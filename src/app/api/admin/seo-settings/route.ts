/**
 * Admin SEO Settings API
 * GET - Get SEO settings
 * POST - Update SEO settings
 */

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch SEO settings
    const { data: settings, error } = await supabase
      .from('seo_settings')
      .select('*')
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned
      console.error('Error fetching SEO settings:', error);
    }

    // Return default settings if none exist
    const defaultSettings = {
      title_template: '%s | HitV2 - Social Bookmark Platform',
      global_description:
        'Discover, organize and share your favorite web content with HitV2. The social bookmark platform for content curators, researchers and digital enthusiasts.',
      og_image_url: '',
      favicon_url: '',
      keywords: 'bookmarks, social bookmarking, content curation, web organization',
      google_analytics_id: '',
      google_search_console: '',
      bing_webmaster: '',
      robots_txt: `User-agent: *
Allow: /

User-agent: Googlebot
Allow: /
Crawl-delay: 1

User-agent: Bingbot
Allow: /
Crawl-delay: 2

Disallow: /admin/
Disallow: /api/
Disallow: /private/

Sitemap: https://hittags.com/sitemap.xml`,
    };

    return NextResponse.json({ settings: settings || defaultSettings });
  } catch (error) {
    console.error('Error in SEO settings API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const settings = await request.json();

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if settings exist
    const { data: existing } = await supabase.from('seo_settings').select('id').single();

    if (existing) {
      // Update existing settings
      const { error } = await supabase
        .from('seo_settings')
        .update({
          ...settings,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      if (error) {
        console.error('Error updating SEO settings:', error);
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
      }
    } else {
      // Insert new settings
      const { error } = await supabase.from('seo_settings').insert([
        {
          ...settings,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error('Error creating SEO settings:', error);
        return NextResponse.json({ error: 'Failed to create settings' }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving SEO settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
