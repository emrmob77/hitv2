'use client';

import { useActionState } from 'react';
import Link from 'next/link';

import { loginAction, type AuthFormState, signInWithProvider } from '@/app/(auth)/login/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const initialState: AuthFormState = {};

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initialState);

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 rounded-3xl border border-border/70 bg-white p-8 shadow-xl">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold text-neutral-900">Sign in to your HitTags account</h1>
        <p className="text-sm text-neutral-500">
          Use your email and password or continue with one of the social providers below.
        </p>
      </div>
      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-neutral-700">
            Email address
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            className="bg-neutral-50"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-neutral-700">
              Password
            </label>
            <Link
              href="/reset-password"
              className="text-xs font-medium text-neutral-500 transition-colors hover:text-neutral-800"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
            className="bg-neutral-50"
          />
        </div>
        {state?.error ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {state.error}
          </p>
        ) : null}
        <Button type="submit" className="w-full bg-[var(--hit-primary)] text-white hover:bg-[var(--hit-primary-dark)]">
          Sign in
        </Button>
      </form>
      <div className="space-y-3">
        <div className="flex items-center gap-3 text-xs text-neutral-400">
          <span className="h-px flex-1 bg-neutral-200" />
          <span>or</span>
          <span className="h-px flex-1 bg-neutral-200" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <form action={signInWithProvider}>
            <input type="hidden" name="provider" value="google" />
            <Button
              type="submit"
              variant="outline"
              className="w-full justify-center border-neutral-300 text-neutral-700 hover:border-neutral-400 hover:bg-neutral-100"
            >
              Continue with Google
            </Button>
          </form>
          <form action={signInWithProvider}>
            <input type="hidden" name="provider" value="github" />
            <Button
              type="submit"
              variant="outline"
              className="w-full justify-center border-neutral-300 text-neutral-700 hover:border-neutral-400 hover:bg-neutral-100"
            >
              Continue with GitHub
            </Button>
          </form>
        </div>
      </div>
      <p className="text-center text-xs text-neutral-500">
        Don&apos;t have an account yet?{' '}
        <Link href="/signup" className="font-semibold text-[var(--hit-primary)] hover:text-[var(--hit-primary-dark)]">
          Create one now
        </Link>
      </p>
    </div>
  );
}
