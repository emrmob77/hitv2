import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { FolderIcon, EyeIcon } from 'lucide-react';

interface Collection {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  cover_image_url: string | null;
  bookmark_count: number;
  created_at: string;
  user: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
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
  params: Promise<{ username: string; slug: string }>;
}): Promise<Metadata> {
  const { username, slug } = await params;
  const collection = await fetchPublicCollection(username, slug);

  if (!collection) {
    return { title: 'Collection Not Found' };
  }

  return {
    title: `${collection.name} by @${collection.user.username} • HitTags`,
    description: collection.description || `A curated collection of bookmarks by @${collection.user.username}`,
    openGraph: {
      title: collection.name,
      description: collection.description || undefined,
      images: collection.cover_image_url ? [collection.cover_image_url] : undefined,
    },
  };
}

export default async function PublicCollectionPage({
  params,
}: {
  params: Promise<{ username: string; slug: string }>;
}) {
  const { username, slug } = await params;
  const collection = await fetchPublicCollection(username, slug);

  if (!collection) {
    notFound();
  }

  const bookmarks = await fetchCollectionBookmarks(collection.id);

  return (
    <div className="min-h-screen bg-neutral-50 py-12">
      <div className="mx-auto w-full max-w-5xl space-y-8 px-4">
        {/* Collection Header */}
        <header className="space-y-6">
          {collection.cover_image_url && (
            <div className="aspect-video w-full overflow-hidden rounded-2xl">
              <img
                src={collection.cover_image_url}
                alt={collection.name}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                <EyeIcon className="h-3 w-3" />
                Public Collection
              </span>
            </div>

            <div className="flex items-start gap-4">
              {collection.user.avatar_url && (
                <img
                  src={collection.user.avatar_url}
                  alt={collection.user.username}
                  className="h-12 w-12 rounded-full"
                />
              )}
              <div>
                <h1 className="text-4xl font-bold text-neutral-900">{collection.name}</h1>
                <p className="mt-2 text-neutral-600">
                  by{' '}
                  <a
                    href={`/${collection.user.username}`}
                    className="font-medium text-neutral-900 hover:underline"
                  >
                    @{collection.user.username}
                  </a>
                </p>
              </div>
            </div>

            {collection.description && (
              <p className="text-lg text-neutral-600">{collection.description}</p>
            )}

            <div className="flex items-center gap-4 text-sm text-neutral-500">
              <span className="flex items-center gap-1">
                <FolderIcon className="h-4 w-4" />
                {collection.bookmark_count} bookmarks
              </span>
              <span>•</span>
              <span>Created {new Date(collection.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </header>

        {/* Bookmarks */}
        <section>
          <Card>
            <CardContent className="p-6">
              {bookmarks.length === 0 ? (
                <div className="py-12 text-center">
                  <FolderIcon className="mx-auto mb-4 h-12 w-12 text-neutral-300" />
                  <p className="text-neutral-600">This collection is empty.</p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {bookmarks.map((bookmark) => (
                    <a
                      key={bookmark.id}
                      href={bookmark.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex gap-4 rounded-lg border p-4 transition-all hover:border-neutral-400 hover:shadow-md"
                    >
                      {bookmark.image_url || bookmark.favicon_url ? (
                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded">
                          <img
                            src={bookmark.image_url || bookmark.favicon_url || ''}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded bg-neutral-100">
                          <FolderIcon className="h-8 w-8 text-neutral-400" />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-neutral-900 line-clamp-2 group-hover:text-blue-600">
                          {bookmark.title}
                        </h3>
                        {bookmark.description && (
                          <p className="mt-1 text-sm text-neutral-600 line-clamp-2">
                            {bookmark.description}
                          </p>
                        )}
                        {bookmark.domain && (
                          <p className="mt-2 text-xs text-neutral-500">{bookmark.domain}</p>
                        )}
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}

async function fetchPublicCollection(
  username: string,
  slug: string
): Promise<Collection | null> {
  const supabase = await createSupabaseServerClient();

  // First get the user by username
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url')
    .eq('username', username)
    .single();

  if (!profile) return null;

  // Then get the collection
  const { data, error } = await supabase
    .from('collections')
    .select('id, name, description, slug, cover_image_url, bookmark_count, created_at')
    .eq('user_id', profile.id)
    .eq('slug', slug)
    .eq('privacy_level', 'public')
    .single();

  if (error || !data) {
    console.error('Public collection fetch error:', error);
    return null;
  }

  return {
    ...data,
    user: profile,
  };
}

async function fetchCollectionBookmarks(collectionId: string): Promise<Bookmark[]> {
  const supabase = await createSupabaseServerClient();

  const { data } = await supabase
    .from('collection_bookmarks')
    .select(`
      bookmark_id,
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
    `)
    .eq('collection_id', collectionId)
    .order('created_at', { ascending: false });

  if (!data) return [];

  return data
    .map((item: any) => item.bookmarks)
    .filter(Boolean);
}
