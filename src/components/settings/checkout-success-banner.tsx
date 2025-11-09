'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export function CheckoutSuccessBanner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const success = searchParams.get('success');
  const portal = searchParams.get('portal');

  // Auto-dismiss after 10 seconds
  useEffect(() => {
    if (success === 'true' || portal === 'demo') {
      const timeout = setTimeout(() => {
        // Remove query params
        router.replace('/dashboard/settings');
      }, 10000);

      return () => clearTimeout(timeout);
    }
  }, [success, portal, router]);

  if (success === 'true') {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-900">Subscription Updated!</AlertTitle>
        <AlertDescription className="text-green-700">
          Your subscription has been successfully updated. You now have access to all premium
          features.{' '}
          <Button
            variant="link"
            className="h-auto p-0 text-green-700 underline"
            onClick={() => router.replace('/dashboard/settings')}
          >
            Dismiss
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (portal === 'demo') {
    return (
      <Alert>
        <CheckCircle2 className="h-4 w-4" />
        <AlertTitle>Demo Mode</AlertTitle>
        <AlertDescription>
          This is a demo environment. Add your Stripe API keys to enable the real customer portal.{' '}
          <Button
            variant="link"
            className="h-auto p-0 underline"
            onClick={() => router.replace('/dashboard/settings')}
          >
            Dismiss
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
