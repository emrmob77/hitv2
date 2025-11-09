/**
 * Social Platform Import System
 *
 * Supports importing bookmarks/saved items from:
 * - Twitter/X (bookmarks)
 * - Reddit (saved posts)
 * - Pocket (saved articles)
 */

export interface ImportedItem {
  url: string;
  title: string;
  description?: string;
  tags?: string[];
  created_at?: Date;
  platform: 'twitter' | 'reddit' | 'pocket';
  metadata?: Record<string, any>;
}

export interface ImportResult {
  total: number;
  successful: number;
  failed: number;
  items: ImportedItem[];
  errors: string[];
}

/**
 * Twitter/X Bookmarks Importer
 *
 * Note: Twitter API requires authentication and developer account
 * This is a placeholder implementation
 */
export class TwitterImporter {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  /**
   * Import bookmarks from Twitter/X
   */
  async importBookmarks(): Promise<ImportResult> {
    const result: ImportResult = {
      total: 0,
      successful: 0,
      failed: 0,
      items: [],
      errors: [],
    };

    try {
      // Note: Twitter API v2 endpoints for bookmarks
      // GET https://api.twitter.com/2/users/:id/bookmarks
      //
      // This would require:
      // 1. OAuth 2.0 authentication
      // 2. Twitter Developer Account
      // 3. Approved application
      //
      // For now, this is a placeholder that would need to be implemented
      // with actual Twitter API integration

      result.errors.push(
        'Twitter API integration requires OAuth setup. Please use Twitter data export instead.'
      );

      return result;
    } catch (error) {
      result.errors.push(
        error instanceof Error ? error.message : 'Unknown error occurred'
      );
      return result;
    }
  }

  /**
   * Parse Twitter archive data export
   *
   * Users can download their Twitter archive which includes bookmarks
   */
  static parseArchiveData(archiveData: any): ImportedItem[] {
    const items: ImportedItem[] = [];

    try {
      // Twitter archive structure varies
      // bookmarks.js file contains bookmark data
      const bookmarks = archiveData.bookmarks || [];

      bookmarks.forEach((bookmark: any) => {
        const tweet = bookmark.tweet || bookmark;

        items.push({
          url: tweet.expanded_url || `https://twitter.com/user/status/${tweet.id}`,
          title: tweet.full_text || tweet.text || 'Twitter Bookmark',
          description: tweet.full_text || tweet.text,
          tags: tweet.entities?.hashtags?.map((h: any) => h.text) || [],
          created_at: tweet.created_at ? new Date(tweet.created_at) : undefined,
          platform: 'twitter',
          metadata: {
            tweet_id: tweet.id,
            user: tweet.user?.screen_name,
            retweet_count: tweet.retweet_count,
            favorite_count: tweet.favorite_count,
          },
        });
      });
    } catch (error) {
      console.error('Error parsing Twitter archive:', error);
    }

    return items;
  }
}

/**
 * Reddit Saved Posts Importer
 */
export class RedditImporter {
  private accessToken: string;
  private username: string;

  constructor(accessToken: string, username: string) {
    this.accessToken = accessToken;
    this.username = username;
  }

  /**
   * Import saved posts from Reddit
   */
  async importSavedPosts(): Promise<ImportResult> {
    const result: ImportResult = {
      total: 0,
      successful: 0,
      failed: 0,
      items: [],
      errors: [],
    };

    try {
      // Reddit API endpoint: GET /user/{username}/saved
      // Requires OAuth authentication
      //
      // Example request:
      // GET https://oauth.reddit.com/user/{username}/saved
      // Headers: Authorization: Bearer {access_token}

      const response = await fetch(
        `https://oauth.reddit.com/user/${this.username}/saved?limit=100`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'User-Agent': 'WebApp:1.0.0',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Reddit API error: ${response.statusText}`);
      }

      const data = await response.json();
      const posts = data.data?.children || [];

      result.total = posts.length;

      posts.forEach((post: any) => {
        try {
          const postData = post.data;

          const item: ImportedItem = {
            url: postData.url || `https://reddit.com${postData.permalink}`,
            title: postData.title || 'Reddit Saved Post',
            description: postData.selftext || postData.title,
            tags: [postData.subreddit, ...(postData.link_flair_text ? [postData.link_flair_text] : [])],
            created_at: postData.created_utc ? new Date(postData.created_utc * 1000) : undefined,
            platform: 'reddit',
            metadata: {
              subreddit: postData.subreddit,
              author: postData.author,
              score: postData.score,
              num_comments: postData.num_comments,
              post_type: postData.is_self ? 'text' : 'link',
            },
          };

          result.items.push(item);
          result.successful++;
        } catch (error) {
          result.failed++;
          result.errors.push(
            `Failed to process post: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      });

      return result;
    } catch (error) {
      result.errors.push(
        error instanceof Error ? error.message : 'Unknown error occurred'
      );
      return result;
    }
  }
}

/**
 * Pocket Saved Items Importer
 */
export class PocketImporter {
  private accessToken: string;
  private consumerKey: string;

  constructor(consumerKey: string, accessToken: string) {
    this.consumerKey = consumerKey;
    this.accessToken = accessToken;
  }

  /**
   * Import saved items from Pocket
   */
  async importSavedItems(): Promise<ImportResult> {
    const result: ImportResult = {
      total: 0,
      successful: 0,
      failed: 0,
      items: [],
      errors: [],
    };

    try {
      // Pocket API: POST https://getpocket.com/v3/get
      // Requires consumer key and access token

      const response = await fetch('https://getpocket.com/v3/get', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          consumer_key: this.consumerKey,
          access_token: this.accessToken,
          detailType: 'complete',
          count: 100,
          state: 'all', // all, unread, archive
        }),
      });

      if (!response.ok) {
        throw new Error(`Pocket API error: ${response.statusText}`);
      }

      const data = await response.json();
      const items = Object.values(data.list || {}) as any[];

      result.total = items.length;

      items.forEach((pocketItem: any) => {
        try {
          const item: ImportedItem = {
            url: pocketItem.resolved_url || pocketItem.given_url,
            title: pocketItem.resolved_title || pocketItem.given_title || 'Pocket Saved Item',
            description: pocketItem.excerpt,
            tags: pocketItem.tags ? Object.keys(pocketItem.tags) : [],
            created_at: pocketItem.time_added ? new Date(parseInt(pocketItem.time_added) * 1000) : undefined,
            platform: 'pocket',
            metadata: {
              item_id: pocketItem.item_id,
              word_count: pocketItem.word_count,
              time_to_read: pocketItem.time_to_read,
              is_article: pocketItem.is_article === '1',
              is_video: pocketItem.has_video === '1',
              is_image: pocketItem.has_image === '1',
              favorite: pocketItem.favorite === '1',
            },
          };

          result.items.push(item);
          result.successful++;
        } catch (error) {
          result.failed++;
          result.errors.push(
            `Failed to process item: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      });

      return result;
    } catch (error) {
      result.errors.push(
        error instanceof Error ? error.message : 'Unknown error occurred'
      );
      return result;
    }
  }

  /**
   * Get Pocket OAuth URL for authentication
   */
  static async getAuthUrl(consumerKey: string, redirectUri: string): Promise<string> {
    // Step 1: Obtain a request token
    const response = await fetch('https://getpocket.com/v3/oauth/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        consumer_key: consumerKey,
        redirect_uri: redirectUri,
      }),
    });

    const data = await response.json();
    const requestToken = data.code;

    // Step 2: Redirect user to Pocket authorization URL
    return `https://getpocket.com/auth/authorize?request_token=${requestToken}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}`;
  }

  /**
   * Exchange request token for access token
   */
  static async getAccessToken(
    consumerKey: string,
    requestToken: string
  ): Promise<string> {
    const response = await fetch('https://getpocket.com/v3/oauth/authorize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        consumer_key: consumerKey,
        code: requestToken,
      }),
    });

    const data = await response.json();
    return data.access_token;
  }
}

/**
 * Social Platform Import Manager
 */
export class SocialImportManager {
  /**
   * Import from multiple platforms
   */
  static async importFromPlatform(
    platform: 'twitter' | 'reddit' | 'pocket',
    credentials: {
      accessToken?: string;
      username?: string;
      consumerKey?: string;
      archiveData?: any;
    }
  ): Promise<ImportResult> {
    switch (platform) {
      case 'twitter':
        if (credentials.archiveData) {
          const items = TwitterImporter.parseArchiveData(credentials.archiveData);
          return {
            total: items.length,
            successful: items.length,
            failed: 0,
            items,
            errors: [],
          };
        }
        const twitterImporter = new TwitterImporter(credentials.accessToken || '');
        return await twitterImporter.importBookmarks();

      case 'reddit':
        if (!credentials.accessToken || !credentials.username) {
          return {
            total: 0,
            successful: 0,
            failed: 0,
            items: [],
            errors: ['Reddit access token and username are required'],
          };
        }
        const redditImporter = new RedditImporter(
          credentials.accessToken,
          credentials.username
        );
        return await redditImporter.importSavedPosts();

      case 'pocket':
        if (!credentials.consumerKey || !credentials.accessToken) {
          return {
            total: 0,
            successful: 0,
            failed: 0,
            items: [],
            errors: ['Pocket consumer key and access token are required'],
          };
        }
        const pocketImporter = new PocketImporter(
          credentials.consumerKey,
          credentials.accessToken
        );
        return await pocketImporter.importSavedItems();

      default:
        return {
          total: 0,
          successful: 0,
          failed: 0,
          items: [],
          errors: [`Unsupported platform: ${platform}`],
        };
    }
  }
}
