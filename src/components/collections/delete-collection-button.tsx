'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TrashIcon } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

interface DeleteCollectionButtonProps {
  collectionId: string;
  collectionName: string;
}

export function DeleteCollectionButton({
  collectionId,
  collectionName,
}: DeleteCollectionButtonProps) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setIsDeleting(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from('collections')
        .delete()
        .eq('id', collectionId);

      if (error) {
        console.error('Failed to delete collection:', error);
        alert('Failed to delete collection. Please try again.');
        return;
      }

      router.push('/dashboard/collections');
      router.refresh();
    } catch (error) {
      console.error('Delete error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsDeleting(false);
      setOpen(false);
    }
  }

  return (
    <>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => setOpen(true)}
      >
        <TrashIcon className="mr-2 h-4 w-4" />
        Delete
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Collection</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{collectionName}&quot;? This action cannot be
              undone. All bookmarks in this collection will remain in your library.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Collection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
