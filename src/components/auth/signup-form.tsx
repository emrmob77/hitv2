'use client';

import { useActionState } from 'react';
import Link from 'next/link';

import { signupAction, type SignupFormState } from '@/app/(auth)/signup/actions';
import { signInWithProvider } from '@/app/(auth)/login/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const initialState: SignupFormState = {};

export function SignupForm() {
  const [state, formAction] = useActionState(signupAction, initialState);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-semibold text-neutral-900">Create your HitTags account</h1>
        <p className="mt-2 text-sm text-neutral-600">Join the community and start curating the web in minutes.</p>
      </div>

      <div className="flex gap-2 rounded-lg bg-neutral-100 p-1 text-sm font-medium">
        <Link
          href="/login"
          className="flex-1 rounded-md py-2 text-center text-neutral-600 transition-colors hover:text-neutral-800"
        >
          Sign In
        </Link>
        <Link
          href="/signup"
          className="flex-1 rounded-md bg-neutral-900 py-2 text-center text-white transition-colors hover:bg-neutral-800"
        >
          Sign Up
        </Link>
      </div>

      <form action={formAction} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="fullName" className="text-sm font-medium text-neutral-700">
            Full name
          </label>
          <Input
            id="fullName"
            name="fullName"
            type="text"
            placeholder="Jane Doe"
            className="h-12 rounded-lg border-neutral-300 bg-neutral-50 text-[15px]"
          />
        </div>

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
            className="h-12 rounded-lg border-neutral-300 bg-neutral-50 text-[15px]"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-neutral-700">
            Password
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Create a password"
            required
            className="h-12 rounded-lg border-neutral-300 bg-neutral-50 text-[15px]"
          />
          <ul className="space-y-1 text-xs text-neutral-500">
            <li>• Minimum 8 characters</li>
            <li>• Combine letters, numbers, and symbols</li>
          </ul>
        </div>

        {state?.error ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {state.error}
          </p>
        ) : null}

        <div className="flex items-start gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-xs text-neutral-600">
          <input
            type="checkbox"
            name="terms"
            className="mt-1 size-4 rounded border-neutral-300 text-neutral-600 focus:ring-neutral-500"
          />
          <span>
            By creating an account you agree to our{' '}
            <Link href="/legal/terms" className="font-semibold text-neutral-700 hover:text-neutral-900">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/legal/privacy" className="font-semibold text-neutral-700 hover:text-neutral-900">
              Privacy Policy
            </Link>
            .
          </span>
        </div>

        <Button type="submit" className="w-full bg-neutral-900 py-3 text-sm font-semibold text-white hover:bg-neutral-800">
          Create Account
        </Button>
      </form>

      <div className="flex items-center gap-3 text-xs text-neutral-400">
        <span className="h-px flex-1 bg-neutral-200" />
        <span>Or sign up with</span>
        <span className="h-px flex-1 bg-neutral-200" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <form action={signInWithProvider}>
          <input type="hidden" name="provider" value="google" />
          <Button
            type="submit"
            variant="outline"
            className="h-12 w-full justify-center gap-2 border-neutral-300 text-sm font-medium text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50"
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
            className="h-12 w-full justify-center gap-2 border-neutral-300 text-sm font-medium text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50"
          >
            <span className="fa-brands fa-github text-neutral-500" aria-hidden />
            GitHub
          </Button>
        </form>
      </div>

      <p className="text-center text-sm text-neutral-600">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-neutral-800 hover:text-neutral-900">
          Sign in
        </Link>
      </p>
    </div>
  );
}
