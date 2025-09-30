import Link from 'next/link';
import { Metadata } from 'next';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FolderIcon, LockIcon, UsersIcon, EyeIcon, ExternalLinkIcon } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Collections • HitTags',
};

interface Collection {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  privacy_level: 'public' | 'private' | 'subscribers';
  bookmark_count: number;
  created_at: string;
  cover_image_url: string | null;
  username?: string;
}

export default async function CollectionsPage() {
  const collections = await fetchCollections();

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="mx-auto flex w-full max-w-5xl flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-neutral-900">Your Collections</h1>
          <p className="text-sm text-neutral-600">
            Organize your bookmarks into curated collections and share them with others.
          </p>
        </div>
        <Button asChild className="bg-neutral-900 text-white hover:bg-neutral-800">
          <Link href="/dashboard/collections/new">Create Collection</Link>
        </Button>
      </header>

      {/* Collections Grid */}
      <div className="mx-auto w-full max-w-5xl">
        {collections.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <FolderIcon className="mx-auto mb-4 h-12 w-12 text-neutral-300" />
              <h3 className="mb-2 text-lg font-semibold text-neutral-900">No collections yet</h3>
              <p className="mb-6 text-sm text-neutral-600">
                Create your first collection to organize your bookmarks.
              </p>
              <Button asChild>
                <Link href="/dashboard/collections/new">Create Your First Collection</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {collections.map((collection) => (
              <div key={collection.id} className="group">
                <Card className="overflow-hidden transition-shadow hover:shadow-lg">
                  {/* Cover Image */}
                  <Link href={`/dashboard/collections/${collection.id}`}>
                    <div className="aspect-video w-full overflow-hidden bg-gradient-to-br from-neutral-100 to-neutral-200">
                      {collection.cover_image_url ? (
                        <img
                          src={collection.cover_image_url}
                          alt={collection.name}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <FolderIcon className="h-16 w-16 text-neutral-300" />
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Content */}
                  <CardContent className="p-4">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <Link href={`/dashboard/collections/${collection.id}`}>
                        <h3 className="font-semibold text-neutral-900 line-clamp-1 hover:text-neutral-700">
                          {collection.name}
                        </h3>
                      </Link>
                      {collection.privacy_level === 'public' ? (
                        <EyeIcon className="h-4 w-4 flex-shrink-0 text-green-600" />
                      ) : (
                        <LockIcon className="h-4 w-4 flex-shrink-0 text-neutral-400" />
                      )}
                    </div>

                    {collection.description && (
                      <p className="mb-3 text-sm text-neutral-600 line-clamp-2">
                        {collection.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-neutral-500">
                      <span className="flex items-center gap-1">
                        <FolderIcon className="h-3 w-3" />
                        {collection.bookmark_count} bookmarks
                      </span>
                      <span className="flex items-center gap-1">
                        {collection.privacy_level === 'public' ? (
                          <>
                            <UsersIcon className="h-3 w-3" />
                            Public
                          </>
                        ) : (
                          <>
                            <LockIcon className="h-3 w-3" />
                            Private
                          </>
                        )}
                      </span>
                    </div>

                    <p className="mt-2 text-xs text-neutral-400">
                      Created {new Date(collection.created_at).toLocaleDateString()}
                    </p>

                    {collection.privacy_level === 'public' && collection.username && (
                      <div className="mt-3 pt-3 border-t border-neutral-200">
                        <Button asChild variant="outline" size="sm" className="w-full">
                          <Link href={`/c/${collection.username}/${collection.slug}`} target="_blank">
                            <ExternalLinkIcon className="mr-2 h-3 w-3" />
                            View Public Page
                          </Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

async function fetchCollections(): Promise<Collection[]> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.log('No user found for collections');
    return [];
  }

  console.log('Fetching collections for user:', user.id);

  // Get username from profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single();

  const { data, error } = await supabase
    .from('collections')
    .select('id, name, description, slug, privacy_level, bookmark_count, created_at, cover_image_url')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Collections fetch error:', error?.message ?? error);
    return [];
  }

  console.log('Collections fetched:', data?.length || 0);

  // Add username to each collection
  return (data || []).map(collection => ({
    ...collection,
    username: profile?.username,
  }));
}