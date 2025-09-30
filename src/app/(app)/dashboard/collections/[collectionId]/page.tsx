import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderIcon, EyeIcon, LockIcon, EditIcon } from 'lucide-react';
import { DeleteCollectionButton } from '@/components/collections/delete-collection-button';
import { RemoveBookmarkButton } from '@/components/collections/remove-bookmark-button';

interface CollectionDetail {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  privacy_level: 'public' | 'private' | 'subscribers';
  bookmark_count: number;
  created_at: string;
  cover_image_url: string | null;
  user_id: string;
}

interface Bookmark {
  id: string;
  title: string;
  description: string | null;
  url: string;
  domain: string | null;
  favicon_url: string | null;
  image_url: string | null;
  created_at: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ collectionId: string }>;
}): Promise<Metadata> {
  const { collectionId } = await params;
  const collection = await fetchCollection(collectionId);

  if (!collection) {
    return { title: 'Collection Not Found' };
  }

  return {
    title: `${collection.name} • HitTags`,
  };
}

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ collectionId: string }>;
}) {
  const { collectionId } = await params;
  const collection = await fetchCollection(collectionId);

  if (!collection) {
    notFound();
  }

  const bookmarks = await fetchCollectionBookmarks(collectionId);

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="mx-auto w-full max-w-5xl">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FolderIcon className="h-6 w-6 text-neutral-600" />
              <h1 className="text-3xl font-semibold text-neutral-900">{collection.name}</h1>
              {collection.privacy_level === 'public' ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                  <EyeIcon className="h-3 w-3" />
                  Public
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-700">
                  <LockIcon className="h-3 w-3" />
                  Private
                </span>
              )}
            </div>
            {collection.description && (
              <p className="text-sm text-neutral-600">{collection.description}</p>
            )}
            <p className="text-xs text-neutral-500">
              {collection.bookmark_count} bookmarks • Created{' '}
              {new Date(collection.created_at).toLocaleDateString()}
            </p>
          </div>

          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/dashboard/collections/${collectionId}/edit`}>
                <EditIcon className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
            <DeleteCollectionButton
              collectionId={collection.id}
              collectionName={collection.name}
            />
          </div>
        </div>
      </header>

      {/* Bookmarks */}
      <div className="mx-auto w-full max-w-5xl">
        <Card>
          <CardHeader>
            <CardTitle>Bookmarks in this collection</CardTitle>
          </CardHeader>
          <CardContent>
            {bookmarks.length === 0 ? (
              <div className="py-8 text-center text-sm text-neutral-600">
                No bookmarks in this collection yet. Add bookmarks to get started.
              </div>
            ) : (
              <div className="space-y-3">
                {bookmarks.map((bookmark) => (
                  <div
                    key={bookmark.id}
                    className="flex items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-neutral-50"
                  >
                    {bookmark.favicon_url && (
                      <img
                        src={bookmark.favicon_url}
                        alt=""
                        className="h-8 w-8 flex-shrink-0 rounded"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-neutral-900 line-clamp-1">
                        {bookmark.title}
                      </h3>
                      {bookmark.description && (
                        <p className="mt-1 text-sm text-neutral-600 line-clamp-2">
                          {bookmark.description}
                        </p>
                      )}
                      <div className="mt-2 flex items-center gap-3 text-xs text-neutral-500">
                        <span>{bookmark.domain}</span>
                        <span>•</span>
                        <a
                          href={bookmark.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Visit link
                        </a>
                      </div>
                    </div>
                    <RemoveBookmarkButton
                      collectionId={collectionId}
                      bookmarkId={bookmark.id}
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

async function fetchCollection(collectionId: string): Promise<CollectionDetail | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .eq('id', collectionId)
    .eq('user_id', user.id)
    .single();

  if (error || !data) return null;

  return data;
}

async function fetchCollectionBookmarks(collectionId: string): Promise<Bookmark[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('collection_bookmarks')
    .select(
      `
      bookmarks (
        id,
        title,
        description,
        url,
        domain,
        favicon_url,
        image_url,
        created_at
      )
    `
    )
    .eq('collection_id', collectionId)
    .order('added_at', { ascending: false });

  if (error || !data) return [];

  return data.map((item: any) => item.bookmarks).filter(Boolean);
}