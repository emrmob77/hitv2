'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface PrivacySettingsSectionProps {
  profile: any;
}

export function PrivacySettingsSection({ profile }: PrivacySettingsSectionProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    show_email: profile?.show_email || false,
    allow_indexing: profile?.allow_indexing !== false, // Default true
    show_activity: profile?.show_activity !== false, // Default true
  });

  const handleSave = async () => {
    setIsLoading(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from('profiles')
        .update({
          show_email: settings.show_email,
          allow_indexing: settings.allow_indexing,
          show_activity: settings.show_activity,
        })
        .eq('id', profile.id);

      if (error) throw error;

      toast.success('Privacy settings updated');
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
          <Label>Show Email on Profile</Label>
          <p className="text-sm text-muted-foreground">
            Display your email address on your public profile
          </p>
        </div>
        <Switch
          checked={settings.show_email}
          onCheckedChange={(checked) =>
            setSettings({ ...settings, show_email: checked })
          }
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Allow Search Engine Indexing</Label>
          <p className="text-sm text-muted-foreground">
            Allow search engines to index your public profile and bookmarks
          </p>
        </div>
        <Switch
          checked={settings.allow_indexing}
          onCheckedChange={(checked) =>
            setSettings({ ...settings, allow_indexing: checked })
          }
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Show Activity</Label>
          <p className="text-sm text-muted-foreground">
            Display your recent activity on your profile
          </p>
        </div>
        <Switch
          checked={settings.show_activity}
          onCheckedChange={(checked) =>
            setSettings({ ...settings, show_activity: checked })
          }
        />
      </div>

      <Button onClick={handleSave} disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save Privacy Settings'}
      </Button>
    </div>
  );
}
