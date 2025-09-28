import Link from 'next/link';

import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
  return (
    <div className="flex w-full flex-col justify-center gap-12 px-6 py-16 lg:flex-row lg:px-12">
      <div className="flex max-w-xl flex-1 flex-col justify-center gap-6">
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--hit-primary)]">
          HitTags Community
        </span>
        <h1 className="text-4xl font-semibold text-neutral-900 lg:text-5xl">
          Built for curators. Organize your bookmarks in seconds.
        </h1>
        <p className="text-base text-neutral-600">
          Save the sources you trust, build collections, and grow your audience with premium drops. HitTags pairs a SEO-first foundation with powerful analytics.
        </p>
        <div className="rounded-3xl border border-neutral-200 bg-white/70 p-6 shadow-md">
          <p className="text-sm font-semibold text-neutral-700">Tag suggestions for newcomers</p>
          <p className="mt-2 text-xs text-neutral-500">
            Follow these topics to tailor your feed:
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {['#design', '#frontend', '#product', '#marketing'].map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[var(--hit-secondary)] bg-[var(--hit-secondary)]/10 px-3 py-1 font-medium text-[var(--hit-secondary-dark)]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-6 text-sm text-neutral-500">
          Thinking about upgrading?
          <Link
            href="/pricing"
            className="font-semibold text-[var(--hit-accent)] transition hover:text-[var(--hit-primary)]"
          >
            Explore pricing →
          </Link>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center">
        <LoginForm />
      </div>
    </div>
  );
}
