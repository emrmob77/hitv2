/**
 * Stripe Client Utilities
 *
 * Client-side Stripe integration utilities.
 * Works in dummy mode until Stripe keys are configured.
 */

import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null> | null = null;

/**
 * Get Stripe client instance
 */
export const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

    if (publishableKey) {
      stripePromise = loadStripe(publishableKey);
    } else {
      // Dummy mode - return null promise
      stripePromise = Promise.resolve(null);
    }
  }

  return stripePromise;
};

/**
 * Check if Stripe is configured on the client
 */
export const isStripeConfigured = (): boolean => {
  return !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
};

/**
 * Initiate checkout session
 */
export async function initiateCheckout(priceId: string): Promise<{
  success: boolean;
  error?: string;
  sessionId?: string;
}> {
  try {
    // Call checkout API
    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ priceId }),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.error || 'Failed to create checkout session',
      };
    }

    const data = await response.json();

    // If Stripe is configured, redirect to checkout
    if (isStripeConfigured() && data.sessionId) {
      const stripe = await getStripe();

      if (stripe) {
        const { error } = await stripe.redirectToCheckout({
          sessionId: data.sessionId,
        });

        if (error) {
          return {
            success: false,
            error: error.message,
          };
        }
      }
    }

    // Return success (either redirected or dummy mode)
    return {
      success: true,
      sessionId: data.sessionId,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'An unexpected error occurred',
    };
  }
}

/**
 * Open customer portal for subscription management
 */
export async function openCustomerPortal(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const response = await fetch('/api/create-portal-session', {
      method: 'POST',
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.error || 'Failed to open customer portal',
      };
    }

    const { url } = await response.json();

    // Redirect to portal
    if (url) {
      window.location.href = url;
      return { success: true };
    }

    return {
      success: false,
      error: 'No portal URL returned',
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'An unexpected error occurred',
    };
  }
}
