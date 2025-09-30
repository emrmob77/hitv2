"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  likes: number;
  isLiked: boolean;
  author: {
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
  isAuthor?: boolean;
  replies?: Comment[];
}

interface BookmarkCommentsProps {
  comments: Comment[];
  totalComments: number;
  currentUser?: {
    username: string;
    avatarUrl: string | null;
  };
}

export function BookmarkComments({
  comments: initialComments,
  totalComments,
  currentUser,
}: BookmarkCommentsProps) {
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState("");

  const handleLikeComment = (commentId: string) => {
    setComments((prev) =>
      prev.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              isLiked: !comment.isLiked,
              likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
            }
          : comment
      )
    );
  };

  const handlePostComment = () => {
    if (!newComment.trim() || !currentUser) return;

    // Here you would add API call to post comment
    setNewComment("");
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
    <section className="rounded-xl border border-neutral-200 bg-white p-8">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-xl font-semibold text-neutral-900">
          Comments ({totalComments})
        </h3>
        <button className="text-sm text-neutral-600 hover:text-neutral-800">
          Sort by newest
        </button>
      </div>

      {/* Add Comment */}
      {currentUser && (
        <div className="mb-6">
          <div className="flex items-start space-x-4">
            {currentUser.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.username}
                className="h-10 w-10 rounded-full"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-300">
                <span className="text-sm font-semibold text-neutral-600">
                  {currentUser.username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1">
              <textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full resize-none rounded-lg border border-neutral-300 p-4 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-neutral-500"
                rows={3}
              />
              <div className="mt-3 flex justify-end">
                <Button
                  onClick={handlePostComment}
                  disabled={!newComment.trim()}
                  className="rounded-lg bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-800"
                >
                  Post Comment
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id}>
            <div className="flex items-start space-x-4">
              {comment.author.avatarUrl ? (
                <img
                  src={comment.author.avatarUrl}
                  alt={comment.author.displayName || comment.author.username}
                  className="h-10 w-10 rounded-full"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-300">
                  <span className="text-sm font-semibold text-neutral-600">
                    {(comment.author.displayName || comment.author.username)
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1">
                <div className="rounded-lg bg-neutral-50 p-4">
                  <div className="mb-2 flex items-center space-x-2">
                    <Link
                      href={`/${comment.author.username}`}
                      className="text-sm font-medium text-neutral-900 hover:text-neutral-700"
                    >
                      {comment.author.displayName || comment.author.username}
                    </Link>
                    {comment.isAuthor && (
                      <span className="rounded bg-neutral-200 px-2 py-1 text-xs text-neutral-500">
                        Author
                      </span>
                    )}
                    <span className="text-xs text-neutral-500">
                      {timeAgo(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-700">{comment.content}</p>
                </div>
                <div className="ml-4 mt-2 flex items-center space-x-4">
                  <button
                    onClick={() => handleLikeComment(comment.id)}
                    className={`flex items-center text-xs ${
                      comment.isLiked
                        ? "text-red-600"
                        : "text-neutral-500 hover:text-neutral-700"
                    }`}
                  >
                    <Heart
                      className="mr-1 h-3 w-3"
                      fill={comment.isLiked ? "currentColor" : "none"}
                    />
                    Like ({comment.likes})
                  </button>
                  <button className="text-xs text-neutral-500 hover:text-neutral-700">
                    Reply
                  </button>
                </div>
              </div>
            </div>

            {/* Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="ml-14 mt-4 space-y-4">
                {comment.replies.map((reply) => (
                  <div key={reply.id} className="flex items-start space-x-4">
                    {reply.author.avatarUrl ? (
                      <img
                        src={reply.author.avatarUrl}
                        alt={reply.author.displayName || reply.author.username}
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-300">
                        <span className="text-xs font-semibold text-neutral-600">
                          {(reply.author.displayName || reply.author.username)
                            .charAt(0)
                            .toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="rounded-lg bg-neutral-50 p-4">
                        <div className="mb-2 flex items-center space-x-2">
                          <Link
                            href={`/${reply.author.username}`}
                            className="text-sm font-medium text-neutral-900 hover:text-neutral-700"
                          >
                            {reply.author.displayName || reply.author.username}
                          </Link>
                          {reply.isAuthor && (
                            <span className="rounded bg-neutral-200 px-2 py-1 text-xs text-neutral-500">
                              Author
                            </span>
                          )}
                          <span className="text-xs text-neutral-500">
                            {timeAgo(reply.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-700">
                          {reply.content}
                        </p>
                      </div>
                      <div className="ml-4 mt-2 flex items-center space-x-4">
                        <button
                          onClick={() => handleLikeComment(reply.id)}
                          className={`flex items-center text-xs ${
                            reply.isLiked
                              ? "text-red-600"
                              : "text-neutral-500 hover:text-neutral-700"
                          }`}
                        >
                          <Heart
                            className="mr-1 h-3 w-3"
                            fill={reply.isLiked ? "currentColor" : "none"}
                          />
                          Like ({reply.likes})
                        </button>
                        <button className="text-xs text-neutral-500 hover:text-neutral-700">
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {comments.length < totalComments && (
        <div className="mt-8 text-center">
          <button className="text-sm text-neutral-600 hover:text-neutral-800">
            Load more comments
          </button>
        </div>
      )}
    </section>
  );
}
