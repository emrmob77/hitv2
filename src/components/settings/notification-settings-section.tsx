'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface NotificationSettingsSectionProps {
  profile: any;
}

export function NotificationSettingsSection({ profile }: NotificationSettingsSectionProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    email_on_follow: profile?.email_on_follow !== false,
    email_on_comment: profile?.email_on_comment !== false,
    email_on_like: profile?.email_on_like || false,
    email_on_mention: profile?.email_on_mention !== false,
    email_weekly_digest: profile?.email_weekly_digest !== false,
    email_marketing: profile?.email_marketing || false,
  });

  const handleSave = async () => {
    setIsLoading(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from('profiles')
        .update({
          email_on_follow: settings.email_on_follow,
          email_on_comment: settings.email_on_comment,
          email_on_like: settings.email_on_like,
          email_on_mention: settings.email_on_mention,
          email_weekly_digest: settings.email_weekly_digest,
          email_marketing: settings.email_marketing,
        })
        .eq('id', profile.id);

      if (error) throw error;

      toast.success('Notification settings updated');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update settings');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>New Follower</Label>
          <p className="text-sm text-muted-foreground">
            Receive email when someone follows you
          </p>
        </div>
        <Switch
          checked={settings.email_on_follow}
          onCheckedChange={(checked) =>
            setSettings({ ...settings, email_on_follow: checked })
          }
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Comments</Label>
          <p className="text-sm text-muted-foreground">
            Receive email when someone comments on your content
          </p>
        </div>
        <Switch
          checked={settings.email_on_comment}
          onCheckedChange={(checked) =>
            setSettings({ ...settings, email_on_comment: checked })
          }
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Likes</Label>
          <p className="text-sm text-muted-foreground">
            Receive email when someone likes your content
          </p>
        </div>
        <Switch
          checked={settings.email_on_like}
          onCheckedChange={(checked) =>
            setSettings({ ...settings, email_on_like: checked })
          }
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Mentions</Label>
          <p className="text-sm text-muted-foreground">
            Receive email when someone mentions you
          </p>
        </div>
        <Switch
          checked={settings.email_on_mention}
          onCheckedChange={(checked) =>
            setSettings({ ...settings, email_on_mention: checked })
          }
        />
      </div>

      <div className="border-t pt-6">
        <h3 className="mb-4 text-sm font-medium">Digest & Marketing</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Weekly Digest</Label>
              <p className="text-sm text-muted-foreground">
                Receive weekly summary of trending bookmarks
              </p>
            </div>
            <Switch
              checked={settings.email_weekly_digest}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, email_weekly_digest: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Marketing Emails</Label>
              <p className="text-sm text-muted-foreground">
                Receive news, updates, and promotional emails
              </p>
            </div>
            <Switch
              checked={settings.email_marketing}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, email_marketing: checked })
              }
            />
          </div>
        </div>
      </div>

      <Button onClick={handleSave} disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save Notification Settings'}
      </Button>
    </div>
  );
}
