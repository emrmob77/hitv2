/**
 * Metadata Fetcher
 * Fetches OpenGraph, Twitter Card, and other metadata from URLs
 */

export interface BookmarkMetadata {
  title?: string;
  description?: string;
  image_url?: string;
  favicon_url?: string;
  domain?: string;
  canonical_url?: string;
  author?: string;
  site_name?: string;
}

/**
 * Fetch metadata from a URL using meta tags
 */
export async function fetchMetadata(url: string): Promise<BookmarkMetadata> {
  try {
    // Validate URL
    const urlObj = new URL(url);
    const domain = urlObj.hostname;

    // Fetch the page
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; HitTags/1.0; +https://hittags.com)',
      },
      signal: AbortSignal.timeout(10000), // 10s timeout
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();

    // Parse metadata
    const metadata: BookmarkMetadata = {
      domain,
      canonical_url: url,
    };

    // Extract title (priority: og:title > twitter:title > title tag)
    const ogTitle = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i);
    const twitterTitle = html.match(/<meta\s+name=["']twitter:title["']\s+content=["']([^"']+)["']/i);
    const titleTag = html.match(/<title>([^<]+)<\/title>/i);

    metadata.title =
      ogTitle?.[1] ||
      twitterTitle?.[1] ||
      titleTag?.[1] ||
      undefined;

    // Extract description (priority: og:description > twitter:description > meta description)
    const ogDesc = html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i);
    const twitterDesc = html.match(/<meta\s+name=["']twitter:description["']\s+content=["']([^"']+)["']/i);
    const metaDesc = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);

    metadata.description =
      ogDesc?.[1] ||
      twitterDesc?.[1] ||
      metaDesc?.[1] ||
      undefined;

    // Extract image (priority: og:image > twitter:image)
    const ogImage = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
    const twitterImage = html.match(/<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/i);

    let imageUrl = ogImage?.[1] || twitterImage?.[1];

    // Make image URL absolute if relative
    if (imageUrl && !imageUrl.startsWith('http')) {
      imageUrl = new URL(imageUrl, url).href;
    }

    metadata.image_url = imageUrl;

    // Extract favicon
    const favicon = html.match(/<link\s+[^>]*rel=["'](?:icon|shortcut icon)["'][^>]*href=["']([^"']+)["']/i);
    let faviconUrl = favicon?.[1];

    if (faviconUrl && !faviconUrl.startsWith('http')) {
      faviconUrl = new URL(faviconUrl, url).href;
    } else if (!faviconUrl) {
      // Fallback to /favicon.ico
      faviconUrl = `${urlObj.protocol}//${urlObj.hostname}/favicon.ico`;
    }

    metadata.favicon_url = faviconUrl;

    // Extract site name
    const siteName = html.match(/<meta\s+property=["']og:site_name["']\s+content=["']([^"']+)["']/i);
    metadata.site_name = siteName?.[1];

    // Extract author
    const author = html.match(/<meta\s+name=["']author["']\s+content=["']([^"']+)["']/i);
    metadata.author = author?.[1];

    // Extract canonical URL
    const canonical = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
    if (canonical?.[1]) {
      metadata.canonical_url = canonical[1].startsWith('http')
        ? canonical[1]
        : new URL(canonical[1], url).href;
    }

    return metadata;
  } catch (error) {
    console.error(`Failed to fetch metadata for ${url}:`, error);

    // Return minimal metadata
    return {
      domain: extractDomain(url),
      canonical_url: url,
    };
  }
}

/**
 * Fetch metadata for multiple URLs in batch with rate limiting
 */
export async function fetchMetadataBatch(
  urls: string[],
  onProgress?: (processed: number, total: number) => void,
  batchSize: number = 5,
  delayMs: number = 1000
): Promise<Map<string, BookmarkMetadata>> {
  const results = new Map<string, BookmarkMetadata>();

  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);

    // Fetch batch in parallel
    const batchPromises = batch.map(url =>
      fetchMetadata(url).then(metadata => ({ url, metadata }))
    );

    const batchResults = await Promise.allSettled(batchPromises);

    batchResults.forEach((result) => {
      if (result.status === 'fulfilled') {
        results.set(result.value.url, result.value.metadata);
      }
    });

    // Report progress
    if (onProgress) {
      onProgress(Math.min(i + batchSize, urls.length), urls.length);
    }

    // Rate limiting delay (except for last batch)
    if (i + batchSize < urls.length) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  return results;
}

/**
 * Extract domain from URL
 */
function extractDomain(url: string): string | undefined {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return undefined;
  }
}

/**
 * Decode HTML entities in text
 */
export function decodeHtmlEntities(text: string): string {
  if (typeof window === 'undefined') {
    // Server-side: basic entity decoding
    return text
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&nbsp;/g, ' ');
  }

  // Client-side: use DOM
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
}
