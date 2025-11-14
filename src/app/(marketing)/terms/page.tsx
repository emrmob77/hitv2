import { Metadata } from 'next';
import { FileText, CheckCircle, Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service - HitTags',
  description: 'Terms and conditions for using HitTags services.',
};

export default function TermsPage() {
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
              <FileText className="mr-2 h-4 w-4 text-blue-600" />
              Terms of Service
            </div>
            <h1 className="mb-6 text-5xl font-bold text-slate-900 md:text-6xl">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Terms of Service
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
            <h2 className="mb-4 text-3xl font-bold text-slate-900">1. Acceptance of Terms</h2>
            <p className="mb-8 text-slate-600">
              By accessing and using HitTags, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, you should not use our services.
            </p>

            <h2 className="mb-4 text-3xl font-bold text-slate-900">2. Use License</h2>
            <p className="mb-6 text-slate-600">
              Permission is granted to temporarily download one copy of the materials on HitTags for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="mb-8 space-y-2 text-slate-600">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose</li>
              <li>Attempt to decompile or reverse engineer any software</li>
              <li>Remove any copyright or proprietary notations</li>
              <li>Transfer the materials to another person</li>
            </ul>

            <h2 className="mb-4 text-3xl font-bold text-slate-900">3. User Accounts</h2>
            <p className="mb-6 text-slate-600">
              When you create an account with us, you must provide accurate, complete, and current information. You are responsible for:
            </p>
            <ul className="mb-8 space-y-2 text-slate-600">
              <li>Maintaining the security of your account</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized use</li>
            </ul>

            <h2 className="mb-4 text-3xl font-bold text-slate-900">4. User Content</h2>
            <p className="mb-8 text-slate-600">
              You retain all rights to any content you submit, post, or display on or through the service. By submitting content, you grant us a worldwide, non-exclusive, royalty-free license to use, copy, reproduce, process, adapt, modify, publish, transmit, display, and distribute such content.
            </p>

            <h2 className="mb-4 text-3xl font-bold text-slate-900">5. Prohibited Uses</h2>
            <p className="mb-6 text-slate-600">
              You may not use HitTags:
            </p>
            <ul className="mb-8 space-y-2 text-slate-600">
              <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
              <li>To violate any international, federal, provincial, or state regulations</li>
              <li>To infringe upon or violate our intellectual property rights</li>
              <li>To harass, abuse, insult, harm, defame, slander, or intimidate</li>
              <li>To upload or transmit viruses or malicious code</li>
              <li>To spam, phish, or perform any automated use of the system</li>
            </ul>

            <h2 className="mb-4 text-3xl font-bold text-slate-900">6. Termination</h2>
            <p className="mb-8 text-slate-600">
              We may terminate or suspend your account immediately, without prior notice or liability, for any reason, including breach of these Terms. Upon termination, your right to use the service will immediately cease.
            </p>

            <h2 className="mb-4 text-3xl font-bold text-slate-900">7. Limitation of Liability</h2>
            <p className="mb-8 text-slate-600">
              In no event shall HitTags, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your access to or use of the service.
            </p>

            <h2 className="mb-4 text-3xl font-bold text-slate-900">8. Governing Law</h2>
            <p className="mb-8 text-slate-600">
              These Terms shall be governed and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.
            </p>

            <h2 className="mb-4 text-3xl font-bold text-slate-900">9. Changes to Terms</h2>
            <p className="mb-8 text-slate-600">
              We reserve the right to modify or replace these Terms at any time. We will provide notice of any material changes by posting the new Terms on this page.
            </p>

            <h2 className="mb-4 text-3xl font-bold text-slate-900">10. Contact Us</h2>
            <p className="text-slate-600">
              If you have any questions about these Terms, please contact us at <a href="mailto:legal@hittags.com" className="font-semibold text-blue-600 hover:text-blue-700">legal@hittags.com</a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
