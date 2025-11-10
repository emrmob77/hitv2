import { createSupabaseServerClient } from '@/lib/supabase/server';

export interface Recommendation {
  id: string;
  type: 'bookmark' | 'collection' | 'user' | 'tag';
  title: string;
  score: number;
  reason: string;
  metadata?: any;
}

export interface UserPreferences {
  tags: string[];
  categories: string[];
  topUsers: string[];
  avgEngagement: number;
}

/**
 * ML-Based Recommendation Engine
 *
 * Implements multiple recommendation strategies:
 * - Collaborative Filtering (user-based)
 * - Content-Based Filtering (tag/content similarity)
 * - Hybrid approach
 */
export class RecommendationEngine {
  /**
   * Get personalized recommendations for a user
   */
  static async getRecommendations(
    userId: string,
    limit: number = 20
  ): Promise<Recommendation[]> {
    const supabase = await createSupabaseServerClient();

    // Get user preferences
    const preferences = await this.getUserPreferences(userId);

    // Get recommendations from multiple sources
    const [collaborative, contentBased, trending] = await Promise.all([
      this.collaborativeFiltering(userId, preferences, 10),
      this.contentBasedFiltering(userId, preferences, 10),
      this.trendingRecommendations(userId, 5),
    ]);

    // Combine and deduplicate
    const allRecommendations = [...collaborative, ...contentBased, ...trending];
    const uniqueRecommendations = this.deduplicateRecommendations(allRecommendations);

    // Sort by score
    uniqueRecommendations.sort((a, b) => b.score - a.score);

    // Store recommendations in database
    await this.storeRecommendations(userId, uniqueRecommendations.slice(0, limit));

    return uniqueRecommendations.slice(0, limit);
  }

  /**
   * Analyze user preferences based on their activity
   */
  private static async getUserPreferences(userId: string): Promise<UserPreferences> {
    const supabase = await createSupabaseServerClient();

    // Get user's bookmarks
    const { data: bookmarks } = await supabase
      .from('bookmarks')
      .select('tags, user_id')
      .eq('user_id', userId)
      .limit(100);

    // Aggregate tags
    const tagCounts: Record<string, number> = {};
    bookmarks?.forEach((bookmark) => {
      if (Array.isArray(bookmark.tags)) {
        bookmark.tags.forEach((tag: string) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });

    const topTags = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([tag]) => tag);

    // Get users they follow
    const { data: following } = await supabase
      .from('subscriptions')
      .select('subscribed_to_id')
      .eq('subscriber_id', userId)
      .limit(50);

    const topUsers = following?.map((f) => f.subscribed_to_id) || [];

    return {
      tags: topTags,
      categories: [],
      topUsers,
      avgEngagement: 0,
    };
  }

  /**
   * Collaborative Filtering: Recommend based on similar users
   */
  private static async collaborativeFiltering(
    userId: string,
    preferences: UserPreferences,
    limit: number
  ): Promise<Recommendation[]> {
    const supabase = await createSupabaseServerClient();

    // Find similar users (users who bookmarked similar content)
    const { data: userBookmarks } = await supabase
      .from('bookmarks')
      .select('id, tags')
      .eq('user_id', userId)
      .limit(50);

    if (!userBookmarks || userBookmarks.length === 0) {
      return [];
    }

    const userTags = new Set<string>();
    userBookmarks.forEach((b) => {
      if (Array.isArray(b.tags)) {
        b.tags.forEach((tag: string) => userTags.add(tag));
      }
    });

    // Find other users with similar tags
    const { data: similarBookmarks } = await supabase
      .from('bookmarks')
      .select('user_id, id, title, tags, url')
      .neq('user_id', userId)
      .eq('is_public', true)
      .overlaps('tags', Array.from(userTags))
      .limit(100);

    if (!similarBookmarks) {
      return [];
    }

    // Calculate similarity scores
    const userScores: Record<string, number> = {};
    const bookmarksByUser: Record<string, any[]> = {};

    similarBookmarks.forEach((bookmark) => {
      if (!bookmarksByUser[bookmark.user_id]) {
        bookmarksByUser[bookmark.user_id] = [];
      }
      bookmarksByUser[bookmark.user_id].push(bookmark);

      // Calculate Jaccard similarity for tags
      if (Array.isArray(bookmark.tags)) {
        const bookmarkTags = new Set(bookmark.tags);
        const intersection = Array.from(userTags).filter((tag) => bookmarkTags.has(tag));
        const union = new Set([...Array.from(userTags), ...Array.from(bookmarkTags)]);
        const similarity = intersection.length / union.size;

        userScores[bookmark.user_id] = (userScores[bookmark.user_id] || 0) + similarity;
      }
    });

    // Get top similar users
    const similarUsers = Object.entries(userScores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([uid]) => uid);

    // Get recommendations from similar users
    const recommendations: Recommendation[] = [];

    similarUsers.forEach((similarUserId) => {
      const userBookmarks = bookmarksByUser[similarUserId] || [];
      userBookmarks.forEach((bookmark) => {
        recommendations.push({
          id: bookmark.id,
          type: 'bookmark',
          title: bookmark.title,
          score: userScores[similarUserId] * 0.8, // Weight collaborative filtering at 80%
          reason: 'Users with similar interests bookmarked this',
          metadata: {
            url: bookmark.url,
            tags: bookmark.tags,
          },
        });
      });
    });

    return recommendations.slice(0, limit);
  }

  /**
   * Content-Based Filtering: Recommend based on content similarity
   */
  private static async contentBasedFiltering(
    userId: string,
    preferences: UserPreferences,
    limit: number
  ): Promise<Recommendation[]> {
    const supabase = await createSupabaseServerClient();

    if (preferences.tags.length === 0) {
      return [];
    }

    // Find bookmarks with matching tags that user hasn't bookmarked
    const { data: userBookmarkIds } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('user_id', userId);

    const excludeIds = userBookmarkIds?.map((b) => b.id) || [];

    const { data: matchingBookmarks } = await supabase
      .from('bookmarks')
      .select('id, title, tags, url, user_id')
      .eq('is_public', true)
      .overlaps('tags', preferences.tags)
      .not('id', 'in', `(${excludeIds.join(',')})`)
      .limit(50);

    if (!matchingBookmarks) {
      return [];
    }

    const recommendations: Recommendation[] = matchingBookmarks.map((bookmark) => {
      // Calculate content similarity score
      const bookmarkTags = Array.isArray(bookmark.tags) ? bookmark.tags : [];
      const matchingTags = bookmarkTags.filter((tag: string) =>
        preferences.tags.includes(tag)
      );
      const score = matchingTags.length / preferences.tags.length;

      return {
        id: bookmark.id,
        type: 'bookmark',
        title: bookmark.title,
        score: score * 0.7, // Weight content-based at 70%
        reason: `Matches your interests: ${matchingTags.slice(0, 3).join(', ')}`,
        metadata: {
          url: bookmark.url,
          tags: bookmark.tags,
        },
      };
    });

    recommendations.sort((a, b) => b.score - a.score);

    return recommendations.slice(0, limit);
  }

  /**
   * Trending Recommendations: Popular recent content
   */
  private static async trendingRecommendations(
    userId: string,
    limit: number
  ): Promise<Recommendation[]> {
    const supabase = await createSupabaseServerClient();

    // Get trending bookmarks from the last 7 days
    const { data: trending } = await supabase
      .from('bookmarks')
      .select('id, title, tags, url, created_at')
      .eq('is_public', true)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(20);

    if (!trending) {
      return [];
    }

    // Get engagement metrics
    const bookmarkIds = trending.map((b) => b.id);

    const { data: likes } = await supabase
      .from('likes')
      .select('content_id')
      .eq('content_type', 'bookmark')
      .in('content_id', bookmarkIds);

    const likeCounts: Record<string, number> = {};
    likes?.forEach((like) => {
      likeCounts[like.content_id] = (likeCounts[like.content_id] || 0) + 1;
    });

    const recommendations: Recommendation[] = trending.map((bookmark) => {
      const likeCount = likeCounts[bookmark.id] || 0;
      const ageHours = (Date.now() - new Date(bookmark.created_at).getTime()) / (1000 * 60 * 60);
      const recencyFactor = Math.max(0, 1 - ageHours / (7 * 24));

      const score = (likeCount * 0.5 + recencyFactor * 0.5) * 0.6; // Weight trending at 60%

      return {
        id: bookmark.id,
        type: 'bookmark',
        title: bookmark.title,
        score,
        reason: 'Trending now',
        metadata: {
          url: bookmark.url,
          tags: bookmark.tags,
          likes: likeCount,
        },
      };
    });

    recommendations.sort((a, b) => b.score - a.score);

    return recommendations.slice(0, limit);
  }

  /**
   * Deduplicate recommendations
   */
  private static deduplicateRecommendations(
    recommendations: Recommendation[]
  ): Recommendation[] {
    const seen = new Set<string>();
    const unique: Recommendation[] = [];

    recommendations.forEach((rec) => {
      const key = `${rec.type}:${rec.id}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(rec);
      }
    });

    return unique;
  }

  /**
   * Store recommendations in database
   */
  private static async storeRecommendations(
    userId: string,
    recommendations: Recommendation[]
  ): Promise<void> {
    const supabase = await createSupabaseServerClient();

    const records = recommendations.map((rec) => ({
      user_id: userId,
      recommended_type: rec.type,
      recommended_id: rec.id,
      relevance_score: rec.score,
      confidence: rec.score * 100,
      reason: rec.reason,
    }));

    await supabase.from('user_recommendations').insert(records);
  }

  /**
   * Get similar users based on bookmarking patterns
   */
  static async getSimilarUsers(userId: string, limit: number = 10): Promise<any[]> {
    const supabase = await createSupabaseServerClient();

    // Get user's tags
    const { data: userBookmarks } = await supabase
      .from('bookmarks')
      .select('tags')
      .eq('user_id', userId)
      .limit(100);

    const userTags = new Set<string>();
    userBookmarks?.forEach((b) => {
      if (Array.isArray(b.tags)) {
        b.tags.forEach((tag: string) => userTags.add(tag));
      }
    });

    if (userTags.size === 0) {
      return [];
    }

    // Find users with similar tags
    const { data: similarUsers } = await supabase
      .from('bookmarks')
      .select('user_id, tags, profiles!inner(username, avatar_url)')
      .neq('user_id', userId)
      .overlaps('tags', Array.from(userTags))
      .limit(100);

    if (!similarUsers) {
      return [];
    }

    // Calculate similarity scores
    const userScores: Record<
      string,
      { score: number; username: string; avatar_url: string }
    > = {};

    similarUsers.forEach((bookmark) => {
      if (Array.isArray(bookmark.tags)) {
        const bookmarkTags = new Set(bookmark.tags);
        const intersection = Array.from(userTags).filter((tag) => bookmarkTags.has(tag));
        const union = new Set([...Array.from(userTags), ...Array.from(bookmarkTags)]);
        const similarity = intersection.length / union.size;

        if (!userScores[bookmark.user_id]) {
          userScores[bookmark.user_id] = {
            score: 0,
            username: (bookmark.profiles as any)?.username,
            avatar_url: (bookmark.profiles as any)?.avatar_url,
          };
        }
        userScores[bookmark.user_id].score += similarity;
      }
    });

    // Sort and return
    const sorted = Object.entries(userScores)
      .map(([user_id, data]) => ({
        user_id,
        ...data,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return sorted;
  }
}
