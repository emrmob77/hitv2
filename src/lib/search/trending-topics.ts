import { createSupabaseServerClient } from '@/lib/supabase/server';

export interface TrendingTopic {
  topic: string;
  trend_score: number;
  mention_count: number;
  velocity: number;
  category?: string;
}

export interface TrendingContent {
  id: string;
  type: 'bookmark' | 'collection' | 'post';
  title: string;
  score: number;
  engagement: {
    views: number;
    likes: number;
    comments: number;
  };
  created_at: string;
}

/**
 * Trending Topics & Content Discovery System
 */
export class TrendingSystem {
  /**
   * Get trending topics
   */
  static async getTrendingTopics(limit: number = 10): Promise<TrendingTopic[]> {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase.rpc('get_trending_topics', {
      p_limit: limit,
    });

    if (error) {
      console.error('Error getting trending topics:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Update trending topics from recent activity
   */
  static async updateTrendingTopics(): Promise<void> {
    const supabase = await createSupabaseServerClient();

    // Get tags from recent bookmarks (last 24 hours)
    const { data: recentBookmarks } = await supabase
      .from('bookmarks')
      .select('tags, user_id')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .not('tags', 'is', null);

    if (!recentBookmarks) return;

    // Aggregate tag mentions
    const tagCounts: Record<
      string,
      { count: number; users: Set<string>; bookmarks: number }
    > = {};

    recentBookmarks.forEach((bookmark) => {
      if (Array.isArray(bookmark.tags)) {
        bookmark.tags.forEach((tag: string) => {
          if (!tagCounts[tag]) {
            tagCounts[tag] = { count: 0, users: new Set(), bookmarks: 0 };
          }
          tagCounts[tag].count++;
          tagCounts[tag].users.add(bookmark.user_id);
          tagCounts[tag].bookmarks++;
        });
      }
    });

    // Update trending_topics table
    for (const [topic, stats] of Object.entries(tagCounts)) {
      const { error } = await supabase
        .from('trending_topics')
        .upsert(
          {
            topic,
            mention_count: stats.count,
            bookmark_count: stats.bookmarks,
            user_count: stats.users.size,
            last_24h_count: stats.count,
            last_seen_at: new Date().toISOString(),
          },
          {
            onConflict: 'topic',
          }
        );

      if (error) {
        console.error(`Error updating trending topic ${topic}:`, error);
      }

      // Update trend score
      await supabase.rpc('update_trend_score', {
        p_topic: topic,
      });
    }
  }

  /**
   * Get trending bookmarks
   */
  static async getTrendingBookmarks(
    timeWindow: '24h' | '7d' | '30d' = '7d',
    limit: number = 20
  ): Promise<TrendingContent[]> {
    const supabase = await createSupabaseServerClient();

    // Calculate time window
    const hours = timeWindow === '24h' ? 24 : timeWindow === '7d' ? 168 : 720;
    const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

    // Get bookmarks with engagement metrics
    const { data: bookmarks } = await supabase
      .from('bookmarks')
      .select(
        `
        id,
        title,
        created_at,
        is_public
      `
      )
      .eq('is_public', true)
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(100);

    if (!bookmarks) return [];

    // Get engagement metrics for these bookmarks
    const bookmarkIds = bookmarks.map((b) => b.id);

    const { data: likes } = await supabase
      .from('likes')
      .select('content_id')
      .eq('content_type', 'bookmark')
      .in('content_id', bookmarkIds);

    const { data: analytics } = await supabase
      .from('analytics_events')
      .select('metadata')
      .eq('event_type', 'bookmark_view')
      .in('metadata->>bookmark_id', bookmarkIds);

    // Aggregate metrics
    const engagement: Record<
      string,
      { views: number; likes: number; comments: number }
    > = {};

    bookmarkIds.forEach((id) => {
      engagement[id] = { views: 0, likes: 0, comments: 0 };
    });

    likes?.forEach((like) => {
      if (engagement[like.content_id]) {
        engagement[like.content_id].likes++;
      }
    });

    analytics?.forEach((event) => {
      const bookmarkId = (event.metadata as any)?.bookmark_id;
      if (engagement[bookmarkId]) {
        engagement[bookmarkId].views++;
      }
    });

    // Calculate trending score
    const trendingBookmarks = bookmarks.map((bookmark) => {
      const metrics = engagement[bookmark.id] || { views: 0, likes: 0, comments: 0 };

      // Score = (likes * 10) + (views * 1) + (recency_factor * 5)
      const ageHours = (Date.now() - new Date(bookmark.created_at).getTime()) / (1000 * 60 * 60);
      const recencyFactor = Math.max(0, 1 - ageHours / hours);

      const score = metrics.likes * 10 + metrics.views * 1 + recencyFactor * 50;

      return {
        id: bookmark.id,
        type: 'bookmark' as const,
        title: bookmark.title,
        score,
        engagement: metrics,
        created_at: bookmark.created_at,
      };
    });

    // Sort by score and return top items
    trendingBookmarks.sort((a, b) => b.score - a.score);

    return trendingBookmarks.slice(0, limit);
  }

  /**
   * Get trending collections
   */
  static async getTrendingCollections(limit: number = 10): Promise<TrendingContent[]> {
    const supabase = await createSupabaseServerClient();

    // Get public collections with bookmark count
    const { data: collections } = await supabase
      .from('collections')
      .select(
        `
        id,
        name,
        created_at,
        bookmarks:bookmarks(count)
      `
      )
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(50);

    if (!collections) return [];

    const collectionIds = collections.map((c) => c.id);

    // Get likes
    const { data: likes } = await supabase
      .from('likes')
      .select('content_id')
      .eq('content_type', 'collection')
      .in('content_id', collectionIds);

    // Count likes per collection
    const likeCounts: Record<string, number> = {};
    likes?.forEach((like) => {
      likeCounts[like.content_id] = (likeCounts[like.content_id] || 0) + 1;
    });

    // Calculate scores
    const trendingCollections = collections.map((collection) => {
      const bookmarkCount = (collection.bookmarks as any)?.length || 0;
      const likeCount = likeCounts[collection.id] || 0;

      // Score = (bookmarks * 3) + (likes * 10)
      const score = bookmarkCount * 3 + likeCount * 10;

      return {
        id: collection.id,
        type: 'collection' as const,
        title: collection.name,
        score,
        engagement: {
          views: 0,
          likes: likeCount,
          comments: 0,
        },
        created_at: collection.created_at,
      };
    });

    // Sort and return
    trendingCollections.sort((a, b) => b.score - a.score);

    return trendingCollections.slice(0, limit);
  }

  /**
   * Get personalized trending content based on user interests
   */
  static async getPersonalizedTrending(
    userId: string,
    limit: number = 20
  ): Promise<TrendingContent[]> {
    const supabase = await createSupabaseServerClient();

    // Get user's tags/interests
    const { data: userBookmarks } = await supabase
      .from('bookmarks')
      .select('tags')
      .eq('user_id', userId)
      .limit(50);

    const userTags: string[] = [];
    userBookmarks?.forEach((bookmark) => {
      if (Array.isArray(bookmark.tags)) {
        userTags.push(...bookmark.tags);
      }
    });

    // Get unique tags
    const uniqueTags = [...new Set(userTags)];

    if (uniqueTags.length === 0) {
      // No user interests, return general trending
      return this.getTrendingBookmarks('7d', limit);
    }

    // Get trending bookmarks with matching tags
    const { data: trendingWithTags } = await supabase
      .from('bookmarks')
      .select('id, title, tags, created_at')
      .eq('is_public', true)
      .overlaps('tags', uniqueTags)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .limit(limit);

    if (!trendingWithTags) return [];

    return trendingWithTags.map((bookmark) => ({
      id: bookmark.id,
      type: 'bookmark' as const,
      title: bookmark.title,
      score: 0,
      engagement: { views: 0, likes: 0, comments: 0 },
      created_at: bookmark.created_at,
    }));
  }
}
