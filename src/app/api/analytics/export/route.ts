import { NextResponse } from 'next/server';

import { getAnalyticsSummary, type AnalyticsSummary } from '@/lib/analytics/summary';
import { createSupabaseServerClient } from '@/lib/supabase/server';

function escapeCsv(value: string) {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

function buildCsv(summary: AnalyticsSummary) {
  const rows: string[][] = [
    ['section', 'metric', 'value'],
    ['bookmarks', 'total', summary.bookmarks.total.toString()],
    ['bookmarks', 'public', summary.bookmarks.public.toString()],
    ['bookmarks', 'private', summary.bookmarks.private.toString()],
    ['bookmarks', 'total_likes', summary.bookmarks.totalLikes.toString()],
    ['bookmarks', 'total_views', summary.bookmarks.totalViews.toString()],
    ['collections', 'total', summary.collections.total.toString()],
    ['collections', 'total_bookmarks', summary.collections.totalBookmarks.toString()],
    ['collections', 'total_followers', summary.collections.totalFollowers.toString()],
    ['collections', 'total_views', summary.collections.totalViews.toString()],
    ['posts', 'total', summary.posts.total.toString()],
    ['posts', 'total_views', summary.posts.totalViews.toString()],
    ['posts', 'total_likes', summary.posts.totalLikes.toString()],
    ['link_groups', 'total', summary.linkGroups.total.toString()],
    ['link_groups', 'total_views', summary.linkGroups.totalViews.toString()],
    ['link_groups', 'total_clicks', summary.linkGroups.totalClicks.toString()],
    ['social', 'followers', summary.social.followers.toString()],
    ['social', 'following', summary.social.following.toString()],
    ['social', 'total_likes_received', summary.social.totalLikesReceived.toString()],
    ['traffic', 'current_views', summary.traffic.currentViews.toString()],
    ['traffic', 'previous_views', summary.traffic.previousViews.toString()],
    ['traffic', 'change_percentage', summary.traffic.change.toString()],
  ];

  summary.traffic.dailyViews.forEach((entry) => {
    rows.push(['traffic_daily', entry.date, entry.value.toString()]);
  });

  summary.traffic.deviceBreakdown.forEach((entry) => {
    rows.push(['device', entry.name, entry.value.toString()]);
  });

  summary.traffic.geoDistribution.forEach((entry) => {
    rows.push(['geo', entry.country, entry.value.toString()]);
  });

  summary.traffic.topReferrers.forEach((entry) => {
    rows.push(['referrer', entry.source, entry.value.toString()]);
  });

  return rows.map((row) => row.map(escapeCsv).join(',')).join('\n');
}

function escapePdfText(text: string) {
  return text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function buildPdf(summary: AnalyticsSummary) {
  const lines: string[] = [
    'HitTags Analytics Export',
    `Generated: ${new Date().toISOString()}`,
    '',
    'Core Metrics',
    `Bookmarks: ${summary.bookmarks.total} total (${summary.bookmarks.public} public, ${summary.bookmarks.private} private)`,
    `Collections: ${summary.collections.total} public sets`,
    `Premium posts: ${summary.posts.total}`,
    `Link groups: ${summary.linkGroups.total}`,
    `Followers: ${summary.social.followers} • Following: ${summary.social.following}`,
    '',
    'Traffic (Last 7 Days)',
    `Views: ${summary.traffic.currentViews} vs ${summary.traffic.previousViews} prior (${summary.traffic.change}%)`,
    '',
    'Top Referrers',
  ];

  summary.traffic.topReferrers.slice(0, 5).forEach((referrer, index) => {
    lines.push(`${index + 1}. ${referrer.source} — ${referrer.value} views`);
  });

  lines.push('', 'Top Regions');
  summary.traffic.geoDistribution.slice(0, 5).forEach((geo, index) => {
    lines.push(`${index + 1}. ${geo.country} — ${geo.value}`);
  });

  lines.push('', 'Daily Views (Last 14 Days)');
  summary.traffic.dailyViews.forEach((entry) => {
    lines.push(`${entry.date}: ${entry.value}`);
  });

  const contentLines = lines.map((line, index) => {
    if (index === 0) {
      return `(${escapePdfText(line)}) Tj`;
    }
    return `T*\n(${escapePdfText(line)}) Tj`;
  });

  const stream = `BT
/F1 12 Tf
14 TL
72 740 Td
${contentLines.join('\n')}
\nET`;

  const streamLength = Buffer.byteLength(stream, 'utf8');

  const objects = [
    '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
    '2 0 obj << /Type /Pages /Count 1 /Kids [3 0 R] >> endobj',
    '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj',
    `4 0 obj << /Length ${streamLength} >> stream
${stream}
endstream
endobj`,
    '5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
  ];

  const header = '%PDF-1.4\n';
  let body = '';
  const offsets: number[] = [];
  let currentOffset = header.length;

  objects.forEach((obj) => {
    offsets.push(currentOffset);
    const objectWithBreak = `${obj}\n`;
    body += objectWithBreak;
    currentOffset += Buffer.byteLength(objectWithBreak, 'utf8');
  });

  const xrefStart = currentOffset;
  let xref = 'xref\n0 6\n0000000000 65535 f \n';
  offsets.forEach((offset) => {
    xref += `${offset.toString().padStart(10, '0')} 00000 n \n`;
  });

  const trailer = `trailer << /Size 6 /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  const pdf = header + body + xref + trailer;
  return Buffer.from(pdf, 'utf8');
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const format = (searchParams.get('format') || 'csv').toLowerCase();

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const summary = await getAnalyticsSummary(supabase, user.id);
    const timestamp = new Date().toISOString().split('T')[0];

    if (format === 'pdf') {
      const pdfBuffer = buildPdf(summary);
      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="analytics-${timestamp}.pdf"`,
          'Cache-Control': 'no-store',
        },
      });
    }

    const csv = buildCsv(summary);
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="analytics-${timestamp}.csv"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Analytics export failed', error);
    return NextResponse.json({ error: 'Analytics export failed' }, { status: 500 });
  }
}
