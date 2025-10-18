import { Metadata } from 'next';
import { Save, Play, Download, Copy, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const metadata: Metadata = {
  title: 'User Onboarding Management',
};

export default function OnboardingSettingsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="mb-2 text-3xl font-semibold text-neutral-900">
          User Onboarding Management
        </h1>
        <p className="text-neutral-600">Configure and monitor the new user onboarding experience</p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Onboarding Flow - 2 columns */}
        <section className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Onboarding Flow Configuration</CardTitle>
              <Button size="sm">
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1 */}
              <div className="rounded-lg border border-neutral-200 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-sm text-white">
                      1
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-900">Landing Page Welcome</h3>
                  </div>
                  <label className="flex items-center space-x-2">
                    <Checkbox defaultChecked />
                    <span className="text-sm text-neutral-600">Enabled</span>
                  </label>
                </div>
                <p className="mb-3 text-sm text-neutral-600">
                  First impression and value proposition display
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm text-neutral-700">Welcome Message</label>
                    <Input type="text" defaultValue="Welcome to HitTags!" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-neutral-700">CTA Button Text</label>
                    <Input type="text" defaultValue="Get Started" />
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="rounded-lg border border-neutral-200 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-sm text-white">
                      2
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-900">Registration Process</h3>
                  </div>
                  <label className="flex items-center space-x-2">
                    <Checkbox defaultChecked />
                    <span className="text-sm text-neutral-600">Enabled</span>
                  </label>
                </div>
                <p className="mb-3 text-sm text-neutral-600">
                  User account creation and verification
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm text-neutral-700">Required Fields</label>
                    <div className="space-y-1">
                      <label className="flex items-center text-sm">
                        <Checkbox defaultChecked className="mr-2" />
                        Email Address
                      </label>
                      <label className="flex items-center text-sm">
                        <Checkbox defaultChecked className="mr-2" />
                        Password
                      </label>
                      <label className="flex items-center text-sm">
                        <Checkbox className="mr-2" />
                        Full Name
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-neutral-700">
                      Social Login Options
                    </label>
                    <div className="space-y-1">
                      <label className="flex items-center text-sm">
                        <Checkbox defaultChecked className="mr-2" />
                        Google
                      </label>
                      <label className="flex items-center text-sm">
                        <Checkbox defaultChecked className="mr-2" />
                        GitHub
                      </label>
                      <label className="flex items-center text-sm">
                        <Checkbox className="mr-2" />
                        Twitter
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="rounded-lg border border-neutral-200 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-sm text-white">
                      3
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-900">Email Verification</h3>
                  </div>
                  <label className="flex items-center space-x-2">
                    <Checkbox defaultChecked />
                    <span className="text-sm text-neutral-600">Required</span>
                  </label>
                </div>
                <p className="mb-3 text-sm text-neutral-600">
                  Email confirmation and account activation
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm text-neutral-700">Email Template</label>
                    <Select defaultValue="welcome">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="welcome">Welcome Template</SelectItem>
                        <SelectItem value="minimal">Minimal Template</SelectItem>
                        <SelectItem value="branded">Branded Template</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-neutral-700">Resend Limit</label>
                    <Input type="number" defaultValue="3" />
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="rounded-lg border border-neutral-200 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-sm text-white">
                      4
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-900">Profile Setup</h3>
                  </div>
                  <label className="flex items-center space-x-2">
                    <Checkbox defaultChecked />
                    <span className="text-sm text-neutral-600">Enabled</span>
                  </label>
                </div>
                <p className="mb-3 text-sm text-neutral-600">Complete user profile information</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm text-neutral-700">Avatar Upload</label>
                    <Select defaultValue="optional">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="optional">Optional</SelectItem>
                        <SelectItem value="required">Required</SelectItem>
                        <SelectItem value="skip">Skip</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-neutral-700">Bio Description</label>
                    <Select defaultValue="optional">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="optional">Optional</SelectItem>
                        <SelectItem value="required">Required</SelectItem>
                        <SelectItem value="skip">Skip</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Step 5 */}
              <div className="rounded-lg border border-neutral-200 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-sm text-white">
                      5
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-900">First Bookmark</h3>
                  </div>
                  <label className="flex items-center space-x-2">
                    <Checkbox defaultChecked />
                    <span className="text-sm text-neutral-600">Guided</span>
                  </label>
                </div>
                <p className="mb-3 text-sm text-neutral-600">Tutorial for adding first bookmark</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm text-neutral-700">Tutorial Style</label>
                    <Select defaultValue="tour">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tour">Interactive Tour</SelectItem>
                        <SelectItem value="video">Video Guide</SelectItem>
                        <SelectItem value="step">Step by Step</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-neutral-700">Skip Option</label>
                    <Select defaultValue="allowed">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="allowed">Allowed</SelectItem>
                        <SelectItem value="not-allowed">Not Allowed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Step 6 */}
              <div className="rounded-lg border border-neutral-200 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-sm text-white">
                      6
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-900">Follow Suggestions</h3>
                  </div>
                  <label className="flex items-center space-x-2">
                    <Checkbox defaultChecked />
                    <span className="text-sm text-neutral-600">Enabled</span>
                  </label>
                </div>
                <p className="mb-3 text-sm text-neutral-600">
                  Recommend users and content to follow
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm text-neutral-700">Suggestion Count</label>
                    <Input type="number" defaultValue="5" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-neutral-700">Algorithm</label>
                    <Select defaultValue="popular">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="popular">Popular Users</SelectItem>
                        <SelectItem value="similar">Similar Interests</SelectItem>
                        <SelectItem value="random">Random</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Right Sidebar */}
        <section className="space-y-6">
          {/* Onboarding Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Onboarding Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-700">Completion Rate</span>
                  <span className="text-lg font-bold text-neutral-900">73%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-neutral-200">
                  <div className="h-2 rounded-full bg-neutral-900" style={{ width: '73%' }}></div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-neutral-900">1,247</p>
                    <p className="text-sm text-neutral-600">Started</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-neutral-900">911</p>
                    <p className="text-sm text-neutral-600">Completed</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Step Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-700">Landing Page</span>
                  <span className="text-sm text-neutral-600">96%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-700">Registration</span>
                  <span className="text-sm text-neutral-600">84%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-700">Email Verification</span>
                  <span className="text-sm text-neutral-600">78%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-700">Profile Setup</span>
                  <span className="text-sm text-neutral-600">81%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-700">First Bookmark</span>
                  <span className="text-sm text-neutral-600">73%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-700">Follow Suggestions</span>
                  <span className="text-sm text-neutral-600">67%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Play className="mr-2 h-4 w-4" />
                  Preview Onboarding
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="mr-2 h-4 w-4" />
                  Export Analytics
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate Flow
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reset to Default
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Onboarding Templates */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Onboarding Templates</CardTitle>
          <Button size="sm">
            <Save className="mr-2 h-4 w-4" />
            Create Template
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-neutral-200 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-neutral-900">Standard Flow</h3>
                <span className="rounded bg-neutral-100 px-2 py-1 text-xs text-neutral-700">
                  Active
                </span>
              </div>
              <p className="mb-4 text-sm text-neutral-600">
                Complete 6-step onboarding with all features enabled
              </p>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1">
                  Edit
                </Button>
                <Button size="sm" className="flex-1">
                  Activate
                </Button>
              </div>
            </div>

            <div className="rounded-lg border border-neutral-200 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-neutral-900">Quick Start</h3>
                <span className="rounded bg-neutral-100 px-2 py-1 text-xs text-neutral-700">
                  Draft
                </span>
              </div>
              <p className="mb-4 text-sm text-neutral-600">
                Minimal 3-step flow for faster user activation
              </p>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1">
                  Edit
                </Button>
                <Button size="sm" className="flex-1">
                  Activate
                </Button>
              </div>
            </div>

            <div className="rounded-lg border border-neutral-200 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-neutral-900">Premium Focus</h3>
                <span className="rounded bg-neutral-100 px-2 py-1 text-xs text-neutral-700">
                  Draft
                </span>
              </div>
              <p className="mb-4 text-sm text-neutral-600">
                Enhanced flow with premium feature highlights
              </p>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1">
                  Edit
                </Button>
                <Button size="sm" className="flex-1">
                  Activate
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
