import Link from 'next/link';
import { Metadata } from 'next';
import type { ElementType } from 'react';

import {
  BookMarked,
  Eye,
  ExternalLinkIcon,
  FolderIcon,
  Layers3,
  Lock,
  Sparkles
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Collections',
};

interface Collection {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  privacy_level: 'public' | 'private' | 'subscribers';
  bookmark_count: number;
  created_at: string;
  cover_image_url: string | null;
  username?: string;
}

export default async function CollectionsPage() {
  const collections = await fetchCollections();

  const totalCollections = collections.length;
  const publicCollections = collections.filter((collection) => collection.privacy_level === 'public').length;
  const privateCollections = collections.filter((collection) => collection.privacy_level !== 'public').length;
  const totalBookmarks = collections.reduce((sum, collection) => sum + collection.bookmark_count, 0);

  const stats = [
    {
      label: 'Total collections',
      value: totalCollections,
      icon: Layers3,
    },
    {
      label: 'Public',
      value: publicCollections,
      icon: Eye,
    },
    {
      label: 'Private',
      value: privateCollections,
      icon: Lock,
    },
    {
      label: 'Bookmarks inside',
      value: totalBookmarks,
      icon: BookMarked,
    },
  ];

  return (
    <div className="space-y-8">
      <header className="mx-auto flex w-full max-w-5xl flex-col gap-6 rounded-3xl border border-neutral-200 bg-gradient-to-br from-neutral-50 via-white to-neutral-100 p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            <Sparkles className="size-3 text-neutral-400" />
            Collections overview
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold text-neutral-900">Curate your library</h1>
            <p className="text-sm text-neutral-600">
              Group related bookmarks, define access levels, and share curated lists with your audience.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button asChild variant="outline" className="h-10 border-neutral-300 text-sm font-semibold text-neutral-700">
            <Link href="/dashboard/bookmarks">View bookmarks</Link>
          </Button>
          <Button asChild className="h-10 bg-neutral-900 text-sm font-semibold text-white hover:bg-neutral-800">
            <Link href="/dashboard/collections/new">Create collection</Link>
          </Button>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-5xl gap-4 rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <SummaryStatCard key={stat.label} {...stat} />
        ))}
      </section>

      {/* Collections Grid */}
      <div className="mx-auto w-full max-w-5xl">
        {collections.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <FolderIcon className="mx-auto mb-4 h-12 w-12 text-neutral-300" />
              <h3 className="mb-2 text-lg font-semibold text-neutral-900">No collections yet</h3>
              <p className="mb-6 text-sm text-neutral-600">
                Create your first collection to organize your bookmarks.
              </p>
              <Button asChild>
                <Link href="/dashboard/collections/new">Create Your First Collection</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {collections.map((collection) => (
              <CollectionCard key={collection.id} collection={collection} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

async function fetchCollections(): Promise<Collection[]> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.log('No user found for collections');
    return [];
  }

  console.log('Fetching collections for user:', user.id);

  // Get username from profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single();

  const { data, error } = await supabase
    .from('collections')
    .select('id, name, description, slug, privacy_level, bookmark_count, created_at, cover_image_url')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Collections fetch error:', error?.message ?? error);
    return [];
  }

  console.log('Collections fetched:', data?.length || 0);

  // Add username to each collection
  return (data || []).map(collection => ({
    ...collection,
    username: profile?.username,
  }));
}

function CollectionCard({ collection }: { collection: Collection }) {
  const createdAt = new Date(collection.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const privacyLabel = collection.privacy_level === 'public' ? 'Public' : collection.privacy_level === 'subscribers' ? 'Subscribers' : 'Private';
  const privacyTone = collection.privacy_level === 'public' ? 'text-green-600 bg-green-100 border-green-200' : collection.privacy_level === 'subscribers' ? 'text-blue-700 bg-blue-100 border-blue-200' : 'text-neutral-600 bg-neutral-100 border-neutral-200';

  return (
    <Card className="group overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg">
      <Link href={`/dashboard/collections/${collection.id}`} className="block">
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-neutral-100 via-neutral-200 to-neutral-300">
          {collection.cover_image_url ? (
            <img
              src={collection.cover_image_url}
              alt={collection.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <FolderIcon className="h-14 w-14 text-neutral-300" />
            </div>
          )}
          <div className="absolute inset-x-3 top-3 inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/80 px-3 py-1 text-xs font-semibold text-neutral-700 backdrop-blur">
            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${privacyTone}`}>
              {collection.privacy_level === 'public' ? <Eye className="size-3" /> : <Lock className="size-3" />}
              {privacyLabel}
            </span>
            <span className="inline-flex items-center gap-1 text-neutral-500">
              <BookMarked className="size-3" />
              {collection.bookmark_count}
            </span>
          </div>
        </div>
      </Link>
      <CardContent className="space-y-3 p-4">
        <div className="space-y-1">
          <Link href={`/dashboard/collections/${collection.id}`} className="line-clamp-1 text-base font-semibold text-neutral-900 transition hover:text-neutral-700">
            {collection.name}
          </Link>
          {collection.description ? (
            <p className="line-clamp-2 text-sm text-neutral-600">{collection.description}</p>
          ) : (
            <p className="text-sm text-neutral-400">No description provided.</p>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-neutral-500">
          <span>Created {createdAt}</span>
          {collection.username && collection.privacy_level === 'public' ? (
            <span className="font-medium text-neutral-600">@{collection.username}</span>
          ) : null}
        </div>

        {collection.privacy_level === 'public' && collection.username ? (
          <Button asChild variant="outline" size="sm" className="w-full justify-center border-neutral-200">
            <Link href={`/c/${collection.username}/${collection.slug}`} target="_blank">
              <ExternalLinkIcon className="mr-2 h-3 w-3" />
              View public page
            </Link>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

function SummaryStatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: ElementType;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-neutral-100 bg-neutral-50/70 px-4 py-3 shadow-sm">
      <div className="flex size-10 items-center justify-center rounded-xl bg-neutral-900/90 text-white">
        <Icon className="size-5" />
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-neutral-500">{label}</p>
        <p className="text-lg font-semibold text-neutral-900">{value}</p>
      </div>
    </div>
  );
}
