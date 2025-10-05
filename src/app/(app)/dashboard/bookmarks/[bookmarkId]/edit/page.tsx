import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { BookmarkEditForm } from '@/components/bookmarks/bookmark-form';
import { createSupabaseServerClient } from '@/lib/supabase/server';

type PageParams = {
  bookmarkId: string;
};

type BookmarkRecord = {
  id: string;
  url: string;
  title: string;
  description: string | null;
  privacy_level: 'public' | 'private' | 'subscribers';
  image_url: string | null;
  favicon_url: string | null;
  affiliate_links?: Array<{
    affiliate_url: string;
    commission_rate: number;
  }>;
  bookmark_tags?: Array<{
    tags: {
      name: string;
      slug: string;
    } | null;
  }> | null;
  collection_bookmarks?: Array<{
    collections: {
      slug: string;
      name: string;
      user_id: string;
    } | null;
  }> | null;
};

export const metadata: Metadata = {
  title: 'Edit Bookmark',
};

export default async function EditBookmarkPage({ params }: { params: Promise<PageParams> }) {
  const { bookmarkId } = await params;
  const bookmark = await getBookmark(bookmarkId);

  if (!bookmark) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-neutral-900">Edit bookmark</h1>
        <p className="text-sm text-neutral-600">
          Update the metadata or adjust who should be able to see this link.
        </p>
      </header>

      <BookmarkEditForm
        bookmarkId={bookmark.id}
        initialValues={{
          url: bookmark.url,
          title: bookmark.title,
          description: bookmark.description ?? '',
          privacy: bookmark.privacy_level,
          imageUrl: bookmark.image_url ?? '',
          faviconUrl: bookmark.favicon_url ?? '',
          affiliateUrl: bookmark.affiliate_links?.[0]?.affiliate_url ?? '',
          commissionRate: bookmark.affiliate_links?.[0]?.commission_rate?.toString() ?? '',
          tags: formatTagInitialValue(bookmark.bookmark_tags),
          collection: extractPrimaryCollectionSlug(bookmark) ?? '',
          collectionName: extractPrimaryCollectionName(bookmark) ?? undefined,
        }}
      />
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
      url,
      title,
      description,
      privacy_level,
      image_url,
      favicon_url,
      bookmark_tags:bookmark_tags(
        tags(name, slug)
      ),
      collection_bookmarks:collection_bookmarks(
        collections!inner(
          slug,
          name,
          user_id
        )
      )
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
    .select('affiliate_url, commission_rate')
    .eq('bookmark_id', id)
    .eq('user_id', user.id);

  const filteredCollectionBookmarks = (data.collection_bookmarks ?? []).filter(
    (entry) => entry.collections && entry.collections.user_id === user.id
  );

  return {
    ...data,
    affiliate_links: affiliateLinks || [],
    collection_bookmarks: filteredCollectionBookmarks,
  };
}

function extractPrimaryCollectionSlug(bookmark: BookmarkRecord): string | null {
  const entries = bookmark.collection_bookmarks ?? [];
  const primary = entries.find((entry) => entry.collections)?.collections;
  return primary?.slug ?? null;
}

function extractPrimaryCollectionName(bookmark: BookmarkRecord): string | null {
  const entries = bookmark.collection_bookmarks ?? [];
  const primary = entries.find((entry) => entry.collections)?.collections;
  return primary?.name ?? null;
}

function formatTagInitialValue(
  bookmarkTags: BookmarkRecord['bookmark_tags']
): string {
  if (!bookmarkTags || bookmarkTags.length === 0) {
    return '';
  }

  const tokens = bookmarkTags
    .map((entry) => entry.tags?.slug || entry.tags?.name || '')
    .filter((slug): slug is string => Boolean(slug))
    .map((slug) => slug.replace(/^#+/, ''));

  const unique = Array.from(new Set(tokens));

  return unique.map((token) => `#${token}`).join(' ');
}
