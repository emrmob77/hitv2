"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { SupabaseClient } from "@supabase/supabase-js";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { siteConfig } from "@/config/site";

const PRIVACY_LEVELS = new Set(["public", "private", "subscribers"] as const);

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || siteConfig.url;

type PrivacyLevel = "public" | "private" | "subscribers";

export type BookmarkMetadata = {
  title?: string;
  description?: string;
  imageUrl?: string;
  faviconUrl?: string;
  sourceUrl?: string;
};

export type BookmarkFormState = {
  error?: string;
  metadata?: BookmarkMetadata;
  values?: {
    url?: string;
    title?: string;
    description?: string;
    privacy?: PrivacyLevel;
    imageUrl?: string;
    faviconUrl?: string;
    tags?: string;
    collection?: string;
    affiliateUrl?: string;
    commissionRate?: string;
  };
};

export type MetadataFormState = {
  error?: string;
  metadata?: BookmarkMetadata;
};

function sanitisePrivacyLevel(raw: unknown): PrivacyLevel {
  const value = typeof raw === "string" ? raw : "";
  if (PRIVACY_LEVELS.has(value as PrivacyLevel)) {
    return value as PrivacyLevel;
  }
  return "public";
}

function safeTrim(value: FormDataEntryValue | null): string {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim();
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200) || "bookmark";
}

type NormalizedTag = {
  name: string;
  slug: string;
};

function parseTags(raw: unknown): NormalizedTag[] {
  if (typeof raw !== "string") {
    return [];
  }

  const tokens = raw
    .replace(/,/g, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean)
    .map((token) => token.replace(/^#+/, ""));

  const unique = new Map<string, NormalizedTag>();

  for (const token of tokens) {
    const slug = slugify(token);
    if (!slug || unique.has(slug)) {
      continue;
    }

    unique.set(slug, {
      name: token,
      slug,
    });
  }

  return Array.from(unique.values());
}

async function syncBookmarkTags(
  supabase: SupabaseClient<any, any, any>,
  bookmarkId: string,
  tags: NormalizedTag[]
) {
  const { data: existingRelations } = await supabase
    .from("bookmark_tags")
    .select("tag_id, tags(id, usage_count)")
    .eq("bookmark_id", bookmarkId);

  if (existingRelations && existingRelations.length > 0) {
    const { error: deleteError } = await supabase
      .from("bookmark_tags")
      .delete()
      .eq("bookmark_id", bookmarkId);

    if (deleteError) {
      console.error("Failed to remove existing bookmark tags", deleteError.message);
    }

    for (const relation of existingRelations) {
      const currentUsage = relation.tags?.usage_count ?? 1;
      const { error: decrementError } = await supabase
        .from("tags")
        .update({ usage_count: Math.max(currentUsage - 1, 0) })
        .eq("id", relation.tag_id);

      if (decrementError) {
        console.error("Failed to decrement tag usage", decrementError.message);
      }
    }
  }

  if (tags.length === 0) {
    return;
  }

  for (const tag of tags) {
    let tagId: string | undefined;

    const { data: existingTag } = await supabase
      .from("tags")
      .select("id, usage_count")
      .eq("slug", tag.slug)
      .single();

    if (existingTag?.id) {
      tagId = existingTag.id;
      const currentUsage = existingTag.usage_count ?? 0;
      const { error: incrementExistingError } = await supabase
        .from("tags")
        .update({ usage_count: currentUsage + 1, name: tag.name })
        .eq("id", tagId);

      if (incrementExistingError) {
        console.error("Failed to update tag usage", incrementExistingError.message);
      }
    } else {
      const { data: insertedTag, error: insertError } = await supabase
        .from("tags")
        .insert({
          name: tag.name,
          slug: tag.slug,
          usage_count: 1,
        })
        .select("id")
        .single();

      if (insertError) {
        console.error("Failed to insert tag", insertError.message);
        continue;
      }

      tagId = insertedTag?.id;
    }

    if (!tagId) {
      continue;
    }

    const { error: linkError } = await supabase
      .from("bookmark_tags")
      .insert({
        bookmark_id: bookmarkId,
        tag_id: tagId,
      });

    if (linkError) {
      console.error("Failed to link tag", linkError.message);
    }
  }
}

async function syncBookmarkCollection(
  supabase: SupabaseClient<any, any, any>,
  bookmarkId: string,
  userId: string,
  collectionSlug: string | null
) {
  const normalizedSlug = collectionSlug?.trim().toLowerCase() || '';

  const { data: existingLinks } = await supabase
    .from('collection_bookmarks')
    .select(
      `collection_id,
       collections!inner(
         id,
         user_id,
         slug,
         bookmark_count
       )`
    )
    .eq('bookmark_id', bookmarkId);

  const existingCollections = (existingLinks ?? []).map((link) => ({
    id: link.collection_id,
    slug: link.collections?.slug ?? null,
    userId: link.collections?.user_id ?? null,
    bookmarkCount: link.collections?.bookmark_count ?? 0,
  }));

  const existingIds = existingCollections
    .filter((collection) => Boolean(collection.id))
    .map((collection) => collection.id as string);

  let targetCollection: { id: string; bookmark_count: number } | null = null;

  if (normalizedSlug) {
    const { data: collection } = await supabase
      .from('collections')
      .select('id, bookmark_count, user_id, slug')
      .eq('user_id', userId)
      .eq('slug', normalizedSlug)
      .maybeSingle();

    if (collection?.id) {
      targetCollection = {
        id: collection.id,
        bookmark_count: collection.bookmark_count ?? 0,
      };
    }
  }

  const targetId = targetCollection?.id ?? null;
  const alreadyLinked = targetId && existingIds.length === 1 && existingIds[0] === targetId;

  if (alreadyLinked) {
    return;
  }

  if (existingIds.length > 0) {
    const { error: deleteError } = await supabase
      .from('collection_bookmarks')
      .delete()
      .eq('bookmark_id', bookmarkId);

    if (deleteError) {
      console.error('Failed to remove existing bookmark collections', deleteError.message);
    }

    for (const existing of existingCollections) {
      if (!existing.id) continue;

      const nextCount = Math.max((existing.bookmarkCount ?? 1) - 1, 0);
      const { error: decrementError } = await supabase
        .from('collections')
        .update({ bookmark_count: nextCount })
        .eq('id', existing.id);

      if (decrementError) {
        console.error('Failed to decrement collection count', decrementError.message);
      }
    }
  }

  if (targetCollection) {
    const { error: linkError } = await supabase
      .from('collection_bookmarks')
      .insert({
        bookmark_id: bookmarkId,
        collection_id: targetCollection.id,
      });

    if (linkError) {
      console.error('Failed to link bookmark to collection', linkError.message);
    }

    const { error: incrementError } = await supabase
      .from('collections')
      .update({ bookmark_count: targetCollection.bookmark_count + 1 })
      .eq('id', targetCollection.id);

    if (incrementError) {
      console.error('Failed to increment collection count', incrementError.message);
    }
  }
}

async function extractMetadataFromUrl(targetUrl: string): Promise<BookmarkMetadata | null> {
  try {
    const response = await fetch(targetUrl, {
      headers: {
        "user-agent": "Mozilla/5.0 (compatible; HitTagsBot/1.0; +https://hittags.com)",
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "accept-language": "en-US,en;q=0.9",
        "cache-control": "no-cache",
      },
      redirect: "follow",
      next: { revalidate: 60 * 60 },
    });

    if (!response.ok) {
      return null;
    }

    const html = await response.text();

    // Helper function to extract meta content
    const getMeta = (pattern: RegExp): string | null => {
      const match = html.match(pattern);
      return match?.[1] || null;
    };

    // Extract all possible meta tags
    const ogTitle = getMeta(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']*)["'][^>]*>/i) ||
                    getMeta(/<meta[^>]+content=["']([^"']*)["'][^>]+property=["']og:title["'][^>]*>/i);

    const ogDescription = getMeta(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)["'][^>]*>/i) ||
                          getMeta(/<meta[^>]+content=["']([^"']*)["'][^>]+property=["']og:description["'][^>]*>/i);

    const ogImage = getMeta(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']*)["'][^>]*>/i) ||
                    getMeta(/<meta[^>]+content=["']([^"']*)["'][^>]+property=["']og:image["'][^>]*>/i) ||
                    getMeta(/<meta[^>]+property=["']og:image:url["'][^>]+content=["']([^"']*)["'][^>]*>/i) ||
                    getMeta(/<meta[^>]+property=["']og:image:secure_url["'][^>]+content=["']([^"']*)["'][^>]*>/i);

    const twitterImage = getMeta(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']*)["'][^>]*>/i) ||
                         getMeta(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']twitter:image["'][^>]*>/i);

    const title = getMeta(/<title[^>]*>([^<]*)<\/title>/i);

    const description = getMeta(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["'][^>]*>/i) ||
                        getMeta(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["'][^>]*>/i);

    const icon = getMeta(/<link[^>]+rel=["'](?:shortcut\s+)?icon(?:\s+icon)?["'][^>]+href=["']([^"']+)["'][^>]*>/i) ||
                 getMeta(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["'](?:shortcut\s+)?icon(?:\s+icon)?["'][^>]*>/i);

    const metadata: BookmarkMetadata = {};

    // Title priority: og:title > title tag
    if (ogTitle) {
      metadata.title = ogTitle.trim();
    } else if (title) {
      metadata.title = title.trim();
    }

    // Description priority: og:description > meta description
    if (ogDescription) {
      metadata.description = ogDescription.trim();
    } else if (description) {
      metadata.description = description.trim();
    }

    // Image priority: og:image > twitter:image
    const imageUrl = ogImage || twitterImage;
    if (imageUrl) {
      const resolved = resolveUrl(targetUrl, imageUrl.trim());
      // Validate image URL
      if (resolved.startsWith('http://') || resolved.startsWith('https://')) {
        metadata.imageUrl = resolved;
      }
    }

    // Favicon
    if (icon) {
      metadata.faviconUrl = resolveUrl(targetUrl, icon.trim());
    } else {
      // Try common favicon paths
      const faviconFallbacks = [
        '/favicon.ico',
        '/favicon.png',
        '/apple-touch-icon.png',
        '/favicon-32x32.png',
        '/favicon-16x16.png',
      ];

      for (const path of faviconFallbacks) {
        const resolved = resolveUrl(targetUrl, path);
        try {
          const faviconResponse = await fetch(resolved, {
            method: 'HEAD',
            headers: {
              'user-agent': 'Mozilla/5.0 (compatible; HitTagsBot/1.0)',
            },
            signal: AbortSignal.timeout(3000), // 3 second timeout
          });
          if (faviconResponse.ok) {
            metadata.faviconUrl = resolved;
            break;
          }
        } catch {
          // Silently continue to next fallback
        }
      }
    }

    return metadata;
  } catch (error) {
    console.warn("Failed to fetch URL metadata", error);
    return null;
  }
}

function resolveUrl(baseUrl: string, resource: string): string {
  try {
    return new URL(resource, baseUrl).toString();
  } catch {
    return resource;
  }
}

async function requireUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Session not found. Please sign in again.");
  }

  return { supabase, user } as const;
}

export async function fetchBookmarkMetadataAction(
  _prevState: MetadataFormState,
  formData: FormData
): Promise<MetadataFormState> {
  const url = safeTrim(formData.get("url"));

  if (!url) {
    return { error: "Enter a valid URL to fetch metadata." };
  }

  try {
    new URL(url);
  } catch {
    return { error: "The URL format is not valid." };
  }

  const metadata = await extractMetadataFromUrl(url);

  if (!metadata) {
    return { error: "Metadata could not be retrieved. Please fill the fields manually." };
  }

  return { metadata: { ...metadata, sourceUrl: url } };
}

export async function createBookmarkAction(
  _prevState: BookmarkFormState,
  formData: FormData
): Promise<BookmarkFormState> {
  const url = safeTrim(formData.get("url"));
  const titleInput = safeTrim(formData.get("title"));
  const descriptionInput = safeTrim(formData.get("description"));
  const privacy = sanitisePrivacyLevel(formData.get("privacy"));
  const imageUrlInput = safeTrim(formData.get("imageUrl"));
  const faviconUrlInput = safeTrim(formData.get("faviconUrl"));
  const collectionInput = safeTrim(formData.get("collection"));
  const affiliateUrl = safeTrim(formData.get("affiliateUrl"));
  const commissionRate = safeTrim(formData.get("commissionRate"));
  const tagsInput = safeTrim(formData.get("tags"));
  const parsedTags = parseTags(tagsInput);

  if (!url) {
    return {
      error: "Please provide a URL.",
      values: {
        url,
        title: titleInput,
        description: descriptionInput,
        privacy,
        imageUrl: imageUrlInput,
        faviconUrl: faviconUrlInput,
        tags: tagsInput,
        collection: collectionInput,
        affiliateUrl,
        commissionRate,
      },
    };
  }

  try {
    new URL(url);
  } catch {
    return {
      error: "The URL format is not valid.",
      values: {
        url,
        title: titleInput,
        description: descriptionInput,
        privacy,
        imageUrl: imageUrlInput,
        faviconUrl: faviconUrlInput,
        tags: tagsInput,
        affiliateUrl,
        commissionRate,
      },
    };
  }

  const { supabase, user } = await requireUser();

  const metadata =
    titleInput && descriptionInput && imageUrlInput && faviconUrlInput
      ? null
      : await extractMetadataFromUrl(url);

  const title = titleInput || metadata?.title || url;
  const description = descriptionInput || metadata?.description || null;
  const imageUrl = imageUrlInput || metadata?.imageUrl || null;
  const faviconUrl = faviconUrlInput || metadata?.faviconUrl || null;

  const domain = (() => {
    try {
      return new URL(url).hostname.replace(/^www\./, "");
    } catch {
      return null;
    }
  })();

  const slugSource = titleInput || metadata?.title || domain || url;
  const slug = slugify(slugSource);

  const { data, error } = await supabase
    .from("bookmarks")
    .insert({
      url,
      title,
      description,
      privacy_level: privacy,
      image_url: imageUrl,
      favicon_url: faviconUrl,
      domain,
      user_id: user.id,
      slug,
    })
    .select("id")
    .single();

  if (error) {
    return {
      error: error.message,
      values: {
        url,
        title,
        description: description ?? undefined,
        privacy,
        imageUrl: imageUrl ?? undefined,
        faviconUrl: faviconUrl ?? undefined,
        tags: tagsInput,
        collection: collectionInput,
        affiliateUrl,
        commissionRate,
      },
    };
  }

  // Create affiliate link if provided
  if (affiliateUrl && data.id) {
    const commissionRateNum = parseFloat(commissionRate) || 0;
    await supabase
      .from("affiliate_links")
      .insert({
        user_id: user.id,
        bookmark_id: data.id,
        original_url: url,
        affiliate_url: affiliateUrl,
        commission_rate: commissionRateNum,
      });
  }

  await syncBookmarkTags(supabase, data.id, parsedTags);
  await syncBookmarkCollection(supabase, data.id, user.id, collectionInput || null);

  revalidatePath("/dashboard/bookmarks");
  redirect(`/dashboard/bookmarks/${data.id}`);
}

export async function updateBookmarkAction(
  _prevState: BookmarkFormState,
  formData: FormData
): Promise<BookmarkFormState> {
  const id = safeTrim(formData.get("bookmarkId"));
  const url = safeTrim(formData.get("url"));
  const titleInput = safeTrim(formData.get("title"));
  const descriptionInput = safeTrim(formData.get("description"));
  const privacy = sanitisePrivacyLevel(formData.get("privacy"));
  const imageUrlInput = safeTrim(formData.get("imageUrl"));
  const faviconUrlInput = safeTrim(formData.get("faviconUrl"));
  const collectionInput = safeTrim(formData.get("collection"));
  const affiliateUrl = safeTrim(formData.get("affiliateUrl"));
  const commissionRate = safeTrim(formData.get("commissionRate"));
  const tagsInput = safeTrim(formData.get("tags"));
  const parsedTags = parseTags(tagsInput);

  if (!id) {
    return { error: "Bookmark identifier is missing." };
  }

  if (!url) {
    return {
      error: "Please provide a URL.",
      values: {
        url,
        title: titleInput,
        description: descriptionInput,
        privacy,
        imageUrl: imageUrlInput,
        faviconUrl: faviconUrlInput,
        tags: tagsInput,
        collection: collectionInput,
        affiliateUrl,
        commissionRate,
      },
    };
  }

  try {
    new URL(url);
  } catch {
    return {
      error: "The URL format is not valid.",
      values: {
        url,
        title: titleInput,
        description: descriptionInput,
        privacy,
        imageUrl: imageUrlInput,
        faviconUrl: faviconUrlInput,
        tags: tagsInput,
        affiliateUrl,
        commissionRate,
      },
    };
  }

  const { supabase, user } = await requireUser();

  const metadata =
    titleInput && descriptionInput && imageUrlInput && faviconUrlInput
      ? null
      : await extractMetadataFromUrl(url);

  const title = titleInput || metadata?.title || url;
  const description = descriptionInput || metadata?.description || null;
  const imageUrl = imageUrlInput || metadata?.imageUrl || null;
  const faviconUrl = faviconUrlInput || metadata?.faviconUrl || null;

  const domain = (() => {
    try {
      return new URL(url).hostname.replace(/^www\./, "");
    } catch {
      return null;
    }
  })();

  const slugSource = titleInput || metadata?.title || domain || url;
  const slug = slugify(slugSource);

  const { error } = await supabase
    .from("bookmarks")
    .update({
      url,
      title,
      description,
      privacy_level: privacy,
      image_url: imageUrl,
      favicon_url: faviconUrl,
      domain,
      slug,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return {
      error: error.message,
      values: {
        url,
        title,
        description: description ?? undefined,
        privacy,
        imageUrl: imageUrl ?? undefined,
        faviconUrl: faviconUrl ?? undefined,
        tags: tagsInput,
        collection: collectionInput,
        affiliateUrl,
        commissionRate,
      },
    };
  }

  // Update or create affiliate link if provided
  if (affiliateUrl) {
    const commissionRateNum = parseFloat(commissionRate) || 0;

    // Check if affiliate link exists
    const { data: existingAffiliate } = await supabase
      .from("affiliate_links")
      .select("id")
      .eq("bookmark_id", id)
      .eq("user_id", user.id)
      .single();

    if (existingAffiliate) {
      // Update existing affiliate link
      await supabase
        .from("affiliate_links")
        .update({
          original_url: url,
          affiliate_url: affiliateUrl,
          commission_rate: commissionRateNum,
        })
        .eq("id", existingAffiliate.id);
    } else {
      // Create new affiliate link
      await supabase
        .from("affiliate_links")
        .insert({
          user_id: user.id,
          bookmark_id: id,
          original_url: url,
          affiliate_url: affiliateUrl,
          commission_rate: commissionRateNum,
        });
    }
  } else {
    // Delete affiliate link if URL is removed
    await supabase
      .from("affiliate_links")
      .delete()
      .eq("bookmark_id", id)
      .eq("user_id", user.id);
  }

  await syncBookmarkTags(supabase, id, parsedTags);
  await syncBookmarkCollection(supabase, id, user.id, collectionInput || null);

  revalidatePath("/dashboard/bookmarks");
  revalidatePath(`/dashboard/bookmarks/${id}`);
  redirect(`/dashboard/bookmarks/${id}`);
}

export async function deleteBookmarkAction(formData: FormData): Promise<void> {
  const id = safeTrim(formData.get("bookmarkId"));

  if (!id) {
    return;
  }

  const redirectTo = safeTrim(formData.get("redirectTo")) || "/dashboard/bookmarks";

  const { supabase, user } = await requireUser();

  const { error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.warn("An error occurred while deleting the bookmark", error.message);
  }

  revalidatePath("/dashboard/bookmarks");
  if (!redirectTo.includes(`/dashboard/bookmarks/${id}`)) {
    revalidatePath(redirectTo);
  }
  redirect(redirectTo || "/dashboard/bookmarks");
}
