'use server';

import { redirect } from 'next/navigation';

import type { Provider } from '@supabase/supabase-js';

import { ensureUserProfile } from '@/lib/profile';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export type AuthFormState = {
  error?: string;
};

const redirectPath = '/dashboard';

export async function loginAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = (formData.get('email') || '').toString().trim();
  const password = (formData.get('password') || '').toString();

  if (!email || !password) {
    return { error: 'Please fill in both the email and password fields.' };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  await ensureUserProfile(supabase);

  redirect(redirectPath);
}

const allowedProviders = new Set<Provider>(['google', 'github']);

export async function signInWithProvider(formData: FormData) {
  const rawProvider = formData.get('provider');
  const provider = rawProvider ? (rawProvider.toString() as Provider) : null;

  if (!provider || !allowedProviders.has(provider)) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: process.env.SUPABASE_REDIRECT_URL || 'http://localhost:3000/auth/callback',
    },
  });

  if (error || !data?.url) {
    return;
  }

  redirect(data.url);
}
