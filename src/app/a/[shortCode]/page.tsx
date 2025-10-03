import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';

interface AffiliateRedirectPageProps {
  params: {
    shortCode: string;
  };
}

export default async function AffiliateRedirectPage({
  params,
}: AffiliateRedirectPageProps) {
  const { shortCode } = params;
  const supabase = await createSupabaseServerClient();

  // Get affiliate link by short code
  const { data: affiliateLink, error } = await supabase
    .from('affiliate_links')
    .select('*')
    .eq('short_code', shortCode)
    .single();

  // If not found, inactive, or expired, redirect to home
  if (error || !affiliateLink || !affiliateLink.is_active) {
    redirect('/');
  }

  // Check if link is expired
  if (affiliateLink.expires_at && new Date(affiliateLink.expires_at) < new Date()) {
    // Auto-disable expired link
    await supabase
      .from('affiliate_links')
      .update({ is_active: false })
      .eq('id', affiliateLink.id);

    redirect('/');
  }

  // Basic fraud detection - check for suspicious activity
  const recentClicksCount = await supabase
    .from('affiliate_clicks')
    .select('id', { count: 'exact', head: true })
    .eq('affiliate_link_id', affiliateLink.id)
    .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()); // Last hour

  // If more than 100 clicks in the last hour, might be suspicious
  const isSuspicious = (recentClicksCount.count || 0) > 100;

  // Track the click
  await supabase.from('affiliate_clicks').insert({
    affiliate_link_id: affiliateLink.id,
    visitor_ip: null, // IP tracking can be added with middleware
    user_agent: null,
    referrer: null,
    converted: false,
  });

  // If suspicious, could log or notify admin, but still redirect
  if (isSuspicious) {
    console.warn(`Suspicious activity detected for affiliate link: ${affiliateLink.id}`);
    // In production, you might want to:
    // - Send notification to admin
    // - Temporarily disable the link
    // - Require CAPTCHA verification
  }

  // Redirect to affiliate URL
  redirect(affiliateLink.affiliate_url);
}
