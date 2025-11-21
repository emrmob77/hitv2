'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Check, Crown, Sparkles, Loader2, XCircle, AlertCircle, Zap, Shield, TrendingUp, Users, Star, ArrowRight, Lock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { STRIPE_PLANS, getYearlyDiscount, type StripePlan } from '@/config/stripe';
import { initiateCheckout, isStripeConfigured } from '@/lib/stripe/client';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

function PricingContent() {
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const { toast } = useToast();
  const searchParams = useSearchParams();

  // Show messages based on URL params
  useEffect(() => {
    const canceled = searchParams.get('canceled');

    if (canceled === 'true') {
      toast({
        title: 'Checkout Canceled',
        description: 'Your checkout was canceled. No charges were made.',
        variant: 'default',
      });
    }
  }, [searchParams, toast]);

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
    setLoadingPlanId(plan.id);

    try {
      const priceId =
        billingInterval === 'monthly'
          ? plan.stripePriceIdMonthly
          : plan.stripePriceIdYearly;

      if (!priceId) {
        // Stripe not configured, proceed silently in demo mode
        setLoadingPlanId(null);
        // Simulate successful checkout and redirect to settings
        setTimeout(() => {
          window.location.href = '/dashboard/settings?success=true';
        }, 800);
        return;
      }

      const result = await initiateCheckout(priceId);

      if (!result.success) {
        toast({
          title: 'Checkout Failed',
          description: result.error || 'Failed to initiate checkout. Please try again.',
          variant: 'destructive',
        });
      }
      // If Stripe is configured, user will be redirected to Stripe checkout
      // No success toast needed as they will be redirected
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoadingPlanId(null);
    }
  };

  const getPrice = (plan: StripePlan) => {
    if (plan.monthlyPrice === 0) return 0;

    return billingInterval === 'monthly'
      ? plan.monthlyPrice
      : Math.round(plan.yearlyPrice / 12);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20 sm:py-24">
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-4 top-0 h-96 w-96 rounded-full bg-blue-200 opacity-20 blur-3xl" />
          <div className="absolute -right-4 top-40 h-96 w-96 rounded-full bg-purple-200 opacity-20 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-pink-200 opacity-20 blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="mb-8 flex justify-center">
            <div className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 text-sm font-medium text-blue-900">
              <Sparkles className="mr-2 h-4 w-4 text-blue-600" />
              Trusted by 10,000+ users worldwide
            </div>
          </div>

          <h1 className="mb-6 text-5xl sm:text-6xl font-bold leading-tight tracking-tight animate-slide-up">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Choose Your Perfect Plan
            </span>
          </h1>
          <p className="mx-auto mb-10 max-w-3xl text-xl leading-relaxed text-slate-600">
            Start organizing your digital life today. Simple pricing, powerful features.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-4 bg-white rounded-full p-1.5 shadow-md border border-slate-200">
            <button
              onClick={() => setBillingInterval('monthly')}
              className={cn(
                'px-6 py-2.5 rounded-full text-sm font-semibold transition-all',
                billingInterval === 'monthly'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingInterval('yearly')}
              className={cn(
                'px-6 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-2',
                billingInterval === 'yearly'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              Yearly
              <span className="inline-flex items-center gap-1 rounded-full bg-green-500 px-2 py-0.5 text-xs font-bold text-white">
                Save 17%
              </span>
            </button>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-slate-600">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium">30-day money back</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium">Secure payment</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium">Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="h-5 w-5 text-blue-600" />
                <p className="text-3xl font-bold text-gray-900">10,000+</p>
              </div>
              <p className="text-sm text-gray-600">Active Users</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <p className="text-3xl font-bold text-gray-900">500K+</p>
              </div>
              <p className="text-sm text-gray-600">Bookmarks Saved</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <p className="text-3xl font-bold text-gray-900">4.9/5</p>
              </div>
              <p className="text-sm text-gray-600">User Rating</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Zap className="h-5 w-5 text-purple-600" />
                <p className="text-3xl font-bold text-gray-900">99.9%</p>
              </div>
              <p className="text-sm text-gray-600">Uptime</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STRIPE_PLANS.map((plan, index) => {
              const price = getPrice(plan);
              const yearlyDiscount = getYearlyDiscount(plan);

              return (
                <Card
                  key={plan.id}
                  className={cn(
                    'relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl animate-slide-up',
                    plan.highlighted
                      ? 'border-2 border-purple-600 shadow-xl ring-4 ring-purple-100 bg-gradient-to-br from-purple-50 to-white'
                      : 'border border-gray-200 shadow-md hover:border-purple-300'
                  )}
                  style={{
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  {/* Gradient overlay for highlighted plan */}
                  {plan.highlighted && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600" />
                  )}

                  {plan.highlighted && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                      <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-1.5 text-sm font-semibold text-white shadow-lg">
                        <Crown className="h-4 w-4" />
                        Most Popular
                      </span>
                    </div>
                  )}

                  <CardHeader className="text-center pb-8 pt-8">
                    {/* Plan icon */}
                    <div className={cn(
                      "mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full",
                      plan.highlighted
                        ? "bg-gradient-to-br from-purple-600 to-blue-600"
                        : plan.tier === 'free'
                        ? "bg-gray-200"
                        : "bg-gradient-to-br from-gray-700 to-gray-900"
                    )}>
                      {plan.tier === 'free' && <Sparkles className="h-8 w-8 text-gray-600" />}
                      {plan.tier === 'pro' && <Zap className="h-8 w-8 text-white" />}
                      {plan.tier === 'enterprise' && <Crown className="h-8 w-8 text-white" />}
                    </div>

                    <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                    <CardDescription className="text-base mb-6 min-h-[48px]">
                      {plan.description}
                    </CardDescription>

                    <div className="mb-6">
                      <div className="flex items-baseline justify-center gap-1">
                        <span className={cn(
                          "text-5xl font-bold",
                          plan.highlighted ? "text-purple-600" : "text-gray-900"
                        )}>
                          ${price}
                        </span>
                        <span className="text-gray-600 text-lg">/month</span>
                      </div>
                      {billingInterval === 'yearly' && plan.monthlyPrice > 0 && (
                        <div className="mt-2 space-y-1">
                          <p className="text-sm text-gray-500">
                            ${plan.yearlyPrice} billed yearly
                          </p>
                          <p className="text-xs font-semibold text-green-600">
                            Save ${(plan.monthlyPrice * 12 - plan.yearlyPrice).toFixed(0)}/year
                          </p>
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={() => handleUpgrade(plan)}
                      variant={plan.highlighted ? 'default' : 'outline'}
                      className={cn(
                        'w-full group',
                        plan.highlighted &&
                          'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg'
                      )}
                      size="lg"
                      disabled={loadingPlanId !== null}
                    >
                      {loadingPlanId === plan.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          {plan.ctaText}
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </Button>

                    {plan.tier === 'pro' && (
                      <p className="mt-3 text-xs text-gray-500">14-day free trial • No credit card required</p>
                    )}
                  </CardHeader>

                  <CardContent>
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                        Everything in {plan.tier === 'pro' ? 'Free' : plan.tier === 'enterprise' ? 'Pro' : 'this plan'}, plus:
                      </p>
                    </div>
                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className={cn(
                            "flex-shrink-0 mt-0.5 rounded-full p-0.5",
                            plan.highlighted ? "bg-purple-100" : "bg-gray-100"
                          )}>
                            <Check
                              className={cn(
                                'h-4 w-4',
                                plan.highlighted ? 'text-purple-600' : 'text-gray-600'
                              )}
                            />
                          </div>
                          <span className="text-sm text-gray-700">{feature}</span>
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
      <section className="py-16 bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-4">
              Compare features
            </h2>
            <p className="text-gray-600 text-lg">See what's included in each plan</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 rounded-xl shadow-lg bg-white overflow-hidden">
              <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                <tr>
                  <th className="text-left py-5 px-6 font-bold text-gray-900">
                    Features
                  </th>
                  <th className="text-center py-5 px-6 font-bold text-gray-900">
                    Free
                  </th>
                  <th className="text-center py-5 px-6 font-bold text-purple-600">
                    Pro ✨
                  </th>
                  <th className="text-center py-5 px-6 font-bold text-gray-900">
                    Enterprise
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="hover:bg-blue-50/50 transition-colors">
                  <td className="py-4 px-6 font-medium text-gray-900">Bookmarks</td>
                  <td className="text-center py-4 px-6 text-gray-600 font-semibold">20</td>
                  <td className="text-center py-4 px-6 text-purple-600 font-semibold">
                    Unlimited
                  </td>
                  <td className="text-center py-4 px-6 text-gray-600 font-semibold">
                    Unlimited
                  </td>
                </tr>
                <tr className="hover:bg-blue-50/50 transition-colors">
                  <td className="py-4 px-6 font-medium text-gray-900">Collections</td>
                  <td className="text-center py-4 px-6 text-gray-600 font-semibold">3</td>
                  <td className="text-center py-4 px-6 text-purple-600 font-semibold">
                    Unlimited
                  </td>
                  <td className="text-center py-4 px-6 text-gray-600 font-semibold">
                    Unlimited
                  </td>
                </tr>
                <tr className="hover:bg-blue-50/50 transition-colors">
                  <td className="py-4 px-6 font-medium text-gray-900">Public Sharing</td>
                  <td className="text-center py-4 px-6">
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                  </td>
                  <td className="text-center py-4 px-6">
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                  </td>
                  <td className="text-center py-4 px-6">
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                  </td>
                </tr>
                <tr className="hover:bg-blue-50/50 transition-colors">
                  <td className="py-4 px-6 font-medium text-gray-900">Premium Posts</td>
                  <td className="text-center py-4 px-6 text-gray-400 text-sm">-</td>
                  <td className="text-center py-4 px-6">
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                  </td>
                  <td className="text-center py-4 px-6">
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                  </td>
                </tr>
                <tr className="hover:bg-blue-50/50 transition-colors">
                  <td className="py-4 px-6 font-medium text-gray-900">Link Groups</td>
                  <td className="text-center py-4 px-6 text-gray-400 text-sm">-</td>
                  <td className="text-center py-4 px-6">
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                  </td>
                  <td className="text-center py-4 px-6">
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                  </td>
                </tr>
                <tr className="hover:bg-blue-50/50 transition-colors">
                  <td className="py-4 px-6 font-medium text-gray-900">Affiliate Links</td>
                  <td className="text-center py-4 px-6 text-gray-400 text-sm">-</td>
                  <td className="text-center py-4 px-6">
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                  </td>
                  <td className="text-center py-4 px-6">
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                  </td>
                </tr>
                <tr className="hover:bg-blue-50/50 transition-colors">
                  <td className="py-4 px-6 font-medium text-gray-900">Subscriber System</td>
                  <td className="text-center py-4 px-6 text-gray-400 text-sm">-</td>
                  <td className="text-center py-4 px-6">
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                  </td>
                  <td className="text-center py-4 px-6">
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                  </td>
                </tr>
                <tr className="hover:bg-blue-50/50 transition-colors">
                  <td className="py-4 px-6 font-medium text-gray-900">Advanced Analytics</td>
                  <td className="text-center py-4 px-6 text-gray-400 text-sm">-</td>
                  <td className="text-center py-4 px-6">
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                  </td>
                  <td className="text-center py-4 px-6">
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                  </td>
                </tr>
                <tr className="hover:bg-blue-50/50 transition-colors">
                  <td className="py-4 px-6 font-medium text-gray-900">Team Collaboration</td>
                  <td className="text-center py-4 px-6 text-gray-400 text-sm">-</td>
                  <td className="text-center py-4 px-6 text-gray-400 text-sm">-</td>
                  <td className="text-center py-4 px-6">
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                  </td>
                </tr>
                <tr className="hover:bg-blue-50/50 transition-colors">
                  <td className="py-4 px-6 font-medium text-gray-900">Priority Support</td>
                  <td className="text-center py-4 px-6 text-gray-400 text-sm">-</td>
                  <td className="text-center py-4 px-6">
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                  </td>
                  <td className="text-center py-4 px-6">
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                  </td>
                </tr>
                <tr className="hover:bg-blue-50/50 transition-colors">
                  <td className="py-4 px-6 font-medium text-gray-900">API Access</td>
                  <td className="text-center py-4 px-6 text-gray-400 text-sm">-</td>
                  <td className="text-center py-4 px-6 text-gray-400 text-sm">-</td>
                  <td className="text-center py-4 px-6">
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                      Coming soon
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-blue-50/50 transition-colors">
                  <td className="py-4 px-6 font-medium text-gray-900">Custom Domain</td>
                  <td className="text-center py-4 px-6 text-gray-400 text-sm">-</td>
                  <td className="text-center py-4 px-6 text-gray-400 text-sm">-</td>
                  <td className="text-center py-4 px-6">
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                      Coming soon
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-4">
              Frequently asked questions
            </h2>
            <p className="text-gray-600 text-lg">
              Everything you need to know about our pricing
            </p>
          </div>

          <div className="space-y-4">
            <Card className="border-2 border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-gray-900 flex items-start gap-3">
                  <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-purple-600 text-sm font-bold">
                    ?
                  </span>
                  Can I change my plan at any time?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 ml-9">
                  Yes, you can upgrade or downgrade your plan at any time. Changes will
                  be reflected in your next billing cycle.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-gray-900 flex items-start gap-3">
                  <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-purple-600 text-sm font-bold">
                    ?
                  </span>
                  Is there a free trial for Pro plans?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 ml-9">
                  Yes, we offer a 14-day free trial for the Pro plan. No credit card
                  required.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-gray-900 flex items-start gap-3">
                  <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-purple-600 text-sm font-bold">
                    ?
                  </span>
                  What payment methods do you accept?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 ml-9">
                  We accept all major credit cards through Stripe, our payment processor.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-gray-900 flex items-start gap-3">
                  <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-purple-600 text-sm font-bold">
                    ?
                  </span>
                  Can I export my data?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 ml-9">
                  Yes, all users can export their bookmarks and collections in various
                  formats including JSON, CSV, and HTML.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-gray-900 flex items-start gap-3">
                  <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-purple-600 text-sm font-bold">
                    ?
                  </span>
                  Do you offer refunds?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 ml-9">
                  We offer a 30-day money-back guarantee for all paid plans. Contact our
                  support team for assistance.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 py-24">
        <div className="absolute inset-0">
          <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-white opacity-5 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-white opacity-5 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mb-6 inline-flex items-center rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
            <Zap className="mr-2 h-5 w-5 text-yellow-300" />
            <span className="text-sm font-semibold text-white">Start organizing in seconds</span>
          </div>

          <h2 className="mb-6 text-4xl font-bold text-white md:text-5xl">
            Ready to organize your digital life?
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-xl text-blue-100">
            Join thousands of users who are already saving time and discovering amazing content with HitTags. No credit card required.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="h-14 border-2 border-white bg-white px-8 text-lg font-semibold text-blue-600 shadow-xl transition-all hover:bg-blue-50"
            >
              <Link href="/auth/sign-up">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-14 border-2 border-white bg-transparent px-8 text-lg font-semibold text-white hover:bg-white/10"
            >
              <Link href="mailto:sales@hittags.com">Contact Sales</Link>
            </Button>
          </div>

          <div className="mt-8 flex items-center justify-center space-x-6 text-sm text-blue-100">
            <div className="flex items-center">
              <Check className="mr-2 h-5 w-5 text-green-300" />
              Free 14-day trial
            </div>
            <div className="flex items-center">
              <Check className="mr-2 h-5 w-5 text-green-300" />
              No credit card
            </div>
            <div className="flex items-center">
              <Check className="mr-2 h-5 w-5 text-green-300" />
              Cancel anytime
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-50 flex items-center justify-center">Loading...</div>}>
      <PricingContent />
    </Suspense>
  );
}
