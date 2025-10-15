import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createSupabaseServerClient } from '@/lib/supabase/server';

/**
 * Stripe Webhook Handler
 *
 * This endpoint will handle Stripe webhook events for subscription management.
 * Currently in placeholder mode - will be activated when Stripe is configured.
 *
 * Events to handle:
 * - checkout.session.completed: New subscription created
 * - customer.subscription.updated: Subscription plan changed
 * - customer.subscription.deleted: Subscription cancelled
 * - invoice.payment_succeeded: Successful payment
 * - invoice.payment_failed: Failed payment
 */

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = headers().get('stripe-signature');

    // TODO: Verify webhook signature with Stripe
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    // const event = stripe.webhooks.constructEvent(
    //   body,
    //   signature!,
    //   process.env.STRIPE_WEBHOOK_SECRET!
    // );

    // For now, return a placeholder response
    console.log('[Stripe Webhook] Received webhook (placeholder mode)');
    console.log('[Stripe Webhook] Signature:', signature);

    // Parse the event (mock for now)
    let event;
    try {
      event = JSON.parse(body);
    } catch (err) {
      console.error('[Stripe Webhook] Invalid JSON:', err);
      return NextResponse.json(
        { error: 'Invalid payload' },
        { status: 400 }
      );
    }

    // Log the event type
    console.log('[Stripe Webhook] Event type:', event.type);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;

      default:
        console.log('[Stripe Webhook] Unhandled event type:', event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('[Stripe Webhook] Error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed', details: error?.message },
      { status: 500 }
    );
  }
}

/**
 * Handle successful checkout session
 * Updates user's subscription tier in the database
 */
async function handleCheckoutSessionCompleted(session: any) {
  console.log('[Stripe] Checkout session completed:', session.id);

  // TODO: Implement when Stripe is connected
  // const supabase = await createSupabaseServerClient();
  // const customerId = session.customer;
  // const subscriptionId = session.subscription;
  //
  // // Get subscription details from Stripe
  // const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  //
  // // Determine tier from price ID
  // const tier = getTierFromPriceId(subscription.items.data[0].price.id);
  //
  // // Update user profile
  // await supabase
  //   .from('profiles')
  //   .update({
  //     subscription_tier: tier,
  //     is_premium: tier !== 'free',
  //     stripe_customer_id: customerId,
  //     stripe_subscription_id: subscriptionId,
  //     subscription_status: 'active',
  //   })
  //   .eq('stripe_customer_id', customerId);

  console.log('[Stripe] Would update user subscription to active');
}

/**
 * Handle subscription updates (plan changes, renewals)
 */
async function handleSubscriptionUpdated(subscription: any) {
  console.log('[Stripe] Subscription updated:', subscription.id);

  // TODO: Implement when Stripe is connected
  // const supabase = await createSupabaseServerClient();
  // const tier = getTierFromPriceId(subscription.items.data[0].price.id);
  //
  // await supabase
  //   .from('profiles')
  //   .update({
  //     subscription_tier: tier,
  //     subscription_status: subscription.status,
  //   })
  //   .eq('stripe_subscription_id', subscription.id);

  console.log('[Stripe] Would update subscription details');
}

/**
 * Handle subscription cancellation
 */
async function handleSubscriptionDeleted(subscription: any) {
  console.log('[Stripe] Subscription deleted:', subscription.id);

  // TODO: Implement when Stripe is connected
  // const supabase = await createSupabaseServerClient();
  //
  // await supabase
  //   .from('profiles')
  //   .update({
  //     subscription_tier: 'free',
  //     is_premium: false,
  //     subscription_status: 'canceled',
  //   })
  //   .eq('stripe_subscription_id', subscription.id);

  console.log('[Stripe] Would downgrade user to free plan');
}

/**
 * Handle successful payment
 */
async function handleInvoicePaymentSucceeded(invoice: any) {
  console.log('[Stripe] Invoice payment succeeded:', invoice.id);

  // TODO: Store invoice in database for billing history
  // const supabase = await createSupabaseServerClient();
  //
  // await supabase.from('invoices').insert({
  //   stripe_invoice_id: invoice.id,
  //   stripe_customer_id: invoice.customer,
  //   amount: invoice.amount_paid,
  //   status: 'paid',
  //   invoice_url: invoice.hosted_invoice_url,
  //   created_at: new Date(invoice.created * 1000).toISOString(),
  // });

  console.log('[Stripe] Would store invoice in database');
}

/**
 * Handle failed payment
 */
async function handleInvoicePaymentFailed(invoice: any) {
  console.log('[Stripe] Invoice payment failed:', invoice.id);

  // TODO: Send notification to user about failed payment
  // const supabase = await createSupabaseServerClient();
  //
  // const { data: profile } = await supabase
  //   .from('profiles')
  //   .select('id')
  //   .eq('stripe_customer_id', invoice.customer)
  //   .single();
  //
  // if (profile) {
  //   await supabase.from('notifications').insert({
  //     user_id: profile.id,
  //     type: 'payment_failed',
  //     title: 'Payment Failed',
  //     message: 'Your recent payment failed. Please update your payment method.',
  //     action_url: '/dashboard/settings',
  //   });
  // }

  console.log('[Stripe] Would notify user about failed payment');
}

/**
 * Helper: Map Stripe price ID to subscription tier
 */
function getTierFromPriceId(priceId: string): 'free' | 'pro' | 'enterprise' {
  // TODO: Map actual Stripe price IDs to tiers
  // const PRICE_TO_TIER: Record<string, 'free' | 'pro' | 'enterprise'> = {
  //   'price_pro_monthly': 'pro',
  //   'price_pro_yearly': 'pro',
  //   'price_enterprise_monthly': 'enterprise',
  //   'price_enterprise_yearly': 'enterprise',
  // };
  //
  // return PRICE_TO_TIER[priceId] || 'free';

  console.log('[Stripe] Would map price ID to tier:', priceId);
  return 'pro'; // Default for testing
}
