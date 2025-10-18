import { NextRequest, NextResponse } from 'next/server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { syncBookmarkCollection, syncBookmarkTags } from '@/app/(app)/dashboard/bookmarks/actions';
import { parseTags } from '@/lib/bookmarks/tag-utils';

type UpdatePayload = {
  id: string;
  title?: string;
  description?: string;
  privacyLevel?: 'public' | 'private' | 'subscribers';
  tags?: string;
  collectionSlug?: string | null;
};

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const updates: UpdatePayload[] = Array.isArray(body?.updates) ? body.updates : [];
    const deleteIds: string[] = Array.isArray(body?.deleteIds) ? body.deleteIds : [];

    const summary = {
      updated: 0,
      failed: 0,
      deleted: 0,
      deleteFailed: 0,
    };

    if (deleteIds.length > 0) {
      const { error: deleteError, count } = await supabase
        .from('bookmarks')
        .delete({ count: 'exact' })
        .eq('user_id', user.id)
        .in('id', deleteIds);

      if (deleteError) {
        summary.deleteFailed = deleteIds.length;
      } else {
        summary.deleted = count ?? deleteIds.length;
      }
    }

    for (const update of updates) {
      if (!update?.id) {
        summary.failed += 1;
        continue;
      }

      const updatePayload: Record<string, any> = {};

      if (typeof update.title === 'string') {
        const trimmed = update.title.trim();
        if (trimmed) {
          updatePayload.title = trimmed;
        }
      }

      if (typeof update.description === 'string') {
        const value = update.description.trim();
        updatePayload.description = value || null;
      }

      if (update.privacyLevel && ['public', 'private', 'subscribers'].includes(update.privacyLevel)) {
        updatePayload.privacy_level = update.privacyLevel;
      }

      if (Object.keys(updatePayload).length > 0) {
        const { error } = await supabase
          .from('bookmarks')
          .update(updatePayload)
          .eq('id', update.id)
          .eq('user_id', user.id);

        if (error) {
          summary.failed += 1;
          continue;
        }
      }

      if (typeof update.tags === 'string') {
        const parsedTags = parseTags(update.tags);
        await syncBookmarkTags(supabase, update.id, parsedTags);
      }

      if (update.collectionSlug !== undefined) {
        await syncBookmarkCollection(
          supabase,
          update.id,
          user.id,
          update.collectionSlug && update.collectionSlug.trim()
            ? update.collectionSlug.trim()
            : null
        );
      }

      summary.updated += 1;
    }

    return NextResponse.json({ success: true, summary });
  } catch (error) {
    console.error('Bulk bookmark update failed:', error);
    return NextResponse.json(
      { error: 'Failed to update imported bookmarks' },
      { status: 500 }
    );
  }
}
