import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { WebhookManager, WEBHOOK_EVENTS } from '@/lib/webhooks/webhook-manager';

// GET /api/developer/webhooks - List webhooks
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const webhooks = await WebhookManager.listSubscriptions(user.id, supabase);

    return NextResponse.json({
      webhooks,
      count: webhooks.length,
    });
  } catch (error) {
    console.error('Error fetching webhooks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch webhooks' },
      { status: 500 }
    );
  }
}

// POST /api/developer/webhooks - Create webhook
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { url, events, api_key_id, description, headers } = body;

    if (!url || !events || events.length === 0) {
      return NextResponse.json(
        { error: 'url and events are required' },
        { status: 400 }
      );
    }

    const webhook = await WebhookManager.createSubscription(
      user.id,
      url,
      events,
      supabase,
      {
        api_key_id,
        description,
        headers,
      }
    );

    return NextResponse.json({
      message: 'Webhook created successfully',
      webhook,
      note: 'Store the secret_key securely. Use it to verify webhook signatures.',
    });
  } catch (error) {
    console.error('Error creating webhook:', error);
    return NextResponse.json(
      {
        error: 'Failed to create webhook',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/developer/webhooks - Delete webhook
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const webhookId = searchParams.get('id');

    if (!webhookId) {
      return NextResponse.json(
        { error: 'Webhook ID is required' },
        { status: 400 }
      );
    }

    await WebhookManager.deleteSubscription(webhookId, user.id, supabase);

    return NextResponse.json({
      message: 'Webhook deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting webhook:', error);
    return NextResponse.json(
      { error: 'Failed to delete webhook' },
      { status: 500 }
    );
  }
}
