import { Metadata } from 'next';
import { Save, Play, TrendingUp, Download, RefreshCw } from 'lucide-react';
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
  title: 'Bookmark Addition Flow',
};

export default function BookmarkAddFlowPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="mb-2 text-3xl font-semibold text-neutral-900">
          Bookmark Addition Flow Management
        </h1>
        <p className="text-neutral-600">Configure and optimize the bookmark creation process</p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Flow Configuration - 2 columns */}
        <section className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Flow Configuration</CardTitle>
              <Button size="sm">
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: Add Button Trigger */}
              <div className="rounded-lg border border-neutral-200 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-sm text-white">
                      1
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-900">Add Button Trigger</h3>
                  </div>
                  <label className="flex items-center space-x-2">
                    <Checkbox defaultChecked />
                    <span className="text-sm text-neutral-600">Enabled</span>
                  </label>
                </div>
                <p className="mb-3 text-sm text-neutral-600">
                  Configure the &quot;+&quot; button and entry points
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm text-neutral-700">Button Position</label>
                    <Select defaultValue="fab">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fab">Floating Action Button</SelectItem>
                        <SelectItem value="header">Header Navigation</SelectItem>
                        <SelectItem value="both">Both Locations</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-neutral-700">Keyboard Shortcut</label>
                    <Input type="text" defaultValue="Ctrl + N" />
                  </div>
                </div>
              </div>

              {/* Step 2: URL Input */}
              <div className="rounded-lg border border-neutral-200 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-sm text-white">
                      2
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-900">URL Input</h3>
                  </div>
                  <label className="flex items-center space-x-2">
                    <Checkbox defaultChecked />
                    <span className="text-sm text-neutral-600">Required</span>
                  </label>
                </div>
                <p className="mb-3 text-sm text-neutral-600">URL validation and input handling</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm text-neutral-700">Validation Type</label>
                    <Select defaultValue="realtime">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="realtime">Real-time validation</SelectItem>
                        <SelectItem value="submit">On submit validation</SelectItem>
                        <SelectItem value="basic">Basic format check</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-neutral-700">
                      Auto-paste Detection
                    </label>
                    <Select defaultValue="enabled">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="enabled">Enabled</SelectItem>
                        <SelectItem value="disabled">Disabled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Step 3: Auto Metadata Fetching */}
              <div className="rounded-lg border border-neutral-200 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-sm text-white">
                      3
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-900">
                      Auto Metadata Fetching
                    </h3>
                  </div>
                  <label className="flex items-center space-x-2">
                    <Checkbox defaultChecked />
                    <span className="text-sm text-neutral-600">Enabled</span>
                  </label>
                </div>
                <p className="mb-3 text-sm text-neutral-600">
                  Automatic extraction of title, description, and images
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm text-neutral-700">Fetch Timeout</label>
                    <Input type="number" defaultValue="10" />
                    <span className="text-xs text-neutral-500">seconds</span>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-neutral-700">Fallback Options</label>
                    <div className="space-y-1">
                      <label className="flex items-center space-x-2 text-sm">
                        <Checkbox defaultChecked />
                        <span>Use domain name as title</span>
                      </label>
                      <label className="flex items-center space-x-2 text-sm">
                        <Checkbox defaultChecked />
                        <span>Generate placeholder image</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4: Detail Editing */}
              <div className="rounded-lg border border-neutral-200 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-sm text-white">
                      4
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-900">Detail Editing</h3>
                  </div>
                  <label className="flex items-center space-x-2">
                    <Checkbox defaultChecked />
                    <span className="text-sm text-neutral-600">Enabled</span>
                  </label>
                </div>
                <p className="mb-3 text-sm text-neutral-600">
                  Allow users to edit title and description
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm text-neutral-700">Title Editing</label>
                    <Select defaultValue="always">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="always">Always editable</SelectItem>
                        <SelectItem value="optional">Optional editing</SelectItem>
                        <SelectItem value="auto">Auto-filled only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-neutral-700">Description Limit</label>
                    <Input type="number" defaultValue="500" />
                    <span className="text-xs text-neutral-500">characters</span>
                  </div>
                </div>
              </div>

              {/* Step 5: Tag & Collection Selection */}
              <div className="rounded-lg border border-neutral-200 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-sm text-white">
                      5
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-900">
                      Tag &amp; Collection Selection
                    </h3>
                  </div>
                  <label className="flex items-center space-x-2">
                    <Checkbox defaultChecked />
                    <span className="text-sm text-neutral-600">Required</span>
                  </label>
                </div>
                <p className="mb-3 text-sm text-neutral-600">
                  Tag suggestions and collection organization
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm text-neutral-700">Tag Suggestions</label>
                    <Select defaultValue="ai">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ai">AI-powered suggestions</SelectItem>
                        <SelectItem value="popular">Popular tags</SelectItem>
                        <SelectItem value="recent">User&apos;s recent tags</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-neutral-700">
                      Max Tags per Bookmark
                    </label>
                    <Input type="number" defaultValue="10" />
                  </div>
                </div>
              </div>

              {/* Step 6: Save & Privacy */}
              <div className="rounded-lg border border-neutral-200 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-sm text-white">
                      6
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-900">Save &amp; Privacy</h3>
                  </div>
                  <label className="flex items-center space-x-2">
                    <Checkbox defaultChecked />
                    <span className="text-sm text-neutral-600">Enabled</span>
                  </label>
                </div>
                <p className="mb-3 text-sm text-neutral-600">
                  Final save options and privacy settings
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm text-neutral-700">Default Privacy</label>
                    <Select defaultValue="public">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                        <SelectItem value="followers">Followers only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-neutral-700">Auto-save Draft</label>
                    <Select defaultValue="30">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">Every 30 seconds</SelectItem>
                        <SelectItem value="60">Every 60 seconds</SelectItem>
                        <SelectItem value="disabled">Disabled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Right Sidebar - 1 column */}
        <section className="space-y-6">
          {/* Flow Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Flow Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-700">Completion Rate</span>
                <span className="text-lg font-semibold text-neutral-900">89%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-neutral-200">
                <div className="h-2 rounded-full bg-neutral-900" style={{ width: '89%' }}></div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-neutral-900">3,421</p>
                  <p className="text-sm text-neutral-600">Started</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-neutral-900">3,046</p>
                  <p className="text-sm text-neutral-600">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Step Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-700">Add Button Click</span>
                <span className="text-sm text-neutral-600">100%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-700">URL Input</span>
                <span className="text-sm text-neutral-600">95%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-700">Metadata Fetch</span>
                <span className="text-sm text-neutral-600">92%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-700">Detail Edit</span>
                <span className="text-sm text-neutral-600">87%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-700">Tag Selection</span>
                <span className="text-sm text-neutral-600">91%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-700">Final Save</span>
                <span className="text-sm text-neutral-600">89%</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Play className="mr-2 h-4 w-4" />
                Test Flow
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="mr-2 h-4 w-4" />
                View Analytics
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset Settings
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Flow Optimization */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Flow Optimization</CardTitle>
          <Button size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Create A/B Test
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Current Flow */}
            <div className="rounded-lg border border-neutral-200 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-neutral-900">Current Flow</h3>
                <span className="rounded bg-neutral-100 px-2 py-1 text-xs text-neutral-700">
                  Active
                </span>
              </div>
              <p className="mb-4 text-sm text-neutral-600">
                Standard 6-step bookmark creation process
              </p>
              <div className="mb-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-700">Avg. Time:</span>
                  <span className="text-neutral-900">2m 34s</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-700">Success Rate:</span>
                  <span className="text-neutral-900">89%</span>
                </div>
              </div>
              <Button variant="outline" className="w-full" size="sm">
                View Details
              </Button>
            </div>

            {/* Quick Add */}
            <div className="rounded-lg border border-neutral-200 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-neutral-900">Quick Add</h3>
                <span className="rounded bg-neutral-100 px-2 py-1 text-xs text-neutral-700">
                  Testing
                </span>
              </div>
              <p className="mb-4 text-sm text-neutral-600">
                Simplified 3-step process with smart defaults
              </p>
              <div className="mb-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-700">Avg. Time:</span>
                  <span className="text-neutral-900">1m 12s</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-700">Success Rate:</span>
                  <span className="text-neutral-900">94%</span>
                </div>
              </div>
              <Button className="w-full" size="sm">
                Enable Test
              </Button>
            </div>

            {/* Advanced Flow */}
            <div className="rounded-lg border border-neutral-200 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-neutral-900">Advanced Flow</h3>
                <span className="rounded bg-neutral-100 px-2 py-1 text-xs text-neutral-700">
                  Draft
                </span>
              </div>
              <p className="mb-4 text-sm text-neutral-600">
                Enhanced flow with AI-powered suggestions
              </p>
              <div className="mb-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-700">Avg. Time:</span>
                  <span className="text-neutral-900">3m 05s</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-700">Expected Rate:</span>
                  <span className="text-neutral-900">92%</span>
                </div>
              </div>
              <Button variant="outline" className="w-full" size="sm">
                Configure
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
