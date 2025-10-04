import { MetadataRoute } from 'next';

import { siteConfig } from '@/config/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || siteConfig.url;

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
    // Fetch tags from Supabase directly
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Fetch tags
    const { data: tags } = await supabase
      .from('tags')
      .select('slug')
      .limit(1000);

    const tagPages = (tags || []).map((tag: any) => ({
      url: `${baseUrl}/tag/${tag.slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }));

    // Fetch collections
    const { data: collections } = await supabase
      .from('collections')
      .select('slug, updated_at, profiles!inner(username)')
      .eq('is_public', true)
      .limit(1000);

    const collectionPages = (collections || []).map((collection: any) => ({
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
