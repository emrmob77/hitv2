/**
 * Webhook Management Dashboard
 *
 * Create and manage webhook subscriptions for real-time event notifications
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { WebhookIcon, TrashIcon, PlusIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface WebhookSubscription {
  id: string;
  url: string;
  events: string[];
  is_active: boolean;
  failed_attempts: number;
  last_success_at?: string;
  last_failure_at?: string;
  description?: string;
  created_at: string;
}

const WEBHOOK_EVENTS = [
  { id: 'bookmark.created', label: 'Bookmark Created', description: 'When a new bookmark is created' },
  { id: 'bookmark.updated', label: 'Bookmark Updated', description: 'When a bookmark is updated' },
  { id: 'bookmark.deleted', label: 'Bookmark Deleted', description: 'When a bookmark is deleted' },
  { id: 'collection.created', label: 'Collection Created', description: 'When a new collection is created' },
  { id: 'collection.updated', label: 'Collection Updated', description: 'When a collection is updated' },
  { id: 'collection.deleted', label: 'Collection Deleted', description: 'When a collection is deleted' },
];

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<WebhookSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Form state
  const [url, setUrl] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>(['bookmark.created']);
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const fetchWebhooks = async () => {
    try {
      const response = await fetch('/api/developer/webhooks');
      if (response.ok) {
        const data = await response.json();
        setWebhooks(data.webhooks || []);
      }
    } catch (error) {
      toast.error('Failed to fetch webhooks');
    } finally {
      setLoading(false);
    }
  };

  const createWebhook = async () => {
    if (!url.trim()) {
      toast.error('Please enter a webhook URL');
      return;
    }

    if (selectedEvents.length === 0) {
      toast.error('Please select at least one event');
      return;
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      toast.error('Please enter a valid URL');
      return;
    }

    setCreating(true);
    try {
      const response = await fetch('/api/developer/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          events: selectedEvents,
          description,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Webhook created successfully');
        toast.info(`Secret key: ${data.webhook.secret_key}`, { duration: 10000 });
        resetForm();
        fetchWebhooks();
      } else {
        const error = await response.json();
        toast.error(error.details || 'Failed to create webhook');
      }
    } catch (error) {
      toast.error('Error creating webhook');
    } finally {
      setCreating(false);
    }
  };

  const deleteWebhook = async (id: string) => {
    if (!confirm('Are you sure you want to delete this webhook?')) return;

    try {
      const response = await fetch(`/api/developer/webhooks?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Webhook deleted');
        fetchWebhooks();
      } else {
        toast.error('Failed to delete webhook');
      }
    } catch (error) {
      toast.error('Error deleting webhook');
    }
  };

  const resetForm = () => {
    setUrl('');
    setSelectedEvents(['bookmark.created']);
    setDescription('');
    setShowCreateDialog(false);
  };

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/developer">← Back to Developer Dashboard</Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold">Webhook Management</h1>
          <p className="mt-2 text-muted-foreground">
            Receive real-time notifications when events occur
          </p>
        </div>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" />
              Create Webhook
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Webhook</DialogTitle>
              <DialogDescription>
                Subscribe to real-time events from the HitV2 API
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="webhook-url">Webhook URL</Label>
                <Input
                  id="webhook-url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://your-app.com/webhooks/hitv2"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  The URL where webhook events will be sent
                </p>
              </div>

              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Production webhook for my app"
                />
              </div>

              <div>
                <Label>Events to Subscribe</Label>
                <div className="mt-2 space-y-2">
                  {WEBHOOK_EVENTS.map((event) => (
                    <div key={event.id} className="flex items-start space-x-2">
                      <Checkbox
                        id={event.id}
                        checked={selectedEvents.includes(event.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedEvents([...selectedEvents, event.id]);
                          } else {
                            setSelectedEvents(selectedEvents.filter((e) => e !== event.id));
                          }
                        }}
                      />
                      <div className="flex-1">
                        <label
                          htmlFor={event.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {event.label}
                        </label>
                        <p className="text-xs text-muted-foreground">{event.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                <p className="text-sm text-blue-900">
                  <strong>Note:</strong> You'll receive a secret key after creation. Use it to
                  verify webhook signatures.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={createWebhook} disabled={creating}>
                {creating ? 'Creating...' : 'Create Webhook'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Documentation */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-sm">Webhook Documentation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p className="text-muted-foreground">
              Webhooks send HTTP POST requests to your URL when events occur. Each request includes:
            </p>
            <ul className="ml-4 list-disc space-y-1 text-muted-foreground">
              <li>Event type in the <code>X-Webhook-Event</code> header</li>
              <li>HMAC signature in the <code>X-Webhook-Signature</code> header for verification</li>
              <li>Event data in the request body as JSON</li>
            </ul>
            <Button asChild variant="link" className="h-auto p-0">
              <a href="/docs/api#webhooks" target="_blank">
                View full documentation →
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Webhooks Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your Webhooks</CardTitle>
          <CardDescription>
            Manage your webhook subscriptions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground">Loading...</p>
          ) : webhooks.length === 0 ? (
            <div className="py-12 text-center">
              <WebhookIcon className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="mb-2 font-medium">No webhooks configured</p>
              <p className="mb-4 text-sm text-muted-foreground">
                Create your first webhook to receive real-time notifications
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <PlusIcon className="mr-2 h-4 w-4" />
                Create Webhook
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>URL</TableHead>
                  <TableHead>Events</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {webhooks.map((webhook) => (
                  <TableRow key={webhook.id}>
                    <TableCell>
                      <div>
                        <code className="text-xs">{webhook.url}</code>
                        {webhook.description && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {webhook.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {webhook.events.slice(0, 2).map((event) => (
                          <Badge key={event} variant="secondary" className="text-xs">
                            {event}
                          </Badge>
                        ))}
                        {webhook.events.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{webhook.events.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {webhook.is_active ? (
                          <>
                            <CheckCircleIcon className="h-4 w-4 text-green-600" />
                            <span className="text-sm">Active</span>
                          </>
                        ) : (
                          <>
                            <XCircleIcon className="h-4 w-4 text-red-600" />
                            <span className="text-sm">Inactive</span>
                          </>
                        )}
                      </div>
                      {webhook.failed_attempts > 0 && (
                        <p className="mt-1 text-xs text-red-600">
                          {webhook.failed_attempts} failed attempts
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="text-xs" suppressHydrationWarning>
                      {webhook.last_success_at ? (
                        <div>
                          <div className="text-green-600">
                            ✓ {new Date(webhook.last_success_at).toLocaleString()}
                          </div>
                        </div>
                      ) : webhook.last_failure_at ? (
                        <div className="text-red-600">
                          ✗ {new Date(webhook.last_failure_at).toLocaleString()}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No activity yet</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteWebhook(webhook.id)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Test Webhook Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-sm">Testing Webhooks</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-sm text-muted-foreground">
            Use these services to test your webhooks before deploying to production:
          </p>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <a href="https://webhook.site" target="_blank" rel="noopener noreferrer">
                webhook.site
              </a>
            </Button>
            <Button asChild variant="outline" size="sm">
              <a href="https://requestbin.com" target="_blank" rel="noopener noreferrer">
                RequestBin
              </a>
            </Button>
            <Button asChild variant="outline" size="sm">
              <a href="https://hookbin.com" target="_blank" rel="noopener noreferrer">
                Hookbin
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
