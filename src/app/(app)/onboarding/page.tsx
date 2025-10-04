import { Metadata } from 'next';

import { OnboardingForm } from '@/components/auth/onboarding-form';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Onboarding',
};

export default async function OnboardingPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, username, bio')
    .eq('id', user?.id ?? '')
    .single();

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-6 py-16 lg:px-12">
      <div className="space-y-3">
        <span className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--hit-secondary)]">
          Welcome aboard
        </span>
        <h1 className="text-4xl font-semibold text-neutral-900">Complete your profile</h1>
        <p className="text-sm text-neutral-600">
          Pick a username and tell the community who you are. These details will appear on your profile and collections.
        </p>
      </div>
      <div className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-xl">
        <OnboardingForm
          defaultValues={{
            displayName: profile?.display_name ?? '',
            username: profile?.username ?? '',
            bio: profile?.bio ?? '',
          }}
        />
      </div>
    </div>
  );
}
