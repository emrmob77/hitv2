'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { XIcon } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

interface RemoveBookmarkButtonProps {
  collectionId: string;
  bookmarkId: string;
}

export function RemoveBookmarkButton({
  collectionId,
  bookmarkId,
}: RemoveBookmarkButtonProps) {
  const [isRemoving, setIsRemoving] = useState(false);
  const router = useRouter();

  async function handleRemove() {
    if (!confirm('Remove this bookmark from the collection?')) {
      return;
    }

    setIsRemoving(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from('collection_bookmarks')
        .delete()
        .eq('collection_id', collectionId)
        .eq('bookmark_id', bookmarkId);

      if (error) {
        console.error('Failed to remove bookmark:', error);
        alert('Failed to remove bookmark. Please try again.');
        return;
      }

      router.refresh();
    } catch (error) {
      console.error('Remove error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsRemoving(false);
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleRemove}
      disabled={isRemoving}
      className="text-neutral-500 hover:text-red-600"
    >
      <XIcon className="h-4 w-4" />
    </Button>
  );
}
