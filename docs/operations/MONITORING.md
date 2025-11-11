# Monitoring & Logging Guide

This guide covers monitoring, logging, and alerting strategies for the production application.

## Overview

The application uses multiple monitoring tools:
- **Sentry**: Error tracking and performance monitoring
- **Vercel Analytics**: Traffic and performance insights
- **Supabase Dashboard**: Database monitoring
- **Custom Analytics**: Affiliate tracking and earnings
- **Logs**: Application and API logs

## Error Tracking (Sentry)

### Setup

1. Create Sentry project at https://sentry.io
2. Install Sentry SDK:

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

3. Configure environment variables:

```bash
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_AUTH_TOKEN=your_auth_token
SENTRY_ORG=your_org
SENTRY_PROJECT=your_project
```

### Monitoring Errors

Sentry automatically captures:
- Unhandled exceptions
- API errors
- Client-side errors
- Performance issues

**Custom error tracking:**

```typescript
import * as Sentry from '@sentry/nextjs';

try {
  // Your code
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      component: 'BookmarkCreate',
      action: 'create',
    },
    extra: {
      bookmarkData: data,
    },
  });
}
```

### Performance Monitoring

```typescript
import * as Sentry from '@sentry/nextjs';

const transaction = Sentry.startTransaction({
  name: 'Fetch User Bookmarks',
  op: 'db.query',
});

try {
  const bookmarks = await fetchBookmarks();
  transaction.setStatus('ok');
} catch (error) {
  transaction.setStatus('internal_error');
  throw error;
} finally {
  transaction.finish();
}
```

### Alerts

Configure alerts in Sentry for:
- Error rate > 10/minute
- New error types
- Performance degradation (p95 > 2s)
- Critical errors (severity: fatal)

## Application Logging

### Log Levels

- **ERROR**: Critical failures requiring immediate attention
- **WARN**: Potential issues that should be monitored
- **INFO**: Important operational events
- **DEBUG**: Detailed diagnostic information

### Logging Strategy

```typescript
// src/lib/logger.ts
export const logger = {
  error: (message: string, meta?: any) => {
    console.error(`[ERROR] ${message}`, meta);
    // Send to external logging service
  },
  warn: (message: string, meta?: any) => {
    console.warn(`[WARN] ${message}`, meta);
  },
  info: (message: string, meta?: any) => {
    console.info(`[INFO] ${message}`, meta);
  },
  debug: (message: string, meta?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, meta);
    }
  },
};
```

### Structured Logging

```typescript
logger.info('User created bookmark', {
  userId: user.id,
  bookmarkId: bookmark.id,
  url: bookmark.url,
  timestamp: new Date().toISOString(),
});
```

## Database Monitoring

### Supabase Dashboard

Monitor:
- **Database Size**: Track growth over time
- **Connection Pool**: Ensure connections are available
- **Query Performance**: Identify slow queries
- **API Usage**: Monitor request volume and errors

### Key Metrics

```sql
-- Active connections
SELECT count(*) FROM pg_stat_activity;

-- Database size
SELECT pg_size_pretty(pg_database_size(current_database()));

-- Table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 10;

-- Slow queries (requires pg_stat_statements extension)
SELECT
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

### Alerts

Set up alerts for:
- Database size > 80% of quota
- Connection pool > 80% utilization
- Query duration > 1s
- Error rate > 1%

## Affiliate Tracking Monitoring

### Key Metrics

Track in `analytics_events` table:
- **Click Volume**: Total affiliate link clicks
- **Click-through Rate**: Clicks / impressions
- **Conversion Rate**: (If tracking conversions)
- **Revenue**: (If tracking affiliate earnings)

### Monitoring Queries

```sql
-- Daily affiliate clicks
SELECT
  DATE(created_at) as date,
  COUNT(*) as total_clicks,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT metadata->>'link_id') as unique_links
FROM analytics_events
WHERE event_type = 'affiliate_click'
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Top performing affiliate links
SELECT
  metadata->>'link_id' as link_id,
  metadata->>'url' as url,
  COUNT(*) as clicks,
  COUNT(DISTINCT user_id) as unique_users
FROM analytics_events
WHERE event_type = 'affiliate_click'
  AND created_at >= NOW() - INTERVAL '7 days'
GROUP BY metadata->>'link_id', metadata->>'url'
ORDER BY clicks DESC
LIMIT 20;

-- Suspicious activity detection
SELECT
  user_id,
  ip_address,
  COUNT(*) as click_count,
  COUNT(DISTINCT metadata->>'link_id') as unique_links,
  MIN(created_at) as first_click,
  MAX(created_at) as last_click
FROM analytics_events
WHERE event_type = 'affiliate_click'
  AND created_at >= NOW() - INTERVAL '1 hour'
GROUP BY user_id, ip_address
HAVING COUNT(*) > 50
ORDER BY click_count DESC;
```

### Alerts

Create alerts for:
- Sudden spike in clicks (>200% of average)
- High click volume from single IP (>50/hour)
- Low conversion rate (<1% for 7 days)
- Revenue drop (>30% week-over-week)

## Performance Monitoring

### Core Web Vitals

Monitor in Vercel Analytics:
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### API Response Times

Track in `analytics_events`:

```typescript
// Middleware to track API response times
export function middleware(request: NextRequest) {
  const start = Date.now();

  return NextResponse.next().then(response => {
    const duration = Date.now() - start;

    // Log slow requests
    if (duration > 1000) {
      logger.warn('Slow API request', {
        path: request.nextUrl.pathname,
        duration,
        method: request.method,
      });
    }

    // Track in analytics
    trackEvent({
      event_type: 'api_request',
      metadata: {
        path: request.nextUrl.pathname,
        method: request.method,
        duration,
        status: response.status,
      },
    });

    return response;
  });
}
```

### Database Query Performance

```sql
-- Enable query statistics
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Monitor slow queries
SELECT
  query,
  calls,
  total_time,
  mean_time,
  stddev_time,
  max_time
FROM pg_stat_statements
WHERE mean_time > 100  -- Queries averaging >100ms
ORDER BY mean_time DESC
LIMIT 20;
```

## Uptime Monitoring

### External Monitoring

Use services like:
- **UptimeRobot**: Free tier monitors every 5 minutes
- **Pingdom**: Detailed monitoring with alerts
- **StatusCake**: Free tier available

### Health Check Endpoint

Create `/api/health` endpoint:

```typescript
// src/app/api/health/route.ts
export async function GET() {
  const checks = {
    database: false,
    stripe: false,
  };

  try {
    // Check database
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    checks.database = !error;

    // Check Stripe (optional)
    // const balance = await stripe.balance.retrieve();
    // checks.stripe = !!balance;

    const healthy = checks.database;

    return Response.json({
      status: healthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      checks,
    }, {
      status: healthy ? 200 : 503,
    });
  } catch (error) {
    return Response.json({
      status: 'unhealthy',
      error: error.message,
    }, { status: 503 });
  }
}
```

Monitor this endpoint every 5 minutes.

## Rate Limiting Monitoring

### Track Rate Limit Events

```typescript
// Log rate limit violations
if (rateLimitExceeded) {
  logger.warn('Rate limit exceeded', {
    userId: user.id,
    ip: ip,
    action: 'BOOKMARK_CREATE',
    limit: rateLimit.maxAttempts,
    window: rateLimit.windowMs,
  });

  // Track in database
  await trackEvent({
    event_type: 'rate_limit_exceeded',
    user_id: user.id,
    metadata: {
      action: 'BOOKMARK_CREATE',
      ip: ip,
    },
  });
}
```

### Queries

```sql
-- Rate limit violations by user
SELECT
  user_id,
  COUNT(*) as violations,
  MAX(created_at) as last_violation
FROM analytics_events
WHERE event_type = 'rate_limit_exceeded'
  AND created_at >= NOW() - INTERVAL '24 hours'
GROUP BY user_id
ORDER BY violations DESC
LIMIT 20;

-- Rate limit violations by IP
SELECT
  metadata->>'ip' as ip,
  COUNT(*) as violations,
  COUNT(DISTINCT user_id) as unique_users
FROM analytics_events
WHERE event_type = 'rate_limit_exceeded'
  AND created_at >= NOW() - INTERVAL '24 hours'
GROUP BY metadata->>'ip'
HAVING COUNT(*) > 10
ORDER BY violations DESC;
```

## Custom Dashboards

### Grafana Setup (Optional)

1. Set up Grafana instance
2. Connect to Supabase (PostgreSQL)
3. Create dashboards for:
   - User growth
   - Bookmark creation trends
   - Affiliate click performance
   - Error rates
   - Response times

### Example Queries for Grafana

```sql
-- Daily active users
SELECT
  DATE(created_at) as time,
  COUNT(DISTINCT user_id) as dau
FROM analytics_events
WHERE created_at >= $__timeFrom() AND created_at <= $__timeTo()
GROUP BY DATE(created_at)
ORDER BY time;

-- Bookmarks created over time
SELECT
  DATE_TRUNC('hour', created_at) as time,
  COUNT(*) as bookmarks_created
FROM bookmarks
WHERE created_at >= $__timeFrom() AND created_at <= $__timeTo()
GROUP BY DATE_TRUNC('hour', created_at)
ORDER BY time;
```

## Alert Channels

### Slack Integration

```typescript
// src/lib/alerts.ts
export async function sendSlackAlert(message: string, severity: 'info' | 'warning' | 'error') {
  const webhook = process.env.SLACK_WEBHOOK_URL;
  if (!webhook) return;

  const color = {
    info: '#36a64f',
    warning: '#ff9800',
    error: '#f44336',
  }[severity];

  await fetch(webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      attachments: [{
        color,
        title: severity.toUpperCase(),
        text: message,
        ts: Math.floor(Date.now() / 1000),
      }],
    }),
  });
}

// Usage
await sendSlackAlert('High error rate detected: 25 errors/min', 'error');
```

### Email Alerts

```typescript
// Send critical alerts via email
export async function sendEmailAlert(to: string, subject: string, body: string) {
  // Using SendGrid, AWS SES, or similar
  await sendEmail({
    to,
    from: process.env.ALERT_EMAIL_FROM,
    subject: `[ALERT] ${subject}`,
    text: body,
  });
}
```

## Metrics to Track

### Business Metrics
- Daily/Monthly Active Users (DAU/MAU)
- New user registrations
- Subscription conversions
- Churn rate
- Affiliate revenue

### Technical Metrics
- API response time (p50, p95, p99)
- Error rate
- Database query performance
- Memory usage
- CPU usage

### User Engagement
- Bookmarks created per user
- Collections created
- Affiliate links created
- Posts published
- Average session duration

## Incident Response

### Incident Severity Levels

**P0 - Critical:**
- Service completely down
- Data loss
- Security breach

**P1 - High:**
- Major feature broken
- Performance severely degraded
- Payment processing issues

**P2 - Medium:**
- Minor feature broken
- Non-critical functionality impaired

**P3 - Low:**
- Cosmetic issues
- Nice-to-have features broken

### Response Procedures

1. **Detect**: Via monitoring alerts
2. **Assess**: Determine severity
3. **Notify**: Alert on-call engineer
4. **Mitigate**: Implement immediate fix or rollback
5. **Resolve**: Fix root cause
6. **Document**: Post-mortem analysis

## Resources

- [Sentry Documentation](https://docs.sentry.io/)
- [Vercel Analytics](https://vercel.com/docs/analytics)
- [PostgreSQL Monitoring](https://www.postgresql.org/docs/current/monitoring.html)
- [Core Web Vitals](https://web.dev/vitals/)
