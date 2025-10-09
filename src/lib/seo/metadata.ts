import { Metadata } from 'next';

import { siteConfig } from '@/config/site';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || siteConfig.url;

interface Tag {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  usage_count: number;
  is_trending: boolean;
}

interface Bookmark {
  id: string;
  title: string;
  description: string | null;
  slug: string | null;
  url: string;
  domain: string | null;
  image_url?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  canonical_url?: string | null;
  seo_keywords?: string[] | null;
  privacy_level?: string | null;
}

export class MetadataGenerator {
  static generateTagPageMetadata(tag: Tag): Metadata {
    const rawDescription = tag.description?.trim();
    const hasMeaningfulDescription =
      rawDescription && rawDescription.toLowerCase() !== 'default fallback tag';

    const title = `${tag.name} Bookmarks & Resources`;
    const description = hasMeaningfulDescription
      ? rawDescription!
      : `Discover ${tag.usage_count || 'the top'} curated ${tag.name} bookmarks. Explore the best ${tag.name} tools, articles, and resources shared by the HitTags community.`;

    const keywordCandidates = [
      tag.name,
      'bookmarks',
      'resources',
      'tools',
      'curated',
      'collection',
      `${tag.name} tools`,
      `${tag.name} resources`,
      `best ${tag.name}`,
    ];

    const keywords = Array.from(new Set(keywordCandidates.map((item) => item.trim())));

    return {
      title,
      description,
      keywords,
      openGraph: {
        title: `${title} | ${siteConfig.name}`,
        description,
        url: `${BASE_URL}/tag/${tag.slug}`,
        siteName: 'HitTags',
        images: [
          {
            url: `${BASE_URL}/api/og/tag/${tag.slug}`,
            width: 1200,
            height: 630,
            alt: `${tag.name} bookmarks collection`,
          },
        ],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${tag.name} Bookmarks - HitTags`,
        description,
        images: [`${BASE_URL}/api/og/tag/${tag.slug}`],
        creator: '@hittags',
        site: '@hittags',
      },
      alternates: {
        canonical: `${BASE_URL}/tag/${tag.slug}`,
      },
      other: {
        'theme-color': tag.color,
      },
    };
  }

  static generateBookmarkMetadata(bookmark: Bookmark, username?: string): Metadata {
    const bookmarkSlug = bookmark.slug || bookmark.id;
    const canonicalUrl =
      (bookmark.canonical_url && bookmark.canonical_url.trim()) ||
      `${BASE_URL}/bookmark/${bookmark.id}/${bookmarkSlug}`;

    const explicitTitle = bookmark.meta_title?.trim();
    const fallbackTitle = username
      ? `${bookmark.title} - Saved by @${username}`
      : bookmark.title;
    const title = explicitTitle || `${fallbackTitle} | HitTags`;

    const explicitDescription = bookmark.meta_description?.trim();
    const description =
      explicitDescription ||
      bookmark.description ||
      `Discover and save quality web content on HitTags`;

    const keywords =
      bookmark.seo_keywords && bookmark.seo_keywords.length > 0
        ? bookmark.seo_keywords
        : undefined;

    let robots: Metadata['robots'] | undefined;
    if (bookmark.privacy_level === 'private') {
      robots = {
        index: false,
        follow: false,
      };
    } else if (bookmark.privacy_level === 'subscribers') {
      robots = {
        index: true,
        follow: false,
      };
    }

    const ogImages =
      bookmark.image_url
        ? [
            {
              url: bookmark.image_url,
              width: 1200,
              height: 630,
              alt: bookmark.title,
            },
          ]
        : bookmark.domain
        ? [
            {
              url: `${BASE_URL}/api/og/bookmark/${bookmark.id}`,
              width: 1200,
              height: 630,
              alt: bookmark.title,
            },
          ]
        : undefined;

    return {
      title,
      description,
      keywords,
      openGraph: {
        title: bookmark.title,
        description,
        url: canonicalUrl,
        siteName: 'HitTags',
        type: 'article',
        images: ogImages,
      },
      twitter: {
        card: 'summary_large_image',
        title: bookmark.title,
        description,
        images: ogImages?.map((image) => image.url) ?? undefined,
      },
      alternates: {
        canonical: canonicalUrl,
      },
      robots,
    };
  }

  static generateCollectionMetadata(
    collection: {
      name: string;
      slug: string;
      description: string | null;
      cover_image_url: string | null;
      bookmark_count: number;
    },
    username: string,
    displayName?: string
  ): Metadata {
    const title = `${collection.name} - Curated by ${displayName || username} | HitTags`;
    const description =
      collection.description ||
      `${collection.bookmark_count} carefully selected bookmarks - Curated collection by ${displayName || username}.`;

    return {
      title,
      description,
      keywords: [
        collection.name,
        'collection',
        'bookmarks',
        'curated',
        username,
        ...collection.name.split(' ').slice(0, 5),
      ],
      openGraph: {
        title: collection.name,
        description,
        url: `${BASE_URL}/collections/${username}/${collection.slug}`,
        siteName: 'HitTags',
        images: [
          {
            url:
              collection.cover_image_url ||
              `${BASE_URL}/api/og/collection/${collection.slug}`,
            width: 1200,
            height: 630,
            alt: `${collection.name} collection`,
          },
        ],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: collection.name,
        description,
        images: [
          collection.cover_image_url ||
            `${BASE_URL}/api/og/collection/${collection.slug}`,
        ],
      },
      alternates: {
        canonical: `${BASE_URL}/collections/${username}/${collection.slug}`,
      },
    };
  }

  static generateSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 60);
  }
}
