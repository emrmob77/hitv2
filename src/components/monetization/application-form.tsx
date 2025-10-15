'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

interface MonetizationApplicationFormProps {
  currentMetrics: {
    followers: number;
    bookmarks: number;
    views: number;
    likes: number;
    collections: number;
  };
  requirements: {
    followers: { required: number; current: number };
    bookmarks: { required: number; current: number };
    views: { required: number; current: number };
    engagements: { required: number; current: number };
  };
}

export function MonetizationApplicationForm({
  currentMetrics,
  requirements,
}: MonetizationApplicationFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if all requirements are met
  const allRequirementsMet =
    currentMetrics.followers >= requirements.followers.required &&
    currentMetrics.bookmarks >= requirements.bookmarks.required &&
    currentMetrics.views >= requirements.views.required &&
    currentMetrics.likes >= requirements.engagements.required;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/monetization/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit application');
      }

      toast.success('Application submitted successfully!');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Apply for Creator Monetization</CardTitle>
        <CardDescription>
          Start earning revenue from your content through our creator program
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Eligibility Status */}
        {allRequirementsMet ? (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-900">
              Congratulations! You meet all requirements and can apply for monetization.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You need to meet all requirements before applying. Continue creating quality content
              and growing your community.
            </AlertDescription>
          </Alert>
        )}

        {/* What You'll Get */}
        <div className="space-y-3">
          <h3 className="font-medium text-neutral-900">What you'll get:</h3>
          <ul className="space-y-2 text-sm text-neutral-600">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 mt-0.5 text-green-600" />
              <span>Up to 80% revenue share based on your quality score</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 mt-0.5 text-green-600" />
              <span>Access to sponsored content opportunities</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 mt-0.5 text-green-600" />
              <span>Direct brand partnership placements</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 mt-0.5 text-green-600" />
              <span>Transparent earnings dashboard and analytics</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 mt-0.5 text-green-600" />
              <span>Monthly payouts (minimum $100)</span>
            </li>
          </ul>
        </div>

        {/* Guidelines */}
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
          <h3 className="font-medium text-neutral-900 mb-2">Application Guidelines</h3>
          <ul className="space-y-1 text-sm text-neutral-600">
            <li>• Maintain high-quality, original content</li>
            <li>• Follow community guidelines and platform policies</li>
            <li>• Engage authentically with your audience</li>
            <li>• Properly disclose sponsored content</li>
            <li>• Respond to feedback and maintain good standing</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={handleSubmit}
            disabled={!allRequirementsMet || isSubmitting}
            size="lg"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </Button>
          {!allRequirementsMet && (
            <Button variant="outline" size="lg" asChild>
              <a href="/dashboard">Go to Dashboard</a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
