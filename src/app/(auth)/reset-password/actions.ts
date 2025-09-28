'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';

export type ResetFormState = {
  success?: boolean;
  error?: string;
};

export async function resetPasswordAction(
  _prevState: ResetFormState,
  formData: FormData
): Promise<ResetFormState> {
  const email = (formData.get('email') || '').toString().trim();
  if (!email) {
    return { error: 'Lütfen kayıtlı e-posta adresinizi girin.' };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: process.env.SUPABASE_REDIRECT_URL || 'http://localhost:3000/onboarding',
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
