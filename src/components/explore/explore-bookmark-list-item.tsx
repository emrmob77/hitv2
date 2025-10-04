"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Bookmark, Share2 } from "lucide-react";

interface ExploreBookmarkListItemProps {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
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

export function ExploreBookmarkListItem({
  id,
  title,
  slug,
  description,
  imageUrl,
  author,
  tags,
  likes: initialLikes,
  isLiked = false,
  isBookmarked = false,
}: ExploreBookmarkListItemProps) {
  const [liked, setLiked] = useState(isLiked);
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  const [likes, setLikes] = useState(initialLikes);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLiked(!liked);
    setLikes(liked ? likes - 1 : likes + 1);
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setBookmarked(!bookmarked);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <Link
      href={`/bookmark/${id}/${slug}`}
      className="flex gap-4 rounded-xl border border-neutral-200 bg-white p-4 transition-shadow hover:shadow-lg"
    >
      <div className="h-32 w-32 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-300">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-xs text-neutral-600">Preview</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col">
        <h3 className="mb-2 text-lg font-semibold text-neutral-900 hover:text-neutral-700">
          {title}
        </h3>
        {description && (
          <p className="mb-3 line-clamp-2 text-sm text-neutral-600">
            {description}
          </p>
        )}
        <div className="mb-3 flex flex-wrap gap-1">
          {tags.slice(0, 5).map((tag) => (
            <span
              key={tag.slug}
              className="rounded bg-neutral-100 px-2 py-1 text-xs text-neutral-700"
            >
              #{tag.name}
            </span>
          ))}
        </div>
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center">
            {author.avatarUrl ? (
              <img
                src={author.avatarUrl}
                alt={author.displayName || author.username}
                className="mr-2 h-6 w-6 rounded-full"
              />
            ) : (
              <div className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-neutral-300">
                <span className="text-xs font-semibold text-neutral-600">
                  {(author.displayName || author.username)
                    .charAt(0)
                    .toUpperCase()}
                </span>
              </div>
            )}
            <span className="text-sm text-neutral-600">
              {author.displayName || author.username}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleLike}
              className={
                liked ? "text-red-500" : "text-neutral-500 hover:text-red-500"
              }
            >
              <Heart
                className="h-4 w-4"
                fill={liked ? "currentColor" : "none"}
              />
            </button>
            <span className="text-sm text-neutral-500">{likes}</span>
            <button
              onClick={handleBookmark}
              className="text-neutral-500 hover:text-neutral-700"
            >
              <Bookmark
                className="h-4 w-4"
                fill={bookmarked ? "currentColor" : "none"}
              />
            </button>
            <button
              onClick={handleShare}
              className="text-neutral-500 hover:text-neutral-700"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
