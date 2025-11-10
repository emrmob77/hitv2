/**
 * HitV2 Browser Extension SDK
 *
 * A TypeScript SDK for building browser extensions that integrate with HitV2
 *
 * Installation:
 * npm install @hitv2/browser-extension-sdk
 *
 * Usage:
 * import { HitV2SDK } from '@hitv2/browser-extension-sdk';
 *
 * const sdk = new HitV2SDK({
 *   apiKey: 'your-api-key',
 *   secretKey: 'your-secret-key',
 * });
 *
 * // Create a bookmark
 * await sdk.bookmarks.create({
 *   url: 'https://example.com',
 *   title: 'Example',
 * });
 */

// Types
export interface SDKConfig {
  apiKey: string;
  secretKey: string;
  baseURL?: string;
}

export interface Bookmark {
  id: string;
  url: string;
  title?: string;
  description?: string;
  tags?: string[];
  collection_id?: string;
  is_public?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  is_public?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  name: string;
  count: number;
}

export interface CreateBookmarkInput {
  url: string;
  title?: string;
  description?: string;
  tags?: string[];
  collection_id?: string;
  is_public?: boolean;
}

export interface UpdateBookmarkInput {
  title?: string;
  description?: string;
  tags?: string[];
  collection_id?: string;
  is_public?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    has_more: boolean;
  };
}

/**
 * HitV2 SDK Client
 */
export class HitV2SDK {
  private config: Required<SDKConfig>;

  constructor(config: SDKConfig) {
    this.config = {
      ...config,
      baseURL: config.baseURL || 'https://hitv2.app/api/v1',
    };
  }

  /**
   * Bookmark operations
   */
  public bookmarks = {
    /**
     * List bookmarks
     */
    list: async (options?: {
      limit?: number;
      offset?: number;
      collection_id?: string;
      tag?: string;
      search?: string;
    }): Promise<PaginatedResponse<Bookmark>> => {
      const params = new URLSearchParams();
      if (options?.limit) params.set('limit', options.limit.toString());
      if (options?.offset) params.set('offset', options.offset.toString());
      if (options?.collection_id) params.set('collection_id', options.collection_id);
      if (options?.tag) params.set('tag', options.tag);
      if (options?.search) params.set('search', options.search);

      return this.request(`/bookmarks?${params.toString()}`);
    },

    /**
     * Get a single bookmark
     */
    get: async (id: string): Promise<{ data: Bookmark }> => {
      return this.request(`/bookmarks/${id}`);
    },

    /**
     * Create a bookmark
     */
    create: async (input: CreateBookmarkInput): Promise<{ data: Bookmark }> => {
      return this.request('/bookmarks', {
        method: 'POST',
        body: JSON.stringify(input),
      });
    },

    /**
     * Update a bookmark
     */
    update: async (
      id: string,
      input: UpdateBookmarkInput
    ): Promise<{ data: Bookmark }> => {
      return this.request(`/bookmarks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(input),
      });
    },

    /**
     * Delete a bookmark
     */
    delete: async (id: string): Promise<void> => {
      await this.request(`/bookmarks/${id}`, {
        method: 'DELETE',
      });
    },
  };

  /**
   * Collection operations
   */
  public collections = {
    /**
     * List collections
     */
    list: async (options?: {
      limit?: number;
      offset?: number;
      include_bookmarks?: boolean;
    }): Promise<PaginatedResponse<Collection>> => {
      const params = new URLSearchParams();
      if (options?.limit) params.set('limit', options.limit.toString());
      if (options?.offset) params.set('offset', options.offset.toString());
      if (options?.include_bookmarks)
        params.set('include_bookmarks', 'true');

      return this.request(`/collections?${params.toString()}`);
    },

    /**
     * Get a single collection
     */
    get: async (id: string): Promise<{ data: Collection }> => {
      return this.request(`/collections/${id}`);
    },

    /**
     * Create a collection
     */
    create: async (input: {
      name: string;
      description?: string;
      is_public?: boolean;
    }): Promise<{ data: Collection }> => {
      return this.request('/collections', {
        method: 'POST',
        body: JSON.stringify(input),
      });
    },

    /**
     * Update a collection
     */
    update: async (
      id: string,
      input: {
        name?: string;
        description?: string;
        is_public?: boolean;
      }
    ): Promise<{ data: Collection }> => {
      return this.request(`/collections/${id}`, {
        method: 'PUT',
        body: JSON.stringify(input),
      });
    },

    /**
     * Delete a collection
     */
    delete: async (id: string): Promise<void> => {
      await this.request(`/collections/${id}`, {
        method: 'DELETE',
      });
    },
  };

  /**
   * Tag operations
   */
  public tags = {
    /**
     * List all tags
     */
    list: async (): Promise<{ data: Tag[]; total: number }> => {
      return this.request('/tags');
    },
  };

  /**
   * Browser extension helpers
   */
  public extension = {
    /**
     * Bookmark the current tab
     */
    bookmarkCurrentTab: async (): Promise<{ data: Bookmark }> => {
      if (typeof chrome === 'undefined' || !chrome.tabs) {
        throw new Error('This method requires chrome.tabs API');
      }

      return new Promise((resolve, reject) => {
        chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
          const tab = tabs[0];
          if (!tab) {
            reject(new Error('No active tab found'));
            return;
          }

          try {
            const result = await this.bookmarks.create({
              url: tab.url!,
              title: tab.title,
            });
            resolve(result);
          } catch (error) {
            reject(error);
          }
        });
      });
    },

    /**
     * Check if the current tab is bookmarked
     */
    isCurrentTabBookmarked: async (): Promise<boolean> => {
      if (typeof chrome === 'undefined' || !chrome.tabs) {
        throw new Error('This method requires chrome.tabs API');
      }

      return new Promise((resolve, reject) => {
        chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
          const tab = tabs[0];
          if (!tab || !tab.url) {
            resolve(false);
            return;
          }

          try {
            const result = await this.bookmarks.list({ search: tab.url });
            const exists = result.data.some((b) => b.url === tab.url);
            resolve(exists);
          } catch (error) {
            reject(error);
          }
        });
      });
    },

    /**
     * Get context menu info (for right-click menus)
     */
    getContextInfo: (): Promise<{
      url?: string;
      text?: string;
      pageUrl?: string;
    }> => {
      if (typeof chrome === 'undefined' || !chrome.tabs) {
        throw new Error('This method requires chrome.tabs API');
      }

      return new Promise((resolve) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const tab = tabs[0];
          resolve({
            pageUrl: tab?.url,
          });
        });
      });
    },
  };

  /**
   * Make HTTP request to API
   */
  private async request<T = any>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.config.baseURL}${endpoint}`;

    const headers = new Headers(options?.headers);
    headers.set(
      'Authorization',
      `Bearer ${this.config.apiKey}:${this.config.secretKey}`
    );
    headers.set('Content-Type', 'application/json');

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle rate limiting
    if (response.status === 429) {
      const rateLimitInfo = {
        hourly_remaining: response.headers.get('X-RateLimit-Remaining-Hour'),
        daily_remaining: response.headers.get('X-RateLimit-Remaining-Day'),
      };
      throw new Error(
        `Rate limit exceeded. Hourly: ${rateLimitInfo.hourly_remaining}, Daily: ${rateLimitInfo.daily_remaining}`
      );
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    // 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }
}

/**
 * Quick save helper for popup/context menus
 */
export async function quickSave(
  sdk: HitV2SDK,
  url: string,
  title?: string,
  options?: {
    tags?: string[];
    collection_id?: string;
  }
): Promise<Bookmark> {
  const result = await sdk.bookmarks.create({
    url,
    title,
    ...options,
  });
  return result.data;
}

/**
 * Batch import helper
 */
export async function batchImport(
  sdk: HitV2SDK,
  bookmarks: CreateBookmarkInput[],
  options?: {
    onProgress?: (current: number, total: number) => void;
    concurrency?: number;
  }
): Promise<{ success: number; failed: number; errors: Error[] }> {
  const results = {
    success: 0,
    failed: 0,
    errors: [] as Error[],
  };

  const concurrency = options?.concurrency || 5;

  for (let i = 0; i < bookmarks.length; i += concurrency) {
    const batch = bookmarks.slice(i, i + concurrency);

    await Promise.allSettled(
      batch.map(async (bookmark) => {
        try {
          await sdk.bookmarks.create(bookmark);
          results.success++;
        } catch (error) {
          results.failed++;
          results.errors.push(error as Error);
        }
      })
    );

    options?.onProgress?.(
      Math.min(i + concurrency, bookmarks.length),
      bookmarks.length
    );
  }

  return results;
}

// Export types
export type { SDKConfig, Bookmark, Collection, Tag };
