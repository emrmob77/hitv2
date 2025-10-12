'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bookmark,
  FolderOpen,
  Hash,
  User,
  Loader2,
  Search as SearchIcon,
  ExternalLink,
  TrendingUp,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingBookmarkCard } from '@/components/trending/trending-bookmark-card';

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

interface SearchResultsProps {
  query: string;
  type?: string;
  currentUserId?: string;
}

export function SearchResults({ query, type: initialType, currentUserId }: SearchResultsProps) {
  const router = useRouter();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(initialType || 'all');

  useEffect(() => {
    async function fetchResults() {
      if (!query || query.length < 2) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        // Always fetch ALL results, no type filter
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(query)}&limit=50`
        );
        const data = await response.json();

        if (response.ok) {
          setResults(data.results || []);
        }
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchResults();
  }, [query]); // Only re-fetch when query changes, NOT activeTab

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const url = value === 'all' ? `/search?q=${query}` : `/search?q=${query}&type=${value}`;
    router.push(url);
  };

  const getResultsByType = (type: string) => {
    if (type === 'all') return results;
    return results.filter((r) => r.type === type);
  };

  const renderResultItem = (result: SearchResult, currentUserId?: string) => {
    // Special rendering for bookmarks using TrendingBookmarkCard
    if (result.type === 'bookmark') {
      return (
        <TrendingBookmarkCard
          key={result.id}
          bookmark={{
            id: result.id,
            title: result.title,
            slug: result.metadata?.slug || result.id,
            description: result.description || null,
            imageUrl: result.imageUrl || null,
            likes: 0,
            saves: 0,
            shares: 0,
            isLiked: false,
            isSaved: false,
            author: {
              username: result.metadata?.username || 'unknown',
              displayName: null,
              avatarUrl: null,
            },
            tags: [],
          }}
          detailUrl={`/bookmark/${result.id}/${result.metadata?.slug || ''}`}
          visitUrl={`/out/bookmark/${result.id}`}
          currentUserId={currentUserId}
          layout="list"
        />
      );
    }

    const getUrl = () => {
      switch (result.type) {
        case 'collection':
          return `/c/${result.metadata?.username}/${result.metadata?.slug}`;
        case 'tag':
          return `/tag/${result.metadata?.slug || result.id}`;
        case 'user':
          return `/${result.metadata?.username || result.id}`;
        default:
          return '#';
      }
    };

    const getIcon = () => {
      switch (result.type) {
        case 'bookmark':
          return (
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
              <Bookmark className="h-7 w-7 text-white" />
            </div>
          );
        case 'collection':
          return (
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
              <FolderOpen className="h-7 w-7 text-white" />
            </div>
          );
        case 'tag':
          return (
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
              <Hash className="h-7 w-7 text-white" />
            </div>
          );
        case 'user':
          return (
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg">
              <User className="h-7 w-7 text-white" />
            </div>
          );
      }
    };

    const getTypeColor = () => {
      switch (result.type) {
        case 'bookmark':
          return 'bg-blue-100 text-blue-700';
        case 'collection':
          return 'bg-purple-100 text-purple-700';
        case 'tag':
          return 'bg-green-100 text-green-700';
        case 'user':
          return 'bg-orange-100 text-orange-700';
        default:
          return 'bg-neutral-100 text-neutral-700';
      }
    };

    return (
      <Link
        key={`${result.type}-${result.id}`}
        href={getUrl()}
        className="group block overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
      >
        <div className="flex items-start gap-5">
          {/* Icon or Image */}
          {result.imageUrl ? (
            <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl">
              <img
                src={result.imageUrl}
                alt={result.title}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            getIcon()
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="mb-2 flex items-start justify-between gap-3">
              <h3 className="line-clamp-2 text-xl font-bold text-neutral-900 transition-colors group-hover:text-indigo-600">
                {result.title}
              </h3>
              <span className={`flex-shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${getTypeColor()}`}>
                {result.type}
              </span>
            </div>

            {result.description && (
              <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-neutral-600">
                {result.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-neutral-500">
              {result.metadata?.username && (
                <span className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  @{result.metadata.username}
                </span>
              )}
              {result.metadata?.count !== undefined && (
                <span className="flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5" />
                  {result.metadata.count} bookmarks
                </span>
              )}
              {result.url && (
                <span className="flex items-center gap-1.5">
                  <ExternalLink className="h-3.5 w-3.5" />
                  {new URL(result.url).hostname}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  };

  if (!query || query.length < 2) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-16 text-center shadow-sm">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100">
          <SearchIcon className="h-10 w-10 text-neutral-400" />
        </div>
        <h3 className="mt-6 text-xl font-bold text-neutral-900">
          Start searching
        </h3>
        <p className="mt-2 text-neutral-600">
          Enter at least 2 characters to search across bookmarks, collections, tags, and users
        </p>
      </div>
    );
  }

  // Calculate counts per type from ALL results (not filtered)
  const allBookmarks = results.filter((r) => r.type === 'bookmark');
  const allCollections = results.filter((r) => r.type === 'collection');
  const allTags = results.filter((r) => r.type === 'tag');
  const allUsers = results.filter((r) => r.type === 'user');

  const currentResults = getResultsByType(activeTab);

  return (
    <div>
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="mb-8 grid w-full grid-cols-5 gap-2 bg-neutral-100 p-1.5">
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            All ({results.length})
          </TabsTrigger>
          <TabsTrigger
            value="bookmark"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Bookmarks ({allBookmarks.length})
          </TabsTrigger>
          <TabsTrigger
            value="collection"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Collections ({allCollections.length})
          </TabsTrigger>
          <TabsTrigger
            value="tag"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Tags ({allTags.length})
          </TabsTrigger>
          <TabsTrigger
            value="user"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Users ({allUsers.length})
          </TabsTrigger>
        </TabsList>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
          </div>
        ) : (
          <>
            <TabsContent value="all" className="space-y-4">
              {currentResults.length === 0 ? (
                <NoResults query={query} />
              ) : (
                currentResults.map((result) => renderResultItem(result, currentUserId))
              )}
            </TabsContent>

            <TabsContent value="bookmark" className="space-y-4">
              {currentResults.length === 0 ? (
                <NoResults query={query} type="bookmarks" />
              ) : (
                currentResults.map((result) => renderResultItem(result, currentUserId))
              )}
            </TabsContent>

            <TabsContent value="collection" className="space-y-4">
              {currentResults.length === 0 ? (
                <NoResults query={query} type="collections" />
              ) : (
                currentResults.map((result) => renderResultItem(result, currentUserId))
              )}
            </TabsContent>

            <TabsContent value="tag" className="space-y-4">
              {currentResults.length === 0 ? (
                <NoResults query={query} type="tags" />
              ) : (
                currentResults.map((result) => renderResultItem(result, currentUserId))
              )}
            </TabsContent>

            <TabsContent value="user" className="space-y-4">
              {currentResults.length === 0 ? (
                <NoResults query={query} type="users" />
              ) : (
                currentResults.map((result) => renderResultItem(result, currentUserId))
              )}
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}

function NoResults({ query, type }: { query: string; type?: string }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-16 text-center shadow-sm">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100">
        <SearchIcon className="h-10 w-10 text-neutral-400" />
      </div>
      <h3 className="mt-6 text-xl font-bold text-neutral-900">
        No {type || 'results'} found
      </h3>
      <p className="mt-2 text-neutral-600">
        We couldn't find any {type || 'results'} matching "<span className="font-semibold">{query}</span>"
      </p>
      <div className="mt-6">
        <Link
          href="/explore"
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
        >
          Explore Popular Content
        </Link>
      </div>
    </div>
  );
}
