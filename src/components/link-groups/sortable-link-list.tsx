'use client';

import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVerticalIcon, TrashIcon, EditIcon, ToggleLeftIcon, ToggleRightIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LinkItem {
  id: string;
  link_group_id: string;
  title: string;
  url: string;
  description: string | null;
  icon: string | null;
  position: number;
  is_active: boolean;
  click_count: number;
}

interface SortableLinkListProps {
  items: LinkItem[];
  onReorder: (items: LinkItem[]) => Promise<void>;
  onToggleActive?: (itemId: string, isActive: boolean) => Promise<void>;
  onDelete?: (itemId: string) => Promise<void>;
  onUpdate?: (itemId: string, data: { title?: string; url?: string; description?: string }) => Promise<void>;
}

function SortableItem({
  item,
  onToggleActive,
  onDelete,
  onUpdate,
}: {
  item: LinkItem;
  onToggleActive?: (itemId: string, isActive: boolean) => Promise<void>;
  onDelete?: (itemId: string) => Promise<void>;
  onUpdate?: (itemId: string, data: { title?: string; url?: string; description?: string }) => Promise<void>;
}) {
  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isActive, setIsActive] = useState(item.is_active);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(item.title);
  const [editUrl, setEditUrl] = useState(item.url);
  const [editDescription, setEditDescription] = useState(item.description || '');
  const [isSaving, setIsSaving] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleSave = async () => {
    if (!onUpdate) return;

    setIsSaving(true);
    try {
      await onUpdate(item.id, {
        title: editTitle,
        url: editUrl,
        description: editDescription || undefined,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Update failed:', error);
      alert('Failed to update link');
      // Revert changes
      setEditTitle(item.title);
      setEditUrl(item.url);
      setEditDescription(item.description || '');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditTitle(item.title);
    setEditUrl(item.url);
    setEditDescription(item.description || '');
    setIsEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 rounded-lg border p-4 transition-colors ${
        isDragging ? 'bg-neutral-100 shadow-lg' : 'hover:bg-neutral-50'
      } ${!isActive ? 'opacity-50' : ''}`}
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none active:cursor-grabbing"
        aria-label="Drag to reorder"
        disabled={isEditing}
      >
        <GripVerticalIcon className="h-5 w-5 flex-shrink-0 text-neutral-400" />
      </button>

      {/* Link Content */}
      {isEditing ? (
        <div className="min-w-0 flex-1 space-y-2">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full rounded border border-neutral-300 px-2 py-1 text-sm font-medium focus:border-blue-500 focus:outline-none"
            placeholder="Link title"
            maxLength={200}
          />
          <input
            type="url"
            value={editUrl}
            onChange={(e) => setEditUrl(e.target.value)}
            className="w-full rounded border border-neutral-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
            placeholder="https://example.com"
          />
          <input
            type="text"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            className="w-full rounded border border-neutral-300 px-2 py-1 text-xs text-neutral-600 focus:border-blue-500 focus:outline-none"
            placeholder="Description (optional)"
            maxLength={200}
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving || !editTitle || !editUrl}
              className="rounded bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="rounded border border-neutral-300 px-3 py-1 text-xs hover:bg-neutral-50 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div
          className="min-w-0 flex-1 cursor-pointer"
          onClick={() => setIsEditing(true)}
          title="Click to edit"
        >
          <h3 className="font-medium text-neutral-900">{item.title}</h3>
          {item.description && (
            <p className="mt-0.5 text-sm text-neutral-600 line-clamp-1">
              {item.description}
            </p>
          )}
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 text-xs text-blue-600 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {item.url}
          </a>
        </div>
      )}

      {/* Stats */}
      {!isEditing && (
        <div className="flex flex-shrink-0 items-center gap-2 text-sm text-neutral-500">
          <span>{item.click_count} clicks</span>
        </div>
      )}

      {/* Actions */}
      {!isEditing && (
        <div className="flex flex-shrink-0 items-center gap-1">
        {/* Toggle Active */}
        {onToggleActive && (
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              const newActiveState = !isActive;
              setIsToggling(true);
              // Optimistic update
              setIsActive(newActiveState);
              try {
                await onToggleActive(item.id, newActiveState);
              } catch (error) {
                console.error('Toggle failed:', error);
                alert('Failed to toggle link status');
                // Revert on error
                setIsActive(!newActiveState);
              } finally {
                setIsToggling(false);
              }
            }}
            disabled={isToggling}
            title={isActive ? 'Deactivate' : 'Activate'}
          >
            {isToggling ? (
              <span className="text-xs">...</span>
            ) : isActive ? (
              <ToggleRightIcon className="h-4 w-4 text-green-600" />
            ) : (
              <ToggleLeftIcon className="h-4 w-4 text-neutral-400" />
            )}
          </Button>
        )}

        {/* Delete */}
        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              if (confirm('Are you sure you want to delete this link?')) {
                setIsDeleting(true);
                try {
                  await onDelete(item.id);
                } catch (error) {
                  console.error('Delete failed:', error);
                  alert('Failed to delete link');
                  setIsDeleting(false);
                }
              }
            }}
            disabled={isDeleting}
            className="text-red-600 hover:text-red-700"
            title="Delete link"
          >
            {isDeleting ? (
              <span className="text-xs">...</span>
            ) : (
              <TrashIcon className="h-4 w-4" />
            )}
          </Button>
        )}
        </div>
      )}
    </div>
  );
}

export function SortableLinkList({
  items: initialItems,
  onReorder,
  onToggleActive,
  onDelete,
  onUpdate,
}: SortableLinkListProps) {
  const [items, setItems] = useState(initialItems);
  const [isSaving, setIsSaving] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Fix hydration mismatch by only rendering DnD on client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Update items when props change (after server action)
  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);

    const reorderedItems = arrayMove(items, oldIndex, newIndex).map(
      (item, index) => ({
        ...item,
        position: index,
      })
    );

    // Optimistic UI update
    setItems(reorderedItems);

    // Save to database
    setIsSaving(true);
    try {
      await onReorder(reorderedItems);
      // Success - keep optimistic UI update
    } catch (error) {
      console.error('Failed to reorder items:', error);
      // Revert on error
      setItems(initialItems);
      alert('Failed to save order. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-neutral-600">
        No links added yet. Add your first link above to get started.
      </div>
    );
  }

  // Show static list during SSR to prevent hydration mismatch
  if (!isMounted) {
    return (
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className={`flex items-center gap-3 rounded-lg border p-4 ${
              !item.is_active ? 'opacity-50' : ''
            }`}
          >
            <GripVerticalIcon className="h-5 w-5 flex-shrink-0 text-neutral-400" />
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-neutral-900">{item.title}</h3>
              {item.description && (
                <p className="mt-0.5 text-sm text-neutral-600 line-clamp-1">
                  {item.description}
                </p>
              )}
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 text-xs text-blue-600 hover:underline"
              >
                {item.url}
              </a>
            </div>
            <div className="flex flex-shrink-0 items-center gap-2 text-sm text-neutral-500">
              <span>{item.click_count} clicks</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isSaving && (
        <div className="text-sm text-neutral-600">Saving order...</div>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {items.map((item) => (
              <SortableItem
                key={item.id}
                item={item}
                onToggleActive={onToggleActive}
                onDelete={onDelete}
                onUpdate={onUpdate}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <p className="text-xs text-neutral-500">
        💡 Tip: Drag and drop links to reorder them
      </p>
    </div>
  );
}
