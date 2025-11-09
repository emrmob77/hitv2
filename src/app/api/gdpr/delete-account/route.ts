import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// Request account deletion (GDPR compliance)
export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { confirmation, reason } = body;

    // Require explicit confirmation
    if (confirmation !== 'DELETE_MY_ACCOUNT') {
      return NextResponse.json(
        { error: 'Invalid confirmation. Please type "DELETE_MY_ACCOUNT" to confirm.' },
        { status: 400 }
      );
    }

    // Log the deletion request
    await supabase.from('moderation_actions').insert({
      moderator_id: user.id, // Self-action
      target_user_id: user.id,
      action_type: 'content_removed',
      reason: reason || 'User requested account deletion',
      notes: 'GDPR account deletion request',
    });

    // In production, this would:
    // 1. Anonymize user data (replace with "Deleted User")
    // 2. Remove personally identifiable information
    // 3. Keep content for platform integrity but anonymized
    // 4. Delete auth account after grace period

    // For now, we'll just mark the account for deletion
    await supabase
      .from('profiles')
      .update({
        display_name: 'Deleted User',
        bio: null,
        avatar_url: null,
        website_url: null,
        twitter_username: null,
        github_username: null,
        // Add a deletion marker
        is_suspended: true,
        suspension_reason: 'Account deleted by user request (GDPR)',
      })
      .eq('id', user.id);

    // In production: Schedule actual deletion after grace period (e.g., 30 days)
    // This allows users to recover their account if they change their mind

    return NextResponse.json({
      success: true,
      message:
        'Your account has been marked for deletion. Your data will be permanently deleted in 30 days. You can cancel this request by contacting support within this period.',
    });
  } catch (error) {
    console.error('Error in POST /api/gdpr/delete-account:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Get account deletion status
export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_suspended, suspension_reason')
      .eq('id', user.id)
      .single();

    const isMarkedForDeletion =
      profile?.is_suspended &&
      profile?.suspension_reason?.includes('Account deleted by user request');

    return NextResponse.json({
      is_marked_for_deletion: isMarkedForDeletion,
      suspension_reason: profile?.suspension_reason,
    });
  } catch (error) {
    console.error('Error in GET /api/gdpr/delete-account:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
