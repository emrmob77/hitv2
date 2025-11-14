'use client';

import Link from 'next/link';
import { WifiOff, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
            <WifiOff className="h-8 w-8 text-neutral-600" />
          </div>
          <CardTitle className="text-2xl">You're Offline</CardTitle>
          <CardDescription>
            It looks like you've lost your internet connection. Don't worry, some features are still
            available offline.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Offline Features */}
          <div className="space-y-3">
            <h3 className="font-medium text-neutral-900">Available Offline</h3>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li className="flex items-start gap-2">
                <span className="text-green-600">✓</span>
                <span>View previously loaded bookmarks</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">✓</span>
                <span>Browse cached collections</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">✓</span>
                <span>Access your saved content</span>
              </li>
            </ul>
          </div>

          {/* Unavailable Features */}
          <div className="space-y-3">
            <h3 className="font-medium text-neutral-900">Requires Connection</h3>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li className="flex items-start gap-2">
                <span className="text-neutral-400">✕</span>
                <span>Creating new bookmarks</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-neutral-400">✕</span>
                <span>Syncing changes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-neutral-400">✕</span>
                <span>Real-time updates</span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Button
              onClick={() => window.location.reload()}
              className="w-full"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Go to Home
              </Link>
            </Button>
          </div>

          {/* Help Text */}
          <p className="text-center text-xs text-neutral-500">
            Your changes will be synced automatically when you're back online.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
