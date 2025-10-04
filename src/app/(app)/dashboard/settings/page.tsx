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

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="mx-auto w-full max-w-5xl space-y-2">
        <h1 className="text-3xl font-semibold text-neutral-900">Settings</h1>
        <p className="text-sm text-neutral-600">
          Manage your account settings and preferences
        </p>
      </header>

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

      {/* Subscription Info */}
      <div className="mx-auto w-full max-w-5xl">
        <Card>
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
            <CardDescription>
              Manage your subscription plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Current Plan</p>
                  <p className="text-sm text-muted-foreground">
                    {profile?.plan_type === 'free' && 'Free Plan'}
                    {profile?.plan_type === 'pro' && 'Pro Plan'}
                    {profile?.plan_type === 'enterprise' && 'Enterprise Plan'}
                  </p>
                </div>
                {profile?.plan_type === 'free' && (
                  <a
                    href="/pricing"
                    className="inline-flex items-center justify-center rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
                  >
                    Upgrade Plan
                  </a>
                )}
              </div>
            </div>
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
