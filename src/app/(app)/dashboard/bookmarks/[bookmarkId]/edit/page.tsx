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
      favicon_url
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

  return {
    ...data,
    affiliate_links: affiliateLinks || [],
  };
}
