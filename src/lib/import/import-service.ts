/**
 * Import Service
 * Handles importing parsed bookmarks into the database
 */

import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { ParsedBookmark, ParseResult } from './browser-bookmark-parser';
import {
  isValidBookmarkUrl,
  sanitizeBookmarkTitle,
  extractDomain,
  generateTagsFromPath,
} from './browser-bookmark-parser';

export interface ImportOptions {
  skip_duplicates?: boolean; // Skip if URL already exists
  auto_tag?: boolean; // Auto-create tags from folder paths
  preserve_folders?: boolean; // Create collections from folders
  default_privacy?: 'public' | 'private' | 'subscribers';
  batch_size?: number; // Number of bookmarks to process at once
}

export interface ImportProgress {
  total: number;
  processed: number;
  successful: number;
  failed: number;
  skipped: number;
  duplicates: number;
  current_item?: string;
}

export interface ImportResult {
  success: boolean;
  progress: ImportProgress;
  imported_bookmark_ids: string[];
  created_tag_ids: string[];
  created_collection_ids: string[];
  errors: Array<{ url: string; error: string }>;
}

/**
 * Import Service Class
 */
export class ImportService {
  private userId: string;
  private options: Required<ImportOptions>;

  constructor(userId: string, options: ImportOptions = {}) {
    this.userId = userId;
    this.options = {
      skip_duplicates: options.skip_duplicates ?? true,
      auto_tag: options.auto_tag ?? true,
      preserve_folders: options.preserve_folders ?? true,
      default_privacy: options.default_privacy ?? 'public',
      batch_size: options.batch_size ?? 50,
    };
  }

  /**
   * Import bookmarks from parsed result
   */
  async importBookmarks(
    parseResult: ParseResult,
    onProgress?: (progress: ImportProgress) => void
  ): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      progress: {
        total: parseResult.total_count,
        processed: 0,
        successful: 0,
        failed: 0,
        skipped: 0,
        duplicates: 0,
      },
      imported_bookmark_ids: [],
      created_tag_ids: [],
      created_collection_ids: [],
      errors: [],
    };

    try {
      // Step 1: Create collections from folders (if enabled)
      if (this.options.preserve_folders) {
        const collectionIds = await this.createCollectionsFromFolders(parseResult.folders);
        result.created_collection_ids = collectionIds;
      }

      // Step 2: Process bookmarks in batches
      const bookmarks = parseResult.bookmarks;
      for (let i = 0; i < bookmarks.length; i += this.options.batch_size) {
        const batch = bookmarks.slice(i, i + this.options.batch_size);

        for (const bookmark of batch) {
          try {
            // Validate URL
            if (!isValidBookmarkUrl(bookmark.url)) {
              result.progress.skipped++;
              result.errors.push({ url: bookmark.url, error: 'Invalid URL format' });
              continue;
            }

            // Check for duplicates
            if (this.options.skip_duplicates) {
              const exists = await this.checkDuplicate(bookmark.url);
              if (exists) {
                result.progress.duplicates++;
                result.progress.skipped++;
                continue;
              }
            }

            // Import bookmark
            const bookmarkId = await this.importSingleBookmark(bookmark);
            if (bookmarkId) {
              result.imported_bookmark_ids.push(bookmarkId);
              result.progress.successful++;

              // Handle tags
              if (this.options.auto_tag && bookmark.folder_path) {
                const tagIds = await this.createTagsFromPath(bookmark.folder_path, bookmarkId);
                result.created_tag_ids.push(...tagIds);
              }
            } else {
              result.progress.failed++;
            }
          } catch (error) {
            result.progress.failed++;
            result.errors.push({
              url: bookmark.url,
              error: error instanceof Error ? error.message : 'Unknown error',
            });
          } finally {
            result.progress.processed++;

            // Report progress
            if (onProgress) {
              onProgress({
                ...result.progress,
                current_item: bookmark.title,
              });
            }
          }
        }
      }

      result.success = result.progress.successful > 0;
      return result;
    } catch (error) {
      result.errors.push({
        url: 'FATAL',
        error: error instanceof Error ? error.message : 'Fatal import error',
      });
      return result;
    }
  }

  /**
   * Import a single bookmark
   */
  private async importSingleBookmark(bookmark: ParsedBookmark): Promise<string | null> {
    try {
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase
        .from('bookmarks')
        .insert({
          user_id: this.userId,
          url: bookmark.url,
          title: sanitizeBookmarkTitle(bookmark.title),
          description: bookmark.description || null,
          favicon_url: bookmark.favicon_url || null,
          domain: extractDomain(bookmark.url),
          privacy_level: this.options.default_privacy,
          created_at: bookmark.added_date?.toISOString() || new Date().toISOString(),
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error importing bookmark:', error);
        return null;
      }

      return data?.id || null;
    } catch (error) {
      console.error('Exception importing bookmark:', error);
      return null;
    }
  }

  /**
   * Check if bookmark URL already exists for this user
   */
  private async checkDuplicate(url: string): Promise<boolean> {
    try {
      const supabase = await createSupabaseServerClient();
      const { data, error} = await supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', this.userId)
        .eq('url', url)
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error checking duplicate:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Exception checking duplicate:', error);
      return false;
    }
  }

  /**
   * Create collections from folder structure
   */
  private async createCollectionsFromFolders(
    folders: ParseResult['folders']
  ): Promise<string[]> {
    const collectionIds: string[] = [];
    const supabase = await createSupabaseServerClient();

    for (const folder of folders) {
      try {
        // Skip root folder
        if (!folder.name || folder.name.toLowerCase() === 'root') continue;

        // Generate slug
        const slug = folder.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');

        // Check if collection already exists
        const { data: existing } = await supabase
          .from('collections')
          .select('id')
          .eq('user_id', this.userId)
          .eq('slug', slug)
          .maybeSingle();

        if (existing) {
          collectionIds.push(existing.id);
          continue;
        }

        // Create collection
        const { data, error } = await supabase
          .from('collections')
          .insert({
            user_id: this.userId,
            name: folder.name,
            slug,
            description: `Imported from ${folder.path}`,
            privacy_level: this.options.default_privacy,
          })
          .select('id')
          .single();

        if (error) {
          console.error('Error creating collection:', error);
          continue;
        }

        if (data?.id) {
          collectionIds.push(data.id);
        }
      } catch (error) {
        console.error('Exception creating collection:', error);
      }
    }

    return collectionIds;
  }

  /**
   * Create tags from folder path and link to bookmark
   */
  private async createTagsFromPath(folderPath: string, bookmarkId: string): Promise<string[]> {
    const tagNames = generateTagsFromPath(folderPath);
    if (tagNames.length === 0) return [];

    const tagIds: string[] = [];
    const supabase = await createSupabaseServerClient();

    for (const tagName of tagNames) {
      try {
        // Check if tag exists
        let tagId: string | null = null;
        const { data: existingTag } = await supabase
          .from('tags')
          .select('id')
          .eq('name', tagName)
          .maybeSingle();

        if (existingTag) {
          tagId = existingTag.id;
        } else {
          // Create new tag
          const { data: newTag, error } = await supabase
            .from('tags')
            .insert({
              name: tagName,
              slug: tagName.replace(/[^a-z0-9]+/g, '-'),
              created_by: this.userId,
            })
            .select('id')
            .single();

          if (error) {
            console.error('Error creating tag:', error);
            continue;
          }

          tagId = newTag?.id || null;
        }

        if (tagId) {
          tagIds.push(tagId);

          // Link tag to bookmark
          await supabase.from('bookmark_tags').insert({
            bookmark_id: bookmarkId,
            tag_id: tagId,
          });
        }
      } catch (error) {
        console.error('Exception creating tag:', error);
      }
    }

    return tagIds;
  }
}

/**
 * Utility function to import bookmarks
 */
export async function importBrowserBookmarks(
  userId: string,
  parseResult: ParseResult,
  options?: ImportOptions,
  onProgress?: (progress: ImportProgress) => void
): Promise<ImportResult> {
  const service = new ImportService(userId, options);
  return service.importBookmarks(parseResult, onProgress);
}
