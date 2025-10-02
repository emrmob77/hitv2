import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const { itemId } = await params;

  try {
    // Get link item
    const { data: item, error } = await supabase
      .from('link_group_items')
      .select('url, click_count, link_group_id')
      .eq('id', itemId)
      .single();

    if (error || !item) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Increment click count for the item
    await supabase
      .from('link_group_items')
      .update({ click_count: item.click_count + 1 })
      .eq('id', itemId);

    // Increment click count for the link group
    const { data: linkGroup } = await supabase
      .from('link_groups')
      .select('click_count')
      .eq('id', item.link_group_id)
      .single();

    if (linkGroup) {
      await supabase
        .from('link_groups')
        .update({ click_count: linkGroup.click_count + 1 })
        .eq('id', item.link_group_id);
    }

    // Redirect to the actual URL
    // Ensure URL is absolute
    const redirectUrl = item.url.startsWith('http')
      ? item.url
      : `https://${item.url}`;

    return NextResponse.redirect(redirectUrl, 302);
  } catch (error) {
    console.error('Link redirect error:', error);
    return NextResponse.redirect(new URL('/', request.url));
  }
}
