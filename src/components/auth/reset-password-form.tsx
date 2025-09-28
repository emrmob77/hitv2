'use client';

import { useActionState } from 'react';

import { resetPasswordAction, type ResetFormState } from '@/app/(auth)/reset-password/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const initialState: ResetFormState = {};

export function ResetPasswordForm() {
  const [state, formAction] = useActionState(resetPasswordAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-neutral-700">
          Email
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
      {state?.error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {state.error}
        </p>
      ) : null}
      {state?.success ? (
        <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          A password reset link has been sent to your inbox.
        </p>
      ) : null}
      <Button type="submit" className="w-full bg-[var(--hit-primary)] text-white hover:bg-[var(--hit-primary-dark)]">
        Send reset link
      </Button>
    </form>
  );
}
