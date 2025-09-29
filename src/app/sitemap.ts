import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hittags.com';

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/explore`,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/trending`,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
  ];

  try {
    // Fetch tags
    const tagsRes = await fetch(`${baseUrl}/api/tags?limit=1000`, {
      next: { revalidate: 3600 },
    });
    const tagsData = await tagsRes.json();
    const tags = tagsData.tags || [];

    const tagPages = tags.map((tag: any) => ({
      url: `${baseUrl}/tags/${tag.slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }));

    // Fetch collections
    const collectionsRes = await fetch(`${baseUrl}/api/collections?limit=1000`, {
      next: { revalidate: 3600 },
    });
    const collectionsData = await collectionsRes.json();
    const collections = collectionsData.collections || [];

    const collectionPages = collections.map((collection: any) => ({
      url: `${baseUrl}/collections/${collection.profiles?.username}/${collection.slug}`,
      lastModified: new Date(collection.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    return [...staticPages, ...tagPages, ...collectionPages];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return staticPages;
  }
}