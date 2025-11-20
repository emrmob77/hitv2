'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MapPin, Link as LinkIcon, Calendar, Share2, MoreHorizontal, Settings } from 'lucide-react';
import { FollowButton } from '@/components/profile/follow-button';
import { SubscriptionButton } from '@/components/profile/subscription-button';
import { format } from 'date-fns';

interface UserProfileHeaderProps {
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
  isFollowing: boolean;
  isSubscribed: boolean;
  isOwnProfile: boolean;
  currentUserId?: string;
}

export function UserProfileHeader({
  profile,
  stats,
  isFollowing,
  isSubscribed,
  isOwnProfile,
  currentUserId,
}: UserProfileHeaderProps) {
  const displayName = profile.display_name || profile.username;
  const subscriptionTier = profile.subscription_tier || profile.plan_type || 'free';
  const isPremium = (typeof profile.is_premium === 'boolean' ? profile.is_premium : undefined) ?? subscriptionTier !== 'free';
  const joinedDate = profile.created_at ? format(new Date(profile.created_at), 'MMMM yyyy') : '';

  const handleShare = async () => {
    const url = `${window.location.origin}/${profile.username}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${displayName} on HitTags`,
          text: profile.bio || `Check out ${displayName}'s profile on HitTags`,
          url,
        });
      } catch (error) {
        // User cancelled share
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(url);
      alert('Profile URL copied to clipboard!');
    }
  };

  return (
    <section className="relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 p-8 shadow-sm">
      {/* Subtle decorative gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-purple-500/5" />

      <div className="relative">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-6">
            <div className="relative">
              <Avatar className="h-28 w-28 border-4 border-white shadow-lg">
                <AvatarImage src={profile.avatar_url} alt={displayName} />
                <AvatarFallback className="text-2xl font-semibold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  {displayName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>

            <div>
              <div className="mb-2 flex items-center space-x-3">
                <h1 className="text-4xl font-bold text-gray-900">{displayName}</h1>
                {isPremium && (
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                    {subscriptionTier === 'pro' && 'Pro Member'}
                    {subscriptionTier === 'enterprise' && 'Enterprise'}
                    {subscriptionTier !== 'pro' && subscriptionTier !== 'enterprise' && 'Premium'}
                  </Badge>
                )}
              </div>

              {profile.bio && (
                <p className="mb-4 max-w-2xl text-lg text-gray-700 leading-relaxed">{profile.bio}</p>
              )}

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600">
                {profile.location && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5 text-slate-900" strokeWidth={2.5} />
                    <span className="font-medium">{profile.location}</span>
                  </div>
                )}

                {profile.website_url && (
                  <div className="flex items-center space-x-2">
                    <LinkIcon className="h-5 w-5 text-slate-900" strokeWidth={2.5} />
                    <a
                      href={profile.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-gray-900 hover:text-gray-700 hover:underline"
                    >
                      {profile.website_url.replace(/^https?:\/\/(www\.)?/, '')}
                    </a>
                  </div>
                )}

                {joinedDate && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-slate-900" strokeWidth={2.5} />
                    <span className="font-medium">Joined {joinedDate}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {!isOwnProfile && currentUserId && isPremium && (
              <SubscriptionButton creatorId={profile.id} isSubscribed={isSubscribed} />
            )}

            {isOwnProfile ? (
              <Button asChild variant="outline" className="border-gray-300 hover:bg-gray-50">
                <Link href="/dashboard/settings">
                  <Settings className="mr-2 h-5 w-5" strokeWidth={2.5} />
                  Edit Profile
                </Link>
              </Button>
            ) : (
              currentUserId && (
                <FollowButton
                  profileId={profile.id}
                  isFollowing={isFollowing}
                  currentUserId={currentUserId}
                />
              )
            )}

            <Button variant="outline" size="icon" onClick={handleShare} className="border-gray-300 hover:bg-gray-50">
              <Share2 className="h-5 w-5" strokeWidth={2.5} />
            </Button>

            {!isOwnProfile && (
              <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                <MoreHorizontal className="h-5 w-5" strokeWidth={2.5} />
              </Button>
            )}
          </div>
        </div>

        {/* Stats - Modern card grid */}
        <div className="mt-8 grid grid-cols-2 gap-3 border-t border-gray-200 pt-8 sm:grid-cols-3 lg:grid-cols-6">
          <div className="group rounded-lg border border-gray-200 bg-white p-3 text-center shadow-sm transition-all hover:border-gray-300 hover:shadow">
            <div className="mb-1 text-2xl font-bold text-gray-900">{stats.bookmarks}</div>
            <div className="text-xs font-medium text-gray-600">Bookmarks</div>
          </div>

          <div className="group rounded-lg border border-gray-200 bg-white p-3 text-center shadow-sm transition-all hover:border-gray-300 hover:shadow">
            <div className="mb-1 text-2xl font-bold text-gray-900">{stats.collections}</div>
            <div className="text-xs font-medium text-gray-600">Collections</div>
          </div>

          <div className="group rounded-lg border border-gray-200 bg-white p-3 text-center shadow-sm transition-all hover:border-gray-300 hover:shadow">
            <div className="mb-1 text-2xl font-bold text-gray-900">{stats.followers}</div>
            <div className="text-xs font-medium text-gray-600">Followers</div>
          </div>

          <div className="group rounded-lg border border-gray-200 bg-white p-3 text-center shadow-sm transition-all hover:border-gray-300 hover:shadow">
            <div className="mb-1 text-2xl font-bold text-gray-900">{stats.following}</div>
            <div className="text-xs font-medium text-gray-600">Following</div>
          </div>

          <div className="group rounded-lg border border-gray-200 bg-white p-3 text-center shadow-sm transition-all hover:border-gray-300 hover:shadow">
            <div className="mb-1 text-2xl font-bold text-gray-900">{stats.likes}</div>
            <div className="text-xs font-medium text-gray-600">Total Likes</div>
          </div>

          <div className="group rounded-lg border border-gray-200 bg-white p-3 text-center shadow-sm transition-all hover:border-gray-300 hover:shadow">
            <div className="mb-1 text-2xl font-bold text-gray-900">{stats.subscribers}</div>
            <div className="text-xs font-medium text-gray-600">Subscribers</div>
          </div>
          {stats.premiumPosts > 0 && (
            <div className="group rounded-lg border border-gray-200 bg-white p-3 text-center shadow-sm transition-all hover:border-gray-300 hover:shadow">
              <div className="mb-1 text-2xl font-bold text-gray-900">{stats.premiumPosts}</div>
              <div className="text-xs font-medium text-gray-600">Premium Posts</div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
