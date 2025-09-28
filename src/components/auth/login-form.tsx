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
    <div className="space-y-4">
      <div className="text-center">
        <h1 className="text-xl font-semibold text-neutral-900">Welcome to HitTags</h1>
        <p className="mt-1 text-xs text-neutral-600">Sign in to your account to continue</p>
      </div>

      <div className="flex gap-2 rounded-lg bg-neutral-100 p-1 text-sm font-medium">
        <Link
          href="/login"
          className="flex-1 rounded-md bg-neutral-900 py-2 text-center text-white transition-colors hover:bg-neutral-800"
        >
          Sign In
        </Link>
        <Link
          href="/signup"
          className="flex-1 rounded-md py-2 text-center text-neutral-600 transition-colors hover:text-neutral-800"
        >
          Sign Up
        </Link>
      </div>

      <form action={formAction} className="space-y-3">
        <div className="space-y-1">
          <label htmlFor="email" className="text-xs font-medium text-neutral-700">
            Email address
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            className="h-9 rounded-lg border-neutral-300 bg-neutral-50 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="text-xs font-medium text-neutral-700">
            Password
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
            className="h-9 rounded-lg border-neutral-300 bg-neutral-50 text-sm"
          />
        </div>

        <div className="flex items-center justify-between text-xs text-neutral-600">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="remember"
              className="size-3 rounded border-neutral-300 text-neutral-600 focus:ring-neutral-500"
            />
            Remember me
          </label>
          <Link href="/reset-password" className="font-medium text-neutral-600 hover:text-neutral-900">
            Forgot password?
          </Link>
        </div>

        {state?.error ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {state.error}
          </p>
        ) : null}

        <Button type="submit" className="w-full bg-neutral-900 py-2 text-xs font-semibold text-white hover:bg-neutral-800">
          Sign In
        </Button>
      </form>

      <div className="flex items-center gap-2 text-xs text-neutral-400">
        <span className="h-px flex-1 bg-neutral-200" />
        <span>Or continue with</span>
        <span className="h-px flex-1 bg-neutral-200" />
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <form action={signInWithProvider}>
          <input type="hidden" name="provider" value="google" />
          <Button
            type="submit"
            variant="outline"
            className="h-8 w-full justify-center gap-1 border-neutral-300 text-xs font-medium text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50"
          >
            <span className="fa-brands fa-google text-neutral-500" aria-hidden />
            Google
          </Button>
        </form>
        <form action={signInWithProvider}>
          <input type="hidden" name="provider" value="github" />
          <Button
            type="submit"
            variant="outline"
            className="h-8 w-full justify-center gap-1 border-neutral-300 text-xs font-medium text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50"
          >
            <span className="fa-brands fa-github text-neutral-500" aria-hidden />
            GitHub
          </Button>
        </form>
      </div>

      <p className="text-center text-xs text-neutral-600">
        Don&apos;t have an account yet?{' '}
        <Link href="/signup" className="font-semibold text-neutral-800 hover:text-neutral-900">
          Create one now
        </Link>
      </p>
    </div>
  );
}
