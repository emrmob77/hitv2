/**
 * Admin Onboarding Settings API
 * GET - Get onboarding flow settings
 * POST - Update onboarding settings
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

    // Fetch onboarding settings
    const { data: settings, error } = await supabase
      .from('onboarding_settings')
      .select('*')
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching onboarding settings:', error);
    }

    // Return default settings if none exist
    const defaultSettings = {
      step1_enabled: true,
      step1_welcome_message: 'Welcome to HitTags!',
      step1_cta_button_text: 'Get Started',
      step2_enabled: true,
      step2_require_email_verification: true,
      step2_social_auth_enabled: true,
      step3_enabled: true,
      step3_title: 'Choose your interests',
      step3_description: 'Help us personalize your experience',
      step4_enabled: true,
      step4_skip_allowed: true,
      step4_import_methods: ['browser', 'file', 'url'],
      step5_enabled: true,
      step5_tutorial_video_url: '',
      step5_show_tips: true,
      completion_redirect_url: '/dashboard',
      skip_onboarding_allowed: false,
    };

    return NextResponse.json({ settings: settings || defaultSettings });
  } catch (error) {
    console.error('Error in onboarding settings API:', error);
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
    const { data: existing } = await supabase.from('onboarding_settings').select('id').single();

    if (existing) {
      // Update existing settings
      const { error } = await supabase
        .from('onboarding_settings')
        .update({
          ...settings,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      if (error) {
        console.error('Error updating onboarding settings:', error);
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
      }
    } else {
      // Insert new settings
      const { error } = await supabase.from('onboarding_settings').insert([
        {
          ...settings,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error('Error creating onboarding settings:', error);
        return NextResponse.json({ error: 'Failed to create settings' }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving onboarding settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
