import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@/lib/supabase/types';

const normalizeUsername = (raw: string) =>
  raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '')
    .replace(/^_+/, '')
    .slice(0, 32);

export async function ensureUserProfile(
  supabase: SupabaseClient<Database>
): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  if (!existingProfile) {
    const metadata = user.user_metadata ?? {};

    const fallbackBase =
      (typeof metadata.username === 'string' && metadata.username) ||
      (typeof metadata.preferred_username === 'string' && metadata.preferred_username) ||
      (typeof metadata.user_name === 'string' && metadata.user_name) ||
      (typeof metadata.full_name === 'string' && metadata.full_name) ||
      (typeof user.email === 'string' && user.email.split('@')[0]) ||
      `user${user.id.slice(0, 6)}`;

    const baseUsername = normalizeUsername(fallbackBase) || `user${user.id.slice(0, 6)}`;

    const displayName =
      (typeof metadata.full_name === 'string' && metadata.full_name) ||
      (typeof metadata.name === 'string' && metadata.name) ||
      baseUsername;

    const avatarUrl =
      (typeof metadata.avatar_url === 'string' && metadata.avatar_url) ||
      (typeof metadata.picture === 'string' && metadata.picture) ||
      null;

    let finalUsername = baseUsername;

    for (let attempt = 0; attempt < 6; attempt++) {
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          username: finalUsername,
          display_name: displayName,
          avatar_url: avatarUrl,
        });

      if (!insertError) {
        break;
      }

      if (insertError.code === '23505') {
        finalUsername = `${baseUsername}${attempt + 1}`;
        continue;
      }

      console.error('Profile insert error:', insertError);
      break;
    }
  }

  const { data: existingSettings } = await supabase
    .from('user_settings')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!existingSettings) {
    const { error: settingsError } = await supabase
      .from('user_settings')
      .insert({ user_id: user.id });

    if (settingsError) {
      console.error('User settings insert error:', settingsError);
    }
  }
}
