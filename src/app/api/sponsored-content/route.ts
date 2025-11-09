import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get sponsored content for the user
    const { data: sponsoredContent, error } = await supabase
      .from('sponsored_content')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ data: sponsoredContent });
  } catch (error) {
    console.error('Error fetching sponsored content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sponsored content' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.content_type || !body.content_id || !body.sponsor_name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create sponsored content
    const { data: sponsoredContent, error } = await supabase
      .from('sponsored_content')
      .insert({
        user_id: user.id,
        content_type: body.content_type,
        content_id: body.content_id,
        sponsor_name: body.sponsor_name,
        sponsor_logo_url: body.sponsor_logo_url,
        sponsor_url: body.sponsor_url,
        campaign_name: body.campaign_name,
        priority: body.priority || 0,
        target_audience: body.target_audience,
        budget_cents: body.budget_cents,
        cost_per_impression_cents: body.cost_per_impression_cents,
        cost_per_click_cents: body.cost_per_click_cents,
        max_impressions: body.max_impressions,
        max_clicks: body.max_clicks,
        disclosure_text: body.disclosure_text || 'Sponsored',
        is_clearly_marked: body.is_clearly_marked !== false,
        start_date: body.start_date,
        end_date: body.end_date,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data: sponsoredContent }, { status: 201 });
  } catch (error) {
    console.error('Error creating sponsored content:', error);
    return NextResponse.json(
      { error: 'Failed to create sponsored content' },
      { status: 500 }
    );
  }
}
