import { siteConfig } from '@/config/site';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || siteConfig.url;

interface Tag {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  usage_count: number;
}

interface Bookmark {
  id: string;
  title: string;
  description: string | null;
  url: string;
  created_at: string;
  user?: {
    username: string;
    display_name: string | null;
  };
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
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: bookmark.title,
      description: bookmark.description,
      url: bookmark.url,
      author: bookmark.user
        ? {
            '@type': 'Person',
            name: bookmark.user.display_name || bookmark.user.username,
            url: `${BASE_URL}/${bookmark.user.username}`,
          }
        : undefined,
      datePublished: bookmark.created_at,
      publisher: {
        '@type': 'Organization',
        name: 'HitTags',
        logo: {
          '@type': 'ImageObject',
          url: `${BASE_URL}/logo.png`,
        },
      },
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
