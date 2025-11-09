import { createSupabaseServerClient } from '@/lib/supabase/server';

export interface FeedItem {
  id: string;
  type: 'bookmark' | 'post' | 'collection';
  user_id: string;
  username: string;
  avatar_url?: string;
  created_at: string;
  content: any;
  score: number;
  engagement_score: number;
  recency_score: number;
  relevance_score: number;
}

export interface PersonalizedFeedOptions {
  userId: string;
  limit?: number;
  offset?: number;
  includeFollowing?: boolean;
  includePublic?: boolean;
  contentTypes?: Array<'bookmark' | 'post' | 'collection'>;
}

/**
 * Personalized Feed Algorithm
 *
 * Scoring factors:
 * - Engagement (40%): Likes, views, shares
 * - Recency (30%): How recent the content is
 * - Relevance (30%): User interests, following relationships
 */
export class PersonalizedFeedGenerator {
  /**
   * Generate personalized feed for a user
   */
  static async generateFeed(options: PersonalizedFeedOptions): Promise<FeedItem[]> {
    const {
      userId,
      limit = 20,
      offset = 0,
      includeFollowing = true,
      includePublic = true,
      contentTypes = ['bookmark', 'post', 'collection'],
    } = options;

    const supabase = await createSupabaseServerClient();

    // Get user's interests and preferences
    const userPreferences = await this.getUserPreferences(userId);
    const followingIds = includeFollowing ? await this.getFollowingIds(userId) : [];

    const feedItems: FeedItem[] = [];

    // Fetch bookmarks
    if (contentTypes.includes('bookmark')) {
      const bookmarks = await this.fetchBookmarks(userId, followingIds, includePublic);
      feedItems.push(...bookmarks);
    }

    // Fetch posts
    if (contentTypes.includes('post')) {
      const posts = await this.fetchPosts(userId, followingIds, includePublic);
      feedItems.push(...posts);
    }

    // Fetch collections
    if (contentTypes.includes('collection')) {
      const collections = await this.fetchCollections(userId, followingIds, includePublic);
      feedItems.push(...collections);
    }

    // Score and rank items
    const scoredItems = feedItems.map((item) => ({
      ...item,
      ...this.calculateScores(item, userPreferences, followingIds),
    }));

    // Sort by total score
    scoredItems.sort((a, b) => b.score - a.score);

    // Apply pagination
    return scoredItems.slice(offset, offset + limit);
  }

  /**
   * Get user preferences (tags, categories they interact with)
   */
  private static async getUserPreferences(userId: string): Promise<{
    tags: string[];
    categories: string[];
  }> {
    const supabase = await createSupabaseServerClient();

    // Get most used tags from user's bookmarks
    const { data: bookmarks } = await supabase
      .from('bookmarks')
      .select('tags')
      .eq('user_id', userId)
      .limit(100);

    const tagCounts: Record<string, number> = {};
    bookmarks?.forEach((bookmark) => {
      if (Array.isArray(bookmark.tags)) {
        bookmark.tags.forEach((tag: string) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });

    // Get top 10 tags
    const topTags = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([tag]) => tag);

    return {
      tags: topTags,
      categories: [], // Can be expanded based on your categorization system
    };
  }

  /**
   * Get list of user IDs that the current user is following
   */
  private static async getFollowingIds(userId: string): Promise<string[]> {
    const supabase = await createSupabaseServerClient();

    const { data } = await supabase
      .from('subscriptions')
      .select('subscribed_to_id')
      .eq('subscriber_id', userId);

    return data?.map((s) => s.subscribed_to_id) || [];
  }

  /**
   * Fetch bookmarks for feed
   */
  private static async fetchBookmarks(
    userId: string,
    followingIds: string[],
    includePublic: boolean
  ): Promise<FeedItem[]> {
    const supabase = await createSupabaseServerClient();

    let query = supabase
      .from('bookmarks')
      .select(`
        id,
        user_id,
        url,
        title,
        description,
        tags,
        created_at,
        is_public,
        profiles!inner(username, avatar_url)
      `)
      .neq('user_id', userId) // Exclude own bookmarks
      .order('created_at', { ascending: false })
      .limit(50);

    if (followingIds.length > 0) {
      query = query.in('user_id', followingIds);
    } else if (includePublic) {
      query = query.eq('is_public', true);
    } else {
      return [];
    }

    const { data } = await query;

    return (data || []).map((bookmark) => ({
      id: bookmark.id,
      type: 'bookmark' as const,
      user_id: bookmark.user_id,
      username: (bookmark.profiles as any)?.username || 'Unknown',
      avatar_url: (bookmark.profiles as any)?.avatar_url,
      created_at: bookmark.created_at,
      content: {
        url: bookmark.url,
        title: bookmark.title,
        description: bookmark.description,
        tags: bookmark.tags,
      },
      score: 0,
      engagement_score: 0,
      recency_score: 0,
      relevance_score: 0,
    }));
  }

  /**
   * Fetch posts for feed
   */
  private static async fetchPosts(
    userId: string,
    followingIds: string[],
    includePublic: boolean
  ): Promise<FeedItem[]> {
    const supabase = await createSupabaseServerClient();

    let query = supabase
      .from('posts')
      .select(`
        id,
        user_id,
        title,
        content,
        created_at,
        visibility,
        profiles!inner(username, avatar_url)
      `)
      .neq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (followingIds.length > 0) {
      query = query.in('user_id', followingIds);
    } else if (includePublic) {
      query = query.eq('visibility', 'public');
    } else {
      return [];
    }

    const { data } = await query;

    return (data || []).map((post) => ({
      id: post.id,
      type: 'post' as const,
      user_id: post.user_id,
      username: (post.profiles as any)?.username || 'Unknown',
      avatar_url: (post.profiles as any)?.avatar_url,
      created_at: post.created_at,
      content: {
        title: post.title,
        content: post.content,
      },
      score: 0,
      engagement_score: 0,
      recency_score: 0,
      relevance_score: 0,
    }));
  }

  /**
   * Fetch collections for feed
   */
  private static async fetchCollections(
    userId: string,
    followingIds: string[],
    includePublic: boolean
  ): Promise<FeedItem[]> {
    const supabase = await createSupabaseServerClient();

    let query = supabase
      .from('collections')
      .select(`
        id,
        user_id,
        name,
        description,
        created_at,
        is_public,
        profiles!inner(username, avatar_url)
      `)
      .neq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(30);

    if (followingIds.length > 0) {
      query = query.in('user_id', followingIds);
    } else if (includePublic) {
      query = query.eq('is_public', true);
    } else {
      return [];
    }

    const { data } = await query;

    return (data || []).map((collection) => ({
      id: collection.id,
      type: 'collection' as const,
      user_id: collection.user_id,
      username: (collection.profiles as any)?.username || 'Unknown',
      avatar_url: (collection.profiles as any)?.avatar_url,
      created_at: collection.created_at,
      content: {
        name: collection.name,
        description: collection.description,
      },
      score: 0,
      engagement_score: 0,
      recency_score: 0,
      relevance_score: 0,
    }));
  }

  /**
   * Calculate scoring for feed items
   *
   * Score = (Engagement * 0.4) + (Recency * 0.3) + (Relevance * 0.3)
   */
  private static calculateScores(
    item: FeedItem,
    userPreferences: { tags: string[]; categories: string[] },
    followingIds: string[]
  ): {
    score: number;
    engagement_score: number;
    recency_score: number;
    relevance_score: number;
  } {
    // Engagement score (0-100)
    // In a real implementation, this would be based on actual engagement metrics
    const engagement_score = Math.random() * 100; // Placeholder

    // Recency score (0-100)
    // Higher score for more recent items
    const now = Date.now();
    const itemTime = new Date(item.created_at).getTime();
    const ageInHours = (now - itemTime) / (1000 * 60 * 60);
    const recency_score = Math.max(0, 100 - (ageInHours / 24) * 10); // Decays over days

    // Relevance score (0-100)
    let relevance_score = 0;

    // Boost if from followed user
    if (followingIds.includes(item.user_id)) {
      relevance_score += 50;
    }

    // Boost if tags match user preferences
    if (item.type === 'bookmark' && item.content.tags) {
      const matchingTags = item.content.tags.filter((tag: string) =>
        userPreferences.tags.includes(tag)
      );
      relevance_score += Math.min(50, matchingTags.length * 10);
    }

    // Calculate total score
    const score = engagement_score * 0.4 + recency_score * 0.3 + relevance_score * 0.3;

    return {
      score,
      engagement_score,
      recency_score,
      relevance_score,
    };
  }
}
