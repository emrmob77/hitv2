'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Crown, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { STRIPE_PLANS, getYearlyDiscount, type StripePlan } from '@/config/stripe';
import { cn } from '@/lib/utils';

export default function PricingPage() {
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');

  const handleUpgrade = async (plan: StripePlan) => {
    if (plan.tier === 'free') {
      // Redirect to signup
      window.location.href = '/auth/register';
      return;
    }

    if (plan.tier === 'enterprise') {
      // Redirect to contact/sales page
      window.location.href = 'mailto:sales@hittags.com?subject=Enterprise Plan Inquiry';
      return;
    }

    // For Pro plan, initiate checkout
    try {
      const priceId =
        billingInterval === 'monthly'
          ? plan.stripePriceIdMonthly
          : plan.stripePriceIdYearly;

      if (!priceId) {
        // Stripe not configured, show message
        alert(
          'Stripe checkout is not configured yet. This is a demo environment. In production, you would be redirected to Stripe checkout.'
        );
        return;
      }

      // Call checkout API
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });

      const { sessionId, error } = await response.json();

      if (error) {
        alert(error);
        return;
      }

      // Redirect to Stripe checkout would happen here
      console.log('Stripe checkout session:', sessionId);
      alert('Checkout initiated! In production, you would be redirected to Stripe.');
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to initiate checkout. Please try again.');
    }
  };

  const getPrice = (plan: StripePlan) => {
    if (plan.monthlyPrice === 0) return 0;

    return billingInterval === 'monthly'
      ? plan.monthlyPrice
      : Math.round(plan.yearlyPrice / 12);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <section className="bg-white py-16 border-b border-neutral-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-neutral-600 mb-8">
            Choose the plan that works best for you
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center mb-8 gap-4">
            <span
              className={cn(
                'text-sm font-medium transition-colors',
                billingInterval === 'monthly' ? 'text-neutral-900' : 'text-neutral-500'
              )}
            >
              Monthly
            </span>
            <button
              onClick={() =>
                setBillingInterval(billingInterval === 'monthly' ? 'yearly' : 'monthly')
              }
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                billingInterval === 'yearly' ? 'bg-neutral-900' : 'bg-neutral-300'
              )}
            >
              <span
                className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  billingInterval === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                )}
              />
            </button>
            <span
              className={cn(
                'text-sm font-medium transition-colors',
                billingInterval === 'yearly' ? 'text-neutral-900' : 'text-neutral-500'
              )}
            >
              Yearly
            </span>
            {billingInterval === 'yearly' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                <Sparkles className="h-3 w-3" />
                Save up to 17%
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STRIPE_PLANS.map((plan) => {
              const price = getPrice(plan);
              const yearlyDiscount = getYearlyDiscount(plan);

              return (
                <Card
                  key={plan.id}
                  className={cn(
                    'relative',
                    plan.highlighted &&
                      'border-2 border-neutral-900 shadow-lg ring-4 ring-neutral-100'
                  )}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-neutral-900 px-4 py-1 text-sm font-medium text-white">
                        <Crown className="h-4 w-4" />
                        Most Popular
                      </span>
                    </div>
                  )}

                  <CardHeader className="text-center pb-8">
                    <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                    <CardDescription className="text-base mb-6">
                      {plan.description}
                    </CardDescription>

                    <div className="mb-6">
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-4xl font-bold text-neutral-900">
                          ${price}
                        </span>
                        <span className="text-neutral-600">/month</span>
                      </div>
                      {billingInterval === 'yearly' && plan.monthlyPrice > 0 && (
                        <p className="text-sm text-neutral-500 mt-2">
                          ${plan.yearlyPrice} billed yearly
                        </p>
                      )}
                    </div>

                    <Button
                      onClick={() => handleUpgrade(plan)}
                      variant={plan.highlighted ? 'default' : 'outline'}
                      className={cn(
                        'w-full',
                        plan.highlighted &&
                          'bg-neutral-900 hover:bg-neutral-800 text-white'
                      )}
                      size="lg"
                    >
                      {plan.ctaText}
                    </Button>
                  </CardHeader>

                  <CardContent>
                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <Check
                            className={cn(
                              'h-5 w-5 flex-shrink-0 mt-0.5',
                              plan.highlighted ? 'text-neutral-900' : 'text-neutral-600'
                            )}
                          />
                          <span className="text-sm text-neutral-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">
              Compare features
            </h2>
            <p className="text-neutral-600">See what's included in each plan</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border border-neutral-200 rounded-lg">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-neutral-900">
                    Features
                  </th>
                  <th className="text-center py-4 px-6 font-semibold text-neutral-900">
                    Free
                  </th>
                  <th className="text-center py-4 px-6 font-semibold text-neutral-900">
                    Pro
                  </th>
                  <th className="text-center py-4 px-6 font-semibold text-neutral-900">
                    Enterprise
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                <tr>
                  <td className="py-4 px-6 text-neutral-700">Bookmarks</td>
                  <td className="text-center py-4 px-6 text-neutral-600">20</td>
                  <td className="text-center py-4 px-6 text-neutral-600">
                    Unlimited
                  </td>
                  <td className="text-center py-4 px-6 text-neutral-600">
                    Unlimited
                  </td>
                </tr>
                <tr className="bg-neutral-50">
                  <td className="py-4 px-6 text-neutral-700">Collections</td>
                  <td className="text-center py-4 px-6 text-neutral-600">3</td>
                  <td className="text-center py-4 px-6 text-neutral-600">
                    Unlimited
                  </td>
                  <td className="text-center py-4 px-6 text-neutral-600">
                    Unlimited
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-neutral-700">Public Sharing</td>
                  <td className="text-center py-4 px-6">
                    <Check className="h-5 w-5 text-green-600 inline" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <Check className="h-5 w-5 text-green-600 inline" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <Check className="h-5 w-5 text-green-600 inline" />
                  </td>
                </tr>
                <tr className="bg-neutral-50">
                  <td className="py-4 px-6 text-neutral-700">Premium Posts</td>
                  <td className="text-center py-4 px-6 text-neutral-400 text-sm">-</td>
                  <td className="text-center py-4 px-6">
                    <Check className="h-5 w-5 text-green-600 inline" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <Check className="h-5 w-5 text-green-600 inline" />
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-neutral-700">Link Groups</td>
                  <td className="text-center py-4 px-6 text-neutral-400 text-sm">-</td>
                  <td className="text-center py-4 px-6">
                    <Check className="h-5 w-5 text-green-600 inline" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <Check className="h-5 w-5 text-green-600 inline" />
                  </td>
                </tr>
                <tr className="bg-neutral-50">
                  <td className="py-4 px-6 text-neutral-700">Affiliate Links</td>
                  <td className="text-center py-4 px-6 text-neutral-400 text-sm">-</td>
                  <td className="text-center py-4 px-6">
                    <Check className="h-5 w-5 text-green-600 inline" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <Check className="h-5 w-5 text-green-600 inline" />
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-neutral-700">Subscriber System</td>
                  <td className="text-center py-4 px-6 text-neutral-400 text-sm">-</td>
                  <td className="text-center py-4 px-6">
                    <Check className="h-5 w-5 text-green-600 inline" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <Check className="h-5 w-5 text-green-600 inline" />
                  </td>
                </tr>
                <tr className="bg-neutral-50">
                  <td className="py-4 px-6 text-neutral-700">Advanced Analytics</td>
                  <td className="text-center py-4 px-6 text-neutral-400 text-sm">-</td>
                  <td className="text-center py-4 px-6">
                    <Check className="h-5 w-5 text-green-600 inline" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <Check className="h-5 w-5 text-green-600 inline" />
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-neutral-700">Team Collaboration</td>
                  <td className="text-center py-4 px-6 text-neutral-400 text-sm">-</td>
                  <td className="text-center py-4 px-6 text-neutral-400 text-sm">-</td>
                  <td className="text-center py-4 px-6">
                    <Check className="h-5 w-5 text-green-600 inline" />
                  </td>
                </tr>
                <tr className="bg-neutral-50">
                  <td className="py-4 px-6 text-neutral-700">Priority Support</td>
                  <td className="text-center py-4 px-6 text-neutral-400 text-sm">-</td>
                  <td className="text-center py-4 px-6">
                    <Check className="h-5 w-5 text-green-600 inline" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <Check className="h-5 w-5 text-green-600 inline" />
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-neutral-700">API Access</td>
                  <td className="text-center py-4 px-6 text-neutral-400 text-sm">-</td>
                  <td className="text-center py-4 px-6 text-neutral-400 text-sm">-</td>
                  <td className="text-center py-4 px-6 text-neutral-600 text-sm">Coming soon</td>
                </tr>
                <tr className="bg-neutral-50">
                  <td className="py-4 px-6 text-neutral-700">Custom Domain</td>
                  <td className="text-center py-4 px-6 text-neutral-400 text-sm">-</td>
                  <td className="text-center py-4 px-6 text-neutral-400 text-sm">-</td>
                  <td className="text-center py-4 px-6 text-neutral-600 text-sm">Coming soon</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">
              Frequently asked questions
            </h2>
            <p className="text-neutral-600">
              Everything you need to know about our pricing
            </p>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Can I change my plan at any time?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-600">
                  Yes, you can upgrade or downgrade your plan at any time. Changes will
                  be reflected in your next billing cycle.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Is there a free trial for Pro plans?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-600">
                  Yes, we offer a 14-day free trial for the Pro plan. No credit card
                  required.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  What payment methods do you accept?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-600">
                  We accept all major credit cards through Stripe, our payment processor.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I export my data?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-600">
                  Yes, all users can export their bookmarks and collections in various
                  formats including JSON, CSV, and HTML.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Do you offer refunds?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-600">
                  We offer a 30-day money-back guarantee for all paid plans. Contact our
                  support team for assistance.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">
            Ready to get started?
          </h2>
          <p className="text-xl text-neutral-600 mb-8">
            Join thousands of users who organize their web content with HitTags
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-neutral-900 hover:bg-neutral-800">
              <Link href="/auth/register">Start Free Trial</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="mailto:sales@hittags.com">Contact Sales</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
