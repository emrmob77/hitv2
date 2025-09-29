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
      url: 'https://hittags.com',
      description:
        'Social bookmarking platform for discovering, saving, and sharing the best web resources.',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://hittags.com/search?q={search_term_string}',
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
      url: 'https://hittags.com',
      logo: 'https://hittags.com/logo.png',
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
      url: `https://hittags.com/tags/${tag.slug}`,
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
                  url: `https://hittags.com/users/${bookmark.user.username}`,
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
            item: 'https://hittags.com',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Tags',
            item: 'https://hittags.com/tags',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: tag.name,
            item: `https://hittags.com/tags/${tag.slug}`,
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
            url: `https://hittags.com/users/${bookmark.user.username}`,
          }
        : undefined,
      datePublished: bookmark.created_at,
      publisher: {
        '@type': 'Organization',
        name: 'HitTags',
        logo: {
          '@type': 'ImageObject',
          url: 'https://hittags.com/logo.png',
        },
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