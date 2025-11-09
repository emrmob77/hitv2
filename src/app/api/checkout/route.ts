import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
// import Stripe from 'stripe'; // Uncomment when Stripe is configured

/**
 * Stripe Checkout API Endpoint
 *
 * Creates a Stripe checkout session for subscription purchase.
 * Currently in DUMMY/MOCK mode - will use real Stripe when API keys are configured.
 *
 * Usage:
 * POST /api/checkout
 * Body: { priceId: string }
 * Returns: { sessionId: string } or { error: string }
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

    // Get price ID from request body
    const { priceId } = await request.json();

    if (!priceId) {
      return NextResponse.json({ error: 'Price ID is required' }, { status: 400 });
    }

    // Get user profile for email
    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single();

    // Check if Stripe is configured
    const stripeConfigured = !!(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY &&
      process.env.STRIPE_SECRET_KEY
    );

    if (!stripeConfigured) {
      // DUMMY MODE: Return mock session ID
      console.log('[Checkout] DUMMY MODE - Stripe not configured');
      console.log('[Checkout] Would create session for:', {
        userId: user.id,
        email: user.email,
        priceId,
        username: profile?.username,
      });

      // Return mock session ID
      return NextResponse.json({
        sessionId: `mock_session_${Date.now()}`,
        message:
          'This is a demo checkout. Add Stripe API keys to enable real payments.',
      });
    }

    // REAL STRIPE MODE (uncomment when ready):
    /*
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16',
    });

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard/settings?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/pricing?canceled=true`,
      client_reference_id: user.id, // Used to identify user in webhook
      customer_email: user.email,
      metadata: {
        userId: user.id,
        username: profile?.username || '',
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          username: profile?.username || '',
        },
      },
    });

    return NextResponse.json({ sessionId: session.id });
    */

    // For now, return mock response
    return NextResponse.json({
      sessionId: `mock_session_${Date.now()}`,
      message: 'Stripe not fully configured yet',
    });
  } catch (error: any) {
    console.error('[Checkout] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session', details: error?.message },
      { status: 500 }
    );
  }
}
