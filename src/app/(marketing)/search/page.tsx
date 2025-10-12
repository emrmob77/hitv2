import { Metadata } from 'next';
import { Suspense } from 'react';
import { SearchResults } from '@/components/search/search-results';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Search - HitTags',
  description: 'Search bookmarks, collections, tags, and users on HitTags',
};

interface SearchPageProps {
  searchParams: {
    q?: string;
    type?: string;
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q, type } = await searchParams;

  // Get current user
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">
            {q ? `Search results for "${q}"` : 'Search'}
          </h1>
          {q && (
            <p className="mt-2 text-neutral-600">
              Find bookmarks, collections, tags, and users
            </p>
          )}
        </div>

        <Suspense
          fallback={
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-32 animate-pulse rounded-xl bg-neutral-200"
                />
              ))}
            </div>
          }
        >
          <SearchResults query={q || ''} type={type} currentUserId={user?.id} />
        </Suspense>
      </div>
    </div>
  );
}
