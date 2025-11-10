import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { WebhookManager } from '@/lib/webhooks/webhook-manager';

// GET /api/developer/webhooks/:id/deliveries - Get delivery logs
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);

    const deliveries = await WebhookManager.getDeliveryLogs(
      params.id,
      user.id,
      supabase,
      limit
    );

    return NextResponse.json({
      webhook_id: params.id,
      deliveries,
      count: deliveries.length,
    });
  } catch (error) {
    console.error('Error fetching webhook deliveries:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch webhook deliveries',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
