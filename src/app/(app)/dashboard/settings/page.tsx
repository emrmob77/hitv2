import { Metadata } from 'next';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProfileSettingsForm } from '@/components/settings/profile-settings-form';
import { AccountSettingsSection } from '@/components/settings/account-settings-section';
import { PrivacySettingsSection } from '@/components/settings/privacy-settings-section';
import { NotificationSettingsSection } from '@/components/settings/notification-settings-section';
import { DataExportSection } from '@/components/settings/data-export-section';
import { DangerZoneSection } from '@/components/settings/danger-zone-section';
import { BillingSubscriptionSection } from '@/components/settings/billing-subscription-section';
import { CheckoutSuccessBanner } from '@/components/settings/checkout-success-banner';
import { FeatureGate } from '@/lib/features/feature-gate';

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Manage your account settings and preferences',
};

export default async function SettingsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Fetch usage stats
  const { data: bookmarks } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('user_id', user.id);

  const { data: collections } = await supabase
    .from('collections')
    .select('id')
    .eq('user_id', user.id);

  const bookmarkCount = bookmarks?.length || 0;
  const collectionCount = collections?.length || 0;

  // Get subscription tier
  const featureGate = FeatureGate.fromProfile(profile || {});
  const currentTier = featureGate.getTier();

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="mx-auto w-full max-w-5xl space-y-2">
        <h1 className="text-3xl font-semibold text-neutral-900">Settings</h1>
        <p className="text-sm text-neutral-600">
          Manage your account settings and preferences
        </p>
      </header>

      {/* Success/Portal Messages */}
      <div className="mx-auto w-full max-w-5xl">
        <CheckoutSuccessBanner />
      </div>

      {/* Profile Settings */}
      <div className="mx-auto w-full max-w-5xl">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Update your profile details and public information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileSettingsForm profile={profile} />
          </CardContent>
        </Card>
      </div>

      {/* Account Settings */}
      <div className="mx-auto w-full max-w-5xl">
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>
              Manage your email and password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AccountSettingsSection user={user} />
          </CardContent>
        </Card>
      </div>

      {/* Privacy Settings */}
      <div className="mx-auto w-full max-w-5xl">
        <Card>
          <CardHeader>
            <CardTitle>Privacy & Visibility</CardTitle>
            <CardDescription>
              Control who can see your profile and bookmarks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PrivacySettingsSection profile={profile} />
          </CardContent>
        </Card>
      </div>

      {/* Billing & Subscription */}
      <div className="mx-auto w-full max-w-5xl">
        <Card>
          <CardHeader>
            <CardTitle>Billing & Subscription</CardTitle>
            <CardDescription>
              Manage your subscription plan and usage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BillingSubscriptionSection
              currentTier={currentTier}
              bookmarkCount={bookmarkCount}
              collectionCount={collectionCount}
            />
          </CardContent>
        </Card>
      </div>

      {/* Notification Settings */}
      <div className="mx-auto w-full max-w-5xl">
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Manage your notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NotificationSettingsSection profile={profile} />
          </CardContent>
        </Card>
      </div>

      {/* Data & Privacy */}
      <div className="mx-auto w-full max-w-5xl">
        <Card>
          <CardHeader>
            <CardTitle>Data Export</CardTitle>
            <CardDescription>
              Download your data and content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataExportSection userId={user.id} />
          </CardContent>
        </Card>
      </div>

      {/* Danger Zone */}
      <div className="mx-auto w-full max-w-5xl">
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader>
            <CardTitle className="text-red-900">Danger Zone</CardTitle>
            <CardDescription className="text-red-700">
              Irreversible actions - proceed with caution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DangerZoneSection userId={user.id} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
