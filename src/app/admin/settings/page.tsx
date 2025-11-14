/**
 * Admin Settings Page
 *
 * Configure system-wide settings and preferences
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Settings,
  Mail,
  Shield,
  Database,
  Zap,
  Save,
  RefreshCw,
  Globe,
  DollarSign,
} from 'lucide-react';
import { toast } from 'sonner';

interface SystemSettings {
  site_name: string;
  site_description: string;
  support_email: string;
  enable_registrations: boolean;
  enable_social_features: boolean;
  enable_ai_processing: boolean;
  enable_email_notifications: boolean;
  max_bookmarks_free: number;
  max_bookmarks_pro: number;
  max_bookmarks_premium: number;
  api_rate_limit_default: number;
  maintenance_mode: boolean;
  maintenance_message: string;
}

interface EmailSettings {
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
  smtp_from_email: string;
  smtp_from_name: string;
  enable_email_verification: boolean;
}

interface SecuritySettings {
  require_email_verification: boolean;
  enable_2fa: boolean;
  password_min_length: number;
  max_login_attempts: number;
  session_timeout_hours: number;
  allowed_domains: string;
}

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // System Settings
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    site_name: 'HitV2',
    site_description: 'Your intelligent bookmark manager',
    support_email: 'support@hitv2.com',
    enable_registrations: true,
    enable_social_features: true,
    enable_ai_processing: true,
    enable_email_notifications: true,
    max_bookmarks_free: 100,
    max_bookmarks_pro: 1000,
    max_bookmarks_premium: 10000,
    api_rate_limit_default: 100,
    maintenance_mode: false,
    maintenance_message: '',
  });

  // Email Settings
  const [emailSettings, setEmailSettings] = useState<EmailSettings>({
    smtp_host: '',
    smtp_port: 587,
    smtp_username: '',
    smtp_password: '',
    smtp_from_email: '',
    smtp_from_name: 'HitV2',
    enable_email_verification: true,
  });

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    require_email_verification: true,
    enable_2fa: false,
    password_min_length: 8,
    max_login_attempts: 5,
    session_timeout_hours: 24,
    allowed_domains: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      if (response.ok) {
        const data = await response.json();
        if (data.system) setSystemSettings(data.system);
        if (data.email) setEmailSettings(data.email);
        if (data.security) setSecuritySettings(data.security);
      }
    } catch (error) {
      toast.error('Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (type: 'system' | 'email' | 'security') => {
    setSaving(true);
    try {
      const settingsData =
        type === 'system'
          ? systemSettings
          : type === 'email'
          ? emailSettings
          : securitySettings;

      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          settings: settingsData,
        }),
      });

      if (response.ok) {
        toast.success('Settings saved successfully');
      } else {
        toast.error('Failed to save settings');
      }
    } catch (error) {
      toast.error('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const testEmailSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailSettings),
      });

      if (response.ok) {
        toast.success('Test email sent successfully');
      } else {
        toast.error('Failed to send test email');
      }
    } catch (error) {
      toast.error('Error sending test email');
    }
  };

  if (loading) {
    return (
      <div className="container max-w-7xl py-8">
        <p className="text-center text-muted-foreground">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Settings</h1>
        <p className="mt-2 text-muted-foreground">
          Configure system-wide settings and preferences
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">
            <Settings className="mr-2 h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="mr-2 h-4 w-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="mr-2 h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="limits">
            <Database className="mr-2 h-4 w-4" />
            Limits
          </TabsTrigger>
          <TabsTrigger value="features">
            <Zap className="mr-2 h-4 w-4" />
            Features
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Site Information</CardTitle>
              <CardDescription>Basic information about your site</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="site-name">Site Name</Label>
                <Input
                  id="site-name"
                  value={systemSettings.site_name}
                  onChange={(e) =>
                    setSystemSettings({ ...systemSettings, site_name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="site-description">Site Description</Label>
                <Textarea
                  id="site-description"
                  value={systemSettings.site_description}
                  onChange={(e) =>
                    setSystemSettings({ ...systemSettings, site_description: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="support-email">Support Email</Label>
                <Input
                  id="support-email"
                  type="email"
                  value={systemSettings.support_email}
                  onChange={(e) =>
                    setSystemSettings({ ...systemSettings, support_email: e.target.value })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Maintenance Mode</CardTitle>
              <CardDescription>
                Temporarily disable access to the site for maintenance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Enable Maintenance Mode</p>
                  <p className="text-sm text-muted-foreground">
                    Only admins will be able to access the site
                  </p>
                </div>
                <Switch
                  checked={systemSettings.maintenance_mode}
                  onCheckedChange={(checked) =>
                    setSystemSettings({ ...systemSettings, maintenance_mode: checked })
                  }
                />
              </div>
              {systemSettings.maintenance_mode && (
                <div>
                  <Label htmlFor="maintenance-message">Maintenance Message</Label>
                  <Textarea
                    id="maintenance-message"
                    value={systemSettings.maintenance_message}
                    onChange={(e) =>
                      setSystemSettings({
                        ...systemSettings,
                        maintenance_message: e.target.value,
                      })
                    }
                    placeholder="We're currently performing maintenance. Please check back soon."
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={() => saveSettings('system')} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SMTP Configuration</CardTitle>
              <CardDescription>Configure your email server settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="smtp-host">SMTP Host</Label>
                  <Input
                    id="smtp-host"
                    value={emailSettings.smtp_host}
                    onChange={(e) =>
                      setEmailSettings({ ...emailSettings, smtp_host: e.target.value })
                    }
                    placeholder="smtp.example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="smtp-port">SMTP Port</Label>
                  <Input
                    id="smtp-port"
                    type="number"
                    value={emailSettings.smtp_port}
                    onChange={(e) =>
                      setEmailSettings({ ...emailSettings, smtp_port: parseInt(e.target.value) })
                    }
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="smtp-username">SMTP Username</Label>
                <Input
                  id="smtp-username"
                  value={emailSettings.smtp_username}
                  onChange={(e) =>
                    setEmailSettings({ ...emailSettings, smtp_username: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="smtp-password">SMTP Password</Label>
                <Input
                  id="smtp-password"
                  type="password"
                  value={emailSettings.smtp_password}
                  onChange={(e) =>
                    setEmailSettings({ ...emailSettings, smtp_password: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="from-email">From Email</Label>
                  <Input
                    id="from-email"
                    type="email"
                    value={emailSettings.smtp_from_email}
                    onChange={(e) =>
                      setEmailSettings({ ...emailSettings, smtp_from_email: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="from-name">From Name</Label>
                  <Input
                    id="from-name"
                    value={emailSettings.smtp_from_name}
                    onChange={(e) =>
                      setEmailSettings({ ...emailSettings, smtp_from_name: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Enable Email Verification</p>
                  <p className="text-sm text-muted-foreground">
                    Require users to verify their email address
                  </p>
                </div>
                <Switch
                  checked={emailSettings.enable_email_verification}
                  onCheckedChange={(checked) =>
                    setEmailSettings({ ...emailSettings, enable_email_verification: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={testEmailSettings}>
              <Mail className="mr-2 h-4 w-4" />
              Send Test Email
            </Button>
            <Button onClick={() => saveSettings('email')} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Authentication & Security</CardTitle>
              <CardDescription>Configure security and authentication settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Require Email Verification</p>
                  <p className="text-sm text-muted-foreground">
                    Users must verify their email before accessing the site
                  </p>
                </div>
                <Switch
                  checked={securitySettings.require_email_verification}
                  onCheckedChange={(checked) =>
                    setSecuritySettings({ ...securitySettings, require_email_verification: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Enable Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">
                    Allow users to enable 2FA for their accounts
                  </p>
                </div>
                <Switch
                  checked={securitySettings.enable_2fa}
                  onCheckedChange={(checked) =>
                    setSecuritySettings({ ...securitySettings, enable_2fa: checked })
                  }
                />
              </div>
              <div>
                <Label htmlFor="password-length">Minimum Password Length</Label>
                <Input
                  id="password-length"
                  type="number"
                  value={securitySettings.password_min_length}
                  onChange={(e) =>
                    setSecuritySettings({
                      ...securitySettings,
                      password_min_length: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="max-attempts">Maximum Login Attempts</Label>
                <Input
                  id="max-attempts"
                  type="number"
                  value={securitySettings.max_login_attempts}
                  onChange={(e) =>
                    setSecuritySettings({
                      ...securitySettings,
                      max_login_attempts: parseInt(e.target.value),
                    })
                  }
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Account will be locked after this many failed attempts
                </p>
              </div>
              <div>
                <Label htmlFor="session-timeout">Session Timeout (hours)</Label>
                <Input
                  id="session-timeout"
                  type="number"
                  value={securitySettings.session_timeout_hours}
                  onChange={(e) =>
                    setSecuritySettings({
                      ...securitySettings,
                      session_timeout_hours: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="allowed-domains">Allowed Email Domains</Label>
                <Textarea
                  id="allowed-domains"
                  value={securitySettings.allowed_domains}
                  onChange={(e) =>
                    setSecuritySettings({ ...securitySettings, allowed_domains: e.target.value })
                  }
                  placeholder="example.com, company.org (leave empty to allow all)"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={() => saveSettings('security')} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </TabsContent>

        {/* Limits Settings */}
        <TabsContent value="limits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Usage Limits</CardTitle>
              <CardDescription>Set limits for different subscription tiers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="free-limit">Free Tier - Max Bookmarks</Label>
                <Input
                  id="free-limit"
                  type="number"
                  value={systemSettings.max_bookmarks_free}
                  onChange={(e) =>
                    setSystemSettings({
                      ...systemSettings,
                      max_bookmarks_free: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="pro-limit">Pro Tier - Max Bookmarks</Label>
                <Input
                  id="pro-limit"
                  type="number"
                  value={systemSettings.max_bookmarks_pro}
                  onChange={(e) =>
                    setSystemSettings({
                      ...systemSettings,
                      max_bookmarks_pro: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="premium-limit">Premium Tier - Max Bookmarks</Label>
                <Input
                  id="premium-limit"
                  type="number"
                  value={systemSettings.max_bookmarks_premium}
                  onChange={(e) =>
                    setSystemSettings({
                      ...systemSettings,
                      max_bookmarks_premium: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="api-rate-limit">API Rate Limit (requests/hour)</Label>
                <Input
                  id="api-rate-limit"
                  type="number"
                  value={systemSettings.api_rate_limit_default}
                  onChange={(e) =>
                    setSystemSettings({
                      ...systemSettings,
                      api_rate_limit_default: parseInt(e.target.value),
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={() => saveSettings('system')} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </TabsContent>

        {/* Features Settings */}
        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feature Toggles</CardTitle>
              <CardDescription>Enable or disable platform features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Enable User Registrations</p>
                  <p className="text-sm text-muted-foreground">
                    Allow new users to register accounts
                  </p>
                </div>
                <Switch
                  checked={systemSettings.enable_registrations}
                  onCheckedChange={(checked) =>
                    setSystemSettings({ ...systemSettings, enable_registrations: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Enable Social Features</p>
                  <p className="text-sm text-muted-foreground">
                    Following, likes, comments, and sharing
                  </p>
                </div>
                <Switch
                  checked={systemSettings.enable_social_features}
                  onCheckedChange={(checked) =>
                    setSystemSettings({ ...systemSettings, enable_social_features: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Enable AI Processing</p>
                  <p className="text-sm text-muted-foreground">
                    Auto-tagging, summarization, and content analysis
                  </p>
                </div>
                <Switch
                  checked={systemSettings.enable_ai_processing}
                  onCheckedChange={(checked) =>
                    setSystemSettings({ ...systemSettings, enable_ai_processing: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Enable Email Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Send email notifications to users
                  </p>
                </div>
                <Switch
                  checked={systemSettings.enable_email_notifications}
                  onCheckedChange={(checked) =>
                    setSystemSettings({ ...systemSettings, enable_email_notifications: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={() => saveSettings('system')} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
