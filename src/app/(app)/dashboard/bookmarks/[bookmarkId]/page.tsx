import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DollarSign } from 'lucide-react';

import { deleteBookmarkAction } from '@/app/(app)/dashboard/bookmarks/actions';
import { Button } from '@/components/ui/button';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { AddToCollectionButton } from '@/components/bookmarks/add-to-collection-button';

type PageParams = {
  bookmarkId: string;
};

type BookmarkRecord = {
  id: string;
  title: string;
  description: string | null;
  url: string;
  domain: string | null;
  privacy_level: 'public' | 'private' | 'subscribers';
  created_at: string;
  updated_at: string;
  image_url: string | null;
  favicon_url: string | null;
  affiliate_links?: Array<{
    id: string;
    affiliate_url: string;
    commission_rate: number;
    total_clicks: number;
    total_earnings: number;
  }>;
};

const PRIVACY_LABELS: Record<BookmarkRecord['privacy_level'], string> = {
  public: 'Public',
  private: 'Private',
  subscribers: 'Subscribers only',
};

export const metadata: Metadata = {
  title: 'Bookmark Details',
};

export default async function BookmarkDetailPage({ params }: { params: Promise<PageParams> }) {
  const { bookmarkId } = await params;
  const bookmark = await getBookmark(bookmarkId);

  if (!bookmark) {
    notFound();
  }

  const createdLabel = formatDate(bookmark.created_at);
  const updatedLabel = formatDate(bookmark.updated_at);

  return (
    <div className="space-y-8">
      <header className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
              <span className="inline-flex items-center gap-2 rounded-full border border-neutral-200 px-3 py-1 text-neutral-600">
                {PRIVACY_LABELS[bookmark.privacy_level]}
              </span>
              <span className="text-neutral-400">Updated {updatedLabel}</span>
            </div>

            <h1 className="text-3xl font-semibold text-neutral-900">{bookmark.title}</h1>

            {bookmark.domain ? (
              <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-500">
                {bookmark.favicon_url ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={bookmark.favicon_url} alt="Favicon" className="size-4 rounded" />
                  </>
                ) : null}
                <span>{bookmark.domain}</span>
                <span className="hidden text-neutral-300 sm:inline">•</span>
                <span>Added {createdLabel}</span>
              </div>
            ) : (
              <div className="text-sm text-neutral-500">
                Added {createdLabel}
              </div>
            )}
          </div>

          <div className="relative hidden min-h-[180px] overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 lg:block">
            {bookmark.image_url ? (
              <img
                src={bookmark.image_url}
                alt="Feature image"
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-neutral-400">
                No preview available
              </div>
            )}
          </div>
        </div>
      </header>

      {bookmark.image_url ? (
        <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-100 lg:hidden">
          <div className="relative aspect-[16/9] w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={bookmark.image_url}
              alt="Feature image"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </div>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.75fr)_minmax(260px,0.85fr)]">
        <div className="space-y-6">
          <article className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-neutral-900">Summary</h2>
            {bookmark.description ? (
              <p className="mt-3 text-sm leading-6 text-neutral-600">{bookmark.description}</p>
            ) : (
              <p className="mt-3 text-sm text-neutral-500">There&apos;s no description yet for this bookmark.</p>
            )}
          </article>

          <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-neutral-900">Link information</h2>
            <dl className="mt-4 grid gap-4 text-sm text-neutral-600 sm:grid-cols-2">
              <div className="space-y-1">
                <dt className="font-medium text-neutral-700">URL</dt>
                <dd className="break-all">
                  <Link href={bookmark.url} target="_blank" className="text-neutral-700 underline">
                    {bookmark.url}
                  </Link>
                </dd>
              </div>
              {bookmark.domain ? (
                <div className="space-y-1">
                  <dt className="font-medium text-neutral-700">Domain</dt>
                  <dd>{bookmark.domain}</dd>
                </div>
              ) : null}
              <div className="space-y-1">
                <dt className="font-medium text-neutral-700">Created</dt>
                <dd>{createdLabel}</dd>
              </div>
              <div className="space-y-1">
                <dt className="font-medium text-neutral-700">Last updated</dt>
                <dd>{updatedLabel}</dd>
              </div>
              <div className="space-y-1">
                <dt className="font-medium text-neutral-700">Privacy</dt>
                <dd>{PRIVACY_LABELS[bookmark.privacy_level]}</dd>
              </div>
            </dl>
          </div>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-32">
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-neutral-900">Actions</h2>
            <p className="mt-1 text-xs text-neutral-500">
              Manage how this bookmark appears and where it lives.
            </p>
            <div className="mt-4 grid gap-2">
              <Button asChild size="sm" className="w-full justify-center">
                <Link href={bookmark.url} target="_blank">
                  Open original
                </Link>
              </Button>
              <AddToCollectionButton
                bookmarkId={bookmark.id}
                variant="outline"
                size="sm"
                className="w-full justify-center"
              />
              <Button asChild variant="outline" size="sm" className="w-full justify-center">
                <Link href={`/dashboard/bookmarks/${bookmark.id}/edit`}>Edit details</Link>
              </Button>
              <form action={deleteBookmarkAction} className="w-full">
                <input type="hidden" name="bookmarkId" value={bookmark.id} />
                <input type="hidden" name="redirectTo" value="/dashboard/bookmarks" />
                <Button type="submit" variant="destructive" size="sm" className="w-full justify-center">
                  Delete bookmark
                </Button>
              </form>
            </div>
          </div>

          {bookmark.affiliate_links && bookmark.affiliate_links.length > 0 ? (
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50/60 p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <DollarSign className="size-5 text-emerald-700" />
                <h2 className="text-base font-semibold text-emerald-900">Affiliate performance</h2>
              </div>
              <dl className="mt-4 space-y-3 text-sm text-emerald-900">
                <div className="space-y-1">
                  <dt className="font-medium">Affiliate URL</dt>
                  <dd className="mt-1 break-all">
                    <Link href={bookmark.affiliate_links[0].affiliate_url} target="_blank" className="underline">
                      {bookmark.affiliate_links[0].affiliate_url}
                    </Link>
                  </dd>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-emerald-100/60 px-3 py-2">
                  <dt className="text-sm font-medium">Commission rate</dt>
                  <dd className="text-sm">{bookmark.affiliate_links[0].commission_rate}%</dd>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-emerald-100/60 px-3 py-2">
                  <dt className="text-sm font-medium">Total clicks</dt>
                  <dd className="text-sm">{bookmark.affiliate_links[0].total_clicks || 0}</dd>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-emerald-100/60 px-3 py-2">
                  <dt className="text-sm font-medium">Total earnings</dt>
                  <dd className="text-sm">${(bookmark.affiliate_links[0].total_earnings || 0).toFixed(2)}</dd>
                </div>
              </dl>
            </div>
          ) : null}
        </aside>
      </section>
    </div>
  );
}

async function getBookmark(id: string): Promise<BookmarkRecord | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  const { data, error } = await supabase
    .from('bookmarks')
    .select(`
      id,
      title,
      description,
      url,
      domain,
      privacy_level,
      image_url,
      favicon_url,
      created_at,
      updated_at
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error || !data) {
    console.error('Bookmark fetch error:', error);
    return null;
  }

  // Fetch affiliate links separately
  const { data: affiliateLinks } = await supabase
    .from('affiliate_links')
    .select('id, affiliate_url, commission_rate, total_clicks, total_earnings')
    .eq('bookmark_id', id)
    .eq('user_id', user.id);

  return {
    ...data,
    affiliate_links: affiliateLinks || [],
  };
}

function formatDate(value: string) {
  const date = new Date(value);
  return date.toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}
