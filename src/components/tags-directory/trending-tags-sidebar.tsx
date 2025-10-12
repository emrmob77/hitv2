"use client";

import Link from 'next/link';
import { TrendingUp, ArrowRight } from 'lucide-react';

interface TrendingTagsSidebarProps {
  tags: Array<{
    id: string;
    name: string;
    slug: string;
    usage_count: number;
    is_trending: boolean;
  }>;
  currentUserId?: string;
}

export function TrendingTagsSidebar({ tags }: TrendingTagsSidebarProps) {
  if (tags.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-orange-500" />
        <h3 className="text-lg font-bold text-neutral-900">Trending Now</h3>
      </div>

      <div className="space-y-3">
        {tags.slice(0, 5).map((tag, index) => (
          <Link
            key={tag.id}
            href={`/tag/${tag.slug}`}
            className="group flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-neutral-50"
          >
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-pink-500 text-sm font-bold text-white">
              {index + 1}
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-neutral-900 group-hover:text-indigo-600">
                #{tag.name}
              </div>
              <div className="text-xs text-neutral-500">
                {tag.usage_count.toLocaleString()} bookmarks
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-neutral-400 opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>
        ))}
      </div>

      {tags.length > 5 && (
        <Link
          href="/tags?sort=trending"
          className="mt-4 block text-center text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          View All Trends →
        </Link>
      )}
    </div>
  );
}
