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
    await supabase.rpc('increment_link_group_clicks', {
      group_id: item.link_group_id,
    });

    // Redirect to the actual URL
    return NextResponse.redirect(item.url);
  } catch (error) {
    console.error('Link redirect error:', error);
    return NextResponse.redirect(new URL('/', request.url));
  }
}
