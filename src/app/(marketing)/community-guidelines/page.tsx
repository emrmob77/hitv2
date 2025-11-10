import { Metadata } from 'next';
import Link from 'next/link';
import { Shield, Heart, Users, AlertTriangle, Scale, Lock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export const metadata: Metadata = {
  title: 'Community Guidelines',
  description: 'Rules and guidelines for the HitTags community',
};

export default function CommunityGuidelinesPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      {/* Header */}
      <header className="mb-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
          <Shield className="h-8 w-8 text-blue-600" />
        </div>
        <h1 className="mb-4 text-4xl font-bold text-neutral-900">Community Guidelines</h1>
        <p className="text-lg text-neutral-600">
          Building a safe, respectful, and vibrant community together
        </p>
      </header>

      {/* Core Values */}
      <div className="mb-12 grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="text-center">
            <Heart className="mx-auto mb-2 h-8 w-8 text-red-500" />
            <CardTitle>Be Respectful</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-sm text-neutral-600">
            Treat everyone with kindness and respect, even when you disagree
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <Users className="mx-auto mb-2 h-8 w-8 text-blue-500" />
            <CardTitle>Be Helpful</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-sm text-neutral-600">
            Share knowledge, curate quality content, and contribute positively
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <Lock className="mx-auto mb-2 h-8 w-8 text-green-500" />
            <CardTitle>Be Safe</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-sm text-neutral-600">
            Protect your privacy and respect the privacy of others
          </CardContent>
        </Card>
      </div>

      {/* Guidelines */}
      <div className="space-y-8">
        <section>
          <h2 className="mb-4 text-2xl font-bold text-neutral-900">What We Encourage</h2>
          <Card>
            <CardContent className="pt-6">
              <ul className="space-y-3 text-neutral-700">
                <li className="flex items-start gap-3">
                  <span className="text-green-600">✓</span>
                  <span>Share high-quality, relevant bookmarks and content</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600">✓</span>
                  <span>Curate collections that provide value to others</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600">✓</span>
                  <span>Engage in constructive discussions and feedback</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600">✓</span>
                  <span>Properly attribute content and respect intellectual property</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600">✓</span>
                  <span>Report violations of these guidelines</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600">✓</span>
                  <span>Use affiliate links transparently and ethically</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-bold text-neutral-900">What's Not Allowed</h2>
          <Card className="border-red-200">
            <CardContent className="pt-6">
              <ul className="space-y-4">
                <li>
                  <h3 className="mb-2 font-semibold text-red-900">Spam and Manipulation</h3>
                  <p className="text-sm text-neutral-600">
                    Don't post repetitive content, engage in vote manipulation, or use bots. Quality
                    over quantity.
                  </p>
                </li>
                <li>
                  <h3 className="mb-2 font-semibold text-red-900">Harassment and Hate Speech</h3>
                  <p className="text-sm text-neutral-600">
                    No bullying, threats, hate speech, or discrimination based on race, religion,
                    gender, sexual orientation, or any other protected characteristic.
                  </p>
                </li>
                <li>
                  <h3 className="mb-2 font-semibold text-red-900">Inappropriate Content</h3>
                  <p className="text-sm text-neutral-600">
                    No adult content, graphic violence, or anything illegal. Keep it safe for work.
                  </p>
                </li>
                <li>
                  <h3 className="mb-2 font-semibold text-red-900">Copyright Violations</h3>
                  <p className="text-sm text-neutral-600">
                    Don't share pirated content or violate intellectual property rights. Respect
                    creators.
                  </p>
                </li>
                <li>
                  <h3 className="mb-2 font-semibold text-red-900">Misinformation</h3>
                  <p className="text-sm text-neutral-600">
                    Don't deliberately spread false information, especially about health, safety, or
                    current events.
                  </p>
                </li>
                <li>
                  <h3 className="mb-2 font-semibold text-red-900">Personal Information</h3>
                  <p className="text-sm text-neutral-600">
                    Don't share others' private information (doxxing) or engage in privacy violations.
                  </p>
                </li>
              </ul>
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-bold text-neutral-900">Enforcement</h2>
          <Card>
            <CardContent className="space-y-4 pt-6">
              <p className="text-neutral-700">
                Violations of these guidelines may result in:
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <h3 className="mb-2 font-semibold text-neutral-900">First Offense</h3>
                  <p className="text-sm text-neutral-600">Warning and content removal</p>
                </div>

                <div className="rounded-lg border p-4">
                  <h3 className="mb-2 font-semibold text-neutral-900">Repeat Violations</h3>
                  <p className="text-sm text-neutral-600">
                    Temporary suspension (3-30 days)
                  </p>
                </div>

                <div className="rounded-lg border p-4">
                  <h3 className="mb-2 font-semibold text-neutral-900">Serious Violations</h3>
                  <p className="text-sm text-neutral-600">Immediate permanent ban</p>
                </div>

                <div className="rounded-lg border p-4">
                  <h3 className="mb-2 font-semibold text-neutral-900">Illegal Activity</h3>
                  <p className="text-sm text-neutral-600">Ban and report to authorities</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-bold text-neutral-900">Appeals Process</h2>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-blue-600" />
                <CardTitle>Think we made a mistake?</CardTitle>
              </div>
              <CardDescription>You have the right to appeal moderation decisions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="list-inside list-decimal space-y-2 text-neutral-700">
                <li>Submit an appeal through your account settings within 30 days</li>
                <li>Provide a clear explanation of why you believe the decision was incorrect</li>
                <li>Our moderation team will review your appeal within 5 business days</li>
                <li>You'll receive a final decision via email</li>
              </ol>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Note</AlertTitle>
                <AlertDescription>
                  Repeated frivolous appeals may result in the appeal privilege being revoked.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-bold text-neutral-900">Reporting Violations</h2>
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <p className="mb-4 text-neutral-700">
                If you see content or behavior that violates these guidelines:
              </p>

              <ol className="mb-4 list-inside list-decimal space-y-2 text-neutral-700">
                <li>Click the "Report" button on the content</li>
                <li>Select the appropriate reason for reporting</li>
                <li>Provide additional details if necessary</li>
                <li>Our moderation team will review within 24 hours</li>
              </ol>

              <p className="text-sm text-neutral-600">
                You can also report urgent safety issues to{' '}
                <a href="mailto:safety@hittags.com" className="text-blue-600 hover:underline">
                  safety@hittags.com
                </a>
              </p>
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-bold text-neutral-900">Updates to Guidelines</h2>
          <p className="mb-4 text-neutral-700">
            These guidelines may be updated from time to time. We'll notify users of significant
            changes via email and in-app notifications. Continued use of HitTags after changes
            constitutes acceptance of the updated guidelines.
          </p>
          <p className="text-sm text-neutral-500">Last updated: {new Date().toLocaleDateString()}</p>
        </section>
      </div>

      {/* Footer CTA */}
      <div className="mt-12 text-center">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
