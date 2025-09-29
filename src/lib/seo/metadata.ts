import { Metadata } from 'next';

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
    const title = `${tag.name} Bookmarks & Resources | HitTags`;
    const description =
      tag.description ||
      `Discover ${tag.usage_count}+ curated ${tag.name} bookmarks. Best ${tag.name} tools, articles, and resources shared by the community.`;

    return {
      title,
      description,
      keywords: [
        tag.name,
        'bookmarks',
        'resources',
        'tools',
        'curated',
        'collection',
        `${tag.name} tools`,
        `${tag.name} resources`,
        `best ${tag.name}`,
      ],
      openGraph: {
        title: `${tag.name} Bookmarks - HitTags`,
        description,
        url: `https://hittags.com/tags/${tag.slug}`,
        siteName: 'HitTags',
        images: [
          {
            url: `/api/og/tag/${tag.slug}`,
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
        images: [`/api/og/tag/${tag.slug}`],
        creator: '@hittags',
        site: '@hittags',
      },
      alternates: {
        canonical: `https://hittags.com/tags/${tag.slug}`,
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
        url: `https://hittags.com/bookmarks/${bookmark.id}/${bookmarkSlug}`,
        siteName: 'HitTags',
        type: 'article',
        images: bookmark.domain
          ? [
              {
                url: `/api/og/bookmark/${bookmark.id}`,
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
        images: bookmark.domain ? [`/api/og/bookmark/${bookmark.id}`] : [],
      },
      alternates: {
        canonical: `https://hittags.com/bookmarks/${bookmark.id}/${bookmarkSlug}`,
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