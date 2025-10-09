import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { bookmarkId: string } }
) {
  const { bookmarkId } = params;

  if (!bookmarkId) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  const target = new URL(`/out/bookmark/${bookmarkId}`, request.url);

  return NextResponse.redirect(target, {
    status: 302,
    headers: {
      'Cache-Control': 'private, no-store',
    },
  });
}
