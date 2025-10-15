'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Crown, Check } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface SubscriberPaywallProps {
  contentType: 'bookmark' | 'post' | 'collection';
  contentTitle: string;
  contentDescription?: string;
  teaserContent?: string;
  creator: {
    id: string;
    username: string;
    displayName?: string;
    avatarUrl?: string;
  };
  currentUserId?: string;
}

export function SubscriberPaywall({
  contentType,
  contentTitle,
  contentDescription,
  teaserContent,
  creator,
  currentUserId,
}: SubscriberPaywallProps) {
  const displayName = creator.displayName || creator.username;

  return (
    <div className="mx-auto max-w-3xl">
      <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-white">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
            <Lock className="h-8 w-8 text-amber-600" />
          </div>

          <div>
            <CardTitle className="text-2xl font-bold">Subscriber-Only Content</CardTitle>
            <CardDescription className="mt-2 text-base">
              This {contentType} is exclusive to subscribers of {displayName}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Content Preview */}
          <div className="rounded-lg border bg-white p-6">
            <h3 className="mb-2 text-lg font-semibold text-neutral-900">{contentTitle}</h3>
            {contentDescription && (
              <p className="mb-4 text-neutral-600">{contentDescription}</p>
            )}
            {teaserContent && (
              <div className="relative">
                <p className="line-clamp-3 text-neutral-500">{teaserContent}</p>
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white to-transparent" />
              </div>
            )}
          </div>

          {/* Creator Info */}
          <div className="flex items-center justify-center space-x-4 rounded-lg border bg-neutral-50 p-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={creator.avatarUrl} alt={displayName} />
              <AvatarFallback>{displayName.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold text-neutral-900">{displayName}</p>
              <p className="text-sm text-neutral-600">@{creator.username}</p>
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-neutral-900">
              Subscribe to get access to:
            </p>
            <ul className="space-y-2">
              <li className="flex items-start space-x-3">
                <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                <span className="text-sm text-neutral-700">
                  Exclusive {contentType}s and premium content
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                <span className="text-sm text-neutral-700">
                  Early access to new content
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                <span className="text-sm text-neutral-700">
                  Support {displayName}'s content creation
                </span>
              </li>
            </ul>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row">
            {currentUserId ? (
              <Button asChild className="flex-1" size="lg">
                <Link href={`/${creator.username}`}>
                  <Crown className="mr-2 h-5 w-5" />
                  Subscribe to {displayName}
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild className="flex-1" size="lg">
                  <Link href="/auth/signup">
                    <Crown className="mr-2 h-5 w-5" />
                    Sign Up to Subscribe
                  </Link>
                </Button>
                <Button asChild variant="outline" className="flex-1" size="lg">
                  <Link href="/auth/login">Log In</Link>
                </Button>
              </>
            )}
          </div>

          {/* SEO-friendly message */}
          <p className="text-center text-xs text-neutral-500">
            This content is not freely accessible. Subscribe to {displayName} to unlock.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
