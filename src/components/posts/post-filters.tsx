'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface PostFiltersProps {
  visibilityFilter: string;
  sortBy: string;
}

export function PostFilters({ visibilityFilter, sortBy }: PostFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set(key, value);
    router.push(`/dashboard/posts?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Visibility Filter */}
      <select
        name="visibility"
        className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
        value={visibilityFilter}
        onChange={(e) => updateFilter('visibility', e.target.value)}
      >
        <option value="all">All Posts</option>
        <option value="public">Public</option>
        <option value="subscribers">Subscribers</option>
        <option value="premium">Premium</option>
        <option value="private">Private</option>
      </select>

      {/* Sort */}
      <select
        name="sort"
        className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
        value={sortBy}
        onChange={(e) => updateFilter('sort', e.target.value)}
      >
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
        <option value="most_viewed">Most Viewed</option>
        <option value="most_liked">Most Liked</option>
      </select>
    </div>
  );
}
