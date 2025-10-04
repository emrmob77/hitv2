import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeftIcon } from 'lucide-react';
import { revalidatePath } from 'next/cache';

export const metadata: Metadata = {
  title: 'Add Affiliate Link',
};

export default async function NewAffiliateLinkPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch user's bookmarks for selection
  const { data: bookmarks } = await supabase
    .from('bookmarks')
    .select('id, title, url')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(100);

  async function createAffiliateLink(formData: FormData) {
    'use server';

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect('/auth/login');
    }

    const bookmarkId = formData.get('bookmark_id') as string;
    const affiliateUrl = formData.get('affiliate_url') as string;
    const commissionRate = parseFloat(formData.get('commission_rate') as string);

    if (!bookmarkId || !affiliateUrl || isNaN(commissionRate)) {
      throw new Error('Tüm alanları doldurun');
    }

    // Get bookmark original URL
    const { data: bookmark, error: bookmarkError } = await supabase
      .from('bookmarks')
      .select('url')
      .eq('id', bookmarkId)
      .single();

    if (bookmarkError || !bookmark) {
      throw new Error('Yer imi bulunamadı');
    }

    const { error } = await supabase.from('affiliate_links').insert({
      user_id: user.id,
      bookmark_id: bookmarkId,
      original_url: bookmark.url,
      affiliate_url: affiliateUrl,
      commission_rate: commissionRate,
      total_clicks: 0,
      total_earnings: 0,
      conversion_count: 0,
      is_active: true,
    });

    if (error) {
      console.error('Failed to create affiliate link:', error);
      throw new Error('Affiliate link oluşturulamadı: ' + error.message);
    }

    revalidatePath('/dashboard/affiliate');
    redirect('/dashboard/affiliate');
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Header */}
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link href="/dashboard/affiliate">
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Affiliate Links
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Add Affiliate Link</h1>
        <p className="text-neutral-600">
          Add an affiliate link to one of your bookmarks
        </p>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Affiliate Link Details</CardTitle>
          <CardDescription>
            Select a bookmark and add your affiliate tracking URL
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createAffiliateLink} className="space-y-6">
            {/* Bookmark Selection */}
            <div className="space-y-2">
              <label htmlFor="bookmark_id" className="text-sm font-medium">
                Select Bookmark <span className="text-red-500">*</span>
              </label>
              <select
                id="bookmark_id"
                name="bookmark_id"
                required
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="">Choose a bookmark...</option>
                {bookmarks?.map((bookmark) => (
                  <option key={bookmark.id} value={bookmark.id}>
                    {bookmark.title} ({bookmark.url})
                  </option>
                ))}
              </select>
              <p className="text-xs text-neutral-500">
                The bookmark you want to attach this affiliate link to
              </p>
            </div>

            {/* Affiliate URL */}
            <div className="space-y-2">
              <label htmlFor="affiliate_url" className="text-sm font-medium">
                Affiliate Tracking URL <span className="text-red-500">*</span>
              </label>
              <Input
                id="affiliate_url"
                name="affiliate_url"
                type="url"
                placeholder="https://example.com/product?ref=your-id"
                required
              />
              <p className="text-xs text-neutral-500">
                Your unique affiliate URL with tracking parameters
              </p>
            </div>

            {/* Commission Rate */}
            <div className="space-y-2">
              <label htmlFor="commission_rate" className="text-sm font-medium">
                Commission Rate (%) <span className="text-red-500">*</span>
              </label>
              <Input
                id="commission_rate"
                name="commission_rate"
                type="number"
                step="0.1"
                min="0"
                max="100"
                placeholder="5.0"
                required
              />
              <p className="text-xs text-neutral-500">
                The commission percentage you earn (e.g., 5.0 for 5%)
              </p>
            </div>

            {/* Info Box */}
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h4 className="mb-2 text-sm font-medium text-blue-900">
                How Affiliate Links Work
              </h4>
              <ul className="space-y-1 text-xs text-blue-800">
                <li>• Your bookmark URL will be replaced with the affiliate URL</li>
                <li>• All clicks will be tracked automatically</li>
                <li>• Earnings are calculated based on commission rate</li>
                <li>• Analytics are available in your dashboard</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button type="submit" className="flex-1">
                Create Affiliate Link
              </Button>
              <Button asChild type="button" variant="outline">
                <Link href="/dashboard/affiliate">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
