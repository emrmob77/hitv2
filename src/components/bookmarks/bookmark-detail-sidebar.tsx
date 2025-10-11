"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Heart,
  Bookmark as BookmarkIcon,
  MessageCircle,
  Share2,
  Eye,
  Copy,
  Mail,
  Plus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface BookmarkStats {
  views: number;
  likes: number;
  saves: number;
  comments: number;
  shares: number;
}

interface CollectionPreview {
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
  ownerCollections?: CollectionPreview[];
  ownerUsername?: string | null;
  bookmarkId: string;
  currentUserId?: string;
  relatedBookmarks?: RelatedBookmark[];
  bookmarkTitle: string;
  bookmarkDescription?: string | null;
  pageUrl?: string;
  viewerCollections?: CollectionPreview[];
  viewerMembershipIds?: string[];
}

export function BookmarkDetailSidebar({
  stats,
  ownerCollections = [],
  ownerUsername,
  bookmarkId,
  currentUserId,
  relatedBookmarks = [],
  bookmarkTitle,
  bookmarkDescription,
  pageUrl,
  viewerCollections: initialViewerCollections,
  viewerMembershipIds = [],
}: BookmarkDetailSidebarProps) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const { toast } = useToast();
  const hasPrefetchedCollections = Array.isArray(initialViewerCollections);
  const [ownerCollectionList, setOwnerCollectionList] = useState<CollectionPreview[]>(ownerCollections);
  const [viewerCollections, setViewerCollections] = useState<CollectionPreview[]>(
    initialViewerCollections ?? []
  );
  const [collectionMembership, setCollectionMembership] = useState<Set<string>>(
    new Set(viewerMembershipIds)
  );
  const [collectionLoading, setCollectionLoading] = useState(
    !hasPrefetchedCollections && Boolean(currentUserId)
  );
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [shareCount, setShareCount] = useState(stats.shares);

  useEffect(() => {
    setOwnerCollectionList(ownerCollections);
  }, [ownerCollections]);

  useEffect(() => {
    setViewerCollections(initialViewerCollections ?? []);
  }, [initialViewerCollections]);

  useEffect(() => {
    setCollectionMembership(new Set(viewerMembershipIds));
  }, [viewerMembershipIds]);

  useEffect(() => {
    setShareCount(stats.shares);
  }, [stats.shares]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleShareEvent = (event: Event) => {
      const customEvent = event as CustomEvent<{ bookmarkId: string }>;
      if (customEvent.detail?.bookmarkId === bookmarkId) {
        setShareCount((prev) => prev + 1);
      }
    };

    window.addEventListener("bookmark-share", handleShareEvent);

    return () => {
      window.removeEventListener("bookmark-share", handleShareEvent);
    };
  }, [bookmarkId]);

  useEffect(() => {
    if (!currentUserId || hasPrefetchedCollections) {
      setCollectionLoading(false);
      return;
    }

    let isMounted = true;

    const loadCollections = async () => {
      setCollectionLoading(true);
      try {
        const { data: collectionsData, error } = await supabase
          .from("collections")
          .select("id, name, slug, bookmark_count")
          .eq("user_id", currentUserId)
          .order("updated_at", { ascending: false })
          .limit(5);

        if (error) {
          throw error;
        }

        if (!isMounted) return;

        const mappedCollections: CollectionPreview[] = (collectionsData || []).map(
          (collection) => ({
            id: collection.id,
            name: collection.name,
            slug: collection.slug,
            bookmarkCount: collection.bookmark_count ?? 0,
          })
        );

        setViewerCollections(mappedCollections);

        const collectionIds = mappedCollections.map((collection) => collection.id);

        if (collectionIds.length > 0) {
          const { data: membershipData, error: membershipError } = await supabase
            .from("collection_bookmarks")
            .select("collection_id")
            .eq("bookmark_id", bookmarkId)
            .in("collection_id", collectionIds);

          if (membershipError) {
            throw membershipError;
          }

          if (!isMounted) return;

          setCollectionMembership(
            new Set(membershipData?.map((membership) => membership.collection_id) || [])
          );
        } else {
          setCollectionMembership(new Set());
        }
      } catch (error) {
        console.error("Failed to load user collections:", error);
        if (isMounted) {
          toast({
            title: "Unable to load collections",
            description: "Please refresh the page and try again.",
            variant: "destructive",
          });
        }
      } finally {
        if (isMounted) {
          setCollectionLoading(false);
        }
      }
    };

    loadCollections();

    return () => {
      isMounted = false;
    };
  }, [bookmarkId, currentUserId, hasPrefetchedCollections, supabase, toast]);

  const toggleCollection = useCallback(
    async (collectionId: string) => {
      if (!currentUserId) {
        toast({
          title: "Authentication required",
          description: "Sign in to add this bookmark to your collections.",
          variant: "destructive",
        });
        return;
      }

      setActionLoading(collectionId);

      try {
        const isInCollection = collectionMembership.has(collectionId);

      if (isInCollection) {
        const { error } = await supabase
          .from("collection_bookmarks")
          .delete()
          .eq("collection_id", collectionId)
            .eq("bookmark_id", bookmarkId);

          if (error) {
            throw error;
          }

        setCollectionMembership((prev) => {
          const updated = new Set(prev);
          updated.delete(collectionId);
          return updated;
        });

        setViewerCollections((prev) =>
          prev.map((collection) =>
            collection.id === collectionId
              ? {
                  ...collection,
                  bookmarkCount: Math.max(0, (collection.bookmarkCount ?? 0) - 1),
                }
              : collection
          )
        );

        setOwnerCollectionList((prev) =>
          prev.map((collection) =>
            collection.id === collectionId
              ? {
                  ...collection,
                  bookmarkCount: Math.max(0, (collection.bookmarkCount ?? 0) - 1),
                }
              : collection
          )
        );
      } else {
        const { error } = await supabase.from("collection_bookmarks").insert({
          collection_id: collectionId,
          bookmark_id: bookmarkId,
        });

          if (error) {
            throw error;
          }

        setCollectionMembership((prev) => new Set(prev).add(collectionId));

        setViewerCollections((prev) =>
          prev.map((collection) =>
            collection.id === collectionId
              ? {
                  ...collection,
                  bookmarkCount: (collection.bookmarkCount ?? 0) + 1,
                }
              : collection
          )
        );

        setOwnerCollectionList((prev) =>
          prev.map((collection) =>
            collection.id === collectionId
              ? {
                  ...collection,
                  bookmarkCount: (collection.bookmarkCount ?? 0) + 1,
                }
              : collection
          )
        );
      }
      } catch (error) {
        console.error("Failed to update collection membership:", error);
        toast({
          title: "Could not update collection",
          description: "Please try again in a moment.",
          variant: "destructive",
        });
      } finally {
        setActionLoading(null);
      }
    },
    [bookmarkId, collectionMembership, currentUserId, supabase, toast]
  );

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      toast({
        title: "Link copied",
        description: "Bookmark link copied to clipboard.",
      });
    });
  }, [toast]);

  const resolvedShareUrl = useMemo(() => {
    if (pageUrl && pageUrl.startsWith("http")) {
      return pageUrl;
    }
    if (typeof window !== "undefined") {
      return window.location.href;
    }
    return "";
  }, [pageUrl]);

  const handleShareTarget = useCallback(
    (target: "twitter" | "linkedin" | "email") => {
      const encodedUrl = encodeURIComponent(resolvedShareUrl);
      const shareText =
        bookmarkTitle || "Check out this curated bookmark on HitTags";
      const encodedText = encodeURIComponent(shareText);
      const extra =
        bookmarkDescription && bookmarkDescription.trim().length > 0
          ? `${shareText} – ${bookmarkDescription}`
          : shareText;

      if (target === "twitter") {
        const twitterUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`;
        window.open(twitterUrl, "_blank", "noopener,noreferrer,width=600,height=600");
      } else if (target === "linkedin") {
        const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        window.open(linkedinUrl, "_blank", "noopener,noreferrer,width=600,height=600");
      } else if (target === "email") {
        const subject = encodeURIComponent(`Interesting bookmark: ${bookmarkTitle}`);
        const body = encodeURIComponent(`${extra}\n\n${resolvedShareUrl}`);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
      }
    },
    [bookmarkDescription, bookmarkTitle, resolvedShareUrl]
  );

  return (
    <aside className="space-y-6">
      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-neutral-900">Bookmark Stats</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="flex items-center text-sm text-neutral-600">
              <Eye className="mr-2 h-4 w-4" />
              Views
            </span>
            <span className="text-sm font-semibold text-neutral-900">{stats.views}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center text-sm text-neutral-600">
              <Heart className="mr-2 h-4 w-4" />
              Likes
            </span>
            <span className="text-sm font-semibold text-neutral-900">{stats.likes}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center text-sm text-neutral-600">
              <BookmarkIcon className="mr-2 h-4 w-4" />
              Saves
            </span>
            <span className="text-sm font-semibold text-neutral-900">{stats.saves}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center text-sm text-neutral-600">
              <MessageCircle className="mr-2 h-4 w-4" />
              Comments
            </span>
            <span className="text-sm font-semibold text-neutral-900">{stats.comments}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center text-sm text-neutral-600">
              <Share2 className="mr-2 h-4 w-4" />
              Shares
            </span>
            <span className="text-sm font-semibold text-neutral-900">{shareCount}</span>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <h3 className="mb-1 text-lg font-semibold text-neutral-900">Save to your collections</h3>
        <p className="mb-4 text-sm text-neutral-500">
          Quickly add this bookmark to one of your collections.
        </p>

        {!currentUserId ? (
          <div className="rounded-lg border border-dashed border-neutral-300 p-4 text-sm text-neutral-600">
            Sign in to save this bookmark to your collections.
          </div>
        ) : collectionLoading ? (
          <p className="text-sm text-neutral-500">Loading your collections…</p>
        ) : viewerCollections.length === 0 ? (
          <div className="rounded-lg border border-dashed border-neutral-300 p-4 text-sm text-neutral-600">
            You don&apos;t have any collections yet.
          </div>
        ) : (
          <div className="space-y-3">
            {viewerCollections.map((collection) => {
              const isSaving = actionLoading === collection.id;
              const isInCollection = collectionMembership.has(collection.id);

              return (
                <div
                  key={collection.id}
                  className="flex items-center justify-between rounded-lg bg-neutral-50 p-3"
                >
                  <div>
                    <div className="text-sm font-medium text-neutral-900">
                      {collection.name}
                    </div>
                    <div className="text-xs text-neutral-500">
                      {collection.bookmarkCount} bookmarks
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={isInCollection ? "secondary" : "outline"}
                    disabled={isSaving}
                    onClick={() => toggleCollection(collection.id)}
                  >
                    {isInCollection ? "Remove" : "Add"}
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        {currentUserId && (
          <Button
            variant="outline"
            className="mt-4 w-full rounded-lg border-neutral-300 py-2 text-sm text-neutral-600 hover:text-neutral-800"
            asChild
          >
            <Link href="/dashboard/collections/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Collection
            </Link>
          </Button>
        )}
      </div>

      {ownerCollectionList.length > 0 && ownerUsername && (
        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-neutral-900">
            Featured collections by @{ownerUsername}
          </h3>
          <div className="space-y-3">
            {ownerCollectionList.map((collection) => (
              <Link
                key={collection.id}
                href={`/c/${ownerUsername}/${collection.slug}`}
                className="block rounded-lg border border-transparent p-3 hover:border-neutral-200 hover:bg-neutral-50"
              >
                <div className="text-sm font-medium text-neutral-900">
                  {collection.name}
                </div>
                <div className="text-xs text-neutral-500">
                  {collection.bookmarkCount} bookmarks
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {ownerCollectionList.length > 0 && !ownerUsername && (
        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-neutral-900">
            Featured collections
          </h3>
          <div className="space-y-3">
            {ownerCollectionList.map((collection) => (
              <Link
                key={collection.id}
                href={`/collections/${collection.slug}`}
                className="block rounded-lg border border-transparent p-3 hover:border-neutral-200 hover:bg-neutral-50"
              >
                <div className="text-sm font-medium text-neutral-900">
                  {collection.name}
                </div>
                <div className="text-xs text-neutral-500">
                  {collection.bookmarkCount} bookmarks
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {relatedBookmarks.length > 0 && (
        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-neutral-900">Related Bookmarks</h3>
          <div className="space-y-4">
            {relatedBookmarks.map((bookmark) => (
              <Link
                key={bookmark.id}
                href={`/bookmark/${bookmark.id}/${bookmark.slug}`}
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
                  <h4 className="mb-1 text-sm font-medium text-neutral-900">{bookmark.title}</h4>
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

      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-neutral-900">Share Options</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleShareTarget("twitter")}
            className="flex items-center justify-center space-x-2 rounded-lg border border-neutral-300 p-3 hover:bg-neutral-50"
          >
            <span className="text-sm text-neutral-700">Twitter / X</span>
          </button>
          <button
            onClick={() => handleShareTarget("linkedin")}
            className="flex items-center justify-center space-x-2 rounded-lg border border-neutral-300 p-3 hover:bg-neutral-50"
          >
            <span className="text-sm text-neutral-700">LinkedIn</span>
          </button>
          <button
            onClick={handleCopyLink}
            className="flex items-center justify-center space-x-2 rounded-lg border border-neutral-300 p-3 hover:bg-neutral-50"
          >
            <Copy className="h-4 w-4 text-neutral-600" />
            <span className="text-sm text-neutral-700">Copy Link</span>
          </button>
          <button
            onClick={() => handleShareTarget("email")}
            className="flex items-center justify-center space-x-2 rounded-lg border border-neutral-300 p-3 hover:bg-neutral-50"
          >
            <Mail className="h-4 w-4 text-neutral-600" />
            <span className="text-sm text-neutral-700">Email</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
