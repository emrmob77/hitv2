import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const metric = await request.json();

    // Log metrics in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Web Vitals API]', {
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
      });
    }

    // In production, you could send to analytics service
    // e.g., Google Analytics, Vercel Analytics, etc.
    // Example:
    // await analytics.track('web-vital', {
    //   name: metric.name,
    //   value: metric.value,
    //   rating: metric.rating,
    //   id: metric.id,
    // });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Web Vitals Error]:', error);
    return NextResponse.json({ error: 'Failed to process metric' }, { status: 500 });
  }
}
