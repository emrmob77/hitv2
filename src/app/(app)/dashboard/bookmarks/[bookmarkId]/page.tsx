import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { deleteBookmarkAction } from '@/app/(app)/dashboard/bookmarks/actions';
import { Button } from '@/components/ui/button';
import { createSupabaseServerClient } from '@/lib/supabase/server';

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
};

const PRIVACY_LABELS: Record<BookmarkRecord['privacy_level'], string> = {
  public: 'Public',
  private: 'Private',
  subscribers: 'Subscribers only',
};

export const metadata: Metadata = {
  title: 'Bookmark details • HitTags',
};

export default async function BookmarkDetailPage({ params }: { params: PageParams }) {
  const bookmark = await getBookmark(params.bookmarkId);

  if (!bookmark) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <p className="inline-flex items-center gap-2 rounded-full border border-neutral-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-600">
            {PRIVACY_LABELS[bookmark.privacy_level]}
          </p>
          <h1 className="text-3xl font-semibold text-neutral-900">{bookmark.title}</h1>
          {bookmark.domain ? (
            <p className="flex items-center gap-2 text-sm text-neutral-500">
              {bookmark.favicon_url ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={bookmark.favicon_url} alt="Favicon" className="size-4 rounded" />
                </>
              ) : null}
              {bookmark.domain}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline">
            <Link href={bookmark.url} target="_blank">
              Open original
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/dashboard/bookmarks/${bookmark.id}/edit`}>Edit</Link>
          </Button>
          <form action={deleteBookmarkAction}>
            <input type="hidden" name="bookmarkId" value={bookmark.id} />
            <input type="hidden" name="redirectTo" value="/dashboard/bookmarks" />
            <Button type="submit" variant="destructive">
              Delete
            </Button>
          </form>
        </div>
      </header>

      {bookmark.image_url ? (
        <div className="overflow-hidden rounded-3xl border border-neutral-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={bookmark.image_url} alt="Feature image" className="h-full w-full object-cover" />
        </div>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <article className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-neutral-900">Summary</h2>
          {bookmark.description ? (
            <p className="mt-3 text-sm leading-6 text-neutral-600">{bookmark.description}</p>
          ) : (
            <p className="mt-3 text-sm text-neutral-500">There&apos;s no description yet for this bookmark.</p>
          )}
        </article>

        <aside className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-neutral-900">Details</h2>
          <dl className="mt-4 space-y-3 text-sm text-neutral-600">
            <div>
              <dt className="font-medium text-neutral-700">URL</dt>
              <dd className="break-all text-neutral-600">
                <Link href={bookmark.url} target="_blank" className="text-neutral-700 underline">
                  {bookmark.url}
                </Link>
              </dd>
            </div>
            <div>
              <dt className="font-medium text-neutral-700">Created</dt>
              <dd>{formatDate(bookmark.created_at)}</dd>
            </div>
            <div>
              <dt className="font-medium text-neutral-700">Updated</dt>
              <dd>{formatDate(bookmark.updated_at)}</dd>
            </div>
            <div>
              <dt className="font-medium text-neutral-700">Privacy</dt>
              <dd>{PRIVACY_LABELS[bookmark.privacy_level]}</dd>
            </div>
          </dl>
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
    .select(
      'id, title, description, url, domain, privacy_level, image_url, favicon_url, created_at, updated_at'
    )
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

function formatDate(value: string) {
  const date = new Date(value);
  return date.toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}
