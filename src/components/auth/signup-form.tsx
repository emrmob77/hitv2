'use client';

import { useActionState } from 'react';
import Link from 'next/link';

import { signupAction, type SignupFormState } from '@/app/(auth)/signup/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const initialState: SignupFormState = {};

export function SignupForm() {
  const [state, formAction] = useActionState(signupAction, initialState);

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 rounded-3xl border border-border/70 bg-white p-8 shadow-xl">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold text-neutral-900">Create your account</h1>
        <p className="text-sm text-neutral-500">
          Join the HitTags community and start curating the web in minutes.
        </p>
      </div>
      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="fullName" className="text-sm font-medium text-neutral-700">
            Full name
          </label>
          <Input id="fullName" name="fullName" type="text" placeholder="Jane Doe" className="bg-neutral-50" />
        </div>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-neutral-700">
            Email
          </label>
          <Input id="email" name="email" type="email" placeholder="you@example.com" required className="bg-neutral-50" />
        </div>
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-neutral-700">
            Password
          </label>
          <Input id="password" name="password" type="password" placeholder="••••••••" required className="bg-neutral-50" />
          <p className="text-xs text-neutral-400">
            Use at least 8 characters and mix letters with numbers for a stronger password.
          </p>
        </div>
        {state?.error ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {state.error}
          </p>
        ) : null}
        <Button type="submit" className="w-full bg-[var(--hit-primary)] text-white hover:bg-[var(--hit-primary-dark)]">
          Sign up
        </Button>
      </form>
      <p className="text-center text-xs text-neutral-500">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-[var(--hit-primary)] hover:text-[var(--hit-primary-dark)]">
          Sign in
        </Link>
      </p>
    </div>
  );
}
