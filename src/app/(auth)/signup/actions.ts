'use server';

import { ensureUserProfile } from '@/lib/profile';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export type SignupFormState = {
  error?: string;
  success?: boolean;
  email?: string;
};

export async function signupAction(
  _prevState: SignupFormState,
  formData: FormData
): Promise<SignupFormState> {
  const email = (formData.get('email') || '').toString().trim();
  const password = (formData.get('password') || '').toString();
  const fullName = (formData.get('fullName') || '').toString().trim();
  const username = (formData.get('username') || '').toString().trim();
  const termsAccepted = formData.get('terms') === 'on';

  if (!email || !password) {
    return { error: 'Please enter a valid email address and password.' };
  }

  if (password.length < 8) {
    return { error: 'Your password must contain at least 8 characters.' };
  }

  if (!username) {
    return { error: 'Please choose a username.' };
  }

  const usernamePattern = /^[a-zA-Z0-9_]{3,32}$/;
  if (!usernamePattern.test(username)) {
    return { error: 'Usernames can only contain letters, numbers, underscores and must be 3-32 characters long.' };
  }

  if (!termsAccepted) {
    return { error: 'You must agree to the Terms of Service and Privacy Policy to continue.' };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        ...(fullName ? { full_name: fullName } : {}),
        username,
      },
      emailRedirectTo: process.env.SUPABASE_REDIRECT_URL || 'http://localhost:3000/onboarding',
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Ensure profile is created for the new user
  await ensureUserProfile(supabase);

  return {
    success: true,
    email,
  };
}
