import { createSupabaseServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { BrandPartnershipsClient } from './client';

export const metadata = {
  title: 'Brand Partnerships | Dashboard',
  description: 'Manage your brand partnerships and sponsored content',
};

export default async function BrandPartnershipsPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch brand partnerships
  const { data: partnerships } = await supabase
    .from('brand_partnerships')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // Fetch sponsored content
  const { data: sponsoredContent } = await supabase
    .from('sponsored_content')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <BrandPartnershipsClient
      partnerships={partnerships || []}
      sponsoredContent={sponsoredContent || []}
    />
  );
}
