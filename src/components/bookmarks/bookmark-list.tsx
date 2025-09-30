"use client";
/* eslint-disable @next/next/no-img-element */

import { useState } from 'react';
import Link from 'next/link';
import { Pencil, Trash2 } from 'lucide-react';

import { deleteBookmarkAction } from '@/app/(app)/dashboard/bookmarks/actions';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type BookmarkListItem = {
  id: string;
  title: string;
  slug?: string;
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

const privacyCopy: Record<BookmarkListItem['privacy_level'], string> = {
  public: 'Public',
  private: 'Private',
  subscribers: 'Subscribers only',
};

const privacyTone: Record<BookmarkListItem['privacy_level'], string> = {
  public: 'border-green-100 bg-green-50 text-green-700',
  private: 'border-neutral-200 bg-neutral-100 text-neutral-700',
  subscribers: 'border-amber-100 bg-amber-50 text-amber-700',
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

function BookmarkActions({
  id,
  redirectTo,
}: {
  id: string;
  redirectTo: string;
}) {
  return (
    <div className="flex items-center gap-1">
      <Link
        href={`/dashboard/bookmarks/${id}/edit`}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-700 transition hover:bg-neutral-100 hover:text-neutral-900"
        title="Edit"
      >
        <Pencil className="h-4 w-4" />
      </Link>
      <form action={deleteBookmarkAction}>
        <input type="hidden" name="bookmarkId" value={id} />
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <Button
          type="submit"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-neutral-700 hover:bg-red-50 hover:text-red-600"
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}

function GridBookmarkCard({ bookmark, redirectTo }: { bookmark: BookmarkListItem; redirectTo: string }) {
  const [imageError, setImageError] = useState(false);
  const fallbackLabel = (bookmark.domain?.slice(0, 2) || 'BK').toUpperCase();
  const showImage = Boolean(bookmark.image_url && !imageError);

  const [faviconError, setFaviconError] = useState(false);

  return (
    <article className="group relative flex h-full flex-col justify-between rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-md">
      {/* Actions - Top Right */}
      <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
        <BookmarkActions id={bookmark.id} redirectTo={redirectTo} />
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
          <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-medium', privacyTone[bookmark.privacy_level])}>
            {privacyCopy[bookmark.privacy_level]}
          </span>
          {bookmark.domain ? (
            <span className="inline-flex items-center gap-2">
              {bookmark.favicon_url && !faviconError ? (
                <img
                  src={bookmark.favicon_url}
                  alt="Favicon"
                  className="size-3 rounded"
                  loading="lazy"
                  onError={() => setFaviconError(true)}
                />
              ) : (
                <span className="flex size-3 items-center justify-center rounded bg-neutral-200 text-[6px] font-bold text-neutral-600">
                  {bookmark.domain.charAt(0).toUpperCase()}
                </span>
              )}
              {bookmark.domain}
            </span>
          ) : null}
          {bookmark.collections && bookmark.collections.length > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 font-medium text-blue-700">
              <i className="fa-solid fa-folder text-[10px]"></i>
              {bookmark.collections[0].name}
              {bookmark.collections.length > 1 && ` +${bookmark.collections.length - 1}`}
            </span>
          )}
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 text-[11px] font-semibold uppercase text-neutral-500">
              {showImage ? (
                <img
                  src={bookmark.image_url!}
                  alt={bookmark.title}
                  className="h-10 w-10 rounded-xl object-cover"
                  loading="lazy"
                  onError={() => setImageError(true)}
                />
              ) : (
                fallbackLabel
              )}
            </div>
            <Link
              href={`/bookmarks/${bookmark.id}/${bookmark.slug || bookmark.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
              className="line-clamp-1 text-base font-semibold text-neutral-900 transition hover:text-neutral-700"
            >
              {bookmark.title}
            </Link>
          </div>
          {bookmark.description ? (
            <p className="line-clamp-3 text-sm text-neutral-600">{bookmark.description}</p>
          ) : null}
          {bookmark.tags && bookmark.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {bookmark.tags.slice(0, 3).map((tag) => (
                <Link
                  key={tag.id}
                  href={`/tag/${tag.slug}`}
                  className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-xs text-neutral-700 hover:border-neutral-300 hover:bg-neutral-100"
                >
                  <span className="text-neutral-400">#</span>
                  {tag.name}
                </Link>
              ))}
              {bookmark.tags.length > 3 && (
                <span className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-xs text-neutral-500">
                  +{bookmark.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="mt-6 flex items-center justify-between text-xs text-neutral-500">
        <Link href={bookmark.url} target="_blank" className="font-semibold text-neutral-700 hover:text-neutral-900">
          Open original →
        </Link>
        <Link
          href={`/bookmarks/${bookmark.id}/${bookmark.slug || bookmark.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
          className="text-neutral-500 hover:text-neutral-700"
          title="View details"
        >
          {new Date(bookmark.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })}
        </Link>
      </div>
    </article>
  );
}

function ListBookmarkCard({ bookmark, redirectTo }: { bookmark: BookmarkListItem; redirectTo: string }) {
  const [imageError, setImageError] = useState(false);
  const fallbackLabel = (bookmark.domain?.slice(0, 2) || 'BK').toUpperCase();
  const showImage = Boolean(bookmark.image_url && !imageError);

  const [faviconError, setFaviconError] = useState(false);

  const formattedDate = new Date(bookmark.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <article className="group relative rounded-2xl border border-neutral-200 bg-white px-4 py-5 shadow-sm transition hover:border-neutral-300 hover:shadow-md">
      {/* Actions - Top Right */}
      <div className="absolute right-3 top-3 opacity-0 transition-opacity group-hover:opacity-100">
        <BookmarkActions id={bookmark.id} redirectTo={redirectTo} />
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 text-[11px] font-semibold uppercase text-neutral-500">
          {showImage ? (
            <img
              src={bookmark.image_url!}
              alt={bookmark.title}
              className="h-12 w-12 rounded-xl object-cover"
              loading="lazy"
              onError={() => setImageError(true)}
            />
          ) : (
            fallbackLabel
          )}
        </div>

        <div className="flex flex-1 flex-col justify-between">
          <div className="space-y-3">
            <div className="space-y-2">
              <Link
                href={`/bookmarks/${bookmark.id}/${bookmark.slug || bookmark.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                className="text-base font-semibold text-neutral-900 transition hover:text-neutral-700"
              >
                {bookmark.title}
              </Link>
              {bookmark.description ? (
                <p className="line-clamp-3 text-sm leading-6 text-neutral-600">{bookmark.description}</p>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500">
              {bookmark.domain ? (
                <>
                  <span className="inline-flex items-center gap-2">
                    {bookmark.favicon_url && !faviconError ? (
                      <img
                        src={bookmark.favicon_url}
                        alt="Favicon"
                        className="size-4 rounded"
                        loading="lazy"
                        onError={() => setFaviconError(true)}
                      />
                    ) : (
                      <span className="flex size-4 items-center justify-center rounded bg-neutral-200 text-[8px] font-bold text-neutral-600">
                        {bookmark.domain.charAt(0).toUpperCase()}
                      </span>
                    )}
                    {bookmark.domain}
                  </span>
                  <span className="text-neutral-300">•</span>
                </>
              ) : null}
              <Link
                href={`/bookmarks/${bookmark.id}/${bookmark.slug || bookmark.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                className="hover:text-neutral-700 hover:underline"
                title="View details"
              >
                {formattedDate}
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-neutral-600">
              {bookmark.domain ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1">
                  {bookmark.domain}
                </span>
              ) : null}
              {bookmark.collections && bookmark.collections.length > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-blue-700">
                  <i className="fa-solid fa-folder text-[10px]"></i>
                  {bookmark.collections[0].name}
                  {bookmark.collections.length > 1 && ` +${bookmark.collections.length - 1}`}
                </span>
              )}
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold',
                  privacyTone[bookmark.privacy_level]
                )}
              >
                {privacyCopy[bookmark.privacy_level]}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              {bookmark.tags && bookmark.tags.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {bookmark.tags.slice(0, 4).map((tag) => (
                    <Link
                      key={tag.id}
                      href={`/tag/${tag.slug}`}
                      className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs text-neutral-700 hover:border-neutral-300 hover:bg-neutral-100"
                    >
                      <span className="text-neutral-400">#</span>
                      {tag.name}
                    </Link>
                  ))}
                  {bookmark.tags.length > 4 && (
                    <span className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs text-neutral-500">
                      +{bookmark.tags.length - 4}
                    </span>
                  )}
                </div>
              ) : (
                <div />
              )}

              <Link
                href={bookmark.url}
                target="_blank"
                className="inline-flex items-center gap-1 rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-600 transition hover:border-neutral-300 hover:text-neutral-900"
              >
                Open original →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
