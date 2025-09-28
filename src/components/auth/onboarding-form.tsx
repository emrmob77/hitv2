'use client';

import { useActionState } from 'react';

import { completeOnboardingAction, type OnboardingFormState } from '@/app/(app)/onboarding/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type OnboardingFormProps = {
  defaultValues: {
    displayName: string;
    username: string;
    bio: string;
  };
};

const initialState: OnboardingFormState = {};

export function OnboardingForm({ defaultValues }: OnboardingFormProps) {
  const [state, formAction] = useActionState(completeOnboardingAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="displayName" className="text-sm font-medium text-neutral-700">
            Display name
          </label>
          <Input
            id="displayName"
            name="displayName"
            defaultValue={defaultValues.displayName}
            placeholder="e.g. Jane Doe"
            required
            className="bg-neutral-50"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="username" className="text-sm font-medium text-neutral-700">
            Username
          </label>
          <Input
            id="username"
            name="username"
            defaultValue={defaultValues.username}
            placeholder="@janedoe"
            required
            pattern="^[a-zA-Z0-9_\.\-]{3,32}$"
            className="bg-neutral-50"
          />
          <p className="text-xs text-neutral-400">Use 3-32 characters. Letters, numbers, dots, hyphens, and underscores are allowed.</p>
        </div>
      </div>
      <div className="space-y-2">
        <label htmlFor="bio" className="text-sm font-medium text-neutral-700">
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          defaultValue={defaultValues.bio}
          rows={4}
          className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm focus:border-[var(--hit-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--hit-primary)]"
          placeholder="Tell the community what you plan to curate with HitTags."
        />
      </div>
      {state?.error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {state.error}
        </p>
      ) : null}
      <Button
        type="submit"
        className="bg-[var(--hit-secondary)] text-white hover:bg-[var(--hit-secondary-dark)]"
      >
        Save profile and continue
      </Button>
    </form>
  );
}
