import Link from 'next/link';

import { ResetPasswordForm } from '@/components/auth/reset-password-form';

export default function ResetPasswordPage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-6 py-20 lg:px-12">
      <div className="space-y-3 text-center">
        <span className="inline-flex items-center justify-center rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--hit-primary)]">
          Password Reset
        </span>
        <h1 className="text-4xl font-semibold text-neutral-900">Reset your password</h1>
        <p className="mx-auto max-w-2xl text-sm text-neutral-600">
          Share your email address and we&apos;ll send you a reset link. If you&apos;re already signed in, you&apos;ll be redirected once you set a new password.
        </p>
      </div>
      <div className="mx-auto w-full max-w-lg rounded-3xl border border-neutral-200 bg-white p-8 shadow-xl">
        <ResetPasswordForm />
        <p className="mt-6 text-center text-xs text-neutral-500">
          Ready to get back into your account?{' '}
          <Link href="/login" className="font-semibold text-[var(--hit-primary)] hover:text-[var(--hit-primary-dark)]">
            Return to the sign-in page
          </Link>
        </p>
      </div>
    </div>
  );
}
