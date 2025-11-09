import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
// import Stripe from 'stripe'; // Uncomment when Stripe is configured

/**
 * Customer Portal Session API
 *
 * Creates a Stripe customer portal session for subscription management.
 * Currently in DUMMY/MOCK mode - will use real Stripe when API keys are configured.
 */

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile with Stripe customer ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, subscription_tier')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Check if user has a subscription
    if (!profile.stripe_customer_id && profile.subscription_tier === 'free') {
      return NextResponse.json(
        {
          error: 'No active subscription found. Please upgrade to a paid plan first.',
        },
        { status: 400 }
      );
    }

    // Check if Stripe is configured
    const stripeConfigured = !!(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY &&
      process.env.STRIPE_SECRET_KEY
    );

    if (!stripeConfigured) {
      // DUMMY MODE: Return mock portal URL
      console.log('[Customer Portal] DUMMY MODE - Stripe not configured');
      console.log('[Customer Portal] Would create portal for:', {
        userId: user.id,
        customerId: profile.stripe_customer_id,
        tier: profile.subscription_tier,
      });

      // Return mock URL that redirects back to settings
      return NextResponse.json({
        url: '/dashboard/settings?portal=demo',
        message: 'This is a demo portal. Add Stripe API keys to enable real portal.',
      });
    }

    // REAL STRIPE MODE (uncomment when ready):
    /*
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16',
    });

    // Create customer portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id!,
      return_url: `${process.env.NEXT_PUBLIC_URL}/dashboard/settings`,
    });

    return NextResponse.json({ url: portalSession.url });
    */

    // For now, return mock response
    return NextResponse.json({
      url: '/dashboard/settings?portal=demo',
      message: 'Stripe not fully configured yet',
    });
  } catch (error: any) {
    console.error('[Customer Portal] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create portal session',
        details: error?.message,
      },
      { status: 500 }
    );
  }
}
