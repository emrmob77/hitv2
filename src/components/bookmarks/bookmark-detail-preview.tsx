"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Bookmark, Share2, ExternalLink, Eye, Calendar, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BookmarkDetailPreviewProps {
  id: string;
  title: string;
  description: string | null;
  url: string;
  domain: string | null;
  imageUrl: string | null;
  createdAt: string;
  viewCount: number;
  likeCount: number;
  author: {
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
    bio?: string | null;
  };
  tags: Array<{
    name: string;
    slug: string;
  }>;
  isLiked?: boolean;
  isBookmarked?: boolean;
}

export function BookmarkDetailPreview({
  id,
  title,
  description,
  url,
  domain,
  imageUrl,
  createdAt,
  viewCount,
  likeCount,
  author,
  tags,
  isLiked = false,
  isBookmarked = false,
}: BookmarkDetailPreviewProps) {
  const [liked, setLiked] = useState(isLiked);
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  const [likes, setLikes] = useState(likeCount);

  const handleLike = () => {
    setLiked(!liked);
    setLikes(liked ? likes - 1 : likes + 1);
  };

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
  };

  const timeAgo = (date: string) => {
    const now = new Date();
    const created = new Date(date);
    const diffInHours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return "1 day ago";
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  return (
    <section className="mb-8 rounded-xl border border-neutral-200 bg-white p-8">
      <div className="mb-6">
        <div className="mb-6 h-80 w-full overflow-hidden rounded-lg bg-neutral-300">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="text-lg text-neutral-600">Website Preview</span>
            </div>
          )}
        </div>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="mb-3 text-3xl font-bold text-neutral-900">{title}</h1>
            {description && (
              <p className="mb-4 text-lg text-neutral-600">{description}</p>
            )}
            <div className="mb-6 flex items-center space-x-4 text-sm text-neutral-500">
              {domain && (
                <span className="flex items-center">
                  <LinkIcon className="mr-2 h-4 w-4" />
                  {domain}
                </span>
              )}
              <span className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                Added {timeAgo(createdAt)}
              </span>
              <span className="flex items-center">
                <Eye className="mr-2 h-4 w-4" />
                {viewCount} views
              </span>
            </div>
            {tags && tags.length > 0 && (
              <div className="mb-6 flex items-center space-x-2">
                {tags.map((tag) => (
                  <Link
                    key={tag.slug}
                    href={`/tags/${tag.slug}`}
                    className="rounded-full bg-neutral-100 px-3 py-1 text-sm text-neutral-700 hover:bg-neutral-200"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-neutral-200 pt-6">
        <div className="flex items-center space-x-4">
          {author.avatarUrl ? (
            <img
              src={author.avatarUrl}
              alt={author.displayName || author.username}
              className="h-10 w-10 rounded-full"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-300">
              <span className="text-sm font-semibold text-neutral-600">
                {(author.displayName || author.username).charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <Link
              href={`/${author.username}`}
              className="text-sm font-medium text-neutral-900 hover:text-neutral-700"
            >
              {author.displayName || author.username}
            </Link>
            {author.bio && (
              <div className="text-xs text-neutral-500">{author.bio}</div>
            )}
          </div>
          <Button className="rounded-lg bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-800">
            Follow
          </Button>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-2 rounded-lg px-4 py-2 ${
                liked
                  ? "bg-red-50 text-red-600"
                  : "bg-neutral-100 hover:bg-neutral-200"
              }`}
            >
              <Heart
                className="h-4 w-4"
                fill={liked ? "currentColor" : "none"}
              />
              <span className="text-sm">{likes}</span>
            </button>
            <button
              onClick={handleBookmark}
              className="flex items-center space-x-2 rounded-lg bg-neutral-100 px-4 py-2 hover:bg-neutral-200"
            >
              <Bookmark
                className="h-4 w-4 text-neutral-600"
                fill={bookmarked ? "currentColor" : "none"}
              />
              <span className="text-sm text-neutral-700">Save</span>
            </button>
            <button className="flex items-center space-x-2 rounded-lg bg-neutral-100 px-4 py-2 hover:bg-neutral-200">
              <Share2 className="h-4 w-4 text-neutral-600" />
              <span className="text-sm text-neutral-700">Share</span>
            </button>
          </div>
          <a
            href={url}
            target="_blank"
            rel="nofollow ugc noopener noreferrer"
            className="flex cursor-pointer items-center space-x-2 rounded-lg bg-neutral-900 px-6 py-2 text-sm text-white hover:bg-neutral-800"
          >
            <ExternalLink className="h-4 w-4" />
            <span>Visit Site</span>
          </a>
        </div>
      </div>
    </section>
  );
}
