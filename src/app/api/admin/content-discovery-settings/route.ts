/**
 * Admin Content Discovery Settings API
 * GET - Get content discovery flow settings
 * POST - Update content discovery settings
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();

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

    // Fetch content discovery settings
    const { data: settings, error } = await supabase
      .from('content_discovery_settings')
      .select('*')
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching content discovery settings:', error);
    }

    // Return default settings if none exist
    const defaultSettings = {
      step1_enabled: true,
      step1_default_view: 'popular',
      step1_items_per_page: 24,
      step2_enabled: true,
      step2_show_category_filter: true,
      step2_show_date_filter: true,
      step2_show_user_filter: true,
      step3_enabled: true,
      step3_layout: 'grid',
      step3_show_preview: true,
      step3_show_description: true,
      step4_enabled: true,
      step4_show_related: true,
      step4_show_similar_users: true,
      step4_show_comments: true,
      step5_enabled: true,
      step5_cta_type: 'save',
      step5_show_share_buttons: true,
      recommended_algorithm: 'collaborative',
      trending_threshold: 100,
      popular_timeframe: '7d',
    };

    return NextResponse.json({ settings: settings || defaultSettings });
  } catch (error) {
    console.error('Error in content discovery settings API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
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
    const { data: existing } = await supabase
      .from('content_discovery_settings')
      .select('id')
      .single();

    if (existing) {
      // Update existing settings
      const { error } = await supabase
        .from('content_discovery_settings')
        .update({
          ...settings,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      if (error) {
        console.error('Error updating content discovery settings:', error);
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
      }
    } else {
      // Insert new settings
      const { error } = await supabase.from('content_discovery_settings').insert([
        {
          ...settings,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error('Error creating content discovery settings:', error);
        return NextResponse.json({ error: 'Failed to create settings' }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving content discovery settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
