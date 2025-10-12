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
    <section className="rounded-xl border border-neutral-200 bg-white p-8">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={profile.avatar_url} alt={displayName} />
            <AvatarFallback className="text-2xl">
              {displayName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div>
            <div className="mb-2 flex items-center space-x-3">
              <h1 className="text-3xl font-semibold text-neutral-900">{displayName}</h1>
              {isPremium && (
                <Badge variant="secondary">
                  {subscriptionTier === 'pro' && 'Pro Member'}
                  {subscriptionTier === 'enterprise' && 'Enterprise'}
                  {subscriptionTier !== 'pro' && subscriptionTier !== 'enterprise' && 'Premium'}
                </Badge>
              )}
            </div>

            {profile.bio && (
              <p className="mb-4 max-w-2xl text-neutral-600">{profile.bio}</p>
            )}

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-neutral-600">
              {profile.location && (
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{profile.location}</span>
                </div>
              )}

              {profile.website_url && (
                <div className="flex items-center space-x-1">
                  <LinkIcon className="h-4 w-4" />
                  <a
                    href={profile.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-neutral-900 hover:text-neutral-700 hover:underline"
                  >
                    {profile.website_url.replace(/^https?:\/\/(www\.)?/, '')}
                  </a>
                </div>
              )}

              {joinedDate && (
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {joinedDate}</span>
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
            <Button asChild variant="outline">
              <Link href="/dashboard/settings">
                <Settings className="mr-2 h-4 w-4" />
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

          <Button variant="outline" size="icon" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
          </Button>

          {!isOwnProfile && (
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-2 gap-6 border-t border-neutral-200 pt-8 sm:grid-cols-3 lg:grid-cols-6">
        <div className="text-center">
          <div className="mb-1 text-2xl font-semibold text-neutral-900">{stats.bookmarks}</div>
          <div className="text-sm text-neutral-600">Bookmarks</div>
        </div>

        <div className="text-center">
          <div className="mb-1 text-2xl font-semibold text-neutral-900">{stats.collections}</div>
          <div className="text-sm text-neutral-600">Collections</div>
        </div>

        <div className="text-center">
          <div className="mb-1 text-2xl font-semibold text-neutral-900">{stats.followers}</div>
          <div className="text-sm text-neutral-600">Followers</div>
        </div>

        <div className="text-center">
          <div className="mb-1 text-2xl font-semibold text-neutral-900">{stats.following}</div>
          <div className="text-sm text-neutral-600">Following</div>
        </div>

        <div className="text-center">
          <div className="mb-1 text-2xl font-semibold text-neutral-900">{stats.likes}</div>
          <div className="text-sm text-neutral-600">Total Likes</div>
        </div>

        <div className="text-center">
          <div className="mb-1 text-2xl font-semibold text-neutral-900">{stats.subscribers}</div>
          <div className="text-sm text-neutral-600">Subscribers</div>
        </div>
        {stats.premiumPosts > 0 && (
          <div className="text-center">
            <div className="mb-1 text-2xl font-semibold text-neutral-900">{stats.premiumPosts}</div>
            <div className="text-sm text-neutral-600">Premium Posts</div>
          </div>
        )}
      </div>
    </section>
  );
}
