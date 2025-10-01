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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Trash2Icon } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

interface DeletePostButtonProps {
  postId: string;
  postTitle: string;
}

export function DeletePostButton({ postId, postTitle }: DeletePostButtonProps) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setIsDeleting(true);

    const supabase = createSupabaseBrowserClient();

    if (!supabase) {
      console.error('Supabase client not initialized');
      setIsDeleting(false);
      return;
    }
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push('/auth/login');
      return;
    }

    const { error } = await supabase
      .from('exclusive_posts')
      .delete()
      .eq('id', postId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Failed to delete post:', error);
      setIsDeleting(false);
      return;
    }

    router.push('/dashboard/posts');
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Trash2Icon className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Premium Post</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &quot;{postTitle}&quot;? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete Post'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
