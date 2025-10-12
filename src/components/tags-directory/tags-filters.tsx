"use client";

import { Grid, List, SlidersHorizontal } from 'lucide-react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTransition } from 'react';

import { Button } from '@/components/ui/button';

interface TagsFiltersProps {
  initialSort: string;
  initialView: 'grid' | 'list';
  totalCount: number;
}

const SORT_OPTIONS = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'trending', label: 'Trending' },
  { value: 'recent', label: 'Most Recent' },
  { value: 'alphabetical', label: 'Alphabetical' },
  { value: 'most-bookmarks', label: 'Most Bookmarks' },
];

export function TagsFilters({ initialSort, initialView, totalCount }: TagsFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateUrl = (updates: Record<string, string>) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams?.toString() ?? '');

      Object.entries(updates).forEach(([key, value]) => {
        if (value && value !== 'popular' && value !== 'grid') {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      const queryString = params.toString();
      router.push(queryString ? `${pathname}?${queryString}` : pathname);
    });
  };

  const handleSortChange = (sort: string) => {
    updateUrl({ sort });
  };

  const handleViewChange = (view: string) => {
    updateUrl({ view });
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <SlidersHorizontal className="h-5 w-5 text-neutral-500" />
        <div className="flex items-center gap-2">
          <label htmlFor="sort-select" className="text-sm font-medium text-neutral-700">
            Sort by:
          </label>
          <select
            id="sort-select"
            value={initialSort}
            onChange={(e) => handleSortChange(e.target.value)}
            className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-500"
            disabled={isPending}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="text-sm text-neutral-600">
          <span className="font-semibold">{totalCount.toLocaleString()}</span> tags found
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-neutral-700">Display:</span>
        <div className="flex rounded-lg border border-neutral-300">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewChange('grid')}
            disabled={isPending}
            className={
              initialView === 'grid'
                ? 'bg-neutral-900 text-white hover:bg-neutral-800 hover:text-white'
                : 'text-neutral-700 hover:bg-neutral-100'
            }
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewChange('list')}
            disabled={isPending}
            className={
              initialView === 'list'
                ? 'bg-neutral-900 text-white hover:bg-neutral-800 hover:text-white'
                : 'text-neutral-700 hover:bg-neutral-100'
            }
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
