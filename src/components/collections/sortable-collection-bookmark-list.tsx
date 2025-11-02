'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVerticalIcon } from 'lucide-react';

import { RemoveBookmarkButton } from '@/components/collections/remove-bookmark-button';

export interface CollectionBookmarkItem {
  id: string;
  position: number;
  bookmark: {
    id: string;
    title: string;
    description: string | null;
    url: string;
    domain: string | null;
    favicon_url: string | null;
    created_at: string;
  };
}

interface SortableCollectionBookmarkListProps {
  collectionId: string;
  items: CollectionBookmarkItem[];
  canReorder: boolean;
  canRemove: boolean;
}

function SortableBookmarkRow({
  item,
  canReorder,
  canRemove,
  onRemoved,
  collectionId,
}: {
  item: CollectionBookmarkItem;
  canReorder: boolean;
  canRemove: boolean;
  collectionId: string;
  onRemoved: (collectionBookmarkId: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, disabled: !canReorder });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const { bookmark } = item;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-start gap-4 rounded-lg border p-4 transition-colors ${
        isDragging ? 'bg-neutral-100 shadow-lg' : 'hover:bg-neutral-50'
      }`}
    >
      {canReorder ? (
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab pt-1 text-neutral-400 transition-colors hover:text-neutral-600 active:cursor-grabbing"
          aria-label="Drag bookmark to reorder"
        >
          <GripVerticalIcon className="h-5 w-5" />
        </button>
      ) : (
        <div className="pt-1 text-xs font-medium text-neutral-400 w-6 text-center">
          {item.position + 1}
        </div>
      )}

      {bookmark.favicon_url ? (
        <img
          src={bookmark.favicon_url}
          alt=""
          className="h-8 w-8 flex-shrink-0 rounded"
        />
      ) : (
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded bg-neutral-200 text-xs font-semibold text-neutral-600">
          {(bookmark.title || 'B').charAt(0).toUpperCase()}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <h3 className="font-medium text-neutral-900 line-clamp-1">{bookmark.title}</h3>
        {bookmark.description && (
          <p className="mt-1 text-sm text-neutral-600 line-clamp-2">{bookmark.description}</p>
        )}
        <div className="mt-2 flex items-center gap-3 text-xs text-neutral-500">
          {bookmark.domain && <span>{bookmark.domain}</span>}
          <span>•</span>
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Visit link
          </a>
        </div>
      </div>

      {canRemove && (
        <RemoveBookmarkButton
          collectionId={collectionId}
          bookmarkId={bookmark.id}
          onRemoved={() => onRemoved(item.id)}
        />
      )}
    </div>
  );
}

function StaticBookmarkRow({
  item,
  canRemove,
  collectionId,
  onRemoved,
}: {
  item: CollectionBookmarkItem;
  canRemove: boolean;
  collectionId: string;
  onRemoved: (collectionBookmarkId: string) => void;
}) {
  const { bookmark } = item;

  return (
    <div className="flex items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-neutral-50">
      <div className="pt-1 text-xs font-medium text-neutral-400 w-6 text-center">
        {item.position + 1}
      </div>
      {bookmark.favicon_url ? (
        <img src={bookmark.favicon_url} alt="" className="h-8 w-8 flex-shrink-0 rounded" />
      ) : (
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded bg-neutral-200 text-xs font-semibold text-neutral-600">
          {(bookmark.title || "B").charAt(0).toUpperCase()}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <h3 className="font-medium text-neutral-900 line-clamp-1">{bookmark.title}</h3>
        {bookmark.description && (
          <p className="mt-1 text-sm text-neutral-600 line-clamp-2">{bookmark.description}</p>
        )}
        <div className="mt-2 flex items-center gap-3 text-xs text-neutral-500">
          {bookmark.domain && <span>{bookmark.domain}</span>}
          <span>•</span>
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Visit link
          </a>
        </div>
      </div>
      {canRemove && (
        <RemoveBookmarkButton
          collectionId={collectionId}
          bookmarkId={bookmark.id}
          onRemoved={() => onRemoved(item.id)}
        />
      )}
    </div>
  );
}

export function SortableCollectionBookmarkList({
  collectionId,
  items,
  canReorder,
  canRemove,
}: SortableCollectionBookmarkListProps) {
  const [data, setData] = useState(() =>
    items
      .map((item) => ({
        ...item,
        position: item.position ?? 0,
      }))
      .sort((a, b) => a.position - b.position)
  );
  const [isSaving, setIsSaving] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const ids = useMemo(() => data.map((item) => item.id), [data]);

  const updatePositions = async (next: CollectionBookmarkItem[]) => {
    setIsSaving(true);
    try {
      const payload = next.map((item, index) => ({
        id: item.id,
        position: index,
      }));

      const response = await fetch(`/api/collections/${collectionId}/reorder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: payload }),
      });

      if (!response.ok) {
        let details: string | undefined;
        try {
          const parsed = await response.json();
          details = parsed?.error;
        } catch {
          // ignore
        }
        throw new Error(details || "Failed to persist new order");
      }
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error
          ? error.message
          : "Could not update collection order. Please refresh and try again."
      );
      setData(items);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    if (!canReorder) {
      return;
    }

    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = ids.indexOf(active.id as string);
    const newIndex = ids.indexOf(over.id as string);

    setData((current) => {
      const next = arrayMove(current, oldIndex, newIndex).map((item, index) => ({
        ...item,
        position: index,
      }));
      updatePositions(next).catch(() => undefined);
      return next;
    });
  };

  const handleRemove = (collectionBookmarkId: string) => {
    setData((current) => current.filter((item) => item.id !== collectionBookmarkId));
  };

  if (data.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-neutral-600">
        No bookmarks in this collection yet. Add bookmarks to get started.
      </div>
    );
  }

  if (!canReorder) {
    return (
      <div className="space-y-3">
        {data
          .slice()
          .sort((a, b) => a.position - b.position)
          .map((item) => (
            <SortableBookmarkRow
              key={item.id}
              item={item}
              canReorder={false}
              canRemove={canRemove}
              onRemoved={handleRemove}
              collectionId={collectionId}
            />
          ))}
      </div>
    );
  }

  if (!hydrated) {
    return (
      <div className="space-y-3">
        {data
          .slice()
          .sort((a, b) => a.position - b.position)
          .map((item) => (
            <StaticBookmarkRow
              key={item.id}
              item={item}
              canRemove={canRemove}
              collectionId={collectionId}
              onRemoved={handleRemove}
            />
          ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-end text-xs text-neutral-500">
        {isSaving ? 'Saving order…' : 'Drag handle to reorder'}
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          {data.map((item) => (
            <SortableBookmarkRow
              key={item.id}
              item={item}
              canReorder={true}
              canRemove={canRemove}
              onRemoved={handleRemove}
              collectionId={collectionId}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}
