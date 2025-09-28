import Link from 'next/link';

import { SignupForm } from '@/components/auth/signup-form';

export default function SignupPage() {
  return (
    <div className="flex w-full flex-col justify-center gap-12 px-6 py-16 lg:flex-row lg:px-12">
      <div className="flex flex-1 items-center justify-center">
        <SignupForm />
      </div>
      <div className="flex max-w-xl flex-1 flex-col justify-center gap-6">
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--hit-secondary)]">
          Premium Studio
        </span>
        <h1 className="text-4xl font-semibold text-neutral-900 lg:text-5xl">
          Publish polished collections and unlock subscription revenue.
        </h1>
        <p className="text-base text-neutral-600">
          HitTags Pro gives you unlimited bookmarks, collections, and analytics. HitTags Team adds collaboration, API access, and priority support.
        </p>
        <div className="rounded-3xl border border-neutral-200 bg-white/70 p-6 shadow-md">
          <p className="text-sm font-semibold text-neutral-700">Not sure which plan fits?</p>
          <p className="mt-2 text-xs text-neutral-500">
            Explore the Free, Pro, and Team tiers on the pricing page and pick the best match for your workflow.
          </p>
          <Link
            href="/pricing"
            className="mt-4 inline-flex items-center text-sm font-semibold text-[var(--hit-primary)] hover:text-[var(--hit-primary-dark)]"
          >
            Compare plans →
          </Link>
        </div>
        <div className="flex items-center gap-6 text-sm text-neutral-500">
          Already part of the HitTags community?
          <Link
            href="/login"
            className="font-semibold text-[var(--hit-accent)] transition hover:text-[var(--hit-primary)]"
          >
            Sign in →
          </Link>
        </div>
      </div>
    </div>
  );
}
