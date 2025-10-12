"use client";

import { Search, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition, useEffect } from 'react';

interface TagsSearchProps {
  initialQuery?: string;
}

export function TagsSearch({ initialQuery = '' }: TagsSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleSearch = (value: string) => {
    setQuery(value);

    startTransition(() => {
      const params = new URLSearchParams(searchParams?.toString() ?? '');

      if (value.trim()) {
        params.set('q', value.trim());
      } else {
        params.delete('q');
      }

      const queryString = params.toString();
      router.push(queryString ? `/tags?${queryString}` : '/tags');
    });
  };

  const handleClear = () => {
    handleSearch('');
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/60" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search for topics, interests..."
          className="w-full rounded-xl border-2 border-white/20 bg-white/10 py-3 pl-12 pr-12 text-white placeholder-white/60 backdrop-blur-sm transition-all focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
          disabled={isPending}
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
            disabled={isPending}
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {isPending && (
        <div className="absolute left-0 right-0 top-full mt-2 rounded-lg border border-neutral-200 bg-white p-3 text-center text-sm text-neutral-600 shadow-lg">
          Searching...
        </div>
      )}
    </div>
  );
}
