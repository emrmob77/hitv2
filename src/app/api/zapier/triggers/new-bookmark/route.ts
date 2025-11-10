/**
 * Zapier Trigger: New Bookmark
 *
 * This endpoint is called by Zapier to fetch new bookmarks
 * Supports both polling and REST Hooks (webhooks)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  authenticateAPIRequest,
  recordAPISuccess,
  requireScope,
} from '@/lib/api/api-auth-middleware';
import { API_SCOPES } from '@/lib/api/api-key-manager';

// GET - Polling endpoint (Zapier calls this periodically)
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  const authResult = await authenticateAPIRequest(request);
  if (!authResult.success) {
    return authResult.error;
  }

  const { apiKey, userId } = authResult.context;

  const scopeCheck = requireScope(apiKey, API_SCOPES.READ_BOOKMARKS);
  if (!scopeCheck.allowed) {
    return scopeCheck.error;
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10), 100);

    // Get recent bookmarks (created in last 24 hours by default)
    const since = searchParams.get('since') || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: bookmarks } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(limit);

    await recordAPISuccess(apiKey.id, request, 200, startTime);

    // Zapier expects an array
    return NextResponse.json(bookmarks || []);
  } catch (error) {
    console.error('Zapier trigger error:', error);
    await recordAPISuccess(apiKey.id, request, 500, startTime);

    return NextResponse.json(
      { error: 'Failed to fetch bookmarks' },
      { status: 500 }
    );
  }
}

// POST - Hook subscription (Zapier calls this when user activates the zap)
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  const authResult = await authenticateAPIRequest(request);
  if (!authResult.success) {
    return authResult.error;
  }

  const { apiKey, userId } = authResult.context;

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const body = await request.json();
    const { target_url } = body;

    if (!target_url) {
      await recordAPISuccess(apiKey.id, request, 400, startTime);
      return NextResponse.json(
        { error: 'target_url is required' },
        { status: 400 }
      );
    }

    // Create webhook subscription
    const { data: subscription, error } = await supabase
      .from('zapier_integrations')
      .insert({
        user_id: userId,
        trigger_type: 'new_bookmark',
        config: { target_url },
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;

    // Also create a webhook subscription for real-time delivery
    const secretKey = crypto.randomUUID();
    await supabase
      .from('webhook_subscriptions')
      .insert({
        user_id: userId,
        url: target_url,
        events: ['bookmark.created'],
        secret_key: secretKey,
        description: 'Zapier: New Bookmark',
      });

    await recordAPISuccess(apiKey.id, request, 201, startTime);

    return NextResponse.json({
      id: subscription.id,
      message: 'Hook subscribed successfully',
    });
  } catch (error) {
    console.error('Zapier hook subscription error:', error);
    await recordAPISuccess(apiKey.id, request, 500, startTime);

    return NextResponse.json(
      { error: 'Failed to subscribe hook' },
      { status: 500 }
    );
  }
}

// DELETE - Hook unsubscription (Zapier calls this when user deactivates the zap)
export async function DELETE(request: NextRequest) {
  const startTime = Date.now();

  const authResult = await authenticateAPIRequest(request);
  if (!authResult.success) {
    return authResult.error;
  }

  const { apiKey, userId } = authResult.context;

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const searchParams = request.nextUrl.searchParams;
    const subscriptionId = searchParams.get('id');

    if (!subscriptionId) {
      await recordAPISuccess(apiKey.id, request, 400, startTime);
      return NextResponse.json(
        { error: 'Subscription ID is required' },
        { status: 400 }
      );
    }

    // Deactivate zapier integration
    await supabase
      .from('zapier_integrations')
      .update({ is_active: false })
      .eq('id', subscriptionId)
      .eq('user_id', userId);

    await recordAPISuccess(apiKey.id, request, 204, startTime);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Zapier hook unsubscription error:', error);
    await recordAPISuccess(apiKey.id, request, 500, startTime);

    return NextResponse.json(
      { error: 'Failed to unsubscribe hook' },
      { status: 500 }
    );
  }
}
