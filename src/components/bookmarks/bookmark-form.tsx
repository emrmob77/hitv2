'use client';

import { useActionState, useEffect, useMemo, useState } from 'react';
import {
  BookmarkPlus,
  ChevronRight,
  Copy,
  Folder,
  Lightbulb,
  Link as LinkIcon,
  Plus,
  Save,
  Share2,
  Sparkles,
  Tag as TagIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import type {
  BookmarkFormState,
  MetadataFormState,
} from '@/app/(app)/dashboard/bookmarks/actions';
import {
  createBookmarkAction,
  fetchBookmarkMetadataAction,
  updateBookmarkAction,
} from '@/app/(app)/dashboard/bookmarks/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type PrivacyLevel = 'public' | 'private' | 'subscribers';

type FormValues = {
  url: string;
  title: string;
  description: string;
  privacy: PrivacyLevel;
  imageUrl: string;
  faviconUrl: string;
  tags: string;
  collection: string;
};

type PrivacyOption = {
  value: PrivacyLevel;
  label: string;
  description: string;
};

type BaseBookmarkFormProps = {
  mode: 'create' | 'edit';
  initialValues?: Partial<FormValues>;
  bookmarkId?: string;
};

const privacyOptions: PrivacyOption[] = [
  {
    value: 'public',
    label: 'Public',
    description: 'Anyone can discover this bookmark on HitTags.',
  },
  {
    value: 'subscribers',
    label: 'Subscribers only',
    description: 'Visible to you and members of your premium feed.',
  },
  {
    value: 'private',
    label: 'Private',
    description: 'Only you can access this bookmark while signed in.',
  },
];

const suggestedTags = [
  { label: '#design', usage: '48k bookmarks' },
  { label: '#marketing', usage: '21k bookmarks' },
  { label: '#seo', usage: '18k bookmarks' },
  { label: '#inspiration', usage: '12k bookmarks' },
];

const emptyFormState: BookmarkFormState = {};
const emptyMetadataState: MetadataFormState = {};

function useFormValues(initialValues?: Partial<FormValues>) {
  const defaults: FormValues = useMemo(
    () => ({
      url: initialValues?.url ?? '',
      title: initialValues?.title ?? '',
      description: initialValues?.description ?? '',
      privacy: (initialValues?.privacy as PrivacyLevel) ?? 'public',
      imageUrl: initialValues?.imageUrl ?? '',
      faviconUrl: initialValues?.faviconUrl ?? '',
      tags: initialValues?.tags ?? '',
      collection: initialValues?.collection ?? '',
    }),
    [initialValues]
  );

  const [formValues, setFormValues] = useState<FormValues>(defaults);

  useEffect(() => {
    setFormValues(defaults);
  }, [defaults]);

  return { formValues, setFormValues };
}

function BaseBookmarkForm({ mode, initialValues, bookmarkId }: BaseBookmarkFormProps) {
  const { formValues, setFormValues } = useFormValues(initialValues);

  const [state, formAction, isSubmitting] = useActionState(
    mode === 'create' ? createBookmarkAction : updateBookmarkAction,
    emptyFormState
  );

  const [metadataState, metadataAction, isFetchingMetadata] = useActionState(
    fetchBookmarkMetadataAction,
    emptyMetadataState
  );

  const previewDomain = useMemo(() => deriveDomain(formValues.url), [formValues.url]);
  const metadataApplied = Boolean(metadataState?.metadata && !metadataState?.error);

  useEffect(() => {
    if (state?.values) {
      setFormValues((prev) => ({
        ...prev,
        url: state.values?.url ?? prev.url,
        title: state.values?.title ?? prev.title,
        description: state.values?.description ?? prev.description,
        privacy: (state.values?.privacy as PrivacyLevel) ?? prev.privacy,
        imageUrl: state.values?.imageUrl ?? prev.imageUrl,
        faviconUrl: state.values?.faviconUrl ?? prev.faviconUrl,
      }));
    }
  }, [setFormValues, state?.values]);

  useEffect(() => {
    if (metadataState?.metadata) {
      setFormValues((prev) => ({
        ...prev,
        title: prev.title || metadataState.metadata?.title || '',
        description: prev.description || metadataState.metadata?.description || '',
        imageUrl: prev.imageUrl || metadataState.metadata?.imageUrl || '',
        faviconUrl: prev.faviconUrl || metadataState.metadata?.faviconUrl || '',
      }));
    }
  }, [metadataState?.metadata, setFormValues]);

  async function handleMetadataFetch() {
    if (!formValues.url) {
      return;
    }

    const payload = new FormData();
    payload.set('url', formValues.url);
    await metadataAction(payload);
  }

  function updateValue<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setFormValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function handleSuggestedTag(tag: string) {
    setFormValues((prev) => {
      const tokens = prev.tags.split(/\s+/).filter(Boolean);
      if (tokens.includes(tag)) {
        return prev;
      }

      const next = prev.tags ? `${prev.tags} ${tag}` : tag;
      return {
        ...prev,
        tags: next.trim(),
      };
    });
  }

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1.6fr_1fr]">
      <section className="rounded-2xl border border-neutral-200 bg-white/95 p-6 shadow-sm">
        <form action={formAction} className="space-y-6" id="bookmark-composer">
          {bookmarkId ? <input type="hidden" name="bookmarkId" value={bookmarkId} /> : null}

          <div className="flex flex-col gap-4 border-b border-neutral-200 pb-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-neutral-900">
                {mode === 'create' ? 'Add new bookmark' : 'Update bookmark'}
              </h2>
              <p className="text-sm text-neutral-500">
                Paste a URL, pull metadata instantly, and organise it for your workspace.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" variant="outline" className="h-9 px-4 text-sm font-semibold">
                <Save className="mr-2 size-4" /> Save draft
              </Button>
              <Button type="submit" className="h-9 px-4 text-sm font-semibold" disabled={isSubmitting}>
                <Plus className="mr-2 size-4" />
                {mode === 'create' ? 'Add bookmark' : 'Save changes'}
              </Button>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <div className="lg:col-span-2">
              <label htmlFor="url" className="block text-sm font-medium text-neutral-700">
                Bookmark URL
              </label>
              <div className="relative mt-2 flex">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
                  <LinkIcon className="size-4" />
                </span>
                <Input
                  id="url"
                  name="url"
                  type="url"
                  placeholder="https://example.com/article"
                  required
                  value={formValues.url}
                  onChange={(event) => updateValue('url', event.target.value)}
                  className="h-10 flex-1 rounded-lg border-neutral-300 pl-11 text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="ml-2 h-10 rounded-lg border-neutral-300 px-4 text-sm font-semibold"
                  onClick={handleMetadataFetch}
                  disabled={!formValues.url || isFetchingMetadata}
                >
                  <Sparkles className="mr-2 size-4" />
                  {isFetchingMetadata ? 'Loading…' : 'Fetch metadata'}
                </Button>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-neutral-500">
                <span>We attempt to enrich the title, description, and artwork.</span>
                {metadataApplied ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-neutral-900/5 px-2 py-1 font-medium text-neutral-700">
                    <Sparkles className="size-3" /> Metadata fetched
                  </span>
                ) : null}
              </div>
              {metadataState?.error ? (
                <p className="mt-2 text-xs font-semibold text-red-600">{metadataState.error}</p>
              ) : null}
            </div>

            <div className="lg:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-neutral-700">
                Title
              </label>
              <Input
                id="title"
                name="title"
                placeholder="The title we’ll display across your collections"
                value={formValues.title}
                onChange={(event) => updateValue('title', event.target.value)}
                className="mt-2 h-10 rounded-lg border-neutral-300 text-sm"
              />
            </div>

            <div className="lg:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-neutral-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formValues.description}
                onChange={(event) => updateValue('description', event.target.value)}
                className="mt-2 w-full rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-3 text-sm text-neutral-800 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200"
                placeholder="Add context, takeaways, or highlights you want to remember"
              />
            </div>

            <div className="space-y-3">
              <label htmlFor="tags" className="block text-sm font-medium text-neutral-700">
                Tags
              </label>
              <div className="relative mt-2">
                <Input
                  id="tags"
                  name="tags"
                  placeholder="Add tags separated by spaces (e.g. #design #seo)"
                  value={formValues.tags}
                  onChange={(event) => updateValue('tags', event.target.value)}
                  className="h-10 rounded-lg border-neutral-300 pl-11 text-sm"
                />
                <TagIcon className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-neutral-500">Suggested tags</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {suggestedTags.map((tag) => (
                    <button
                      key={tag.label}
                      type="button"
                      onClick={() => handleSuggestedTag(tag.label)}
                      className="flex items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-left text-xs font-medium text-neutral-700 transition hover:border-neutral-300 hover:bg-white"
                    >
                      <span>{tag.label}</span>
                      <span className="text-[11px] font-normal text-neutral-400">{tag.usage}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="collection" className="block text-sm font-medium text-neutral-700">
                Collection
              </label>
              <select
                id="collection"
                name="collection"
                value={formValues.collection}
                onChange={(event) => updateValue('collection', event.target.value)}
                className="mt-2 h-10 w-full rounded-lg border border-neutral-300 bg-white px-4 text-sm focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200"
              >
                <option value="">Select a collection (optional)</option>
                <option value="design-resources">Design resources</option>
                <option value="development-tools">Development tools</option>
                <option value="inspiration">Inspiration</option>
                <option value="learning">Learning materials</option>
              </select>
              <button type="button" className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-neutral-600 transition hover:text-neutral-800">
                <Plus className="size-4" /> Create new collection
              </button>
            </div>

            <div>
              <span className="block text-sm font-medium text-neutral-700">Privacy settings</span>
              <div className="mt-3 space-y-3 rounded-xl border border-neutral-200 bg-neutral-50/60 p-3">
                {privacyOptions.map((option) => (
                  <label
                    key={option.value}
                    className="flex cursor-pointer items-start gap-3 rounded-lg border border-transparent px-3 py-2 transition hover:border-neutral-200 hover:bg-white"
                  >
                    <input
                      type="radio"
                      name="privacy"
                      value={option.value}
                      checked={formValues.privacy === option.value}
                      onChange={(event) => updateValue('privacy', event.target.value as PrivacyLevel)}
                      className="mt-1"
                    />
                    <span>
                      <span className="font-semibold text-neutral-800">{option.label}</span>
                      <span className="mt-1 block text-sm text-neutral-500">{option.description}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <details className="lg:col-span-2 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
              <summary className="cursor-pointer text-sm font-semibold text-neutral-700">
                Advanced metadata
              </summary>
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <div>
                  <label htmlFor="imageUrl" className="block text-sm font-medium text-neutral-700">
                    Feature image URL (optional)
                  </label>
                  <Input
                    id="imageUrl"
                    name="imageUrl"
                    type="url"
                    placeholder="https://..."
                    value={formValues.imageUrl}
                    onChange={(event) => updateValue('imageUrl', event.target.value)}
                    className="mt-2 h-10 rounded-lg border-neutral-300 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="faviconUrl" className="block text-sm font-medium text-neutral-700">
                    Favicon URL (optional)
                  </label>
                  <Input
                    id="faviconUrl"
                    name="faviconUrl"
                    type="url"
                    placeholder="https://..."
                    value={formValues.faviconUrl}
                    onChange={(event) => updateValue('faviconUrl', event.target.value)}
                    className="mt-2 h-10 rounded-lg border-neutral-300 text-sm"
                  />
                </div>
              </div>
            </details>
          </div>

          {state?.error ? (
            <p className="text-sm font-semibold text-red-600">{state.error}</p>
          ) : null}
        </form>
      </section>

      <aside className="space-y-5 lg:sticky lg:top-24">
        <div className="rounded-2xl border border-neutral-200 bg-white/95 p-5 shadow-sm">
          <h3 className="text-base font-semibold text-neutral-900">Preview</h3>
          <div className="mt-3 rounded-2xl border border-neutral-100 bg-neutral-50/70 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-[10px] font-semibold text-neutral-500 shadow-sm">
                Preview
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-sm font-semibold text-neutral-800">
                  {formValues.title || 'Title will appear here…'}
                </p>
                <p className="line-clamp-3 text-xs leading-5 text-neutral-500">
                  {formValues.description || 'Description will appear here…'}
                </p>
                <p className="text-xs text-neutral-400">{previewDomain || 'example.com'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white/95 p-5 shadow-sm">
          <h3 className="text-base font-semibold text-neutral-900">Quick actions</h3>
          <div className="mt-3 space-y-2">
            <QuickAction icon={BookmarkPlus} label="Save for later" />
            <QuickAction icon={Share2} label="Share bookmark" />
            <QuickAction icon={Copy} label="Copy link" />
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white/95 p-5 shadow-sm">
          <h3 className="text-base font-semibold text-neutral-900">Recent collections</h3>
          <div className="mt-3 space-y-2">
            <CollectionListItem name="Design resources" count="34 bookmarks" />
            <CollectionListItem name="Development tools" count="28 bookmarks" />
            <CollectionListItem name="Inspiration" count="45 bookmarks" />
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white/95 p-5 shadow-sm">
          <h3 className="text-base font-semibold text-neutral-900">Tips</h3>
          <div className="mt-3 space-y-3 text-sm text-neutral-600">
            <TipItem
              title="Use descriptive tags"
              description="Tags make it easier to resurface your best finds later."
            />
            <TipItem
              title="Add to collections"
              description="Group related bookmarks together for faster sharing."
            />
            <TipItem
              title="Explain why it matters"
              description="A short note helps collaborators understand the insight."
            />
          </div>
        </div>
      </aside>
    </div>
  );
}

export function BookmarkCreateForm({ initialValues }: { initialValues?: Partial<FormValues> }) {
  return <BaseBookmarkForm mode="create" initialValues={initialValues} />;
}

export function BookmarkEditForm({
  bookmarkId,
  initialValues,
}: {
  bookmarkId: string;
  initialValues?: Partial<FormValues>;
}) {
  return <BaseBookmarkForm mode="edit" bookmarkId={bookmarkId} initialValues={initialValues} />;
}

function deriveDomain(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function QuickAction({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <button
      type="button"
      className="flex w-full items-center justify-between rounded-xl border border-neutral-100 bg-neutral-50 px-3 py-2 text-sm font-medium text-neutral-700 transition hover:border-neutral-200 hover:bg-white"
    >
      <span className="flex items-center gap-2">
        <Icon className="size-4 text-neutral-500" />
        {label}
      </span>
      <ChevronRight className="size-4 text-neutral-300" />
    </button>
  );
}

function CollectionListItem({ name, count }: { name: string; count: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl px-3 py-2 transition hover:bg-neutral-50">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100">
        <Folder className="size-4 text-neutral-500" />
      </div>
      <div>
        <p className="text-sm font-semibold text-neutral-800">{name}</p>
        <p className="text-xs text-neutral-500">{count}</p>
      </div>
    </div>
  );
}

function TipItem({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex items-start gap-3">
      <Lightbulb className="mt-1 size-4 text-neutral-400" />
      <div>
        <p className="font-semibold text-neutral-800">{title}</p>
        <p className="mt-1 text-xs text-neutral-500">{description}</p>
      </div>
    </div>
  );
}
