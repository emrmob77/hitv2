import { Metadata } from 'next';
import { Shield, Eye, Lock, FileText, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy - HitTags',
  description: 'Learn how HitTags collects, uses, and protects your personal information.',
};

export default function PrivacyPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 py-24">
        <div className="absolute inset-0">
          <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-blue-200 opacity-20 blur-3xl" />
          <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-purple-200 opacity-20 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-6 inline-flex items-center rounded-full bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 text-sm font-medium text-blue-900">
              <Shield className="mr-2 h-4 w-4 text-blue-600" />
              Privacy Policy
            </div>
            <h1 className="mb-6 text-5xl font-bold text-slate-900 md:text-6xl">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Your Privacy Matters
              </span>
            </h1>
            <p className="text-lg text-slate-600">
              Last updated: November 11, 2025
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg prose-slate max-w-none">
            <div className="mb-12 grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl border-2 border-slate-100 bg-white p-6 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                  <Lock className="h-6 w-6 text-white" />
                </div>
                <div className="text-sm font-semibold text-slate-900">GDPR Compliant</div>
              </div>
              <div className="rounded-2xl border-2 border-slate-100 bg-white p-6 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
                  <Eye className="h-6 w-6 text-white" />
                </div>
                <div className="text-sm font-semibold text-slate-900">Transparent</div>
              </div>
              <div className="rounded-2xl border-2 border-slate-100 bg-white p-6 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 shadow-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div className="text-sm font-semibold text-slate-900">Secure</div>
              </div>
            </div>

            <h2 className="mb-4 text-3xl font-bold text-slate-900">1. Information We Collect</h2>
            <p className="mb-6 text-slate-600">
              We collect information you provide directly to us, including when you create an account, use our services, or communicate with us. This includes:
            </p>
            <ul className="mb-8 space-y-2 text-slate-600">
              <li>Account information (name, email, password)</li>
              <li>Profile information (bio, avatar, preferences)</li>
              <li>Content you create (bookmarks, collections, comments)</li>
              <li>Usage data (how you interact with our service)</li>
            </ul>

            <h2 className="mb-4 text-3xl font-bold text-slate-900">2. How We Use Your Information</h2>
            <p className="mb-6 text-slate-600">
              We use the information we collect to:
            </p>
            <ul className="mb-8 space-y-2 text-slate-600">
              <li>Provide, maintain, and improve our services</li>
              <li>Personalize your experience</li>
              <li>Send you technical notices and support messages</li>
              <li>Communicate about products, services, and events</li>
              <li>Monitor and analyze trends and usage</li>
              <li>Detect, prevent, and address fraud and security issues</li>
            </ul>

            <h2 className="mb-4 text-3xl font-bold text-slate-900">3. Information Sharing</h2>
            <p className="mb-6 text-slate-600">
              We do not sell your personal information. We may share information in the following circumstances:
            </p>
            <ul className="mb-8 space-y-2 text-slate-600">
              <li>With your consent</li>
              <li>With service providers who assist in our operations</li>
              <li>To comply with legal obligations</li>
              <li>To protect rights, property, and safety</li>
              <li>In connection with a merger or acquisition</li>
            </ul>

            <h2 className="mb-4 text-3xl font-bold text-slate-900">4. Data Security</h2>
            <p className="mb-8 text-slate-600">
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes encryption, access controls, and regular security assessments.
            </p>

            <h2 className="mb-4 text-3xl font-bold text-slate-900">5. Your Rights</h2>
            <p className="mb-6 text-slate-600">
              You have the right to:
            </p>
            <ul className="mb-8 space-y-2 text-slate-600">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Delete your account and data</li>
              <li>Export your data</li>
              <li>Opt-out of marketing communications</li>
              <li>Object to processing of your information</li>
            </ul>

            <h2 className="mb-4 text-3xl font-bold text-slate-900">6. Cookies and Tracking</h2>
            <p className="mb-8 text-slate-600">
              We use cookies and similar tracking technologies to collect and use personal information about you. You can control cookies through your browser settings and other tools.
            </p>

            <h2 className="mb-4 text-3xl font-bold text-slate-900">7. Children's Privacy</h2>
            <p className="mb-8 text-slate-600">
              Our services are not directed to children under 13. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us.
            </p>

            <h2 className="mb-4 text-3xl font-bold text-slate-900">8. Changes to This Policy</h2>
            <p className="mb-8 text-slate-600">
              We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
            </p>

            <h2 className="mb-4 text-3xl font-bold text-slate-900">9. Contact Us</h2>
            <p className="text-slate-600">
              If you have questions about this privacy policy, please contact us at <a href="mailto:privacy@hittags.com" className="font-semibold text-blue-600 hover:text-blue-700">privacy@hittags.com</a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
