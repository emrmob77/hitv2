'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { LikeButton } from '@/components/social/like-button';
import { formatDistanceToNow } from 'date-fns';

interface CommentAuthor {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  updated_at: string | null;
  user_id: string;
  profiles: CommentAuthor;
  like_count: number;
  replies?: Comment[];
}

interface BookmarkCommentsProps {
  bookmarkId: string;
  bookmarkOwnerId: string;
  currentUser?: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
}

export function BookmarkComments({
  bookmarkId,
  bookmarkOwnerId,
  currentUser,
}: BookmarkCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchComments();
  }, [bookmarkId]);

  const fetchComments = async () => {
    try {
      const response = await fetch(
        `/api/comments?content_type=bookmark&content_id=${bookmarkId}`
      );
      const data = await response.json();

      if (response.ok) {
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim() || !currentUser || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content_type: 'bookmark',
          content_id: bookmarkId,
          content: newComment.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setComments([data.comment, ...comments]);
        setNewComment('');
        toast({
          title: 'Success',
          description: 'Comment posted successfully',
        });
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to post comment',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      toast({
        title: 'Error',
        description: 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePostReply = async (parentCommentId: string) => {
    if (!replyContent.trim() || !currentUser || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content_type: 'bookmark',
          content_id: bookmarkId,
          content: replyContent.trim(),
          parent_comment_id: parentCommentId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update comments with new reply
        setComments((prev) =>
          prev.map((comment) =>
            comment.id === parentCommentId
              ? {
                  ...comment,
                  replies: [...(comment.replies || []), data.comment],
                }
              : comment
          )
        );
        setReplyContent('');
        setReplyTo(null);
        toast({
          title: 'Success',
          description: 'Reply posted successfully',
        });
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to post reply',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error posting reply:', error);
      toast({
        title: 'Error',
        description: 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string, isReply = false) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        if (isReply) {
          // Remove reply from parent comment
          setComments((prev) =>
            prev.map((comment) => ({
              ...comment,
              replies: comment.replies?.filter((r) => r.id !== commentId) || [],
            }))
          );
        } else {
          // Remove top-level comment
          setComments((prev) => prev.filter((c) => c.id !== commentId));
        }
        toast({
          title: 'Success',
          description: 'Comment deleted successfully',
        });
      } else {
        const data = await response.json();
        toast({
          title: 'Error',
          description: data.error || 'Failed to delete comment',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: 'Error',
        description: 'Something went wrong',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <section className="rounded-xl border border-neutral-200 bg-white p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-32 rounded bg-neutral-200"></div>
          <div className="h-20 rounded bg-neutral-200"></div>
          <div className="h-20 rounded bg-neutral-200"></div>
        </div>
      </section>
    );
  }

  return (
    <section id="comments" className="rounded-xl border border-neutral-200 bg-white p-8">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-xl font-semibold text-neutral-900">
          Comments ({comments.length})
        </h3>
      </div>

      {/* Add Comment */}
      {currentUser ? (
        <div className="mb-6">
          <div className="flex items-start space-x-4">
            {currentUser.avatar_url ? (
              <img
                src={currentUser.avatar_url}
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
                maxLength={1000}
              />
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-neutral-500">
                  {newComment.length}/1000
                </span>
                <Button
                  onClick={handlePostComment}
                  disabled={!newComment.trim() || isSubmitting}
                  className="rounded-lg bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-800"
                >
                  {isSubmitting ? 'Posting...' : 'Post Comment'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6 rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-center">
          <p className="text-sm text-neutral-600">
            Please{' '}
            <Link href="/login" className="text-neutral-900 underline">
              log in
            </Link>{' '}
            to comment
          </p>
        </div>
      )}

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="py-8 text-center text-neutral-500">
          No comments yet. Be the first to comment!
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id}>
              <div className="flex items-start space-x-4">
                {comment.profiles.avatar_url ? (
                  <img
                    src={comment.profiles.avatar_url}
                    alt={
                      comment.profiles.display_name ||
                      comment.profiles.username
                    }
                    className="h-10 w-10 rounded-full"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-300">
                    <span className="text-sm font-semibold text-neutral-600">
                      {(
                        comment.profiles.display_name ||
                        comment.profiles.username
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <div className="rounded-lg bg-neutral-50 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/${comment.profiles.username}`}
                          className="text-sm font-medium text-neutral-900 hover:text-neutral-700"
                        >
                          {comment.profiles.display_name ||
                            comment.profiles.username}
                        </Link>
                        {comment.user_id === bookmarkOwnerId && (
                          <span className="rounded bg-neutral-200 px-2 py-1 text-xs text-neutral-500">
                            Author
                          </span>
                        )}
                        <span className="text-xs text-neutral-500">
                          {formatDistanceToNow(new Date(comment.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      {currentUser?.id === comment.user_id && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-xs text-red-600 hover:text-red-700"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-neutral-700">
                      {comment.content}
                    </p>
                  </div>
                  <div className="ml-4 mt-2 flex items-center space-x-4">
                    <LikeButton
                      contentType="comment"
                      contentId={comment.id}
                      initialLikeCount={comment.like_count}
                      size="sm"
                      showCount={true}
                    />
                    {currentUser && (
                      <button
                        onClick={() => setReplyTo(comment.id)}
                        className="text-xs text-neutral-500 hover:text-neutral-700"
                      >
                        Reply
                      </button>
                    )}
                  </div>

                  {/* Reply Form */}
                  {replyTo === comment.id && currentUser && (
                    <div className="ml-4 mt-4 flex items-start space-x-3">
                      {currentUser.avatar_url ? (
                        <img
                          src={currentUser.avatar_url}
                          alt={currentUser.username}
                          className="h-8 w-8 rounded-full"
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-300">
                          <span className="text-xs font-semibold text-neutral-600">
                            {currentUser.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="flex-1">
                        <textarea
                          placeholder="Write a reply..."
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          className="w-full resize-none rounded-lg border border-neutral-300 p-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-neutral-500"
                          rows={2}
                          maxLength={1000}
                        />
                        <div className="mt-2 flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setReplyTo(null);
                              setReplyContent('');
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handlePostReply(comment.id)}
                            disabled={!replyContent.trim() || isSubmitting}
                          >
                            {isSubmitting ? 'Posting...' : 'Reply'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="ml-14 mt-4 space-y-4">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="flex items-start space-x-4">
                      {reply.profiles.avatar_url ? (
                        <img
                          src={reply.profiles.avatar_url}
                          alt={
                            reply.profiles.display_name ||
                            reply.profiles.username
                          }
                          className="h-8 w-8 rounded-full"
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-300">
                          <span className="text-xs font-semibold text-neutral-600">
                            {(
                              reply.profiles.display_name ||
                              reply.profiles.username
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="rounded-lg bg-neutral-50 p-4">
                          <div className="mb-2 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Link
                                href={`/${reply.profiles.username}`}
                                className="text-sm font-medium text-neutral-900 hover:text-neutral-700"
                              >
                                {reply.profiles.display_name ||
                                  reply.profiles.username}
                              </Link>
                              {reply.user_id === bookmarkOwnerId && (
                                <span className="rounded bg-neutral-200 px-2 py-1 text-xs text-neutral-500">
                                  Author
                                </span>
                              )}
                              <span className="text-xs text-neutral-500">
                                {formatDistanceToNow(
                                  new Date(reply.created_at),
                                  {
                                    addSuffix: true,
                                  }
                                )}
                              </span>
                            </div>
                            {currentUser?.id === reply.user_id && (
                              <button
                                onClick={() => handleDeleteComment(reply.id, true)}
                                className="text-xs text-red-600 hover:text-red-700"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                          <p className="text-sm text-neutral-700">
                            {reply.content}
                          </p>
                        </div>
                        <div className="ml-4 mt-2">
                          <LikeButton
                            contentType="comment"
                            contentId={reply.id}
                            initialLikeCount={reply.like_count}
                            size="sm"
                            showCount={true}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
