"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

const PRIVACY_LEVELS = new Set(["public", "private", "subscribers"] as const);

type PrivacyLevel = "public" | "private" | "subscribers";

export type BookmarkMetadata = {
  title?: string;
  description?: string;
  imageUrl?: string;
  faviconUrl?: string;
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

async function extractMetadataFromUrl(targetUrl: string): Promise<BookmarkMetadata | null> {
  try {
    const response = await fetch(targetUrl, {
      headers: {
        "user-agent": "HitTagsBot/1.0 (+https://hittags.com)",
        accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
      next: { revalidate: 60 * 60 },
    });

    if (!response.ok) {
      return null;
    }

    const html = await response.text();

    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    const descriptionMatch = html.match(
      /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["'][^>]*>/i
    );
    const ogTitleMatch = html.match(
      /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']*)["'][^>]*>/i
    );
    const ogDescriptionMatch = html.match(
      /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)["'][^>]*>/i
    );
    const ogImageMatch = html.match(
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']*)["'][^>]*>/i
    );
    const iconMatch = html.match(
      /<link[^>]+rel=["'](?:shortcut )?icon["'][^>]+href=["']([^"']*)["'][^>]*>/i
    );

    const metadata: BookmarkMetadata = {};

    if (ogTitleMatch?.[1]) {
      metadata.title = ogTitleMatch[1];
    } else if (titleMatch?.[1]) {
      metadata.title = titleMatch[1];
    }

    if (ogDescriptionMatch?.[1]) {
      metadata.description = ogDescriptionMatch[1];
    } else if (descriptionMatch?.[1]) {
      metadata.description = descriptionMatch[1];
    }

    if (ogImageMatch?.[1]) {
      metadata.imageUrl = resolveUrl(targetUrl, ogImageMatch[1]);
    }

    if (iconMatch?.[1]) {
      metadata.faviconUrl = resolveUrl(targetUrl, iconMatch[1]);
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

  return { metadata };
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

  if (!url) {
    return {
      error: "Please provide a URL.",
      values: { url, title: titleInput, description: descriptionInput, privacy },
    };
  }

  try {
    new URL(url);
  } catch {
    return {
      error: "The URL format is not valid.",
      values: { url, title: titleInput, description: descriptionInput, privacy },
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
      },
    };
  }

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

  if (!id) {
    return { error: "Bookmark identifier is missing." };
  }

  if (!url) {
    return {
      error: "Please provide a URL.",
      values: { url, title: titleInput, description: descriptionInput, privacy },
    };
  }

  try {
    new URL(url);
  } catch {
    return {
      error: "The URL format is not valid.",
      values: { url, title: titleInput, description: descriptionInput, privacy },
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
      },
    };
  }

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
