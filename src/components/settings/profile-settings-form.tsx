'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface ProfileSettingsFormProps {
  profile: any;
}

export function ProfileSettingsForm({ profile }: ProfileSettingsFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: profile?.username || '',
    display_name: profile?.display_name || '',
    bio: profile?.bio || '',
    website_url: profile?.website_url || '',
    twitter_handle: profile?.twitter_handle || '',
    github_handle: profile?.github_handle || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate and normalize website URL
      let websiteUrl = formData.website_url.trim();
      if (websiteUrl && !websiteUrl.startsWith('http://') && !websiteUrl.startsWith('https://')) {
        websiteUrl = 'https://' + websiteUrl;
      }

      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: formData.display_name,
          bio: formData.bio,
          website_url: websiteUrl || null,
          twitter_handle: formData.twitter_handle,
          github_handle: formData.github_handle,
        })
        .eq('id', profile.id);

      if (error) throw error;

      toast.success('Profile updated successfully');

      // Update local form data with normalized URL
      if (websiteUrl !== formData.website_url) {
        setFormData({ ...formData, website_url: websiteUrl });
      }

      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          value={formData.username}
          disabled
          className="bg-neutral-50"
        />
        <p className="text-xs text-muted-foreground">
          Username cannot be changed
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="display_name">Display Name</Label>
        <Input
          id="display_name"
          value={formData.display_name}
          onChange={(e) =>
            setFormData({ ...formData, display_name: e.target.value })
          }
          placeholder="Your display name"
          maxLength={50}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          placeholder="Tell us about yourself"
          maxLength={160}
          rows={3}
        />
        <p className="text-xs text-muted-foreground">
          {formData.bio.length}/160 characters
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="website_url">Website</Label>
        <Input
          id="website_url"
          type="text"
          value={formData.website_url}
          onChange={(e) =>
            setFormData({ ...formData, website_url: e.target.value })
          }
          placeholder="https://example.com"
        />
        <p className="text-xs text-muted-foreground">
          Enter a full URL (e.g., https://example.com)
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="twitter_handle">Twitter Handle</Label>
          <Input
            id="twitter_handle"
            value={formData.twitter_handle}
            onChange={(e) =>
              setFormData({ ...formData, twitter_handle: e.target.value })
            }
            placeholder="username"
            maxLength={15}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="github_handle">GitHub Handle</Label>
          <Input
            id="github_handle"
            value={formData.github_handle}
            onChange={(e) =>
              setFormData({ ...formData, github_handle: e.target.value })
            }
            placeholder="username"
            maxLength={39}
          />
        </div>
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save Changes'}
      </Button>
    </form>
  );
}
