"use client";

import Link from "next/link";
import { Heart, Bookmark as BookmarkIcon, MessageCircle, Share2, Eye, Plus, Copy, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BookmarkStats {
  views: number;
  likes: number;
  saves: number;
  comments: number;
  shares: number;
}

interface Collection {
  id: string;
  name: string;
  slug: string;
  bookmarkCount: number;
}

interface RelatedBookmark {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  likes: number;
  saves: number;
}

interface BookmarkDetailSidebarProps {
  stats: BookmarkStats;
  collections?: Collection[];
  relatedBookmarks?: RelatedBookmark[];
}

export function BookmarkDetailSidebar({
  stats,
  collections = [],
  relatedBookmarks = [],
}: BookmarkDetailSidebarProps) {
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  return (
    <aside className="space-y-6">
      {/* Bookmark Stats */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-neutral-900">
          Bookmark Stats
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="flex items-center text-sm text-neutral-600">
              <Eye className="mr-2 h-4 w-4" />
              Views
            </span>
            <span className="text-sm font-semibold text-neutral-900">
              {stats.views}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center text-sm text-neutral-600">
              <Heart className="mr-2 h-4 w-4" />
              Likes
            </span>
            <span className="text-sm font-semibold text-neutral-900">
              {stats.likes}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center text-sm text-neutral-600">
              <BookmarkIcon className="mr-2 h-4 w-4" />
              Saves
            </span>
            <span className="text-sm font-semibold text-neutral-900">
              {stats.saves}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center text-sm text-neutral-600">
              <MessageCircle className="mr-2 h-4 w-4" />
              Comments
            </span>
            <span className="text-sm font-semibold text-neutral-900">
              {stats.comments}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center text-sm text-neutral-600">
              <Share2 className="mr-2 h-4 w-4" />
              Shares
            </span>
            <span className="text-sm font-semibold text-neutral-900">
              {stats.shares}
            </span>
          </div>
        </div>
      </div>

      {/* Collections */}
      {collections.length > 0 && (
        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-neutral-900">
            Collections
          </h3>
          <div className="space-y-3">
            {collections.map((collection) => (
              <div
                key={collection.id}
                className="flex items-center justify-between rounded-lg bg-neutral-50 p-3 hover:bg-neutral-100"
              >
                <Link href={`/collections/${collection.slug}`}>
                  <div className="text-sm font-medium text-neutral-900">
                    {collection.name}
                  </div>
                  <div className="text-xs text-neutral-500">
                    {collection.bookmarkCount} bookmarks
                  </div>
                </Link>
                <button className="text-xs font-medium text-neutral-600 hover:text-neutral-800">
                  Add
                </button>
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            className="mt-4 w-full rounded-lg border-neutral-300 py-2 text-sm text-neutral-600 hover:text-neutral-800"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Collection
          </Button>
        </div>
      )}

      {/* Related Bookmarks */}
      {relatedBookmarks.length > 0 && (
        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-neutral-900">
            Related Bookmarks
          </h3>
          <div className="space-y-4">
            {relatedBookmarks.map((bookmark) => (
              <Link
                key={bookmark.id}
                href={`/bookmarks/${bookmark.id}/${bookmark.slug}`}
                className="flex items-start space-x-3 rounded-lg p-3 hover:bg-neutral-50"
              >
                {bookmark.imageUrl ? (
                  <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-300">
                    <img
                      src={bookmark.imageUrl}
                      alt={bookmark.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-neutral-300">
                    <span className="text-xs text-neutral-600">IMG</span>
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="mb-1 text-sm font-medium text-neutral-900">
                    {bookmark.title}
                  </h4>
                  {bookmark.description && (
                    <p className="mb-2 text-xs text-neutral-600 line-clamp-2">
                      {bookmark.description}
                    </p>
                  )}
                  <div className="flex items-center space-x-2">
                    <span className="flex items-center text-xs text-neutral-500">
                      <Heart className="mr-1 h-3 w-3" />
                      {bookmark.likes}
                    </span>
                    <span className="flex items-center text-xs text-neutral-500">
                      <BookmarkIcon className="mr-1 h-3 w-3" />
                      {bookmark.saves}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Share Options */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-neutral-900">
          Share Options
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <button className="flex items-center justify-center space-x-2 rounded-lg border border-neutral-300 p-3 hover:bg-neutral-50">
            <svg className="h-4 w-4 text-neutral-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
            </svg>
            <span className="text-sm text-neutral-700">Twitter</span>
          </button>
          <button className="flex items-center justify-center space-x-2 rounded-lg border border-neutral-300 p-3 hover:bg-neutral-50">
            <svg className="h-4 w-4 text-neutral-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            <span className="text-sm text-neutral-700">LinkedIn</span>
          </button>
          <button
            onClick={handleCopyLink}
            className="flex items-center justify-center space-x-2 rounded-lg border border-neutral-300 p-3 hover:bg-neutral-50"
          >
            <Copy className="h-4 w-4 text-neutral-600" />
            <span className="text-sm text-neutral-700">Copy Link</span>
          </button>
          <button className="flex items-center justify-center space-x-2 rounded-lg border border-neutral-300 p-3 hover:bg-neutral-50">
            <Mail className="h-4 w-4 text-neutral-600" />
            <span className="text-sm text-neutral-700">Email</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
