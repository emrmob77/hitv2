import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

import { siteConfig } from '@/config/site';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || siteConfig.url;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

type TagRecord = {
  slug: string;
  updated_at: string | null;
  usage_count: number | null;
  is_trending: boolean | null;
};

function getSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase credentials are not configured for sitemap generation.');
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

function buildXml(entries: Array<{ loc: string; lastmod: string; changefreq: string; priority: string }>) {
  const urlset = entries
    .map(
      (entry) => `
  <url>
    <loc>${entry.loc}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
    )
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlset}
</urlset>`;
}

export const revalidate = 1800;

export async function GET() {
  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('tags')
      .select('slug, updated_at, usage_count, is_trending')
      .order('usage_count', { ascending: false })
      .limit(1500);

    if (error) {
      console.error('Failed to load tags for sitemap:', error);
      return NextResponse.json({ error: 'Unable to build tag sitemap' }, { status: 500 });
    }

    const entries = (data as TagRecord[]).map((tag) => {
      const usage = tag.usage_count ?? 0;
      const engagementWeight = Math.min(usage / 500, 0.3);
      const trendingBoost = tag.is_trending ? 0.1 : 0;
      const priority = Math.min(0.9, 0.6 + engagementWeight + trendingBoost);

      return {
        loc: `${baseUrl}/tag/${tag.slug}`,
        lastmod: tag.updated_at ? new Date(tag.updated_at).toISOString() : new Date().toISOString(),
        changefreq: tag.is_trending ? 'hourly' : 'daily',
        priority: priority.toFixed(2),
      };
    });

    const xml = buildXml(entries);

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Unexpected error generating tag sitemap:', error);
    return NextResponse.json({ error: 'Unable to build tag sitemap' }, { status: 500 });
  }
}
