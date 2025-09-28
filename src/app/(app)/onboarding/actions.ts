'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { createSupabaseServerClient } from '@/lib/supabase/server';

export type OnboardingFormState = {
  error?: string;
};

export async function completeOnboardingAction(
  _prevState: OnboardingFormState,
  formData: FormData
): Promise<OnboardingFormState> {
  const displayName = (formData.get('displayName') || '').toString().trim();
  const username = (formData.get('username') || '').toString().trim();
  const bio = (formData.get('bio') || '').toString().trim();

  if (!displayName || !username) {
    return { error: 'Please provide both a display name and a username.' };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: sessionError,
  } = await supabase.auth.getUser();

  if (sessionError || !user) {
    return { error: 'Session not found. Please sign in again.' };
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      display_name: displayName,
      username,
      bio: bio || null,
    })
    .eq('id', user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/dashboard');
  redirect('/dashboard');
}
