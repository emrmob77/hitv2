import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

import { siteConfig } from '@/config/site';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || siteConfig.url;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

type BookmarkRecord = {
  id: string;
  slug: string | null;
  updated_at: string;
  view_count: number | null;
  like_count: number | null;
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

export const revalidate = 3600;

export async function GET() {
  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('bookmarks')
      .select('id, slug, updated_at, view_count, like_count')
      .eq('is_public', true)
      .order('updated_at', { ascending: false })
      .limit(1500);

    if (error) {
      console.error('Failed to load bookmarks for sitemap:', error);
      return NextResponse.json({ error: 'Unable to build bookmark sitemap' }, { status: 500 });
    }

    const entries = (data as BookmarkRecord[]).map((bookmark) => {
      const engagementScore = (bookmark.view_count ?? 0) + (bookmark.like_count ?? 0) * 2;
      const priority = Math.min(0.9, 0.5 + Math.min(engagementScore / 1000, 0.4));

      return {
        loc: `${baseUrl}/bookmark/${bookmark.id}/${bookmark.slug ?? bookmark.id}`,
        lastmod: new Date(bookmark.updated_at).toISOString(),
        changefreq: 'weekly',
        priority: priority.toFixed(2),
      };
    });

    const xml = buildXml(entries);

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Unexpected error generating bookmark sitemap:', error);
    return NextResponse.json({ error: 'Unable to build bookmark sitemap' }, { status: 500 });
  }
}
