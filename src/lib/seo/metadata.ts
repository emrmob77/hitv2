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
    const title = username
      ? `${bookmark.title} - Saved by @${username} | HitTags`
      : `${bookmark.title} | HitTags`;
    const description =
      bookmark.description ||
      `Discover and save quality web content on HitTags`;

    const bookmarkSlug = bookmark.slug || bookmark.id;

    return {
      title,
      description,
      openGraph: {
        title: bookmark.title,
        description: description,
        url: `${BASE_URL}/bookmark/${bookmark.id}/${bookmarkSlug}`,
        siteName: 'HitTags',
        type: 'article',
        images: bookmark.domain
          ? [
              {
                url: `${BASE_URL}/api/og/bookmark/${bookmark.id}`,
                width: 1200,
                height: 630,
                alt: bookmark.title,
              },
            ]
          : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: bookmark.title,
        description: description,
        images: bookmark.domain ? [`${BASE_URL}/api/og/bookmark/${bookmark.id}`] : [],
      },
      alternates: {
        canonical: `${BASE_URL}/bookmark/${bookmark.id}/${bookmarkSlug}`,
      },
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
