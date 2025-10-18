'use client';

import { useState } from 'react';
import { Trash2, Lock, Globe, Users, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRouter } from 'next/navigation';

interface BulkActionsBarProps {
  selectedCount: number;
  totalCount: number;
  onClearSelection: () => void;
  selectedIds: string[];
}

export function BulkActionsBar({
  selectedCount,
  totalCount,
  onClearSelection,
  selectedIds,
}: BulkActionsBarProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updatingPrivacy, setUpdatingPrivacy] = useState(false);

  if (selectedCount === 0) return null;

  const handleBulkDelete = async () => {
    setDeleting(true);
    try {
      // Delete all selected bookmarks
      await Promise.all(
        selectedIds.map((id) =>
          fetch(`/api/bookmarks/${id}`, {
            method: 'DELETE',
          })
        )
      );

      setShowDeleteDialog(false);
      onClearSelection();
      router.refresh();
    } catch (error) {
      console.error('Bulk delete failed:', error);
    } finally {
      setDeleting(false);
    }
  };

  const handleBulkPrivacyUpdate = async (privacy: string) => {
    setUpdatingPrivacy(true);
    try {
      // Update privacy for all selected bookmarks
      await Promise.all(
        selectedIds.map((id) =>
          fetch(`/api/bookmarks/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ privacy_level: privacy }),
          })
        )
      );

      onClearSelection();
      router.refresh();
    } catch (error) {
      console.error('Bulk privacy update failed:', error);
    } finally {
      setUpdatingPrivacy(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 transform">
        <div className="rounded-full border border-neutral-200 bg-white shadow-lg">
          <div className="flex items-center gap-4 px-6 py-3">
            {/* Selection Count */}
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
                {selectedCount}
              </div>
              <span className="text-sm font-medium text-neutral-700">
                {selectedCount} of {totalCount} selected
              </span>
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-neutral-200" />

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Privacy Update */}
              <Select onValueChange={handleBulkPrivacyUpdate} disabled={updatingPrivacy}>
                <SelectTrigger className="h-9 w-[140px] border-neutral-200 text-sm">
                  <SelectValue placeholder="Change privacy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      <span>Public</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="private">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      <span>Private</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="subscribers">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>Subscribers</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Delete Button */}
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                disabled={deleting}
                className="h-9"
              >
                {deleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </>
                )}
              </Button>
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-neutral-200" />

            {/* Clear Selection */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="h-9 px-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedCount} bookmarks?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected bookmarks
              from your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
