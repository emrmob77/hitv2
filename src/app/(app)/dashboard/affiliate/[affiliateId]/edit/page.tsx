import { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeftIcon } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Edit Affiliate Link',
};

type PageParams = {
  affiliateId: string;
};

export default async function EditAffiliateLinkPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { affiliateId } = await params;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  // Fetch affiliate link
  const { data: affiliateLink, error } = await supabase
    .from('affiliate_links')
    .select('*')
    .eq('id', affiliateId)
    .eq('user_id', user.id)
    .single();

  if (error || !affiliateLink) {
    notFound();
  }

  // Fetch bookmark
  const { data: bookmark } = await supabase
    .from('bookmarks')
    .select('id, title')
    .eq('id', affiliateLink.bookmark_id)
    .single();

  async function updateAffiliateLink(formData: FormData) {
    'use server';

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Unauthorized');
    }

    const affiliateUrl = formData.get('affiliateUrl') as string;
    const commissionRate = parseFloat(formData.get('commissionRate') as string);
    const expiresAt = formData.get('expiresAt') as string;
    const isActive = formData.get('isActive') === 'true';

    if (!affiliateUrl || isNaN(commissionRate)) {
      throw new Error('Invalid input');
    }

    const updateData: any = {
      affiliate_url: affiliateUrl,
      commission_rate: commissionRate,
      is_active: isActive,
    };

    if (expiresAt) {
      updateData.expires_at = new Date(expiresAt).toISOString();
    } else {
      updateData.expires_at = null;
    }

    const { error } = await supabase
      .from('affiliate_links')
      .update(updateData)
      .eq('id', affiliateId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Update error:', error);
      throw new Error('Failed to update affiliate link');
    }

    revalidatePath(`/dashboard/affiliate/${affiliateId}`);
    revalidatePath('/dashboard/affiliate');
    redirect(`/dashboard/affiliate/${affiliateId}`);
  }

  async function deleteAffiliateLink(formData: FormData) {
    'use server';

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Unauthorized');
    }

    const confirm = formData.get('confirm');
    if (confirm !== 'delete') {
      return;
    }

    // First delete related earnings records
    const { error: earningsError } = await supabase
      .from('earnings')
      .delete()
      .eq('affiliate_link_id', affiliateId);

    if (earningsError) {
      console.error('Earnings delete error:', earningsError);
      throw new Error(`Failed to delete earnings records: ${earningsError.message}`);
    }

    // Then delete the affiliate link
    const { error } = await supabase
      .from('affiliate_links')
      .delete()
      .eq('id', affiliateId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Delete error:', error);
      throw new Error(`Failed to delete affiliate link: ${error.message}`);
    }

    revalidatePath('/dashboard/affiliate');
    redirect('/dashboard/affiliate');
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link href={`/dashboard/affiliate/${affiliateId}`}>
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Details
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Edit Affiliate Link</h1>
        <p className="text-neutral-600">
          Update your affiliate tracking settings for {bookmark?.title || 'this bookmark'}
        </p>
      </div>

      {/* Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle>Affiliate Link Settings</CardTitle>
          <CardDescription>
            Modify your affiliate URL and commission rate
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateAffiliateLink} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="affiliateUrl">Affiliate URL</Label>
              <Input
                id="affiliateUrl"
                name="affiliateUrl"
                type="url"
                required
                defaultValue={affiliateLink.affiliate_url}
                placeholder="https://affiliate-link.com/ref=yourcode"
                className="font-mono text-sm"
              />
              <p className="text-xs text-neutral-500">
                The tracking URL that visitors will be redirected to
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="commissionRate">Commission Rate (%)</Label>
              <Input
                id="commissionRate"
                name="commissionRate"
                type="number"
                step="0.01"
                min="0"
                max="100"
                required
                defaultValue={affiliateLink.commission_rate}
                placeholder="10.00"
              />
              <p className="text-xs text-neutral-500">
                Your commission percentage for this affiliate program
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiresAt">Expiration Date (Optional)</Label>
              <Input
                id="expiresAt"
                name="expiresAt"
                type="datetime-local"
                defaultValue={
                  affiliateLink.expires_at
                    ? new Date(affiliateLink.expires_at).toISOString().slice(0, 16)
                    : ''
                }
              />
              <p className="text-xs text-neutral-500">
                Link will be automatically disabled after this date
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                value="true"
                defaultChecked={affiliateLink.is_active}
                className="h-4 w-4 rounded border-neutral-300"
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                Link is active
              </Label>
            </div>

            <div className="flex gap-3">
              <Button type="submit">Save Changes</Button>
              <Button asChild variant="outline">
                <Link href={`/dashboard/affiliate/${affiliateId}`}>Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-900">Danger Zone</CardTitle>
          <CardDescription>
            Permanently remove this affiliate link from your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
              <p className="text-xs text-amber-800">
                <strong>Note:</strong> Deleting this affiliate link will also remove all
                associated earnings records and click history.
              </p>
            </div>
            <form action={deleteAffiliateLink} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="confirm">Type &quot;delete&quot; to confirm</Label>
                <Input
                  id="confirm"
                  name="confirm"
                  type="text"
                  placeholder="delete"
                  required
                />
              </div>
              <Button type="submit" variant="destructive">
                Delete Affiliate Link
              </Button>
            </form>
            <p className="text-xs text-neutral-600">
              This action cannot be undone. Your click and earning history will be permanently
              deleted.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
