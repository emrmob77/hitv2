'use server';

import { redirect } from 'next/navigation';

import { createSupabaseServerClient } from '@/lib/supabase/server';

export type SignupFormState = {
  error?: string;
};

export async function signupAction(
  _prevState: SignupFormState,
  formData: FormData
): Promise<SignupFormState> {
  const email = (formData.get('email') || '').toString().trim();
  const password = (formData.get('password') || '').toString();
  const fullName = (formData.get('fullName') || '').toString().trim();

  if (!email || !password) {
    return { error: 'Please enter a valid email address and password.' };
  }

  if (password.length < 8) {
    return { error: 'Your password must contain at least 8 characters.' };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: fullName ? { full_name: fullName } : undefined,
      emailRedirectTo: process.env.SUPABASE_REDIRECT_URL || 'http://localhost:3000/onboarding',
    },
  });

  if (error) {
    return { error: error.message };
  }

  redirect('/onboarding');
}
