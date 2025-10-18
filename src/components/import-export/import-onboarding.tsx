'use client';

import { useState, useEffect } from 'react';
import { Check, X, Globe, Lock, Users, Folder, Loader2, Eye, ArrowRight, ArrowLeft, Sparkles, ExternalLink, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ImportedBookmark {
  id: string;
  url: string;
  title: string;
  description: string;
  image_url?: string;
  favicon_url?: string;
  domain?: string;
  privacy_level: 'public' | 'private' | 'subscribers';
  tags: string[];
  tagInput: string;
  collectionSlug?: string;
  collectionName?: string;
  collectionInput: string;
  selected: boolean;
}

interface ImportOnboardingProps {
  open: boolean;
  bookmarkIds: string[];
  onComplete: () => void;
  onCancel: () => void;
}

function normaliseTagTokens(raw: string) {
  return raw
    .replace(/,/g, ' ')
    .split(/\s+/)
    .map(token => token.trim())
    .filter(Boolean)
    .map(token => token.replace(/^#+/, ''));
}

function formatTagsForInput(raw: string) {
  if (!raw) {
    return '';
  }

  const tokens = normaliseTagTokens(raw);
  const seen = new Set<string>();
  const formatted: string[] = [];

  for (const token of tokens) {
    const key = token.toLowerCase();
    if (!token || seen.has(key)) {
      continue;
    }
    seen.add(key);
    formatted.push(`#${token}`);
  }

  return formatted.join(' ');
}

function tokensFromInput(raw: string) {
  if (!raw) {
    return [];
  }

  const tokens = normaliseTagTokens(raw);
  const seen = new Set<string>();
  const values: string[] = [];

  for (const token of tokens) {
    const key = token.toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    values.push(token);
  }

  return values;
}

function tagsArrayToInput(tags: string[]) {
  if (!tags || tags.length === 0) {
    return '';
  }

  const seen = new Set<string>();
  const formatted: string[] = [];

  for (const tag of tags) {
    const token = tag.replace(/^#+/, '');
    const key = token.toLowerCase();
    if (!token || seen.has(key)) {
      continue;
    }
    seen.add(key);
    formatted.push(`#${token}`);
  }

  return formatted.join(' ');
}

function slugifyCollection(value: string) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

export function ImportOnboarding({
  open,
  bookmarkIds,
  onComplete,
  onCancel,
}: ImportOnboardingProps) {
  const [loading, setLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState<ImportedBookmark[]>([]);
  const [saving, setSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState<'review' | 'privacy' | 'complete'>('review');
  const [bulkPrivacy, setBulkPrivacy] = useState<'public' | 'private' | 'subscribers'>('public');
  const [fetchingMetadata, setFetchingMetadata] = useState(false);
  const [metadataProgress, setMetadataProgress] = useState({ current: 0, total: 0 });
  const [activeBookmarkId, setActiveBookmarkId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Fetch imported bookmarks
  useEffect(() => {
    if (open && bookmarkIds.length > 0) {
      fetchBookmarks();
    }
  }, [open, bookmarkIds]);

  const fetchBookmarks = async () => {
    setLoading(true);
    try {
      const bookmarkPromises = bookmarkIds.map(id =>
        fetch(`/api/bookmarks/${id}`).then(res => (res.ok ? res.json() : null))
      );

      const results = await Promise.allSettled(bookmarkPromises);
      const fetchedBookmarks = results
        .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled' && r.value)
        .map(r => r.value);

      const mapped = fetchedBookmarks.map((b: any) => {
        const rawTags = Array.isArray(b.bookmark_tags)
          ? b.bookmark_tags
              .map((entry: any) => entry?.tags?.slug || entry?.tags?.name || '')
              .filter(Boolean)
          : [];

        const tagInput = tagsArrayToInput(rawTags);
        const displayTags = tokensFromInput(tagInput).map(token => `#${token}`);

        const firstCollection = Array.isArray(b.collection_bookmarks)
          ? b.collection_bookmarks.find((entry: any) => entry?.collections)
          : null;

        const collectionSlug = firstCollection?.collections?.slug || '';
        const collectionName = firstCollection?.collections?.name || '';
        const collectionInput = collectionName || collectionSlug || '';

        return {
          id: b.id,
          url: b.url,
          title: b.title || b.url,
          description: b.description || '',
          image_url: b.image_url,
          favicon_url: b.favicon_url,
          domain: b.domain,
          privacy_level: b.privacy_level || 'public',
          tags: displayTags,
          tagInput,
          collectionSlug,
          collectionName,
          collectionInput,
          selected: true,
        } satisfies ImportedBookmark;
      });

      setBookmarks(mapped);
      setActiveBookmarkId(mapped[0]?.id ?? null);
    } catch (error) {
      console.error('Failed to fetch bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch metadata for bookmarks without images
  const fetchMissingMetadata = async () => {
    const bookmarksNeedingMetadata = bookmarks.filter(b => !b.image_url && b.selected);

    if (bookmarksNeedingMetadata.length === 0) {
      return;
    }

    setFetchingMetadata(true);
    setMetadataProgress({ current: 0, total: bookmarksNeedingMetadata.length });

    for (let i = 0; i < bookmarksNeedingMetadata.length; i++) {
      const bookmark = bookmarksNeedingMetadata[i];

      try {
        const response = await fetch('/api/metadata/fetch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: bookmark.url }),
        });

        if (response.ok) {
          const { metadata } = await response.json();

          // Update bookmark in state AND database immediately
          const updatedData = {
            image_url: metadata.image_url || bookmark.image_url,
            favicon_url: metadata.favicon_url || bookmark.favicon_url,
            description: metadata.description || bookmark.description,
            title: metadata.title || bookmark.title,
          };

          // Update state
          setBookmarks(prev =>
            prev.map(b =>
              b.id === bookmark.id ? { ...b, ...updatedData } : b
            )
          );

          // Update in database immediately
          await fetch(`/api/bookmarks/${bookmark.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData),
          });
        }
      } catch (error) {
        console.error(`Failed to fetch metadata for ${bookmark.url}:`, error);
      }

      setMetadataProgress({ current: i + 1, total: bookmarksNeedingMetadata.length });

      // Rate limiting
      if (i < bookmarksNeedingMetadata.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    setFetchingMetadata(false);
  };

  const updateBookmarkField = <K extends keyof ImportedBookmark>(
    id: string,
    key: K,
    value: ImportedBookmark[K]
  ) => {
    setBookmarks(prev => prev.map(b => (b.id === id ? { ...b, [key]: value } : b)));
  };

  const updateBookmarkTags = (id: string, value: string) => {
    const formatted = formatTagsForInput(value);
    const tokens = tokensFromInput(formatted);
    setBookmarks(prev =>
      prev.map(b =>
        b.id === id
          ? {
              ...b,
              tagInput: formatted,
              tags: tokens.map(token => `#${token}`),
            }
          : b
      )
    );
  };

  const updateCollectionInput = (id: string, value: string) => {
    setBookmarks(prev =>
      prev.map(b =>
        b.id === id
          ? {
              ...b,
              collectionInput: value,
              collectionSlug: value.trim() ? slugifyCollection(value) : undefined,
            }
          : b
      )
    );
  };

  const toggleBookmark = (id: string) => {
    setBookmarks(prev => {
      const updated = prev.map(b => (b.id === id ? { ...b, selected: !b.selected } : b));
      const toggled = updated.find(b => b.id === id);

      if (toggled?.selected) {
        setActiveBookmarkId(id);
      } else if (activeBookmarkId === id) {
        const nextSelected = updated.find(b => b.selected);
        setActiveBookmarkId(nextSelected?.id ?? null);
      }

      return updated;
    });
  };

  const toggleAll = () => {
    setBookmarks(prev => {
      const allSelected = prev.every(b => b.selected);
      const next = prev.map(b => ({ ...b, selected: !allSelected }));

      if (allSelected) {
        setActiveBookmarkId(null);
      } else {
        const firstSelected = next.find(b => b.selected);
        setActiveBookmarkId(firstSelected?.id ?? null);
      }

      return next;
    });
  };

  const applyBulkPrivacy = () => {
    setBookmarks(prev =>
      prev.map(b => (b.selected ? { ...b, privacy_level: bulkPrivacy } : b))
    );
  };

  const updatePrivacy = (id: string, privacy: 'public' | 'private' | 'subscribers') => {
    updateBookmarkField(id, 'privacy_level', privacy);
    if (activeBookmarkId === id) {
      setActiveBookmarkId(id);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);

    try {
      const updates = bookmarks
        .filter(b => b.selected)
        .map(b => ({
          id: b.id,
          title: b.title,
          description: b.description,
          privacyLevel: b.privacy_level,
          tags: b.tagInput,
          collectionSlug: b.collectionInput.trim()
            ? slugifyCollection(b.collectionInput)
            : '',
        }));

      const toDelete = bookmarks.filter(b => !b.selected).map(b => b.id);

      const response = await fetch('/api/import/bookmarks/bulk-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates, deleteIds: toDelete }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to update imported bookmarks');
      }

      setCurrentStep('complete');
    } catch (error) {
      console.error('Failed to save bookmarks:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const selectedCount = bookmarks.filter(b => b.selected).length;
  const activeBookmark =
    (activeBookmarkId && bookmarks.find(b => b.id === activeBookmarkId)) ||
    bookmarks.find(b => b.selected) ||
    bookmarks[0] ||
    null;

  useEffect(() => {
    if (!activeBookmarkId) {
      const firstSelected = bookmarks.find(b => b.selected);
      if (firstSelected) {
        setActiveBookmarkId(firstSelected.id);
      }
    }
  }, [activeBookmarkId, bookmarks]);

  const privacyConfig = {
    public: {
      icon: <Globe className="h-4 w-4" />,
      label: 'Public',
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200'
    },
    private: {
      icon: <Lock className="h-4 w-4" />,
      label: 'Private',
      color: 'text-neutral-600',
      bg: 'bg-neutral-50',
      border: 'border-neutral-200'
    },
    subscribers: {
      icon: <Users className="h-4 w-4" />,
      label: 'Subscribers',
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200'
    },
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="fixed inset-0 overflow-y-auto">
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="relative w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="relative bg-gradient-to-br from-primary via-primary to-primary/80 px-8 py-6 text-white">
              <button
                onClick={onCancel}
                className="absolute right-6 top-6 p-2 rounded-lg hover:bg-white/20 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Import Bookmarks</h2>
                  <p className="text-white/80 text-sm mt-0.5">Configure your imported bookmarks</p>
                </div>
              </div>

              {/* Progress Steps */}
              <div className="flex items-center gap-2">
                {['review', 'privacy', 'complete'].map((step, idx) => (
                  <div key={step} className="flex items-center flex-1">
                    <div className="flex items-center gap-2 flex-1">
                      <div className={`
                        h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all
                        ${currentStep === step ? 'bg-white text-primary' :
                          (idx < ['review', 'privacy', 'complete'].indexOf(currentStep) ? 'bg-white/40 text-white' : 'bg-white/20 text-white/60')}
                      `}>
                        {idx < ['review', 'privacy', 'complete'].indexOf(currentStep) ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          idx + 1
                        )}
                      </div>
                      <span className={`text-sm font-medium ${currentStep === step ? 'text-white' : 'text-white/60'}`}>
                        {step === 'review' ? 'Review' : step === 'privacy' ? 'Privacy' : 'Complete'}
                      </span>
                    </div>
                    {idx < 2 && (
                      <div className={`h-0.5 flex-1 mx-2 ${idx < ['review', 'privacy', 'complete'].indexOf(currentStep) ? 'bg-white/40' : 'bg-white/20'}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-24">
                  <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                  <p className="text-neutral-600">Loading your bookmarks...</p>
                </div>
              ) : currentStep === 'review' ? (
                <div className="space-y-8">
                  <div className="grid gap-4 sm:grid-cols-4">
                    <div className="rounded-2xl border border-blue-100 bg-blue-50/80 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                        Imported
                      </p>
                      <p className="mt-2 text-3xl font-bold text-blue-700">{bookmarks.length}</p>
                    </div>
                    <div className="rounded-2xl border border-green-100 bg-green-50/80 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
                        Selected
                      </p>
                      <p className="mt-2 text-3xl font-bold text-green-700">{selectedCount}</p>
                    </div>
                    <div className="rounded-2xl border border-amber-100 bg-amber-50/80 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                        Missing images
                      </p>
                      <p className="mt-2 text-3xl font-bold text-amber-700">
                        {bookmarks.filter(b => !b.image_url).length}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-purple-100 bg-purple-50/80 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-purple-700">
                        With tags
                      </p>
                      <p className="mt-2 text-3xl font-bold text-purple-700">
                        {bookmarks.filter(b => b.tags.length > 0).length}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-[minmax(0,4fr)_minmax(0,5fr)]">
                    <div className="space-y-4">
                      <div className="flex flex-col gap-3 rounded-2xl border bg-neutral-50 p-4 shadow-sm md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={bookmarks.every(b => b.selected)}
                            onChange={toggleAll}
                            className="h-5 w-5 cursor-pointer rounded border-neutral-300 text-primary"
                          />
                          <div>
                            <p className="text-sm font-semibold text-neutral-900">Select all</p>
                            <p className="text-xs text-neutral-500">
                              {selectedCount} of {bookmarks.length} selected
                            </p>
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          onClick={fetchMissingMetadata}
                          disabled={
                            fetchingMetadata ||
                            bookmarks.filter(b => !b.image_url && b.selected).length === 0
                          }
                          className="gap-2"
                        >
                          {fetchingMetadata ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Fetching {metadataProgress.current}/{metadataProgress.total}
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4" />
                              Fetch missing images
                            </>
                          )}
                        </Button>
                      </div>

                      <div className="max-h-[520px] space-y-2 overflow-y-auto rounded-2xl border bg-white p-2 shadow-inner">
                        {bookmarks.map(bookmark => {
                          const isActive = activeBookmark?.id === bookmark.id;

                          return (
                            <div
                              key={bookmark.id}
                              onClick={() => setActiveBookmarkId(bookmark.id)}
                              className={`group flex cursor-pointer gap-4 rounded-xl border-2 p-4 transition-all ${
                                isActive
                                  ? 'border-primary bg-primary/10 shadow-md'
                                  : bookmark.selected
                                  ? 'border-neutral-200 bg-white hover:border-primary/50 hover:shadow-sm'
                                  : 'border-dashed border-neutral-200 bg-neutral-50 hover:border-neutral-300'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={bookmark.selected}
                                onChange={() => toggleBookmark(bookmark.id)}
                                onClick={e => e.stopPropagation()}
                                className="mt-1 h-5 w-5 cursor-pointer rounded border-neutral-300 text-primary"
                              />

                              <div className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                                {bookmark.image_url ? (
                                  <img
                                    src={bookmark.image_url}
                                    alt=""
                                    className="h-full w-full object-cover"
                                  />
                                ) : bookmark.favicon_url ? (
                                  <div className="flex h-full w-full items-center justify-center">
                                    <img src={bookmark.favicon_url} alt="" className="h-10 w-10" />
                                  </div>
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center">
                                    <Globe className="h-6 w-6 text-neutral-400" />
                                  </div>
                                )}
                              </div>

                              <div className="min-w-0 flex-1 space-y-2">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0 space-y-1">
                                    <p className="line-clamp-1 text-sm font-semibold text-neutral-900">
                                      {bookmark.title}
                                    </p>
                                    <p className="line-clamp-1 text-xs text-neutral-500">
                                      {bookmark.domain || bookmark.url}
                                    </p>
                                  </div>
                                  <Badge
                                    className={`gap-1.5 ${privacyConfig[bookmark.privacy_level].bg} ${privacyConfig[bookmark.privacy_level].border} ${privacyConfig[bookmark.privacy_level].color} border`}
                                  >
                                    {privacyConfig[bookmark.privacy_level].icon}
                                    {privacyConfig[bookmark.privacy_level].label}
                                  </Badge>
                                </div>

                                <p className="line-clamp-2 text-xs text-neutral-600">
                                  {bookmark.description || 'No description yet'}
                                </p>

                                <div className="flex flex-wrap items-center gap-2">
                                  {bookmark.tags.map(tag => (
                                    <Badge key={`${bookmark.id}-${tag}`} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                  {bookmark.collectionInput && (
                                    <Badge variant="secondary" className="gap-1 text-xs">
                                      <Folder className="h-3 w-3" />
                                      {bookmark.collectionInput}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="rounded-2xl border bg-white p-6 shadow-lg">
                      {activeBookmark ? (
                        <div className="space-y-6">
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="space-y-1">
                              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                                Editing
                              </p>
                              <h3 className="text-xl font-semibold text-neutral-900">
                                {activeBookmark.title}
                              </h3>
                              <p className="text-sm text-neutral-500">
                                Refine details, tags, and privacy before publishing.
                              </p>
                            </div>
                            <Badge
                              className={`gap-1.5 ${privacyConfig[activeBookmark.privacy_level].bg} ${privacyConfig[activeBookmark.privacy_level].border} ${privacyConfig[activeBookmark.privacy_level].color} border`}
                            >
                              {privacyConfig[activeBookmark.privacy_level].icon}
                              {privacyConfig[activeBookmark.privacy_level].label}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-4 rounded-xl bg-neutral-50 p-4">
                            <div className="h-16 w-24 overflow-hidden rounded-lg bg-neutral-100">
                              {activeBookmark.image_url ? (
                                <img
                                  src={activeBookmark.image_url}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              ) : activeBookmark.favicon_url ? (
                                <div className="flex h-full w-full items-center justify-center">
                                  <img
                                    src={activeBookmark.favicon_url}
                                    alt=""
                                    className="h-10 w-10"
                                  />
                                </div>
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <Globe className="h-6 w-6 text-neutral-400" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 space-y-2">
                              <p className="text-sm font-medium text-neutral-900 line-clamp-1">
                                {activeBookmark.domain || activeBookmark.url}
                              </p>
                              <p className="text-xs text-neutral-500 line-clamp-1">
                                {activeBookmark.url}
                              </p>
                              <div className="flex flex-wrap gap-2 pt-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="gap-1"
                                  onClick={() => window.open(activeBookmark.url, '_blank')}
                                >
                                  <ExternalLink className="h-3.5 w-3.5" />
                                  Open original
                                </Button>
                                <Button
                                  variant={activeBookmark.selected ? 'outline' : 'secondary'}
                                  size="sm"
                                  className="gap-1"
                                  onClick={() => toggleBookmark(activeBookmark.id)}
                                >
                                  {activeBookmark.selected ? 'Remove from import' : 'Add back'}
                                </Button>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor={`title-${activeBookmark.id}`}>Title</Label>
                              <Input
                                id={`title-${activeBookmark.id}`}
                                value={activeBookmark.title}
                                onChange={e =>
                                  updateBookmarkField(activeBookmark.id, 'title', e.target.value)
                                }
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`description-${activeBookmark.id}`}>Description</Label>
                              <Textarea
                                id={`description-${activeBookmark.id}`}
                                value={activeBookmark.description}
                                onChange={e =>
                                  updateBookmarkField(
                                    activeBookmark.id,
                                    'description',
                                    e.target.value
                                  )
                                }
                                rows={4}
                                placeholder="Add a quick summary or note"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`tags-${activeBookmark.id}`}>Tags</Label>
                              <Input
                                id={`tags-${activeBookmark.id}`}
                                value={activeBookmark.tagInput}
                                onChange={e =>
                                  updateBookmarkTags(activeBookmark.id, e.target.value)
                                }
                                placeholder="#design #inspiration"
                              />
                              <p className="text-xs text-neutral-500">
                                Separate tags with spaces or commas. We&apos;ll create them when
                                needed.
                              </p>
                              {activeBookmark.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-1">
                                  {activeBookmark.tags.map(tag => (
                                    <Badge key={`${activeBookmark.id}-${tag}`} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`collection-${activeBookmark.id}`}>Collection</Label>
                              <Input
                                id={`collection-${activeBookmark.id}`}
                                value={activeBookmark.collectionInput}
                                onChange={e =>
                                  updateCollectionInput(activeBookmark.id, e.target.value)
                                }
                                placeholder="Inspiration"
                              />
                              <p className="text-xs text-neutral-500">
                                Type an existing collection name or create a new one on the fly.
                              </p>
                            </div>

                            <div className="space-y-2">
                              <Label>Privacy</Label>
                              <Select
                                value={activeBookmark.privacy_level}
                                onValueChange={(value: any) =>
                                  updatePrivacy(activeBookmark.id, value)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="public">
                                    <div className="flex items-center gap-2">
                                      <Globe className="h-4 w-4 text-green-600" />
                                      Public
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="private">
                                    <div className="flex items-center gap-2">
                                      <Lock className="h-4 w-4 text-neutral-600" />
                                      Private
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="subscribers">
                                    <div className="flex items-center gap-2">
                                      <Users className="h-4 w-4 text-amber-600" />
                                      Subscribers only
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-neutral-500">
                          <Sparkles className="h-8 w-8 text-primary" />
                          <p className="text-sm font-medium">Select a bookmark to start editing.</p>
                          <p className="text-xs text-neutral-500">
                            Choose items from the list to update their info and privacy.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : currentStep === 'privacy' ? (
                <div className="space-y-6">
                  <div className="rounded-2xl border border-blue-100 bg-blue-50/80 p-6 shadow-sm">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-blue-900">Bulk privacy update</h3>
                        <p className="text-sm text-blue-700">
                          Apply a privacy preset to all {selectedCount} selected bookmarks.
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                          Selected
                        </p>
                        <p className="text-3xl font-bold text-blue-700">{selectedCount}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
                      <Select value={bulkPrivacy} onValueChange={(v: any) => setBulkPrivacy(v)}>
                        <SelectTrigger className="w-full bg-white font-medium md:w-64">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4 text-green-600" />
                              Public
                            </div>
                          </SelectItem>
                          <SelectItem value="private">
                            <div className="flex items-center gap-2">
                              <Lock className="h-4 w-4 text-neutral-600" />
                              Private
                            </div>
                          </SelectItem>
                          <SelectItem value="subscribers">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-amber-600" />
                              Subscribers only
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={applyBulkPrivacy}
                        variant="secondary"
                        className="w-full md:w-auto"
                      >
                        Apply to selected
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-3 text-sm font-semibold text-neutral-700">
                      Fine tune per bookmark
                    </h3>
                    <div className="max-h-[450px] overflow-y-auto pr-2 space-y-2">
                      {bookmarks
                        .filter(b => b.selected)
                        .map(bookmark => (
                          <div
                            key={bookmark.id}
                            className="flex items-center justify-between gap-4 rounded-xl border bg-white p-4 shadow-sm"
                          >
                            <div className="min-w-0">
                              <p className="line-clamp-1 text-sm font-semibold text-neutral-900">
                                {bookmark.title}
                              </p>
                              <p className="line-clamp-1 text-xs text-neutral-500">
                                {bookmark.domain || bookmark.url}
                              </p>
                            </div>
                            <Select
                              value={bookmark.privacy_level}
                              onValueChange={(value: any) => updatePrivacy(bookmark.id, value)}
                            >
                              <SelectTrigger className="w-48">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="public">
                                  <div className="flex items-center gap-2">
                                    <Globe className="h-4 w-4 text-green-600" />
                                    Public
                                  </div>
                                </SelectItem>
                                <SelectItem value="private">
                                  <div className="flex items-center gap-2">
                                    <Lock className="h-4 w-4 text-neutral-600" />
                                    Private
                                  </div>
                                </SelectItem>
                                <SelectItem value="subscribers">
                                  <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-amber-600" />
                                    Subscribers only
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        ))}
                    </div>
                  </div>

                  {saveError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{saveError}</AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : (
                <div className="py-20 text-center">
                  <div className="relative inline-flex mb-6">
                    <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
                    <div className="relative h-24 w-24 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-xl">
                      <Check className="h-12 w-12 text-white stroke-[3]" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-neutral-900 mb-3">Import Complete!</h3>
                  <p className="text-neutral-600 text-lg mb-8">
                    Successfully saved <span className="font-bold text-green-600">{selectedCount}</span> bookmarks
                  </p>
                  <div className="grid grid-cols-3 gap-6 max-w-xl mx-auto">
                    <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-4 border border-primary/20">
                      <div className="text-3xl font-bold text-primary">{selectedCount}</div>
                      <div className="text-sm text-neutral-600 mt-1">Saved</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                      <div className="text-3xl font-bold text-green-600">
                        {bookmarks.filter(b => b.selected && b.image_url).length}
                      </div>
                      <div className="text-sm text-neutral-600 mt-1">With Images</div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                      <div className="text-3xl font-bold text-blue-600">
                        {bookmarks.filter(b => b.selected && b.tags.length > 0).length}
                      </div>
                      <div className="text-sm text-neutral-600 mt-1">Tagged</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-neutral-200 bg-neutral-50 px-8 py-5">
              <div className="flex items-center justify-between">
                {currentStep === 'review' && (
                  <>
                    <Button variant="outline" onClick={onCancel}>
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        setSaveError(null);
                        setCurrentStep('privacy');
                      }}
                      disabled={selectedCount === 0}
                      className="gap-2"
                    >
                      Next: Privacy Settings
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </>
                )}

                {currentStep === 'privacy' && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSaveError(null);
                        setCurrentStep('review');
                      }}
                      className="gap-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </Button>
                    <Button onClick={handleSave} disabled={saving} className="gap-2">
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          Save & Complete
                          <Check className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </>
                )}

                {currentStep === 'complete' && (
                  <Button onClick={onComplete} className="w-full gap-2">
                    Go to My Bookmarks
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
