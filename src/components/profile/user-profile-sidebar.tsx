import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Twitter, Github, Globe, Crown, LinkIcon } from 'lucide-react';

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
  linkGroup?: {
    slug: string;
    name: string;
    is_active: boolean;
  } | null;
}

export function UserProfileSidebar({ profile, stats, isOwnProfile, isSubscribed, currentUserId, linkGroup }: UserProfileSidebarProps) {
  const subscriptionTier = profile.subscription_tier || profile.plan_type || 'free';
  const isPremium = (typeof profile.is_premium === 'boolean' ? profile.is_premium : undefined) ?? subscriptionTier !== 'free';
  return (
    <div className="space-y-6">
      {/* Social Links */}
      {(profile.twitter_handle || profile.github_handle || profile.website_url) && (
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-gray-900">Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {profile.twitter_handle && (
              <a
                href={`https://twitter.com/${profile.twitter_handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-sm text-gray-700 transition-colors hover:text-gray-900"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white">
                  <Twitter className="h-4 w-4 text-slate-900" strokeWidth={2.5} />
                </div>
                <span className="font-medium">@{profile.twitter_handle}</span>
              </a>
            )}

            {profile.github_handle && (
              <a
                href={`https://github.com/${profile.github_handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-sm text-gray-700 transition-colors hover:text-gray-900"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white">
                  <Github className="h-4 w-4 text-slate-900" strokeWidth={2.5} />
                </div>
                <span className="font-medium">@{profile.github_handle}</span>
              </a>
            )}

            {profile.website_url && (
              <a
                href={profile.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-sm text-gray-700 transition-colors hover:text-gray-900"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white">
                  <Globe className="h-4 w-4 text-slate-900" strokeWidth={2.5} />
                </div>
                <span className="font-medium">{profile.website_url.replace(/^https?:\/\/(www\.)?/, '')}</span>
              </a>
            )}
          </CardContent>
        </Card>
      )}

      {/* Activity Stats */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-gray-900">Activity</CardTitle>
          <CardDescription className="text-xs text-gray-600">Snapshot of recent reach</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700">Public Bookmarks</span>
            <Badge variant="secondary" className="bg-gray-100 text-gray-900 font-semibold text-xs">{stats.bookmarks}</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700">Collections</span>
            <Badge variant="secondary" className="bg-gray-100 text-gray-900 font-semibold text-xs">{stats.collections}</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700">Total Followers</span>
            <Badge variant="secondary" className="bg-gray-100 text-gray-900 font-semibold text-xs">{stats.followers}</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700">Following</span>
            <Badge variant="secondary" className="bg-gray-100 text-gray-900 font-semibold text-xs">{stats.following}</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700">Total Likes</span>
            <Badge variant="secondary" className="bg-gray-100 text-gray-900 font-semibold text-xs">{stats.likes}</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700">Subscribers</span>
            <Badge variant="secondary" className="bg-gray-100 text-gray-900 font-semibold text-xs">{stats.subscribers}</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700">Premium Posts</span>
            <Badge variant="secondary" className="bg-gray-100 text-gray-900 font-semibold text-xs">{stats.premiumPosts}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Achievements / Badges */}
      {isPremium && (
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-gray-900">Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {subscriptionTier === 'pro' && (
                <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 font-semibold text-xs">Pro Member</Badge>
              )}
              {subscriptionTier === 'enterprise' && (
                <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 font-semibold text-xs">Enterprise Member</Badge>
              )}
              {stats.bookmarks >= 100 && (
                <Badge variant="secondary" className="bg-gray-100 text-gray-900 font-semibold text-xs">100+ Bookmarks</Badge>
              )}
              {stats.followers >= 50 && (
                <Badge variant="secondary" className="bg-gray-100 text-gray-900 font-semibold text-xs">50+ Followers</Badge>
              )}
              {stats.subscribers >= 25 && (
                <Badge variant="secondary" className="bg-gray-100 text-gray-900 font-semibold text-xs">25+ Subscribers</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {isPremium && (
        <Card className="border-amber-200 bg-gradient-to-br from-amber-50/50 to-white shadow-sm">
          <CardHeader className="space-y-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-amber-200 bg-amber-50">
                <Crown className="h-4 w-4 text-amber-600" strokeWidth={2.5} />
              </div>
              Premium Content
            </CardTitle>
            <CardDescription className="text-xs text-gray-600">
              {isOwnProfile
                ? 'Track how your premium drops perform.'
                : `Unlock exclusive posts from ${profile.display_name || profile.username}.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">Published posts</span>
              <Badge className="bg-amber-100 text-amber-900 border-0 font-semibold text-xs">{stats.premiumPosts}</Badge>
            </div>

            {isOwnProfile ? (
              <Link
                href="/dashboard/posts"
                className="inline-flex items-center text-sm font-semibold text-gray-900 underline-offset-2 hover:underline"
              >
                Manage premium posts
              </Link>
            ) : currentUserId ? (
              isSubscribed ? (
                <p className="text-xs text-gray-600 font-medium">You are subscribed to this creator.</p>
              ) : (
                <SubscriptionButton creatorId={profile.id} isSubscribed={isSubscribed} />
              )
            ) : (
              <p className="text-xs text-gray-600 font-medium">
                Sign in to subscribe and view premium releases.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Link Groups */}
      {isPremium && (isOwnProfile || linkGroup) && (
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50/50 to-white shadow-sm">
          <CardHeader className="space-y-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-blue-200 bg-blue-50">
                <LinkIcon className="h-4 w-4 text-blue-600" strokeWidth={2.5} />
              </div>
              Link Groups
            </CardTitle>
            <CardDescription className="text-xs text-gray-600">
              {isOwnProfile
                ? 'Share all your important links in one place'
                : `Check out ${profile.display_name || profile.username}'s curated links`
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isOwnProfile ? (
              <>
                <p className="text-xs text-gray-600">
                  Create beautiful link pages to share with your audience
                </p>
                <Button asChild variant="outline" size="sm" className="w-full border-blue-200 text-blue-700 hover:bg-blue-50">
                  <Link href="/dashboard/link-groups">
                    Manage link groups
                  </Link>
                </Button>
              </>
            ) : linkGroup ? (
              <>
                <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-3">
                  <p className="text-sm font-medium text-gray-900">{linkGroup.name}</p>
                </div>
                <Button asChild variant="outline" size="sm" className="w-full border-blue-200 text-blue-700 hover:bg-blue-50">
                  <Link href={`/l/${profile.username}/${linkGroup.slug}`}>
                    View all links
                  </Link>
                </Button>
              </>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
