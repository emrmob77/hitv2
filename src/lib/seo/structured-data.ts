import { siteConfig } from '@/config/site';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || siteConfig.url;

interface Tag {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  usage_count: number;
}

interface StructuredBookmarkAuthor {
  username: string;
  display_name: string | null;
}

interface StructuredBookmarkTag {
  name: string;
  slug: string;
}

interface Bookmark {
  id: string;
  title: string;
  description: string | null;
  url: string;
  created_at: string;
  slug?: string | null;
  tags?: StructuredBookmarkTag[];
  user?: StructuredBookmarkAuthor;
  privacy_level?: 'public' | 'private' | 'subscribers';
}

export class StructuredDataGenerator {
  // Website Schema (Homepage)
  static generateWebsiteSchema() {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'HitTags',
      alternateName: 'HitTags - Social Bookmarking Platform',
      url: BASE_URL,
      description:
        'Social bookmarking platform for discovering, saving, and sharing the best web resources.',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${BASE_URL}/search?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
      sameAs: [
        'https://twitter.com/hittags',
        'https://github.com/hittags',
        'https://linkedin.com/company/hittags',
      ],
    };
  }

  // Organization Schema
  static generateOrganizationSchema() {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'HitTags',
      url: BASE_URL,
      logo: `${BASE_URL}/logo.png`,
      description:
        'Social bookmarking platform for discovering and organizing web resources.',
      foundingDate: '2024',
      sameAs: ['https://twitter.com/hittags', 'https://github.com/hittags'],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        email: 'support@hittags.com',
      },
    };
  }

  // Tag Page Schema
  static generateTagCollectionSchema(tag: Tag, bookmarks: Bookmark[]) {
    return {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `${tag.name} Bookmarks`,
      description: tag.description || `Curated collection of ${tag.name} bookmarks and resources`,
      url: `${BASE_URL}/tag/${tag.slug}`,
      numberOfItems: tag.usage_count,
      about: {
        '@type': 'Thing',
        name: tag.name,
        description: tag.description,
      },
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: bookmarks.length,
        itemListElement: bookmarks.slice(0, 10).map((bookmark, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'WebPage',
            name: bookmark.title,
            description: bookmark.description,
            url: bookmark.url,
            author: bookmark.user
              ? {
                  '@type': 'Person',
                  name: bookmark.user.display_name || bookmark.user.username,
                  url: `${BASE_URL}/${bookmark.user.username}`,
                }
              : undefined,
          },
        })),
      },
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: BASE_URL,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Tags',
            item: `${BASE_URL}/tags`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: tag.name,
            item: `${BASE_URL}/tag/${tag.slug}`,
          },
        ],
      },
    };
  }

  // Bookmark Page Schema
  static generateBookmarkSchema(bookmark: Bookmark) {
    const pageUrl = `${BASE_URL}/bookmark/${bookmark.id}/${bookmark.slug ?? bookmark.id}`;
    const isAccessibleForFree = bookmark.privacy_level !== 'subscribers';

    const author =
      bookmark.user && (bookmark.user.display_name || bookmark.user.username)
        ? {
            '@type': 'Person',
            name: bookmark.user.display_name || bookmark.user.username,
            url: `${BASE_URL}/${bookmark.user.username}`,
          }
        : undefined;

    const keywords =
      bookmark.tags && bookmark.tags.length > 0
        ? bookmark.tags.map((tag) => tag.name)
        : undefined;

    const article: Record<string, unknown> = {
      '@type': 'Article',
      headline: bookmark.title,
      description: bookmark.description ?? undefined,
      url: bookmark.url,
      mainEntityOfPage: pageUrl,
      author,
      datePublished: bookmark.created_at,
      keywords,
      isAccessibleForFree,
      publisher: {
        '@type': 'Organization',
        name: 'HitTags',
        logo: {
          '@type': 'ImageObject',
          url: `${BASE_URL}/logo.png`,
        },
      },
    };

    // Add premium content metadata for subscriber-only bookmarks
    if (!isAccessibleForFree && author) {
      article.hasPart = {
        '@type': 'WebPageElement',
        name: 'Subscriber-only Content',
        isAccessibleForFree: false,
        cssSelector: '.bookmark-content',
      };
      article.isPartOf = {
        '@type': 'CreativeWork',
        name: 'HitTags Subscriber Feed',
        url: bookmark.user?.username ? `${BASE_URL}/${bookmark.user.username}` : BASE_URL,
      };
    }

    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Home',
              item: BASE_URL,
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Bookmarks',
              item: `${BASE_URL}/explore`,
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: bookmark.title,
              item: pageUrl,
            },
          ],
        },
        article,
      ],
    };
  }

  static generatePremiumPostSchema(input: {
    title: string;
    slug: string;
    username: string;
    createdAt: string;
    visibility: 'public' | 'subscribers' | 'premium' | 'private';
    excerpt: string;
    mediaUrls?: string[];
    authorName: string;
  }) {
    const pageUrl = `${BASE_URL}/p/${input.username}/${input.slug}`;
    const isAccessibleForFree = input.visibility === 'public';

    const article: Record<string, unknown> = {
      '@type': 'Article',
      headline: input.title,
      description: input.excerpt,
      datePublished: input.createdAt,
      mainEntityOfPage: pageUrl,
      url: pageUrl,
      author: {
        '@type': 'Person',
        name: input.authorName,
        url: `${BASE_URL}/${input.username}`,
      },
      publisher: {
        '@type': 'Organization',
        name: 'HitTags',
        url: BASE_URL,
        logo: {
          '@type': 'ImageObject',
          url: `${BASE_URL}/logo.png`,
        },
      },
      isAccessibleForFree,
    };

    if (input.mediaUrls && input.mediaUrls.length > 0) {
      article.image = input.mediaUrls.slice(0, 4);
    }

    if (!isAccessibleForFree) {
      article.hasPart = {
        '@type': 'WebPageElement',
        name: 'Premium Content',
        isAccessibleForFree: false,
        cssSelector: '.premium-content',
      };
      article.isPartOf = {
        '@type': 'CreativeWork',
        name: 'HitTags Premium Feed',
        url: `${BASE_URL}/${input.username}`,
      };
    }

    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Home',
              item: BASE_URL,
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: input.authorName,
              item: `${BASE_URL}/${input.username}`,
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: input.title,
              item: pageUrl,
            },
          ],
        },
        article,
      ],
    };
  }

  // Collection Page Schema
  static generateCollectionSchema(
    collection: {
      id: string;
      name: string;
      slug: string;
      description: string | null;
      bookmark_count: number;
    },
    username: string,
    displayName: string | null,
    bookmarks: Bookmark[]
  ) {
    return {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: collection.name,
      description:
        collection.description ||
        `Curated collection of ${collection.bookmark_count} bookmarks`,
      url: `${BASE_URL}/collections/${username}/${collection.slug}`,
      numberOfItems: collection.bookmark_count,
      creator: {
        '@type': 'Person',
        name: displayName || username,
        url: `${BASE_URL}/${username}`,
      },
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: bookmarks.length,
        itemListElement: bookmarks.slice(0, 10).map((bookmark, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'WebPage',
            name: bookmark.title,
            description: bookmark.description,
            url: bookmark.url,
            author: bookmark.user
              ? {
                  '@type': 'Person',
                  name: bookmark.user.display_name || bookmark.user.username,
                  url: `${BASE_URL}/${bookmark.user.username}`,
                }
              : undefined,
          },
        })),
      },
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: BASE_URL,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Collections',
            item: `${BASE_URL}/collections`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: displayName || username,
            item: `${BASE_URL}/${username}`,
          },
          {
            '@type': 'ListItem',
            position: 4,
            name: collection.name,
            item: `${BASE_URL}/collections/${username}/${collection.slug}`,
          },
        ],
      },
    };
  }

  // Breadcrumb Schema
  static generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url,
      })),
    };
  }
}
