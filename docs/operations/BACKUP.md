# Backup & Disaster Recovery Guide

This guide covers backup strategies and disaster recovery procedures for the application.

## Overview

The backup strategy covers:
- **Database**: Full backups and point-in-time recovery
- **User uploads**: Files and images (if applicable)
- **Configuration**: Environment variables and secrets
- **Code**: Git repository

## Database Backups

### Automated Backups (Supabase)

Supabase provides automatic backups on paid plans:
- **Daily backups**: Retained for 7 days (Free tier)
- **Point-in-time recovery**: Up to 30 days (Pro tier)

### Manual Backups

#### Using pg_dump

```bash
# Full database backup
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d-%H%M%S).sql

# Compressed backup
pg_dump $DATABASE_URL | gzip > backup-$(date +%Y%m%d-%H%M%S).sql.gz

# Schema only
pg_dump --schema-only $DATABASE_URL > schema-$(date +%Y%m%d).sql

# Data only
pg_dump --data-only $DATABASE_URL > data-$(date +%Y%m%d).sql

# Specific tables
pg_dump -t bookmarks -t collections $DATABASE_URL > bookmarks-backup.sql
```

#### Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# List projects
supabase projects list

# Create backup
supabase db dump -p $PROJECT_REF > backup.sql
```

### Automated Backup Script

Create `scripts/backup-database.sh`:

```bash
#!/bin/bash

# Configuration
BACKUP_DIR="/path/to/backups"
DATABASE_URL="$DATABASE_URL"
S3_BUCKET="your-backup-bucket"
RETENTION_DAYS=30

# Create backup directory if not exists
mkdir -p $BACKUP_DIR

# Generate backup filename
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup-$TIMESTAMP.sql.gz"

# Create backup
echo "Creating database backup..."
pg_dump $DATABASE_URL | gzip > $BACKUP_FILE

if [ $? -eq 0 ]; then
  echo "Backup created successfully: $BACKUP_FILE"

  # Upload to S3
  echo "Uploading to S3..."
  aws s3 cp $BACKUP_FILE s3://$S3_BUCKET/database/

  if [ $? -eq 0 ]; then
    echo "Backup uploaded to S3 successfully"
  else
    echo "Error uploading to S3"
    exit 1
  fi
else
  echo "Error creating backup"
  exit 1
fi

# Clean up old local backups
find $BACKUP_DIR -name "backup-*.sql.gz" -mtime +$RETENTION_DAYS -delete
echo "Old backups cleaned up (>$RETENTION_DAYS days)"

# Verify backup
echo "Verifying backup integrity..."
gunzip -t $BACKUP_FILE
if [ $? -eq 0 ]; then
  echo "Backup integrity verified"
else
  echo "Warning: Backup integrity check failed"
fi
```

### Schedule Automated Backups

#### Using cron

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /path/to/scripts/backup-database.sh >> /var/log/backup.log 2>&1

# Add weekly full backup on Sunday at 3 AM
0 3 * * 0 /path/to/scripts/backup-database.sh --full >> /var/log/backup-full.log 2>&1
```

#### Using GitHub Actions

Create `.github/workflows/backup.yml`:

```yaml
name: Database Backup

on:
  schedule:
    # Run daily at 2 AM UTC
    - cron: '0 2 * * *'
  workflow_dispatch:

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - name: Install PostgreSQL client
        run: |
          sudo apt-get update
          sudo apt-get install -y postgresql-client

      - name: Create backup
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
        run: |
          TIMESTAMP=$(date +%Y%m%d-%H%M%S)
          pg_dump $DATABASE_URL | gzip > backup-$TIMESTAMP.sql.gz

      - name: Upload to S3
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Copy to S3
        run: |
          aws s3 cp backup-*.sql.gz s3://${{ secrets.S3_BACKUP_BUCKET }}/database/

      - name: Notify on failure
        if: failure()
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Database backup failed!'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

## Storage Backups (User Files)

If you're storing user-uploaded files:

### S3/Supabase Storage

```bash
# Sync Supabase Storage to S3
aws s3 sync supabase://your-bucket s3://backup-bucket/storage/

# Using rclone for Supabase Storage
rclone sync supabase:your-bucket s3:backup-bucket/storage/
```

### Backup Script for Storage

```bash
#!/bin/bash

SUPABASE_PROJECT_REF="your-project-ref"
SUPABASE_ANON_KEY="your-anon-key"
BACKUP_DIR="/path/to/storage-backups"
S3_BUCKET="your-backup-bucket"

# List all storage buckets
# Download files using Supabase Storage API
# Upload to S3 backup bucket
```

## Configuration Backups

### Environment Variables

```bash
# Export environment variables (without values)
cat .env.production | grep -v "^#" | cut -d'=' -f1 > env-variables-list.txt

# Store encrypted backup of .env.production
gpg --symmetric --cipher-algo AES256 .env.production
aws s3 cp .env.production.gpg s3://backup-bucket/config/
```

### Secrets Management

Use a secrets manager:
- **AWS Secrets Manager**
- **HashiCorp Vault**
- **Doppler**
- **1Password Secrets Automation**

## Recovery Procedures

### Database Recovery

#### Full Database Restore

```bash
# Download backup from S3
aws s3 cp s3://backup-bucket/database/backup-20240101-020000.sql.gz ./

# Decompress
gunzip backup-20240101-020000.sql.gz

# Restore to database
psql $DATABASE_URL < backup-20240101-020000.sql

# Or with pg_restore for custom format
pg_restore -d $DATABASE_URL backup-20240101-020000.dump
```

#### Selective Table Restore

```bash
# Restore specific tables
pg_restore -d $DATABASE_URL -t bookmarks -t collections backup.dump

# Or using SQL
psql $DATABASE_URL -c "DROP TABLE IF EXISTS bookmarks CASCADE;"
psql $DATABASE_URL -f backup-bookmarks-only.sql
```

#### Point-in-Time Recovery (PITR)

If using Supabase Pro with PITR:

```bash
# Restore to specific timestamp
supabase db restore --timestamp "2024-01-01 12:00:00 UTC"
```

### Application Recovery

#### Rollback Deployment

```bash
# Using Vercel
vercel rollback

# Or redeploy specific commit
git checkout <commit-hash>
vercel --prod
```

#### Restore from Git

```bash
# Find the last known good commit
git log --oneline

# Revert to that commit
git reset --hard <commit-hash>

# Force push (use with caution)
git push --force origin main
```

## Disaster Recovery Scenarios

### Scenario 1: Database Corruption

**Symptoms:**
- Database queries failing
- Data inconsistencies
- Connection errors

**Recovery Steps:**

1. Identify issue:
```sql
-- Check for table corruption
SELECT * FROM pg_stat_database WHERE datname = 'your_database';

-- Check for connection issues
SELECT count(*) FROM pg_stat_activity;
```

2. Create current state backup (if possible):
```bash
pg_dump $DATABASE_URL > pre-recovery-backup.sql
```

3. Restore from latest backup:
```bash
aws s3 cp s3://backup-bucket/database/latest.sql.gz ./
gunzip latest.sql.gz
psql $DATABASE_URL < latest.sql
```

4. Verify data integrity:
```sql
-- Run consistency checks
SELECT COUNT(*) FROM bookmarks;
SELECT COUNT(*) FROM profiles;
-- Check foreign key constraints
```

### Scenario 2: Accidental Data Deletion

**Recovery Steps:**

1. Stop the application to prevent further writes
2. Restore from backup to temporary database
3. Extract deleted data
4. Import to production database

```bash
# Restore to temporary database
createdb temp_recovery
psql temp_recovery < backup.sql

# Export deleted data
pg_dump -t bookmarks temp_recovery > deleted-bookmarks.sql

# Import to production
psql $DATABASE_URL < deleted-bookmarks.sql

# Drop temporary database
dropdb temp_recovery
```

### Scenario 3: Complete Service Outage

**Recovery Steps:**

1. **Assess the situation**
   - Check Vercel status
   - Check Supabase status
   - Review error logs

2. **Switch to backup infrastructure** (if available)
   - Update DNS to point to backup
   - Enable maintenance mode

3. **Restore services**
   - Deploy to new Vercel project
   - Restore database to new Supabase instance
   - Update environment variables

4. **Verify functionality**
   - Test critical user flows
   - Check data integrity
   - Monitor for errors

### Scenario 4: Security Breach

**Recovery Steps:**

1. **Immediate actions**
   - Rotate all API keys and secrets
   - Disable compromised accounts
   - Enable read-only mode

2. **Assess damage**
   - Review audit logs
   - Check for data exfiltration
   - Identify affected users

3. **Restore from clean backup**
   - Restore database from pre-breach backup
   - Verify no malicious code in application

4. **Notify affected users**
   - Send security notifications
   - Provide guidance on password resets

## Backup Verification

### Test Restore Procedure

Regularly test backup restoration:

```bash
# Monthly restore test
#!/bin/bash

LATEST_BACKUP="$(aws s3 ls s3://backup-bucket/database/ | sort | tail -n 1 | awk '{print $4}')"
echo "Testing restore of: $LATEST_BACKUP"

# Download backup
aws s3 cp s3://backup-bucket/database/$LATEST_BACKUP ./

# Create test database
createdb test_restore

# Restore
gunzip -c $LATEST_BACKUP | psql test_restore

# Verify
RECORD_COUNT=$(psql test_restore -t -c "SELECT COUNT(*) FROM bookmarks;")
echo "Restored $RECORD_COUNT bookmarks"

# Cleanup
dropdb test_restore
rm $LATEST_BACKUP

if [ $RECORD_COUNT -gt 0 ]; then
  echo "✓ Restore test passed"
  exit 0
else
  echo "✗ Restore test failed"
  exit 1
fi
```

### Backup Monitoring

Track backup metrics:

```typescript
// Monitor backup success/failure
interface BackupMetrics {
  timestamp: Date;
  success: boolean;
  duration: number;
  size: number;
  error?: string;
}

async function logBackupMetrics(metrics: BackupMetrics) {
  await supabase.from('backup_logs').insert({
    timestamp: metrics.timestamp,
    success: metrics.success,
    duration_ms: metrics.duration,
    size_bytes: metrics.size,
    error_message: metrics.error,
  });
}
```

## Backup Retention Policy

### Retention Schedule

- **Hourly backups**: Keep for 24 hours
- **Daily backups**: Keep for 30 days
- **Weekly backups**: Keep for 3 months
- **Monthly backups**: Keep for 1 year
- **Yearly backups**: Keep indefinitely

### Cleanup Script

```bash
#!/bin/bash

S3_BUCKET="backup-bucket"

# Delete hourly backups older than 1 day
aws s3 ls s3://$S3_BUCKET/hourly/ | \
  while read -r line; do
    BACKUP_DATE=$(echo $line | awk '{print $1 " " $2}')
    if [[ $(date -d "$BACKUP_DATE" +%s) -lt $(date -d "1 day ago" +%s) ]]; then
      FILE=$(echo $line | awk '{print $4}')
      aws s3 rm s3://$S3_BUCKET/hourly/$FILE
    fi
  done

# Delete daily backups older than 30 days
# Similar logic...

# Delete weekly backups older than 3 months
# Similar logic...
```

## Cost Optimization

### Storage Costs

```bash
# Calculate backup storage costs
aws s3 ls s3://backup-bucket --recursive --human-readable --summarize

# Use S3 Lifecycle policies to move old backups to Glacier
# Delete backups older than retention period automatically
```

### S3 Lifecycle Policy

```json
{
  "Rules": [
    {
      "Id": "MoveToGlacier",
      "Status": "Enabled",
      "Transitions": [
        {
          "Days": 90,
          "StorageClass": "GLACIER"
        }
      ]
    },
    {
      "Id": "DeleteOldBackups",
      "Status": "Enabled",
      "Expiration": {
        "Days": 365
      }
    }
  ]
}
```

## Compliance & Auditing

### Backup Audit Trail

Track all backup and restore operations:

```sql
CREATE TABLE backup_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  operation VARCHAR(50) NOT NULL, -- 'backup' or 'restore'
  initiated_by VARCHAR(255),
  backup_file VARCHAR(255),
  status VARCHAR(50), -- 'success', 'failed', 'in_progress'
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  metadata JSONB
);
```

### GDPR Compliance

For user data deletion requests:

```bash
# Ensure deleted user data is removed from backups after retention period
# Or anonymize user data in backups

# Example: Anonymize user in backup
psql $DATABASE_URL -c "
UPDATE profiles
SET email = 'deleted-user-' || id || '@example.com',
    username = 'deleted-user-' || id,
    full_name = 'Deleted User'
WHERE id = '$USER_ID';
"
```

## Resources

- [PostgreSQL Backup Documentation](https://www.postgresql.org/docs/current/backup.html)
- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [Supabase Backup Guide](https://supabase.com/docs/guides/platform/backups)
- [Vercel Deployment Rollback](https://vercel.com/docs/deployments/rollbacks)
