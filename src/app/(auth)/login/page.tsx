import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { LoginForm } from '@/components/auth/login-form';

const tagSuggestions = ['#frontend', '#design', '#marketing', '#product'];

export default async function LoginPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If user is already logged in, redirect to dashboard
  if (user) {
    redirect('/dashboard');
  }
  return (
    <main className="relative overflow-hidden bg-neutral-50 py-20">
      <div className="pointer-events-none absolute inset-y-12 left-1/2 hidden w-[620px] -translate-x-1/2 rounded-full bg-gradient-to-br from-[rgba(63,32,251,0.08)] via-[rgba(55,48,163,0.05)] to-transparent blur-3xl lg:block" />

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-8 lg:grid-cols-2 lg:gap-20 lg:place-items-center">
        <section className="mx-auto max-w-xl space-y-8 text-center lg:mx-0 lg:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-600 shadow-sm">
            HitTags Community
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold leading-tight text-neutral-900 sm:text-5xl">
              Save smarter. Share faster. Grow your reach.
            </h1>
            <p className="text-base text-neutral-600">
              HitTags keeps your must-read links, research, and inspiration tidy. Build SEO-friendly collections,
              surface premium drops, and understand what your followers love—all in one place.
            </p>
          </div>
          <div className="rounded-3xl border border-neutral-200 bg-white/90 p-6 shadow-md backdrop-blur">
            <p className="text-sm font-semibold text-neutral-800">Recommended topics to follow</p>
            <p className="mt-2 text-sm text-neutral-500">
              Pick a few tags to personalize your discovery feed from day one.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs font-medium text-neutral-600 lg:justify-start">
              {tagSuggestions.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-neutral-200 bg-neutral-100/80 px-3 py-1 transition hover:border-neutral-300 hover:bg-neutral-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <p className="text-sm text-neutral-500">
            Thinking about upgrading?{' '}
            <Link href="/pricing" className="font-semibold text-neutral-800 hover:text-neutral-900">
              See what&apos;s new in Pro →
            </Link>
          </p>
        </section>

        <aside className="w-full max-w-md mx-auto lg:mx-0">
          <div className="rounded-3xl border border-neutral-200 bg-white/95 p-8 shadow-xl backdrop-blur">
            <LoginForm />
          </div>
        </aside>
      </div>
    </main>
  );
}
