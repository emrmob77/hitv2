'use client';

import { useState, useEffect, type ComponentProps } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FolderPlusIcon, CheckIcon } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

interface Collection {
  id: string;
  name: string;
  bookmark_count: number;
}

interface AddToCollectionButtonProps {
  bookmarkId: string;
  variant?: ComponentProps<typeof Button>['variant'];
  size?: ComponentProps<typeof Button>['size'];
  className?: string;
}

export function AddToCollectionButton({
  bookmarkId,
  variant = 'outline',
  size = 'sm',
  className,
}: AddToCollectionButtonProps) {
  const [open, setOpen] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [bookmarkCollections, setBookmarkCollections] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      loadCollections();
    }
  }, [open, bookmarkId]);

  async function loadCollections() {
    setLoading(true);
    const supabase = createSupabaseBrowserClient();

    try {
      // Fetch user's collections
      const { data: collectionsData } = await supabase
        .from('collections')
        .select('id, name, bookmark_count')
        .order('name');

      // Fetch bookmark's current collections
      const { data: bookmarkCollectionsData } = await supabase
        .from('collection_bookmarks')
        .select('collection_id')
        .eq('bookmark_id', bookmarkId);

      setCollections(collectionsData || []);
      setBookmarkCollections(
        new Set(bookmarkCollectionsData?.map((bc) => bc.collection_id) || [])
      );
    } catch (error) {
      console.error('Failed to load collections:', error);
    } finally {
      setLoading(false);
    }
  }

  async function toggleCollection(collectionId: string) {
    setActionLoading(collectionId);
    const supabase = createSupabaseBrowserClient();

    try {
      const isInCollection = bookmarkCollections.has(collectionId);

      if (isInCollection) {
        // Remove from collection
        const { error } = await supabase
          .from('collection_bookmarks')
          .delete()
          .eq('collection_id', collectionId)
          .eq('bookmark_id', bookmarkId);

        if (error) throw error;

        setBookmarkCollections((prev) => {
          const newSet = new Set(prev);
          newSet.delete(collectionId);
          return newSet;
        });
      } else {
        // Add to collection
        const { error } = await supabase.from('collection_bookmarks').insert({
          collection_id: collectionId,
          bookmark_id: bookmarkId,
        });

        if (error) throw error;

        setBookmarkCollections((prev) => new Set(prev).add(collectionId));
      }
    } catch (error) {
      console.error('Failed to toggle collection:', error);
      alert('Failed to update collection. Please try again.');
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => setOpen(true)}
        type="button"
      >
        <FolderPlusIcon className="mr-2 h-4 w-4" />
        Add to Collection
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add to Collection</DialogTitle>
            <DialogDescription>
              Select which collections should contain this bookmark.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-4">
            {loading ? (
              <p className="text-center text-sm text-neutral-500">Loading collections...</p>
            ) : collections.length === 0 ? (
              <div className="py-8 text-center">
                <p className="mb-4 text-sm text-neutral-600">
                  You don&apos;t have any collections yet.
                </p>
                <Button size="sm" asChild>
                  <a href="/dashboard/collections/new">Create Collection</a>
                </Button>
              </div>
            ) : (
              collections.map((collection) => {
                const isInCollection = bookmarkCollections.has(collection.id);
                const isLoading = actionLoading === collection.id;

                return (
                  <button
                    key={collection.id}
                    onClick={() => toggleCollection(collection.id)}
                    disabled={isLoading}
                    className="flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors hover:bg-neutral-50 disabled:opacity-50"
                  >
                    <div>
                      <p className="font-medium text-neutral-900">{collection.name}</p>
                      <p className="text-xs text-neutral-500">
                        {collection.bookmark_count} bookmarks
                      </p>
                    </div>
                    {isInCollection && (
                      <CheckIcon className="h-5 w-5 text-green-600" />
                    )}
                  </button>
                );
              })
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
