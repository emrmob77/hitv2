/**
 * Browser Bookmark Parser
 * Parses HTML bookmark files from Chrome, Firefox, Safari, Edge
 * Supports Netscape Bookmark File Format (standard across browsers)
 */

export interface ParsedBookmark {
  url: string;
  title: string;
  description?: string;
  favicon_url?: string;
  tags?: string[];
  folder_path?: string; // e.g., "Personal/Tech/Development"
  added_date?: Date;
  icon?: string; // Base64 icon data from browser
}

export interface ParsedFolder {
  name: string;
  path: string;
  parent_path?: string;
  bookmarks: ParsedBookmark[];
  subfolders: ParsedFolder[];
}

export interface ParseResult {
  bookmarks: ParsedBookmark[];
  folders: ParsedFolder[];
  total_count: number;
  source_type: 'chrome' | 'firefox' | 'safari' | 'edge' | 'netscape' | 'unknown';
  parse_errors: Array<{ line: number; error: string }>;
}

/**
 * Browser Bookmark Parser Class
 */
export class BrowserBookmarkParser {
  private html: string;
  private errors: Array<{ line: number; error: string }> = [];

  constructor(html: string) {
    this.html = html;
  }

  /**
   * Main parse method
   */
  parse(): ParseResult {
    try {
      // Detect browser type from HTML content
      const sourceType = this.detectSourceType();

      // Parse the HTML structure
      const folders = this.parseStructure();
      const bookmarks = this.flattenBookmarks(folders);

      return {
        bookmarks,
        folders,
        total_count: bookmarks.length,
        source_type: sourceType,
        parse_errors: this.errors,
      };
    } catch (error) {
      this.errors.push({
        line: 0,
        error: `Fatal parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });

      return {
        bookmarks: [],
        folders: [],
        total_count: 0,
        source_type: 'unknown',
        parse_errors: this.errors,
      };
    }
  }

  /**
   * Detect browser type from HTML metadata
   */
  private detectSourceType(): ParseResult['source_type'] {
    const html = this.html.toLowerCase();

    if (html.includes('chrome')) return 'chrome';
    if (html.includes('firefox')) return 'firefox';
    if (html.includes('safari')) return 'safari';
    if (html.includes('edge')) return 'edge';
    if (html.includes('netscape')) return 'netscape';

    return 'unknown';
  }

  /**
   * Parse HTML structure into folders and bookmarks
   */
  private parseStructure(): ParsedFolder[] {
    // Create a DOM parser (works in browser environment)
    if (typeof window !== 'undefined' && typeof DOMParser !== 'undefined') {
      return this.parseDOMStructure();
    }

    // Fallback to regex-based parsing for Node.js/server environment
    return this.parseRegexStructure();
  }

  /**
   * DOM-based parsing (client-side)
   */
  private parseDOMStructure(): ParsedFolder[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(this.html, 'text/html');
    const folders: ParsedFolder[] = [];

    // Find the main DL (definition list) element
    const mainDL = doc.querySelector('dl');
    if (!mainDL) {
      this.errors.push({ line: 0, error: 'No bookmark structure found (missing <DL> tag)' });
      return folders;
    }

    // Parse top-level folders
    this.parseDLElement(mainDL, folders, '');

    return folders;
  }

  /**
   * Recursively parse DL (definition list) elements
   */
  private parseDLElement(dl: Element, folders: ParsedFolder[], currentPath: string): void {
    let currentFolder: ParsedFolder | null = null;

    Array.from(dl.children).forEach((child) => {
      const tagName = child.tagName.toUpperCase();

      if (tagName === 'DT') {
        // Check if it's a folder (has H3) or bookmark (has A)
        const h3 = child.querySelector('h3');
        const a = child.querySelector('a');

        if (h3) {
          // This is a folder
          const folderName = h3.textContent?.trim() || 'Untitled Folder';
          const folderPath = currentPath ? `${currentPath}/${folderName}` : folderName;

          currentFolder = {
            name: folderName,
            path: folderPath,
            parent_path: currentPath || undefined,
            bookmarks: [],
            subfolders: [],
          };

          folders.push(currentFolder);

          // Look for nested DL (subfolders and bookmarks)
          const nestedDL = child.querySelector('dl');
          if (nestedDL && currentFolder) {
            this.parseDLElement(nestedDL, currentFolder.subfolders, folderPath);
          }
        } else if (a) {
          // This is a bookmark
          const bookmark = this.parseBookmarkElement(a, currentPath);
          if (bookmark && currentFolder) {
            currentFolder.bookmarks.push(bookmark);
          }
        }
      }
    });
  }

  /**
   * Parse a single bookmark element
   */
  private parseBookmarkElement(a: Element, folderPath: string): ParsedBookmark | null {
    const url = a.getAttribute('href');
    const title = a.textContent?.trim();

    if (!url || !title) {
      this.errors.push({ line: 0, error: `Invalid bookmark: missing URL or title` });
      return null;
    }

    const addDate = a.getAttribute('add_date');
    const icon = a.getAttribute('icon');

    return {
      url,
      title,
      folder_path: folderPath || undefined,
      added_date: addDate ? new Date(parseInt(addDate) * 1000) : undefined,
      icon: icon || undefined,
    };
  }

  /**
   * Regex-based parsing (server-side fallback)
   */
  private parseRegexStructure(): ParsedFolder[] {
    const folders: ParsedFolder[] = [];
    const rootFolder: ParsedFolder = {
      name: 'Root',
      path: '',
      bookmarks: [],
      subfolders: [],
    };

    // Simple regex to extract bookmarks
    // Pattern: <A HREF="url" ADD_DATE="timestamp">title</A>
    const bookmarkRegex = /<a\s+href="([^"]+)"[^>]*>([^<]+)<\/a>/gi;
    const folderRegex = /<h3[^>]*>([^<]+)<\/h3>/gi;

    let match;

    // Extract bookmarks
    while ((match = bookmarkRegex.exec(this.html)) !== null) {
      const [, url, title] = match;
      rootFolder.bookmarks.push({
        url,
        title: title.trim(),
      });
    }

    // Extract folders (basic implementation)
    while ((match = folderRegex.exec(this.html)) !== null) {
      const folderName = match[1].trim();
      if (folderName && folderName !== 'Bookmarks' && folderName !== 'Bookmarks Bar') {
        folders.push({
          name: folderName,
          path: folderName,
          bookmarks: [],
          subfolders: [],
        });
      }
    }

    if (rootFolder.bookmarks.length > 0) {
      folders.unshift(rootFolder);
    }

    return folders;
  }

  /**
   * Flatten folder structure into a flat array of bookmarks
   */
  private flattenBookmarks(folders: ParsedFolder[]): ParsedBookmark[] {
    const bookmarks: ParsedBookmark[] = [];

    const flatten = (folder: ParsedFolder) => {
      bookmarks.push(...folder.bookmarks);
      folder.subfolders.forEach(flatten);
    };

    folders.forEach(flatten);

    return bookmarks;
  }
}

/**
 * Utility function to parse browser bookmark file
 */
export async function parseBrowserBookmarks(file: File): Promise<ParseResult> {
  const html = await file.text();
  const parser = new BrowserBookmarkParser(html);
  return parser.parse();
}

/**
 * Validate bookmark URL
 */
export function isValidBookmarkUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:', 'ftp:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
}

/**
 * Sanitize bookmark title
 */
export function sanitizeBookmarkTitle(title: string): string {
  return title.trim().slice(0, 500); // Match database VARCHAR(500) limit
}

/**
 * Extract domain from URL
 */
export function extractDomain(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return null;
  }
}

/**
 * Generate tags from folder path
 * e.g., "Personal/Tech/Development" -> ["personal", "tech", "development"]
 */
export function generateTagsFromPath(folderPath?: string): string[] {
  if (!folderPath) return [];

  return folderPath
    .split('/')
    .map((part) => part.trim().toLowerCase())
    .filter((part) => part.length > 0 && part !== 'root' && part !== 'bookmarks');
}
