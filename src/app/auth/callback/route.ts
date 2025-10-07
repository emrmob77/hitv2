import { NextResponse } from 'next/server';

import { ensureUserProfile } from '@/lib/profile';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/dashboard';

  if (code) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.exchangeCodeForSession(code);
    await ensureUserProfile(supabase);
  }

  return NextResponse.redirect(new URL(next, request.url));
}
