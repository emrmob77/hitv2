import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { SupabaseClient } from "@supabase/supabase-js";
import { FolderIcon, EyeIcon, LockIcon, EditIcon, UsersIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteCollectionButton } from "@/components/collections/delete-collection-button";
import {
  SortableCollectionBookmarkList,
  type CollectionBookmarkItem,
} from "@/components/collections/sortable-collection-bookmark-list";
import { CollectionFollowButton } from "@/components/collections/collection-follow-button";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

interface CollectionDetail {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
  privacy_level: "public" | "private" | "subscribers";
  is_collaborative: boolean;
  bookmark_count: number | null;
  follower_count: number | null;
  like_count: number | null;
  view_count: number | null;
  created_at: string | null;
  updated_at: string | null;
  role: ViewerRole;
  permissions: RolePermissions;
  isFollowing: boolean;
}

type ViewerRole = "owner" | "editor" | "contributor" | "viewer";

interface RolePermissions {
  canEditMetadata: boolean;
  canManageCollaborators: boolean;
  canReorder: boolean;
  canRemove: boolean;
  canAddBookmarks: boolean;
}

const ROLE_PERMISSIONS: Record<ViewerRole, RolePermissions> = {
  owner: {
    canEditMetadata: true,
    canManageCollaborators: true,
    canReorder: true,
    canRemove: true,
    canAddBookmarks: true,
  },
  editor: {
    canEditMetadata: true,
    canManageCollaborators: false,
    canReorder: true,
    canRemove: true,
    canAddBookmarks: true,
  },
  contributor: {
    canEditMetadata: false,
    canManageCollaborators: false,
    canReorder: false,
    canRemove: false,
    canAddBookmarks: true,
  },
  viewer: {
    canEditMetadata: false,
    canManageCollaborators: false,
    canReorder: false,
    canRemove: false,
    canAddBookmarks: false,
  },
};

const FOLLOWERS_TABLE_MISSING_FRAGMENT = "collection_followers";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ collectionId: string }>;
}): Promise<Metadata> {
  const { collectionId } = await params;
  const collection = await fetchCollection(collectionId, { viewerId: null });

  if (!collection) {
    return { title: "Collection Not Found" };
  }

  return {
    title: `${collection.name} • HitTags`,
    description: collection.description ?? undefined,
  };
}

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ collectionId: string }>;
}) {
  const { collectionId } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const collection = await fetchCollection(collectionId, {
    supabase,
    viewerId: user.id,
  });

  if (!collection) {
    notFound();
  }

  const bookmarks = await fetchCollectionBookmarks(collectionId);

  await trackCollectionView(supabase, collectionId, user.id);

  const viewCount = (collection.view_count ?? 0) + 1;
  const followerCount = collection.follower_count ?? 0;

  return (
    <div className="space-y-8">
      <header className="mx-auto w-full max-w-5xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <FolderIcon className="h-6 w-6 text-neutral-600" />
              <h1 className="text-3xl font-semibold text-neutral-900">{collection.name}</h1>
              <span className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700">
                <UsersIcon className="h-4 w-4" />
                {collection.role.charAt(0).toUpperCase() + collection.role.slice(1)}
              </span>
              {collection.privacy_level === "public" ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                  <EyeIcon className="h-3 w-3" />
                  Public
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-700">
                  <LockIcon className="h-3 w-3" />
                  {collection.privacy_level === "private" ? "Private" : "Subscribers"}
                </span>
              )}
            </div>
            {collection.description && (
              <p className="text-sm text-neutral-600">{collection.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500">
              <span>{collection.bookmark_count ?? 0} bookmarks</span>
              <span>•</span>
              <span>{viewCount} views</span>
              <span>•</span>
              <span>{followerCount} followers</span>
              <span>•</span>
              <span>
                Created{" "}
                {collection.created_at ? new Date(collection.created_at).toLocaleDateString() : "—"}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {collection.role !== "owner" && collection.privacy_level === "public" && (
              <CollectionFollowButton
                collectionId={collection.id}
                initialFollowerCount={followerCount}
                initialIsFollowing={collection.isFollowing}
              />
            )}
            {collection.permissions.canEditMetadata && (
              <Button asChild variant="outline" size="sm">
                <Link href={`/dashboard/collections/${collectionId}/edit`}>
                  <EditIcon className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </Button>
            )}
            {collection.permissions.canManageCollaborators && (
              <DeleteCollectionButton
                collectionId={collection.id}
                collectionName={collection.name}
              />
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-5xl">
        <Card>
          <CardHeader>
            <CardTitle>Bookmarks in this collection</CardTitle>
          </CardHeader>
          <CardContent>
            <SortableCollectionBookmarkList
              collectionId={collection.id}
              items={bookmarks}
              canReorder={collection.permissions.canReorder}
              canRemove={collection.permissions.canRemove}
            />
            {!collection.permissions.canReorder && collection.permissions.canAddBookmarks && (
              <p className="mt-4 text-xs text-neutral-500">
                You can contribute new bookmarks to this collection. Reordering is reserved for
                editors and owners.
              </p>
            )}
            {!collection.permissions.canAddBookmarks && (
              <p className="mt-4 text-xs text-neutral-500">
                You have read-only access to this collection.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

async function fetchCollection(
  collectionId: string,
  options: {
    supabase?: SupabaseClient<Database>;
    viewerId?: string | null;
  } = {}
): Promise<CollectionDetail | null> {
  const supabase = options.supabase ?? (await createSupabaseServerClient());

  if (!supabase) {
    return null;
  }

  let viewerId = options.viewerId ?? null;

  if (viewerId === undefined) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    viewerId = user?.id ?? null;
  }

  const { data: collection, error } = await supabase
    .from("collections")
    .select("*")
    .eq("id", collectionId)
    .maybeSingle();

  if (error || !collection) {
    return null;
  }

  let role: ViewerRole = "viewer";

  if (viewerId && collection.user_id === viewerId) {
    role = "owner";
  } else if (viewerId) {
    const { data: collaborator } = await supabase
      .from("collection_collaborators")
      .select("role")
      .eq("collection_id", collectionId)
      .eq("user_id", viewerId)
      .maybeSingle();

    if (collaborator?.role && ROLE_PERMISSIONS[collaborator.role as ViewerRole]) {
      role = collaborator.role as ViewerRole;
    }
  }

  if (collection.privacy_level !== "public" && role === "viewer") {
    return null;
  }

  const permissions = ROLE_PERMISSIONS[role] ?? ROLE_PERMISSIONS.viewer;

  let isFollowing = false;

  if (viewerId) {
    try {
      const { data: followRecord } = await supabase
        .from("collection_followers")
        .select("id")
        .eq("collection_id", collectionId)
        .eq("user_id", viewerId)
        .maybeSingle();

      isFollowing = Boolean(followRecord);
    } catch (err) {
      const message = err instanceof Error ? err.message.toLowerCase() : "";
      if (!message.includes(FOLLOWERS_TABLE_MISSING_FRAGMENT)) {
        console.error("Failed to check collection follow state:", err);
      }
    }
  }

  return {
    ...collection,
    role,
    permissions,
    isFollowing,
  };
}

async function fetchCollectionBookmarks(collectionId: string): Promise<CollectionBookmarkItem[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("collection_bookmarks")
    .select(
      `
      id,
      position,
      created_at,
      bookmarks (
        id,
        title,
        description,
        url,
        domain,
        favicon_url,
        image_url,
        created_at
      )
    `
    )
    .eq("collection_id", collectionId)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Collection bookmarks fetch error:", error);
    return [];
  }

  if (!data) {
    return [];
  }

  return data
    .filter((item) => Boolean(item.bookmarks))
    .map((item, index) => ({
      id: item.id,
      position: item.position ?? index,
      bookmark: {
        id: item.bookmarks.id,
        title: item.bookmarks.title,
        description: item.bookmarks.description,
        url: item.bookmarks.url,
        domain: item.bookmarks.domain,
        favicon_url: item.bookmarks.favicon_url,
        image_url: item.bookmarks.image_url,
        created_at: item.bookmarks.created_at,
      },
    }))
    .sort((a, b) => a.position - b.position);
}

async function trackCollectionView(
  supabase: SupabaseClient<Database>,
  collectionId: string,
  viewerId: string | null
) {
  try {
    await supabase.rpc("increment_collection_view", { p_collection_id: collectionId });
  } catch (error) {
    console.error("Failed to increment collection view count:", error);
  }

  try {
    await supabase.from("page_views").insert({
      viewable_type: "collection",
      viewable_id: collectionId,
      viewer_id: viewerId,
    });
  } catch (error) {
    console.error("Failed to log collection page view:", error);
  }
}
