import { NextResponse } from 'next/server';

import { createSupabaseApiClient } from '@/lib/supabase/api';

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseApiClient(request);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (!user || authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const creatorId = body?.creator_id;

    if (!creatorId) {
      return NextResponse.json({ error: 'creator_id is required' }, { status: 400 });
    }

    if (creatorId === user.id) {
      return NextResponse.json(
        { error: 'You cannot subscribe to yourself' },
        { status: 400 }
      );
    }

    const { data: existing, error: existingError } = await supabase
      .from('subscriptions_user')
      .select('id, status')
      .eq('subscriber_id', user.id)
      .eq('creator_id', creatorId)
      .maybeSingle();

    if (existingError) {
      console.error('Subscription lookup failed:', existingError);
      return NextResponse.json(
        { error: existingError.message },
        { status: 500 }
      );
    }

    let isSubscribed = false;

    if (existing?.status === 'active') {
      const { error: deactivateError } = await supabase
        .from('subscriptions_user')
        .update({ status: 'canceled', updated_at: new Date().toISOString() })
        .eq('id', existing.id);

      if (deactivateError) {
        return NextResponse.json(
          { error: deactivateError.message },
          { status: 500 }
        );
      }
    } else if (existing) {
      const { error: reactivateError } = await supabase
        .from('subscriptions_user')
        .update({ status: 'active', updated_at: new Date().toISOString() })
        .eq('id', existing.id);

      if (reactivateError) {
        return NextResponse.json(
          { error: reactivateError.message },
          { status: 500 }
        );
      }

      isSubscribed = true;
    } else {
      const { error: insertError } = await supabase
        .from('subscriptions_user')
        .insert({
          subscriber_id: user.id,
          creator_id: creatorId,
          status: 'active',
        });

      if (insertError) {
        return NextResponse.json(
          { error: insertError.message },
          { status: 500 }
        );
      }

      isSubscribed = true;

      // Create notification for creator
      const { data: subscriberProfile } = await supabase
        .from('profiles')
        .select('username, display_name')
        .eq('id', user.id)
        .single();

      if (subscriberProfile) {
        await supabase.from('notifications').insert({
          user_id: creatorId,
          type: 'subscription',
          title: 'New subscriber',
          message: `${subscriberProfile.display_name || subscriberProfile.username} subscribed to your content`,
          data: {
            subscriber_id: user.id,
            subscriber_username: subscriberProfile.username,
            subscriber_display_name: subscriberProfile.display_name,
            action: 'subscribed',
          },
          action_url: `/${subscriberProfile.username}`,
          is_read: false,
        });

        // Create activity
        await supabase.from('activities').insert({
          user_id: user.id,
          action: 'subscribe',
          object_type: 'user',
          object_id: creatorId,
          is_public: false,
        });
      }
    }

    return NextResponse.json({
      success: true,
      isSubscribed,
    });
  } catch (error: any) {
    console.error('Subscriptions API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message },
      { status: 500 }
    );
  }
}
