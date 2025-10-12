'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { ArrowRight, Eye, Heart, Lock, MessageCircle, Sparkles, Users } from 'lucide-react';

import { Badge } from '@/components/ui/badge';

type Visibility = 'public' | 'subscribers' | 'premium' | 'private';

interface PremiumPostCardProps {
  username: string;
  isLockedView: boolean;
  post: {
    id: string;
    title: string;
    slug: string;
    visibility: Visibility;
    createdAt: string;
    likeCount: number;
    commentCount: number;
    viewCount: number;
    teaser: string;
  };
}

function getVisibilityMeta(visibility: Visibility) {
  switch (visibility) {
    case 'premium':
      return {
        label: 'Premium',
        tone: 'bg-amber-600/10 text-amber-700 ring-1 ring-amber-600/30',
        icon: Sparkles,
      };
    case 'subscribers':
      return {
        label: 'Subscribers only',
        tone: 'bg-indigo-600/10 text-indigo-700 ring-1 ring-indigo-600/30',
        icon: Users,
      };
    case 'public':
      return {
        label: 'Public preview',
        tone: 'bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/30',
        icon: Eye,
      };
    default:
      return {
        label: 'Hidden',
        tone: 'bg-neutral-200 text-neutral-700',
        icon: Lock,
      };
  }
}

export function PremiumPostCard({ username, post, isLockedView }: PremiumPostCardProps) {
  const href = `/p/${username}/${post.slug}`;
  const visibilityMeta = getVisibilityMeta(post.visibility);
  const createdAt = post.createdAt ? format(new Date(post.createdAt), 'MMM d, yyyy') : '';
  const AccessIcon = visibilityMeta.icon || Lock;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 shadow-[0px_1px_3px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0px_20px_35px_rgba(15,23,42,0.12)]">
      {isLockedView && (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/90 via-white/70 to-white/95 backdrop-blur-[1px]" />
      )}

      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Badge className={`text-xs font-medium ${visibilityMeta.tone}`}>{visibilityMeta.label}</Badge>
            {isLockedView && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700">
                <Lock className="h-3.5 w-3.5" />
                Locked
              </span>
            )}
          </div>
          <Link
            href={href}
            className="mt-3 block text-lg font-semibold text-neutral-900 transition-colors hover:text-neutral-700"
          >
            {post.title}
          </Link>
          <p className={`mt-2 text-sm ${isLockedView ? 'line-clamp-2 text-neutral-500' : 'text-neutral-600'}`}>
            {post.teaser}
          </p>
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-4 text-xs text-neutral-500 md:grid-cols-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100">
            <AccessIcon className="h-3.5 w-3.5 text-neutral-500" />
          </span>
          <div>
            <dt className="font-medium text-neutral-600">Access</dt>
            <dd>{visibilityMeta.label}</dd>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100">
            <Eye className="h-3.5 w-3.5 text-neutral-500" />
          </span>
          <div>
            <dt className="font-medium text-neutral-600">Views</dt>
            <dd>{post.viewCount}</dd>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100">
            <Heart className="h-3.5 w-3.5 text-neutral-500" />
          </span>
          <div>
            <dt className="font-medium text-neutral-600">Likes</dt>
            <dd>{post.likeCount}</dd>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100">
            <MessageCircle className="h-3.5 w-3.5 text-neutral-500" />
          </span>
          <div>
            <dt className="font-medium text-neutral-600">Comments</dt>
            <dd>{post.commentCount}</dd>
          </div>
        </div>
      </dl>

      <div className="mt-6 flex items-center justify-between text-xs text-neutral-500">
        <span>Published {createdAt}</span>
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-sm font-semibold text-neutral-900 transition hover:text-neutral-700"
        >
          View premium drop
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
