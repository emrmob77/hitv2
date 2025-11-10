/**
 * Admin Settings API
 * GET - Get all settings
 * POST - Update settings
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

    // Fetch settings from database
    const { data: settings, error } = await supabase
      .from('system_settings')
      .select('*')
      .single();

    if (error) {
      // If table doesn't exist or no settings, return defaults
      return NextResponse.json({
        system: {
          site_name: 'HitV2',
          site_description: 'Your intelligent bookmark manager',
          support_email: 'support@hitv2.com',
          enable_registrations: true,
          enable_social_features: true,
          enable_ai_processing: true,
          enable_email_notifications: true,
          max_bookmarks_free: 100,
          max_bookmarks_pro: 1000,
          max_bookmarks_premium: 10000,
          api_rate_limit_default: 100,
          maintenance_mode: false,
          maintenance_message: '',
        },
        email: {
          smtp_host: '',
          smtp_port: 587,
          smtp_username: '',
          smtp_password: '',
          smtp_from_email: '',
          smtp_from_name: 'HitV2',
          enable_email_verification: true,
        },
        security: {
          require_email_verification: true,
          enable_2fa: false,
          password_min_length: 8,
          max_login_attempts: 5,
          session_timeout_hours: 24,
          allowed_domains: '',
        },
      });
    }

    return NextResponse.json({
      system: settings.system_settings || {},
      email: settings.email_settings || {},
      security: settings.security_settings || {},
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { type, settings } = await request.json();

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

    // Get current settings
    const { data: currentSettings } = await supabase
      .from('system_settings')
      .select('*')
      .single();

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    // Update the appropriate settings section
    if (type === 'system') {
      updateData.system_settings = settings;
    } else if (type === 'email') {
      updateData.email_settings = settings;
    } else if (type === 'security') {
      updateData.security_settings = settings;
    }

    if (currentSettings) {
      // Update existing settings
      const { error } = await supabase
        .from('system_settings')
        .update(updateData)
        .eq('id', currentSettings.id);

      if (error) {
        console.error('Error updating settings:', error);
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
      }
    } else {
      // Insert new settings
      const { error } = await supabase.from('system_settings').insert([
        {
          ...updateData,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error('Error creating settings:', error);
        return NextResponse.json({ error: 'Failed to create settings' }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
