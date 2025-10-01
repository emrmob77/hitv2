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

interface DeleteLinkGroupButtonProps {
  groupId: string;
  groupName: string;
}

export function DeleteLinkGroupButton({ groupId, groupName }: DeleteLinkGroupButtonProps) {
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
      .from('link_groups')
      .delete()
      .eq('id', groupId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Failed to delete link group:', error);
      setIsDeleting(false);
      return;
    }

    router.push('/dashboard/link-groups');
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
          <DialogTitle>Delete Link Group</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &quot;{groupName}&quot;? All links in this group will be removed. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete Link Group'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
