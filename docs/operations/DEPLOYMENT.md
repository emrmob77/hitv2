# Deployment Guide

This guide covers deploying the application to production on Vercel with Supabase.

## Prerequisites

- Node.js 20.x or higher
- npm or yarn package manager
- Vercel account
- Supabase project (production)
- Stripe account (production/live mode)
- (Optional) Sentry account for error monitoring
- (Optional) Redis instance for rate limiting

## Environment Setup

### 1. Create Production Environment File

Copy `.env.production.example` to `.env.production.local`:

```bash
cp .env.production.example .env.production.local
```

### 2. Configure Environment Variables

Update `.env.production.local` with your production values:

**Required Variables:**
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (keep secret!)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Stripe live publishable key
- `STRIPE_SECRET_KEY`: Stripe live secret key
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook signing secret

**Optional but Recommended:**
- `SENTRY_DSN`: Sentry error tracking
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`: Google Analytics
- `REDIS_URL`: Redis for rate limiting and caching

## Database Setup

### 1. Run Migrations

Apply all database migrations to your production Supabase instance:

```bash
# Using Supabase CLI
supabase db push --db-url "postgresql://[user]:[password]@[host]:[port]/[database]"

# Or manually run migration files in order:
# database-migrations/001_initial_schema.sql
# database-migrations/002_add_collections.sql
# ... etc
```

### 2. Verify Database Schema

Check that all tables, RLS policies, and functions are created:

```sql
-- List all tables
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Verify RLS is enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND rowsecurity = true;
```

### 3. Create Initial Admin User

```sql
-- Update a user to be admin
UPDATE profiles
SET is_admin = true, is_moderator = true
WHERE email = 'admin@yourdomain.com';
```

## Stripe Configuration

### 1. Create Products and Prices

In Stripe Dashboard:

1. Create "Pro" product with monthly/annual prices
2. Create "Enterprise" product with monthly/annual prices
3. Copy price IDs to environment variables

### 2. Configure Webhook

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`

## Vercel Deployment

### Option 1: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

### Option 2: Deploy via GitHub Integration

1. Connect your GitHub repository to Vercel
2. Import project in Vercel dashboard
3. Configure environment variables in Vercel project settings
4. Enable automatic deployments from main branch

### Configure Environment Variables in Vercel

Go to Project Settings → Environment Variables and add:

```
NEXT_PUBLIC_SUPABASE_URL=xxx
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=xxx
STRIPE_SECRET_KEY=xxx
STRIPE_WEBHOOK_SECRET=xxx
STRIPE_PRO_PRICE_ID=xxx
STRIPE_PRO_ANNUAL_PRICE_ID=xxx
STRIPE_ENTERPRISE_PRICE_ID=xxx
STRIPE_ENTERPRISE_ANNUAL_PRICE_ID=xxx
```

### Configure Build Settings

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm ci`
- **Node Version**: 20.x

## Post-Deployment Checklist

### 1. Verify Application

- [ ] Visit production URL
- [ ] Test user registration
- [ ] Test user login
- [ ] Test bookmark creation
- [ ] Test subscription flow (Stripe checkout)
- [ ] Verify webhook is receiving events

### 2. Configure DNS

Point your custom domain to Vercel:

```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 3. Enable SSL

Vercel automatically provides SSL certificates. Verify HTTPS is working.

### 4. Configure Analytics

Add Google Analytics tracking code if using:

```typescript
// Already configured in src/app/layout.tsx
// Just add NEXT_PUBLIC_GA_MEASUREMENT_ID to environment variables
```

### 5. Set Up Monitoring

#### Sentry Error Tracking

```bash
# Install Sentry
npm install @sentry/nextjs

# Initialize Sentry
npx @sentry/wizard@latest -i nextjs

# Add to environment variables
SENTRY_DSN=xxx
SENTRY_AUTH_TOKEN=xxx
```

#### Vercel Analytics

Enable in Vercel dashboard:
- Speed Insights
- Web Analytics
- Log Drains (optional)

### 6. Configure Rate Limiting

If using Redis for rate limiting:

```bash
# Set up Redis (e.g., Upstash)
# Add REDIS_URL to environment variables
REDIS_URL=redis://:password@host:port
```

### 7. Set Up Backups

#### Database Backups

Supabase provides automatic backups on paid plans. For additional safety:

```bash
# Manual backup script
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Upload to S3
aws s3 cp backup-*.sql s3://your-backup-bucket/
```

#### Automated Backups

Configure in `.github/workflows/backup.yml` (create this file for automated backups).

## Monitoring & Observability

### Application Logs

View logs in Vercel dashboard:
- Deployments → [Your Deployment] → Runtime Logs

### Database Monitoring

Monitor Supabase:
- Database size
- Active connections
- Query performance
- API usage

### Performance Monitoring

Use Lighthouse CI for performance tracking:

```bash
npm run test:perf:lighthouse
```

Set up alerts for:
- Response time > 1s
- Error rate > 1%
- Memory usage > 80%
- Database connection pool > 80%

### Alerting

Configure alerts in Sentry:
- High error rate
- New error types
- Performance degradation

Configure alerts in Vercel:
- Deployment failures
- Function timeouts
- Bandwidth limits

## Scaling Considerations

### Database

- Enable connection pooling (Supabase Pooler)
- Add indexes for frequently queried fields
- Consider read replicas for high traffic

### CDN & Caching

- Use Vercel Edge Network (automatic)
- Configure caching headers
- Use `stale-while-revalidate` for dynamic content

### Rate Limiting

- Implement Redis-based rate limiting
- Configure per-endpoint limits
- Add IP-based blocking for abuse

## Rollback Procedure

If deployment fails:

```bash
# Vercel CLI
vercel rollback

# Or redeploy previous commit
git checkout <previous-commit>
vercel --prod
```

## Security Checklist

- [ ] All environment variables are set
- [ ] Service role key is never exposed to client
- [ ] RLS policies are enabled on all tables
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled
- [ ] Input validation is in place
- [ ] SQL injection prevention (using parameterized queries)
- [ ] XSS prevention (React auto-escaping + CSP headers)
- [ ] CSRF protection (SameSite cookies)

## Performance Optimization

- [ ] Enable Next.js caching
- [ ] Optimize images (use Next.js Image component)
- [ ] Code splitting (dynamic imports)
- [ ] Bundle size analysis (`npm run build`)
- [ ] Database query optimization
- [ ] Enable Vercel Edge Functions where appropriate

## Support & Troubleshooting

### Common Issues

**Issue: Stripe webhook not receiving events**
- Solution: Verify webhook URL in Stripe dashboard
- Check webhook signing secret matches
- Review Vercel function logs

**Issue: Database connection errors**
- Solution: Check Supabase connection pooling
- Verify connection string format
- Check IP allowlist

**Issue: High memory usage**
- Solution: Analyze with memory profiling tools
- Check for memory leaks in long-running processes
- Review large data operations

### Getting Help

- Check Vercel logs
- Review Sentry error reports
- Check Supabase logs
- Contact support teams

## Maintenance

### Regular Tasks

**Daily:**
- Monitor error rates
- Check application performance

**Weekly:**
- Review user reports
- Check database performance
- Analyze traffic patterns

**Monthly:**
- Security updates (`npm audit`)
- Dependency updates
- Database cleanup
- Backup verification

### Database Maintenance

```sql
-- Vacuum database
VACUUM ANALYZE;

-- Check table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Clean up old analytics events (older than 90 days)
DELETE FROM analytics_events WHERE created_at < NOW() - INTERVAL '90 days';
```

## Disaster Recovery

### Database Recovery

```bash
# Restore from backup
pg_restore -d $DATABASE_URL backup.sql

# Or from S3
aws s3 cp s3://your-backup-bucket/backup-20240101.sql ./
pg_restore -d $DATABASE_URL backup-20240101.sql
```

### Application Recovery

1. Check Vercel deployment history
2. Rollback to last known good deployment
3. Verify database state
4. Check for data integrity issues

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Deployment](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Sentry for Next.js](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
