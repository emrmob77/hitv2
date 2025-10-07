import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { SignupForm } from '@/components/auth/signup-form';

const planHighlights = [
  {
    title: 'Unlimited bookmarks',
    description: 'Save every article, video, and inspiration without worrying about storage limits.',
  },
  {
    title: 'Collaborative collections',
    description: 'Curate living libraries with teammates, partners, or your community in real time.',
  },
  {
    title: 'SEO-ready landing pages',
    description: 'Publish public collections that rank, convert, and grow your audience organically.',
  },
];

export default async function SignupPage() {
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
        <section className="order-2 mx-auto max-w-xl space-y-8 text-center lg:order-1 lg:mx-0 lg:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-600 shadow-sm">
            Premium Studio
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold leading-tight text-neutral-900 sm:text-5xl">
              Launch your best collections—and monetize the ones that convert.
            </h1>
            <p className="text-base text-neutral-600">
              Sign up to unlock affiliate-ready links, premium content drops, and analytics dashboards designed for
              professional curators.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {planHighlights.map((item) => (
              <div key={item.title} className="rounded-3xl border border-neutral-200 bg-white/90 p-6 shadow-md backdrop-blur">
                <p className="text-sm font-semibold text-neutral-800">{item.title}</p>
                <p className="mt-2 text-xs text-neutral-500">{item.description}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-neutral-500">
            Ready to explore the tiers?{' '}
            <Link href="/pricing" className="font-semibold text-neutral-800 hover:text-neutral-900">
              Compare Free vs Pro →
            </Link>
          </p>
        </section>

        <aside className="order-1 w-full max-w-md mx-auto lg:order-2 lg:mx-0">
          <div className="rounded-3xl border border-neutral-200 bg-white/95 p-8 shadow-xl backdrop-blur">
            <SignupForm />
          </div>
        </aside>
      </div>
    </main>
  );
}
