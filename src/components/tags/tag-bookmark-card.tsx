"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Bookmark, Share2 } from "lucide-react";

interface TagBookmarkCardProps {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  domain: string | null;
  imageUrl: string | null;
  createdAt: string;
  author: {
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
  tags: Array<{
    name: string;
    slug: string;
  }>;
  likes: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
}

export function TagBookmarkCard({
  id,
  title,
  slug,
  description,
  domain,
  imageUrl,
  createdAt,
  author,
  tags,
  likes,
  isLiked = false,
  isBookmarked = false,
}: TagBookmarkCardProps) {
  const [liked, setLiked] = useState(isLiked);
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  const [likeCount, setLikeCount] = useState(likes);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    setBookmarked(!bookmarked);
  };

  const timeAgo = (date: string) => {
    const now = new Date();
    const created = new Date(date);
    const diffInHours = Math.floor(
      (now.getTime() - created.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return "1 day ago";
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 transition-shadow hover:shadow-lg">
      <div className="flex items-start space-x-4">
        {imageUrl && (
          <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-300">
            <img
              src={imageUrl}
              alt={title}
              className="h-full w-full object-cover"
            />
          </div>
        )}
        {!imageUrl && (
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-neutral-300">
            <span className="text-xs text-neutral-600">IMG</span>
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <Link
                href={`/bookmarks/${id}/${slug}`}
                className="mb-2 block text-lg font-semibold text-neutral-900 hover:text-neutral-700"
              >
                {title}
              </Link>
              {description && (
                <p className="mb-3 text-sm text-neutral-600">{description}</p>
              )}
              <div className="mb-3 flex items-center space-x-4 text-sm text-neutral-500">
                <span>{domain}</span>
                <span>•</span>
                <span>{timeAgo(createdAt)}</span>
                <span>•</span>
                <span className="flex items-center">
                  {author.avatarUrl && (
                    <img
                      src={author.avatarUrl}
                      alt={author.displayName || author.username}
                      className="mr-1 h-4 w-4 rounded-full"
                    />
                  )}
                  {author.displayName || author.username}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {tags.slice(0, 3).map((tag) => (
                  <Link
                    key={tag.slug}
                    href={`/tags/${tag.slug}`}
                    className="rounded-full bg-neutral-100 px-2 py-1 text-xs text-neutral-700 hover:bg-neutral-200"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            </div>
            <div className="ml-4 flex items-center space-x-2">
              <button
                onClick={handleLike}
                className={`p-2 ${
                  liked
                    ? "text-red-600"
                    : "text-neutral-500 hover:text-neutral-600"
                }`}
              >
                <Heart
                  className="h-5 w-5"
                  fill={liked ? "currentColor" : "none"}
                />
              </button>
              <span className="text-sm text-neutral-500">{likeCount}</span>
              <button
                onClick={handleBookmark}
                className="p-2 text-neutral-500 hover:text-neutral-700"
              >
                <Bookmark
                  className="h-5 w-5"
                  fill={bookmarked ? "currentColor" : "none"}
                />
              </button>
              <button className="p-2 text-neutral-500 hover:text-neutral-700">
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
