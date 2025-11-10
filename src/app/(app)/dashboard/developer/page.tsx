/**
 * Developer Dashboard - API Keys Management
 *
 * Create and manage API keys for third-party integrations
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
import { KeyIcon, TrashIcon, EyeIcon, CopyIcon, PlusIcon } from 'lucide-react';
import { toast } from 'sonner';

interface APIKey {
  id: string;
  key_name: string;
  api_key: string;
  scopes: string[];
  rate_limit_per_hour: number;
  rate_limit_per_day: number;
  is_active: boolean;
  last_used_at?: string;
  created_at: string;
}

const AVAILABLE_SCOPES = [
  { id: 'read:bookmarks', label: 'Read Bookmarks', description: 'View bookmarks' },
  { id: 'write:bookmarks', label: 'Write Bookmarks', description: 'Create and update bookmarks' },
  { id: 'delete:bookmarks', label: 'Delete Bookmarks', description: 'Delete bookmarks' },
  { id: 'read:collections', label: 'Read Collections', description: 'View collections' },
  { id: 'write:collections', label: 'Write Collections', description: 'Create and update collections' },
  { id: 'delete:collections', label: 'Delete Collections', description: 'Delete collections' },
  { id: 'read:tags', label: 'Read Tags', description: 'View tags' },
  { id: 'read:user', label: 'Read User', description: 'View user profile' },
  { id: 'read:analytics', label: 'Read Analytics', description: 'View analytics data' },
];

export default function DeveloperDashboardPage() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newKeyResult, setNewKeyResult] = useState<{ api_key: string; secret_key: string } | null>(null);

  // Form state
  const [keyName, setKeyName] = useState('');
  const [selectedScopes, setSelectedScopes] = useState<string[]>(['read:bookmarks']);
  const [hourlyLimit, setHourlyLimit] = useState(1000);
  const [dailyLimit, setDailyLimit] = useState(10000);

  useEffect(() => {
    fetchAPIKeys();
  }, []);

  const fetchAPIKeys = async () => {
    try {
      const response = await fetch('/api/developer/api-keys');
      if (response.ok) {
        const data = await response.json();
        setApiKeys(data.api_keys || []);
      }
    } catch (error) {
      toast.error('Failed to fetch API keys');
    } finally {
      setLoading(false);
    }
  };

  const createAPIKey = async () => {
    if (!keyName.trim()) {
      toast.error('Please enter a key name');
      return;
    }

    if (selectedScopes.length === 0) {
      toast.error('Please select at least one scope');
      return;
    }

    setCreating(true);
    try {
      const response = await fetch('/api/developer/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key_name: keyName,
          scopes: selectedScopes,
          rate_limit_per_hour: hourlyLimit,
          rate_limit_per_day: dailyLimit,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setNewKeyResult({
          api_key: data.api_key,
          secret_key: data.secret_key,
        });
        toast.success('API key created successfully');
        fetchAPIKeys();
      } else {
        toast.error('Failed to create API key');
      }
    } catch (error) {
      toast.error('Error creating API key');
    } finally {
      setCreating(false);
    }
  };

  const deleteAPIKey = async (id: string) => {
    if (!confirm('Are you sure you want to delete this API key?')) return;

    try {
      const response = await fetch(`/api/developer/api-keys?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('API key deleted');
        fetchAPIKeys();
      } else {
        toast.error('Failed to delete API key');
      }
    } catch (error) {
      toast.error('Error deleting API key');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const resetForm = () => {
    setKeyName('');
    setSelectedScopes(['read:bookmarks']);
    setHourlyLimit(1000);
    setDailyLimit(10000);
    setNewKeyResult(null);
    setShowCreateDialog(false);
  };

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Developer Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Manage API keys for third-party integrations
          </p>
        </div>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" />
              Create API Key
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New API Key</DialogTitle>
              <DialogDescription>
                Generate a new API key for accessing the HitV2 API
              </DialogDescription>
            </DialogHeader>

            {newKeyResult ? (
              <div className="space-y-4">
                <div className="rounded-lg border border-amber-500 bg-amber-50 p-4">
                  <p className="mb-2 font-medium text-amber-900">
                    ⚠️ Save these credentials now!
                  </p>
                  <p className="text-sm text-amber-800">
                    The secret key will not be shown again. Store it securely.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label>API Key</Label>
                    <div className="mt-1 flex gap-2">
                      <Input value={newKeyResult.api_key} readOnly />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(newKeyResult.api_key)}
                      >
                        <CopyIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label>Secret Key</Label>
                    <div className="mt-1 flex gap-2">
                      <Input value={newKeyResult.secret_key} readOnly />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(newKeyResult.secret_key)}
                      >
                        <CopyIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button onClick={resetForm}>Done</Button>
                </DialogFooter>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="key-name">Key Name</Label>
                  <Input
                    id="key-name"
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                    placeholder="e.g., My App Integration"
                  />
                </div>

                <div>
                  <Label>Scopes</Label>
                  <div className="mt-2 space-y-2">
                    {AVAILABLE_SCOPES.map((scope) => (
                      <div key={scope.id} className="flex items-start space-x-2">
                        <Checkbox
                          id={scope.id}
                          checked={selectedScopes.includes(scope.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedScopes([...selectedScopes, scope.id]);
                            } else {
                              setSelectedScopes(selectedScopes.filter((s) => s !== scope.id));
                            }
                          }}
                        />
                        <div className="flex-1">
                          <label
                            htmlFor={scope.id}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {scope.label}
                          </label>
                          <p className="text-xs text-muted-foreground">{scope.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="hourly-limit">Hourly Limit</Label>
                    <Input
                      id="hourly-limit"
                      type="number"
                      value={hourlyLimit}
                      onChange={(e) => setHourlyLimit(parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="daily-limit">Daily Limit</Label>
                    <Input
                      id="daily-limit"
                      type="number"
                      value={dailyLimit}
                      onChange={(e) => setDailyLimit(parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createAPIKey} disabled={creating}>
                    {creating ? 'Creating...' : 'Create API Key'}
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Documentation Links */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">API Documentation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-sm text-muted-foreground">
              Learn how to use the HitV2 API
            </p>
            <Button asChild variant="outline" size="sm" className="w-full">
              <a href="/docs/api" target="_blank">
                View Docs
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">GraphQL Playground</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-sm text-muted-foreground">
              Test GraphQL queries
            </p>
            <Button asChild variant="outline" size="sm" className="w-full">
              <a href="/api/graphql" target="_blank">
                Open Playground
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Webhooks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-sm text-muted-foreground">
              Manage webhook subscriptions
            </p>
            <Button asChild variant="outline" size="sm" className="w-full">
              <a href="/dashboard/developer/webhooks">
                Manage Webhooks
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* API Keys Table */}
      <Card>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
          <CardDescription>
            Your API keys for accessing the HitV2 API
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground">Loading...</p>
          ) : apiKeys.length === 0 ? (
            <div className="py-12 text-center">
              <KeyIcon className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="mb-2 font-medium">No API keys yet</p>
              <p className="mb-4 text-sm text-muted-foreground">
                Create your first API key to get started
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <PlusIcon className="mr-2 h-4 w-4" />
                Create API Key
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>API Key</TableHead>
                  <TableHead>Scopes</TableHead>
                  <TableHead>Rate Limit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell className="font-medium">{key.key_name}</TableCell>
                    <TableCell>
                      <code className="text-xs">{key.api_key.substring(0, 20)}...</code>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {key.scopes.slice(0, 2).map((scope) => (
                          <Badge key={scope} variant="secondary" className="text-xs">
                            {scope}
                          </Badge>
                        ))}
                        {key.scopes.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{key.scopes.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">
                      {key.rate_limit_per_hour}/hr
                      <br />
                      {key.rate_limit_per_day}/day
                    </TableCell>
                    <TableCell>
                      {key.is_active ? (
                        <Badge variant="default" className="bg-green-600">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs" suppressHydrationWarning>
                      {key.last_used_at
                        ? new Date(key.last_used_at).toLocaleDateString()
                        : 'Never'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteAPIKey(key.id)}
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
    </div>
  );
}
