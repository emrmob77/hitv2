/**
 * Admin Bookmark Flow Settings API
 * GET - Get bookmark add flow settings
 * POST - Update bookmark flow settings
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

    // Fetch bookmark flow settings
    const { data: settings, error } = await supabase
      .from('bookmark_flow_settings')
      .select('*')
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching bookmark flow settings:', error);
    }

    // Return default settings if none exist
    const defaultSettings = {
      step1_enabled: true,
      step1_auto_fetch_metadata: true,
      step1_show_url_preview: true,
      step2_enabled: true,
      step2_required_fields: ['title', 'url'],
      step2_optional_fields: ['description', 'tags', 'collection'],
      step2_auto_suggest_tags: true,
      step3_enabled: true,
      step3_default_visibility: 'private',
      step3_allow_public: true,
      step3_allow_unlisted: true,
      step4_enabled: true,
      step4_suggest_collections: true,
      step4_allow_new_collection: true,
      step5_enabled: true,
      step5_show_similar_bookmarks: true,
      step5_completion_message: 'Bookmark saved successfully!',
      step5_redirect_after_save: 'view',
      browser_extension_enabled: true,
      quick_save_enabled: true,
      bulk_import_enabled: true,
      ai_categorization_enabled: true,
      duplicate_detection_enabled: true,
    };

    return NextResponse.json({ settings: settings || defaultSettings });
  } catch (error) {
    console.error('Error in bookmark flow settings API:', error);
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
    const { data: existing } = await supabase.from('bookmark_flow_settings').select('id').single();

    if (existing) {
      // Update existing settings
      const { error } = await supabase
        .from('bookmark_flow_settings')
        .update({
          ...settings,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      if (error) {
        console.error('Error updating bookmark flow settings:', error);
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
      }
    } else {
      // Insert new settings
      const { error } = await supabase.from('bookmark_flow_settings').insert([
        {
          ...settings,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error('Error creating bookmark flow settings:', error);
        return NextResponse.json({ error: 'Failed to create settings' }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving bookmark flow settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
