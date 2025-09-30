"use client";
/* eslint-disable @next/next/no-img-element */

import { useState } from 'react';
import Link from 'next/link';

import { deleteBookmarkAction } from '@/app/(app)/dashboard/bookmarks/actions';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type BookmarkListItem = {
  id: string;
  title: string;
  description: string | null;
  url: string;
  domain: string | null;
  created_at: string;
  privacy_level: 'public' | 'private' | 'subscribers';
  image_url: string | null;
  favicon_url: string | null;
  collections?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  tags?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
};

type BookmarkListProps = {
  items: BookmarkListItem[];
  view: 'grid' | 'list';
  redirectTo: string;
};

const privacyIcon: Record<BookmarkListItem['privacy_level'], string> = {
  public: 'fa-earth-americas',
  private: 'fa-lock',
  subscribers: 'fa-user-group',
};

const privacyColor: Record<BookmarkListItem['privacy_level'], string> = {
  public: 'text-green-600',
  private: 'text-neutral-500',
  subscribers: 'text-amber-600',
};

export function BookmarkList({ items, view, redirectTo }: BookmarkListProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-neutral-200 bg-white p-10 text-center">
        <h3 className="text-lg font-semibold text-neutral-800">You haven&apos;t added any bookmarks yet</h3>
        <p className="mt-2 text-sm text-neutral-500">
          Save your first link and we&apos;ll auto-populate its title and description for you.
        </p>
        <Link
          href="/dashboard/bookmarks/new"
          className="mt-4 inline-flex items-center rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800"
        >
          Add bookmark
        </Link>
      </div>
    );
  }

  if (view === 'grid') {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((bookmark) => (
          <GridBookmarkCard key={bookmark.id} bookmark={bookmark} redirectTo={redirectTo} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((bookmark) => (
        <ListBookmarkCard key={bookmark.id} bookmark={bookmark} redirectTo={redirectTo} />
      ))}
    </div>
  );
}

function GridBookmarkCard({ bookmark, redirectTo }: { bookmark: BookmarkListItem; redirectTo: string }) {
  const [imageError, setImageError] = useState(false);
  const showImage = Boolean(bookmark.image_url && !imageError);

  return (
    <article className="group relative flex h-full flex-col rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:shadow-md">
      {/* Actions - Top Right */}
      <div className="absolute right-3 top-3 z-10 opacity-0 transition group-hover:opacity-100">
        <div className="flex items-center gap-1 rounded-lg bg-white/95 p-1 shadow-sm backdrop-blur">
          <Link
            href={`/dashboard/bookmarks/${bookmark.id}/edit`}
            className="flex h-7 w-7 items-center justify-center rounded text-neutral-600 transition hover:bg-neutral-100"
            title="Edit"
          >
            <i className="fa-solid fa-pen text-xs"></i>
          </Link>
          <form action={deleteBookmarkAction}>
            <input type="hidden" name="bookmarkId" value={bookmark.id} />
            <input type="hidden" name="redirectTo" value={redirectTo} />
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-neutral-600 hover:bg-red-50 hover:text-red-600"
              title="Delete"
            >
              <i className="fa-solid fa-trash text-xs"></i>
            </Button>
          </form>
        </div>
      </div>

      {/* Image Preview */}
      {showImage && (
        <div className="aspect-video w-full overflow-hidden rounded-t-2xl bg-neutral-100">
          <img
            src={bookmark.image_url!}
            alt={bookmark.title}
            className="h-full w-full object-cover"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        </div>
      )}

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        {/* Title - Clickable */}
        <Link
          href={`/dashboard/bookmarks/${bookmark.id}`}
          className="mb-2 line-clamp-2 text-base font-semibold text-neutral-900 transition hover:text-neutral-700"
        >
          {bookmark.title}
        </Link>

        {/* Description */}
        {bookmark.description && (
          <p className="mb-3 line-clamp-2 text-sm text-neutral-600">{bookmark.description}</p>
        )}

        {/* Tags */}
        {bookmark.tags && bookmark.tags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {bookmark.tags.slice(0, 3).map((tag) => (
              <Link
                key={tag.id}
                href={`/tag/${tag.slug}`}
                className="inline-flex items-center gap-1 text-xs text-neutral-600 transition hover:text-neutral-900"
              >
                <span className="text-neutral-400">#</span>
                {tag.name}
              </Link>
            ))}
            {bookmark.tags.length > 3 && (
              <span className="text-xs text-neutral-500">+{bookmark.tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-neutral-100 pt-3 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            {/* Privacy Icon */}
            <i className={cn('fa-solid', privacyIcon[bookmark.privacy_level], privacyColor[bookmark.privacy_level])}></i>

            {/* Domain */}
            {bookmark.domain && (
              <span className="truncate">{bookmark.domain}</span>
            )}
          </div>

          {/* Collection Badge */}
          {bookmark.collections && bookmark.collections.length > 0 && (
            <div className="flex items-center gap-1 text-blue-600">
              <i className="fa-solid fa-folder text-xs"></i>
              <span className="text-xs">{bookmark.collections.length}</span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function ListBookmarkCard({ bookmark, redirectTo }: { bookmark: BookmarkListItem; redirectTo: string }) {
  const [imageError, setImageError] = useState(false);
  const showImage = Boolean(bookmark.image_url && !imageError);

  const formattedDate = new Date(bookmark.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <article className="group relative rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex gap-4">
        {/* Thumbnail */}
        <div className="flex-shrink-0">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg bg-neutral-100">
            {showImage ? (
              <img
                src={bookmark.image_url!}
                alt={bookmark.title}
                className="h-full w-full object-cover"
                loading="lazy"
                onError={() => setImageError(true)}
              />
            ) : (
              <i className="fa-solid fa-bookmark text-2xl text-neutral-300"></i>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Title */}
          <Link
            href={`/dashboard/bookmarks/${bookmark.id}`}
            className="mb-1 line-clamp-1 text-base font-semibold text-neutral-900 transition hover:text-neutral-700"
          >
            {bookmark.title}
          </Link>

          {/* Description */}
          {bookmark.description && (
            <p className="mb-2 line-clamp-2 text-sm text-neutral-600">{bookmark.description}</p>
          )}

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500">
            {/* Privacy Icon */}
            <i className={cn('fa-solid', privacyIcon[bookmark.privacy_level], privacyColor[bookmark.privacy_level])}></i>

            {/* Domain */}
            {bookmark.domain && (
              <span className="truncate">{bookmark.domain}</span>
            )}

            {/* Date - Clickable to detail */}
            <Link
              href={`/dashboard/bookmarks/${bookmark.id}`}
              className="hover:text-neutral-700"
            >
              {formattedDate}
            </Link>

            {/* Collection Count */}
            {bookmark.collections && bookmark.collections.length > 0 && (
              <span className="flex items-center gap-1 text-blue-600">
                <i className="fa-solid fa-folder text-xs"></i>
                {bookmark.collections[0].name}
                {bookmark.collections.length > 1 && ` +${bookmark.collections.length - 1}`}
              </span>
            )}
          </div>

          {/* Tags */}
          {bookmark.tags && bookmark.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {bookmark.tags.slice(0, 5).map((tag) => (
                <Link
                  key={tag.id}
                  href={`/tag/${tag.slug}`}
                  className="inline-flex items-center gap-1 text-xs text-neutral-600 transition hover:text-neutral-900"
                >
                  <span className="text-neutral-400">#</span>
                  {tag.name}
                </Link>
              ))}
              {bookmark.tags.length > 5 && (
                <span className="text-xs text-neutral-500">+{bookmark.tags.length - 5} more</span>
              )}
            </div>
          )}
        </div>

        {/* Actions - Right Side */}
        <div className="flex-shrink-0 opacity-0 transition group-hover:opacity-100">
          <div className="flex flex-col gap-1">
            <Link
              href={`/dashboard/bookmarks/${bookmark.id}/edit`}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-700"
              title="Edit"
            >
              <i className="fa-solid fa-pen text-sm"></i>
            </Link>
            <form action={deleteBookmarkAction}>
              <input type="hidden" name="bookmarkId" value={bookmark.id} />
              <input type="hidden" name="redirectTo" value={redirectTo} />
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-neutral-500 hover:bg-red-50 hover:text-red-600"
                title="Delete"
              >
                <i className="fa-solid fa-trash text-sm"></i>
              </Button>
            </form>
          </div>
        </div>
      </div>
    </article>
  );
}
