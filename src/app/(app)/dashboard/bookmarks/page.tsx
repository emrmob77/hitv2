import Link from 'next/link';
import { Metadata } from 'next';

import { BookmarkList, type BookmarkListItem } from '@/components/bookmarks/bookmark-list';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createSupabaseServerClient } from '@/lib/supabase/server';

type SearchParams = {
  view?: string;
  q?: string;
  privacy?: string;
};

const PRIVACY_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'public', label: 'Public' },
  { value: 'private', label: 'Private' },
  { value: 'subscribers', label: 'Subscribers only' },
];

export const metadata: Metadata = {
  title: 'Bookmarks • HitTags',
};

export default async function BookmarksPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const view = params.view === 'list' ? 'list' : 'grid';
  const searchTerm = (params.q ?? '').trim();
  const privacyFilter = PRIVACY_FILTERS.some((filter) => filter.value === params.privacy)
    ? (params.privacy as 'all' | 'public' | 'private' | 'subscribers')
    : 'all';

  const { bookmarks } = await fetchBookmarks({ searchTerm, privacy: privacyFilter });

  const redirectTo = buildRedirectTo({ view, search: searchTerm, privacy: privacyFilter });

  return (
    <div className="space-y-8">
      <header className="mx-auto flex w-full max-w-5xl flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-neutral-900">Your bookmark workspace</h1>
          <p className="text-sm text-neutral-600">
            Review saved links, update their metadata, and adjust who is able to see them.
          </p>
        </div>
        <Button asChild className="bg-neutral-900 text-white hover:bg-neutral-800">
          <Link href="/dashboard/bookmarks/new">Add bookmark</Link>
        </Button>
      </header>

      <div className="mx-auto w-full max-w-5xl rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm">
        <form className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between" method="get">
          <div className="flex flex-1 items-center gap-3">
            <label htmlFor="search" className="text-sm font-medium text-neutral-700">
              Search
            </label>
            <Input
              id="search"
              name="q"
              defaultValue={searchTerm}
              placeholder="Search by title, description, or URL"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-neutral-700">Privacy</span>
              <select
                name="privacy"
                defaultValue={privacyFilter}
                className="h-10 rounded-lg border border-neutral-200 bg-neutral-50 px-3 text-sm focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200"
              >
                {PRIVACY_FILTERS.map((filter) => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>
            </div>
            <input type="hidden" name="view" value={view} />
            <Button type="submit" variant="secondary" className="font-semibold">
              Apply
            </Button>
          </div>
        </form>
      </div>

      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-neutral-600">
          {bookmarks.length}{' '}bookmark{bookmarks.length === 1 ? '' : 's'}
          {searchTerm ? ` • matching “${searchTerm}”` : ''}
        </p>
        <ViewToggle view={view} search={searchTerm} privacy={privacyFilter} />
      </div>

      <div className="mx-auto w-full max-w-5xl">
        <BookmarkList items={bookmarks} view={view} redirectTo={redirectTo} />
      </div>
    </div>
  );
}

async function fetchBookmarks({
  searchTerm,
  privacy,
}: {
  searchTerm: string;
  privacy: 'all' | 'public' | 'private' | 'subscribers';
}): Promise<{ bookmarks: BookmarkListItem[] }> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { bookmarks: [] };
  }

  let query = supabase
    .from('bookmarks')
    .select(`
      id,
      title,
      slug,
      description,
      url,
      domain,
      created_at,
      privacy_level,
      image_url,
      favicon_url,
      collection_bookmarks (
        collection_id,
        collections (
          id,
          name,
          slug
        )
      ),
      bookmark_tags (
        tag_id,
        tags (
          id,
          name,
          slug
        )
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (searchTerm) {
    const like = `%${escapeForIlike(searchTerm)}%`;
    query = query.or(
      `title.ilike.${like},description.ilike.${like},url.ilike.${like}`
    );
  }

  if (privacy !== 'all') {
    query = query.eq('privacy_level', privacy);
  }

  const { data, error } = await query;

  if (error || !data) {
    return { bookmarks: [] };
  }

  return {
    bookmarks: data.map((item) => ({
      id: item.id,
      title: item.title,
      slug: item.slug || item.id,
      description: item.description,
      url: item.url,
      domain: item.domain,
      created_at: item.created_at,
      privacy_level: item.privacy_level,
      image_url: item.image_url,
      favicon_url: item.favicon_url,
      collections: item.collection_bookmarks
        ?.map((cb) => cb.collections)
        .filter(Boolean) || [],
      tags: item.bookmark_tags
        ?.map((bt) => bt.tags)
        .filter(Boolean) || [],
    })),
  };
}

function ViewToggle({
  view,
  search,
  privacy,
}: {
  view: 'grid' | 'list';
  search: string;
  privacy: 'all' | 'public' | 'private' | 'subscribers';
}) {
  const baseParams = new URLSearchParams();
  if (search) {
    baseParams.set('q', search);
  }
  if (privacy && privacy !== 'all') {
    baseParams.set('privacy', privacy);
  }

  const gridParams = new URLSearchParams(baseParams);
  gridParams.set('view', 'grid');

  const listParams = new URLSearchParams(baseParams);
  listParams.set('view', 'list');

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-white p-1 text-xs font-semibold text-neutral-600">
      <Link
        href={`/dashboard/bookmarks?${gridParams.toString()}`}
        className={cnToggle(view === 'grid')}
      >
        Grid
      </Link>
      <Link
        href={`/dashboard/bookmarks?${listParams.toString()}`}
        className={cnToggle(view === 'list')}
      >
        List
      </Link>
    </div>
  );
}

function cnToggle(active: boolean) {
  return [
    'rounded-full px-4 py-1 transition',
    active ? 'bg-neutral-900 text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-800',
  ].join(' ');
}

function buildRedirectTo({
  view,
  search,
  privacy,
}: {
  view: 'grid' | 'list';
  search: string;
  privacy: 'all' | 'public' | 'private' | 'subscribers';
}) {
  const params = new URLSearchParams();
  params.set('view', view);
  if (search) {
    params.set('q', search);
  }
  if (privacy && privacy !== 'all') {
    params.set('privacy', privacy);
  }
  return `/dashboard/bookmarks?${params.toString()}`;
}

function escapeForIlike(value: string) {
  return value.replace(/%/g, '\\%').replace(/_/g, '\\_').replace(/,/g, '');
}
