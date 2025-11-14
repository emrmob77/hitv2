/**
 * Webhook Processing Cron Job
 *
 * This endpoint should be called periodically (e.g., every 5 minutes) by a cron job
 * to process pending webhook deliveries.
 *
 * Configure in vercel.json or similar with schedule:
 * "0 0,5,10,15,20,25,30,35,40,45,50,55 * * *"
 * This runs every 5 minutes at the top of each 5-minute interval.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { WebhookManager } from '@/lib/webhooks/webhook-manager';

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret (for security)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Process pending webhooks
    await WebhookManager.processPendingWebhooks(supabase);

    return NextResponse.json({
      message: 'Webhook processing completed',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error processing webhooks:', error);
    return NextResponse.json(
      {
        error: 'Failed to process webhooks',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Also support POST for manual triggering
export async function POST(request: NextRequest) {
  return GET(request);
}
