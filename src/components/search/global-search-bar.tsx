'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Loader2 } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

interface SearchResult {
  type: 'bookmark' | 'collection' | 'tag' | 'user';
  id: string;
  title: string;
  description?: string;
  url?: string;
  imageUrl?: string;
  metadata?: {
    username?: string;
    slug?: string;
    count?: number;
  };
}

export function GlobalSearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch search results
  useEffect(() => {
    async function fetchResults() {
      if (!debouncedQuery || debouncedQuery.length < 2) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(debouncedQuery)}&limit=5`
        );
        const data = await response.json();

        if (response.ok) {
          setResults(data.results || []);
          setIsOpen(true);
        }
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchResults();
  }, [debouncedQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (e.target.value.length >= 2) {
      setIsLoading(true);
    }
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  const handleResultClick = (result: SearchResult) => {
    setIsOpen(false);
    setQuery('');

    switch (result.type) {
      case 'bookmark':
        router.push(`/bookmark/${result.id}/${result.metadata?.slug || ''}`);
        break;
      case 'collection':
        router.push(`/c/${result.metadata?.username}/${result.metadata?.slug}`);
        break;
      case 'tag':
        router.push(`/tag/${result.metadata?.slug || result.id}`);
        break;
      case 'user':
        router.push(`/${result.metadata?.username || result.id}`);
        break;
    }
  };

  const handleViewAll = () => {
    router.push(`/search?q=${encodeURIComponent(query)}`);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.length >= 2) {
      handleViewAll();
    }
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'bookmark':
        return '🔖';
      case 'collection':
        return '📚';
      case 'tag':
        return '🏷️';
      case 'user':
        return '👤';
      default:
        return '📄';
    }
  };

  return (
    <div ref={searchRef} className="relative">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <input
          type="search"
          placeholder="Search bookmarks, collections, tags..."
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && results.length > 0 && setIsOpen(true)}
          className="w-64 rounded-lg border border-neutral-300 py-2 pl-10 pr-10 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-neutral-500"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {isLoading && (
          <div className="absolute right-10 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
          </div>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-xl border border-neutral-200 bg-white shadow-2xl">
          <div className="p-2">
            {results.map((result) => (
              <button
                key={`${result.type}-${result.id}`}
                onClick={() => handleResultClick(result)}
                className="flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors hover:bg-neutral-50"
              >
                <span className="text-2xl">{getResultIcon(result.type)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium text-neutral-900">
                      {result.title}
                    </p>
                    <span className="flex-shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600">
                      {result.type}
                    </span>
                  </div>
                  {result.description && (
                    <p className="mt-0.5 line-clamp-1 text-sm text-neutral-500">
                      {result.description}
                    </p>
                  )}
                  {result.metadata?.username && (
                    <p className="mt-0.5 text-xs text-neutral-400">
                      by @{result.metadata.username}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* View All Results */}
          <div className="border-t border-neutral-100 p-2">
            <button
              onClick={handleViewAll}
              className="w-full rounded-lg p-2 text-center text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-neutral-900"
            >
              View all results for "{query}" →
            </button>
          </div>
        </div>
      )}

      {/* No Results */}
      {isOpen && !isLoading && query.length >= 2 && results.length === 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-xl border border-neutral-200 bg-white p-6 text-center shadow-2xl">
          <p className="text-sm text-neutral-500">
            No results found for "{query}"
          </p>
        </div>
      )}
    </div>
  );
}
