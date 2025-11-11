# Stripe Integration Setup Guide

This guide will help you integrate Stripe for subscription payments when you're ready.

## Current Status

✅ **Completed (Mock Mode)**
- Feature gate system with tier-based limits
- Subscription management UI
- Billing history interface (mock data)
- Usage tracking and indicators
- Webhook endpoint placeholder

⏳ **Pending (Requires Stripe Account)**
- Real payment processing
- Webhook signature verification
- Invoice storage
- Customer portal integration

## Prerequisites

1. **Stripe Account**: Sign up at https://stripe.com
2. **Stripe CLI**: Install for local webhook testing
3. **Environment Variables**: Configure in `.env.local`

## Step 1: Create Stripe Account and Get API Keys

1. Go to https://dashboard.stripe.com/register
2. Complete account setup
3. Navigate to **Developers → API Keys**
4. Copy the following keys:
   - **Publishable Key** (starts with `pk_test_`)
   - **Secret Key** (starts with `sk_test_`)

## Step 2: Create Products and Prices

### Pro Plan
```bash
# Create product
stripe products create \
  --name="Pro Plan" \
  --description="For power users and content creators"

# Create monthly price
stripe prices create \
  --product=prod_XXX \
  --unit-amount=2900 \
  --currency=usd \
  --recurring[interval]=month

# Create yearly price (save 17%)
stripe prices create \
  --product=prod_XXX \
  --unit-amount=29000 \
  --currency=usd \
  --recurring[interval]=year
```

### Enterprise Plan
```bash
# Create product
stripe products create \
  --name="Enterprise Plan" \
  --description="For teams and organizations"

# Create monthly price
stripe prices create \
  --product=prod_XXX \
  --unit-amount=9900 \
  --currency=usd \
  --recurring[interval]=month

# Create yearly price
stripe prices create \
  --product=prod_XXX \
  --unit-amount=99000 \
  --currency=usd \
  --recurring[interval]=year
```

## Step 3: Configure Environment Variables

Add to `.env.local`:

```bash
# Stripe Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs
NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_ENTERPRISE_MONTHLY_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_ENTERPRISE_YEARLY_PRICE_ID=price_...
```

## Step 4: Install Stripe SDK

```bash
npm install stripe @stripe/stripe-js
```

## Step 5: Update Webhook Handler

1. Open `/src/app/api/webhooks/stripe/route.ts`
2. Uncomment the Stripe SDK initialization
3. Uncomment webhook signature verification
4. Uncomment database update logic

## Step 6: Create Checkout Session API

Create `/src/app/api/checkout/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { priceId } = await request.json();

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard/settings?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/pricing?canceled=true`,
    client_reference_id: user.id,
    customer_email: user.email,
  });

  return NextResponse.json({ sessionId: session.id });
}
```

## Step 7: Update Pricing Page

Add checkout button handlers:

```typescript
'use client';

import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export function PricingCard({ priceId }: { priceId: string }) {
  const handleCheckout = async () => {
    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId }),
    });

    const { sessionId } = await response.json();
    const stripe = await stripePromise;

    await stripe?.redirectToCheckout({ sessionId });
  };

  return (
    <button onClick={handleCheckout}>
      Upgrade to Pro
    </button>
  );
}
```

## Step 8: Set Up Webhooks

### For Local Development

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### For Production

1. Go to **Stripe Dashboard → Developers → Webhooks**
2. Click **Add Endpoint**
3. Enter your production URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the **Signing Secret** to `STRIPE_WEBHOOK_SECRET`

## Step 9: Add Database Columns

Add Stripe-related columns to `profiles` table:

```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT;

CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer
  ON profiles(stripe_customer_id);
```

Optional: Create `invoices` table for billing history:

```sql
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_invoice_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL,
  invoice_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invoices_user ON invoices(user_id);
CREATE INDEX idx_invoices_stripe ON invoices(stripe_invoice_id);
```

## Step 10: Test the Integration

### Test Cards (Stripe Test Mode)

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires Auth**: `4000 0025 0000 3155`

Use any future expiry date and any CVC.

### Test Scenarios

1. **New Subscription**: Complete checkout → Verify tier upgrade
2. **Webhook Processing**: Check logs for subscription events
3. **Limit Enforcement**: Try creating bookmarks at limit
4. **Cancellation**: Cancel subscription → Verify downgrade to free
5. **Failed Payment**: Use decline card → Check notification

## Step 11: Go Live

1. Switch from test keys to live keys
2. Update webhook endpoints to production URL
3. Test with real cards in small amounts
4. Monitor Stripe Dashboard for errors
5. Set up email notifications for payment failures

## Helpful Resources

- [Stripe Docs](https://stripe.com/docs)
- [Next.js + Stripe Example](https://github.com/vercel/next.js/tree/canary/examples/with-stripe-typescript)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Webhook Best Practices](https://stripe.com/docs/webhooks/best-practices)

## Support

If you encounter issues:
1. Check Stripe Dashboard logs
2. Review webhook event history
3. Test with Stripe CLI locally
4. Contact Stripe support if needed

---

**Note**: The current implementation is in mock mode and will work without Stripe. When you're ready to accept real payments, follow this guide to activate the integration.
