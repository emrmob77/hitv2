/**
 * Export Service
 * Handles exporting bookmarks to various formats (JSON, CSV, HTML/Netscape)
 */

import { createSupabaseServerClient } from '@/lib/supabase/server';

export type ExportFormat = 'json' | 'csv' | 'html' | 'netscape_bookmark';

export interface ExportOptions {
  format: ExportFormat;
  include_tags?: boolean;
  include_collections?: boolean;
  include_metadata?: boolean;
  collection_id?: string; // Export only this collection
  tag_ids?: string[]; // Export only bookmarks with these tags
  date_from?: Date;
  date_to?: Date;
}

export interface ExportBookmark {
  id: string;
  url: string;
  title: string;
  description?: string;
  favicon_url?: string;
  domain?: string;
  privacy_level: string;
  created_at: string;
  tags?: string[];
  collections?: string[];
}

export interface ExportResult {
  success: boolean;
  file_content: string;
  file_name: string;
  mime_type: string;
  total_bookmarks: number;
  error?: string;
}

/**
 * Export Service Class
 */
export class ExportService {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  /**
   * Main export method
   */
  async exportBookmarks(options: ExportOptions): Promise<ExportResult> {
    try {
      // Fetch bookmarks based on filters
      const bookmarks = await this.fetchBookmarks(options);

      if (bookmarks.length === 0) {
        return {
          success: false,
          file_content: '',
          file_name: '',
          mime_type: '',
          total_bookmarks: 0,
          error: 'No bookmarks found matching the criteria',
        };
      }

      // Generate file based on format
      switch (options.format) {
        case 'json':
          return this.exportAsJSON(bookmarks, options);
        case 'csv':
          return this.exportAsCSV(bookmarks, options);
        case 'html':
        case 'netscape_bookmark':
          return this.exportAsHTML(bookmarks, options);
        default:
          throw new Error(`Unsupported format: ${options.format}`);
      }
    } catch (error) {
      return {
        success: false,
        file_content: '',
        file_name: '',
        mime_type: '',
        total_bookmarks: 0,
        error: error instanceof Error ? error.message : 'Export failed',
      };
    }
  }

  /**
   * Fetch bookmarks with filters
   */
  private async fetchBookmarks(options: ExportOptions): Promise<ExportBookmark[]> {
    const supabase = await createSupabaseServerClient();
    let query = supabase
      .from('bookmarks')
      .select(
        `
        id,
        url,
        title,
        description,
        favicon_url,
        domain,
        privacy_level,
        created_at,
        ${options.include_tags ? 'bookmark_tags(tag_id, tags(name)),' : ''}
        ${options.include_collections ? 'collection_bookmarks(collection_id, collections(name))' : ''}
      `
      )
      .eq('user_id', this.userId)
      .order('created_at', { ascending: false });

    // Apply filters
    if (options.collection_id) {
      query = query.eq('collection_bookmarks.collection_id', options.collection_id);
    }

    if (options.date_from) {
      query = query.gte('created_at', options.date_from.toISOString());
    }

    if (options.date_to) {
      query = query.lte('created_at', options.date_to.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching bookmarks:', error);
      throw new Error('Failed to fetch bookmarks');
    }

    // Transform data
    return (data || []).map((bookmark: any) => ({
      id: bookmark.id,
      url: bookmark.url,
      title: bookmark.title,
      description: bookmark.description || undefined,
      favicon_url: bookmark.favicon_url || undefined,
      domain: bookmark.domain || undefined,
      privacy_level: bookmark.privacy_level,
      created_at: bookmark.created_at,
      tags: options.include_tags
        ? bookmark.bookmark_tags?.map((bt: any) => bt.tags?.name).filter(Boolean)
        : undefined,
      collections: options.include_collections
        ? bookmark.collection_bookmarks?.map((cb: any) => cb.collections?.name).filter(Boolean)
        : undefined,
    }));
  }

  /**
   * Export as JSON
   */
  private exportAsJSON(bookmarks: ExportBookmark[], options: ExportOptions): ExportResult {
    const exportData = {
      metadata: options.include_metadata
        ? {
            exported_at: new Date().toISOString(),
            exported_by: this.userId,
            total_bookmarks: bookmarks.length,
            format: 'json',
            version: '1.0',
          }
        : undefined,
      bookmarks,
    };

    const fileContent = JSON.stringify(exportData, null, 2);
    const fileName = `hittags-bookmarks-${new Date().toISOString().split('T')[0]}.json`;

    return {
      success: true,
      file_content: fileContent,
      file_name: fileName,
      mime_type: 'application/json',
      total_bookmarks: bookmarks.length,
    };
  }

  /**
   * Export as CSV
   */
  private exportAsCSV(bookmarks: ExportBookmark[], options: ExportOptions): ExportResult {
    // CSV Headers
    const headers = ['URL', 'Title', 'Description', 'Domain', 'Privacy', 'Created At'];
    if (options.include_tags) headers.push('Tags');
    if (options.include_collections) headers.push('Collections');

    // CSV Rows
    const rows = bookmarks.map((bookmark) => {
      const row = [
        this.escapeCSV(bookmark.url),
        this.escapeCSV(bookmark.title),
        this.escapeCSV(bookmark.description || ''),
        this.escapeCSV(bookmark.domain || ''),
        this.escapeCSV(bookmark.privacy_level),
        this.escapeCSV(bookmark.created_at),
      ];

      if (options.include_tags) {
        row.push(this.escapeCSV(bookmark.tags?.join(', ') || ''));
      }

      if (options.include_collections) {
        row.push(this.escapeCSV(bookmark.collections?.join(', ') || ''));
      }

      return row.join(',');
    });

    const fileContent = [headers.join(','), ...rows].join('\n');
    const fileName = `hittags-bookmarks-${new Date().toISOString().split('T')[0]}.csv`;

    return {
      success: true,
      file_content: fileContent,
      file_name: fileName,
      mime_type: 'text/csv',
      total_bookmarks: bookmarks.length,
    };
  }

  /**
   * Export as HTML (Netscape Bookmark File Format)
   * Compatible with Chrome, Firefox, Safari, Edge
   */
  private exportAsHTML(bookmarks: ExportBookmark[], options: ExportOptions): ExportResult {
    const timestamp = Math.floor(Date.now() / 1000);

    let html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file.
     It will be read and overwritten.
     DO NOT EDIT! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
    <DT><H3 ADD_DATE="${timestamp}" LAST_MODIFIED="${timestamp}">HitTags Bookmarks</H3>
    <DL><p>
`;

    // Group bookmarks by collection if available
    if (options.include_collections) {
      const grouped = this.groupBookmarksByCollection(bookmarks);

      for (const [collectionName, items] of Object.entries(grouped)) {
        if (collectionName !== '_uncategorized') {
          html += `        <DT><H3 ADD_DATE="${timestamp}">${this.escapeHTML(collectionName)}</H3>\n`;
          html += `        <DL><p>\n`;
        }

        for (const bookmark of items) {
          const addDate = Math.floor(new Date(bookmark.created_at).getTime() / 1000);
          const icon = bookmark.favicon_url ? ` ICON="${this.escapeHTML(bookmark.favicon_url)}"` : '';

          html += `            <DT><A HREF="${this.escapeHTML(bookmark.url)}" ADD_DATE="${addDate}"${icon}>${this.escapeHTML(bookmark.title)}</A>\n`;

          if (bookmark.description) {
            html += `            <DD>${this.escapeHTML(bookmark.description)}\n`;
          }
        }

        if (collectionName !== '_uncategorized') {
          html += `        </DL><p>\n`;
        }
      }
    } else {
      // Flat list of bookmarks
      for (const bookmark of bookmarks) {
        const addDate = Math.floor(new Date(bookmark.created_at).getTime() / 1000);
        const icon = bookmark.favicon_url ? ` ICON="${this.escapeHTML(bookmark.favicon_url)}"` : '';

        html += `        <DT><A HREF="${this.escapeHTML(bookmark.url)}" ADD_DATE="${addDate}"${icon}>${this.escapeHTML(bookmark.title)}</A>\n`;

        if (bookmark.description) {
          html += `        <DD>${this.escapeHTML(bookmark.description)}\n`;
        }
      }
    }

    html += `    </DL><p>
</DL><p>
`;

    const fileName = `hittags-bookmarks-${new Date().toISOString().split('T')[0]}.html`;

    return {
      success: true,
      file_content: html,
      file_name: fileName,
      mime_type: 'text/html',
      total_bookmarks: bookmarks.length,
    };
  }

  /**
   * Group bookmarks by collection
   */
  private groupBookmarksByCollection(
    bookmarks: ExportBookmark[]
  ): Record<string, ExportBookmark[]> {
    const grouped: Record<string, ExportBookmark[]> = {};

    for (const bookmark of bookmarks) {
      if (bookmark.collections && bookmark.collections.length > 0) {
        for (const collection of bookmark.collections) {
          if (!grouped[collection]) {
            grouped[collection] = [];
          }
          grouped[collection].push(bookmark);
        }
      } else {
        if (!grouped._uncategorized) {
          grouped._uncategorized = [];
        }
        grouped._uncategorized.push(bookmark);
      }
    }

    return grouped;
  }

  /**
   * Escape CSV values
   */
  private escapeCSV(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  /**
   * Escape HTML entities
   */
  private escapeHTML(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

/**
 * Utility function to export bookmarks
 */
export async function exportBookmarks(
  userId: string,
  options: ExportOptions
): Promise<ExportResult> {
  const service = new ExportService(userId);
  return service.exportBookmarks(options);
}
