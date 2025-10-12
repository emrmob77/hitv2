import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Twitter, Github, Globe, Crown } from 'lucide-react';

import { SubscriptionButton } from '@/components/profile/subscription-button';

interface UserProfileSidebarProps {
  profile: any;
  stats: {
    bookmarks: number;
    collections: number;
    followers: number;
    following: number;
    likes: number;
    subscribers: number;
    premiumPosts: number;
  };
  isOwnProfile: boolean;
  isSubscribed: boolean;
  currentUserId?: string;
}

export function UserProfileSidebar({ profile, stats, isOwnProfile, isSubscribed, currentUserId }: UserProfileSidebarProps) {
  const subscriptionTier = profile.subscription_tier || profile.plan_type || 'free';
  const isPremium = (typeof profile.is_premium === 'boolean' ? profile.is_premium : undefined) ?? subscriptionTier !== 'free';
  return (
    <div className="space-y-6">
      {/* Social Links */}
      {(profile.twitter_handle || profile.github_handle || profile.website_url) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {profile.twitter_handle && (
              <a
                href={`https://twitter.com/${profile.twitter_handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-sm text-neutral-600 hover:text-neutral-900"
              >
                <Twitter className="h-4 w-4" />
                <span>@{profile.twitter_handle}</span>
              </a>
            )}

            {profile.github_handle && (
              <a
                href={`https://github.com/${profile.github_handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-sm text-neutral-600 hover:text-neutral-900"
              >
                <Github className="h-4 w-4" />
                <span>@{profile.github_handle}</span>
              </a>
            )}

            {profile.website_url && (
              <a
                href={profile.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-sm text-neutral-600 hover:text-neutral-900"
              >
                <Globe className="h-4 w-4" />
                <span>{profile.website_url.replace(/^https?:\/\/(www\.)?/, '')}</span>
              </a>
            )}
          </CardContent>
        </Card>
      )}

      {/* Activity Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Activity</CardTitle>
          <CardDescription>Snapshot of recent reach</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-600">Public Bookmarks</span>
            <Badge variant="secondary">{stats.bookmarks}</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-600">Collections</span>
            <Badge variant="secondary">{stats.collections}</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-600">Total Followers</span>
            <Badge variant="secondary">{stats.followers}</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-600">Following</span>
            <Badge variant="secondary">{stats.following}</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-600">Total Likes</span>
            <Badge variant="secondary">{stats.likes}</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-600">Subscribers</span>
            <Badge variant="secondary">{stats.subscribers}</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-600">Premium Posts</span>
            <Badge variant="secondary">{stats.premiumPosts}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Achievements / Badges */}
      {isPremium && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {subscriptionTier === 'pro' && (
                <Badge variant="default">Pro Member</Badge>
              )}
              {subscriptionTier === 'enterprise' && (
                <Badge variant="default">Enterprise Member</Badge>
              )}
              {stats.bookmarks >= 100 && (
                <Badge variant="secondary">100+ Bookmarks</Badge>
              )}
              {stats.followers >= 50 && (
                <Badge variant="secondary">50+ Followers</Badge>
              )}
              {stats.subscribers >= 25 && (
                <Badge variant="secondary">25+ Subscribers</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {isPremium && (
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
              <Crown className="h-4 w-4 text-amber-500" />
              Premium Content
            </CardTitle>
            <CardDescription>
              {isOwnProfile
                ? 'Track how your premium drops perform.'
                : `Unlock exclusive posts from ${profile.display_name || profile.username}.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-600">Published posts</span>
              <Badge variant="secondary">{stats.premiumPosts}</Badge>
            </div>

            {isOwnProfile ? (
              <Link
                href="/dashboard/posts"
                className="inline-flex items-center text-sm font-medium text-neutral-900 underline-offset-2 hover:underline"
              >
                Manage premium posts
              </Link>
            ) : currentUserId ? (
              isSubscribed ? (
                <p className="text-xs text-neutral-500">You are subscribed to this creator.</p>
              ) : (
                <SubscriptionButton creatorId={profile.id} isSubscribed={isSubscribed} />
              )
            ) : (
              <p className="text-xs text-neutral-500">
                Sign in to subscribe and view premium releases.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
