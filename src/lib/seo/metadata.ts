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
        url: `https://hittags.com/tag/${tag.slug}`,
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
        canonical: `https://hittags.com/tag/${tag.slug}`,
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
        url: `https://hittags.com/bookmark/${bookmark.id}/${bookmarkSlug}`,
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
        canonical: `https://hittags.com/bookmark/${bookmark.id}/${bookmarkSlug}`,
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
        url: `https://hittags.com/collections/${username}/${collection.slug}`,
        siteName: 'HitTags',
        images: [
          {
            url:
              collection.cover_image_url ||
              `/api/og/collection/${collection.slug}`,
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
            `/api/og/collection/${collection.slug}`,
        ],
      },
      alternates: {
        canonical: `https://hittags.com/collections/${username}/${collection.slug}`,
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