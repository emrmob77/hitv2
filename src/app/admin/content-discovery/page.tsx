import { Metadata } from 'next';
import { Save, Eye, Filter, BarChart, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const metadata: Metadata = {
  title: 'Content Discovery Flow',
};

export default function ContentDiscoveryPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="mb-2 text-3xl font-semibold text-neutral-900">
          Content Discovery Flow Management
        </h1>
        <p className="text-neutral-600">Configure and optimize the content exploration experience</p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Flow Configuration - 2 columns */}
        <section className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Discovery Flow Configuration</CardTitle>
              <Button size="sm">
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: Explore Page Entry */}
              <div className="rounded-lg border border-neutral-200 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-sm text-white">
                      1
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-900">Explore Page Entry</h3>
                  </div>
                  <label className="flex items-center space-x-2">
                    <Checkbox defaultChecked />
                    <span className="text-sm text-neutral-600">Enabled</span>
                  </label>
                </div>
                <p className="mb-3 text-sm text-neutral-600">
                  Configure landing experience and initial content display
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm text-neutral-700">Default View</label>
                    <Select defaultValue="popular">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="popular">Popular Content</SelectItem>
                        <SelectItem value="recent">Recent Bookmarks</SelectItem>
                        <SelectItem value="personalized">Personalized Feed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-neutral-700">Items per Page</label>
                    <Input type="number" defaultValue="24" />
                  </div>
                </div>
              </div>

              {/* Step 2: Filter Application */}
              <div className="rounded-lg border border-neutral-200 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-sm text-white">
                      2
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-900">Filter Application</h3>
                  </div>
                  <label className="flex items-center space-x-2">
                    <Checkbox defaultChecked />
                    <span className="text-sm text-neutral-600">Enabled</span>
                  </label>
                </div>
                <p className="mb-3 text-sm text-neutral-600">Search and filtering capabilities</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm text-neutral-700">Available Filters</label>
                    <div className="space-y-1">
                      <label className="flex items-center text-sm">
                        <Checkbox defaultChecked className="mr-2" />
                        Category
                      </label>
                      <label className="flex items-center text-sm">
                        <Checkbox defaultChecked className="mr-2" />
                        Date Range
                      </label>
                      <label className="flex items-center text-sm">
                        <Checkbox defaultChecked className="mr-2" />
                        Popularity
                      </label>
                      <label className="flex items-center text-sm">
                        <Checkbox className="mr-2" />
                        User Rating
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-neutral-700">Search Features</label>
                    <div className="space-y-1">
                      <label className="flex items-center text-sm">
                        <Checkbox defaultChecked className="mr-2" />
                        Auto-complete
                      </label>
                      <label className="flex items-center text-sm">
                        <Checkbox defaultChecked className="mr-2" />
                        Tag suggestions
                      </label>
                      <label className="flex items-center text-sm">
                        <Checkbox className="mr-2" />
                        Advanced search
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3: Bookmark Inspection */}
              <div className="rounded-lg border border-neutral-200 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-sm text-white">
                      3
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-900">Bookmark Inspection</h3>
                  </div>
                  <label className="flex items-center space-x-2">
                    <Checkbox defaultChecked />
                    <span className="text-sm text-neutral-600">Enabled</span>
                  </label>
                </div>
                <p className="mb-3 text-sm text-neutral-600">
                  Content preview and quick view options
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm text-neutral-700">Preview Mode</label>
                    <Select defaultValue="hover">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hover">Hover Preview</SelectItem>
                        <SelectItem value="click">Click to Expand</SelectItem>
                        <SelectItem value="modal">Modal Popup</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-neutral-700">Preview Content</label>
                    <div className="space-y-1">
                      <label className="flex items-center text-sm">
                        <Checkbox defaultChecked className="mr-2" />
                        Description
                      </label>
                      <label className="flex items-center text-sm">
                        <Checkbox defaultChecked className="mr-2" />
                        Tags
                      </label>
                      <label className="flex items-center text-sm">
                        <Checkbox className="mr-2" />
                        Comments count
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4: Like & Save Actions */}
              <div className="rounded-lg border border-neutral-200 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-sm text-white">
                      4
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-900">Like & Save Actions</h3>
                  </div>
                  <label className="flex items-center space-x-2">
                    <Checkbox defaultChecked />
                    <span className="text-sm text-neutral-600">Enabled</span>
                  </label>
                </div>
                <p className="mb-3 text-sm text-neutral-600">
                  Quick interaction buttons and feedback
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm text-neutral-700">Quick Actions</label>
                    <div className="space-y-1">
                      <label className="flex items-center text-sm">
                        <Checkbox defaultChecked className="mr-2" />
                        Like button
                      </label>
                      <label className="flex items-center text-sm">
                        <Checkbox defaultChecked className="mr-2" />
                        Save to collection
                      </label>
                      <label className="flex items-center text-sm">
                        <Checkbox defaultChecked className="mr-2" />
                        Share button
                      </label>
                      <label className="flex items-center text-sm">
                        <Checkbox className="mr-2" />
                        Report content
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-neutral-700">
                      Interaction Feedback
                    </label>
                    <Select defaultValue="instant">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="instant">Instant visual feedback</SelectItem>
                        <SelectItem value="notification">Success notification</SelectItem>
                        <SelectItem value="minimal">Minimal feedback</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Step 5: Profile Navigation */}
              <div className="rounded-lg border border-neutral-200 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-sm text-white">
                      5
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-900">Profile Navigation</h3>
                  </div>
                  <label className="flex items-center space-x-2">
                    <Checkbox defaultChecked />
                    <span className="text-sm text-neutral-600">Enabled</span>
                  </label>
                </div>
                <p className="mb-3 text-sm text-neutral-600">
                  User profile access and information display
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm text-neutral-700">Profile Access</label>
                    <Select defaultValue="both">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="avatar">Click on avatar</SelectItem>
                        <SelectItem value="username">Click on username</SelectItem>
                        <SelectItem value="both">Both options</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-neutral-700">Profile Preview</label>
                    <div className="space-y-1">
                      <label className="flex items-center text-sm">
                        <Checkbox defaultChecked className="mr-2" />
                        User stats
                      </label>
                      <label className="flex items-center text-sm">
                        <Checkbox defaultChecked className="mr-2" />
                        Recent activity
                      </label>
                      <label className="flex items-center text-sm">
                        <Checkbox className="mr-2" />
                        Follow button
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 6: Follow Actions */}
              <div className="rounded-lg border border-neutral-200 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-sm text-white">
                      6
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-900">Follow Actions</h3>
                  </div>
                  <label className="flex items-center space-x-2">
                    <Checkbox defaultChecked />
                    <span className="text-sm text-neutral-600">Enabled</span>
                  </label>
                </div>
                <p className="mb-3 text-sm text-neutral-600">
                  User following and social features
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm text-neutral-700">
                      Follow Button Style
                    </label>
                    <Select defaultValue="primary">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="primary">Primary button</SelectItem>
                        <SelectItem value="outline">Outline button</SelectItem>
                        <SelectItem value="icon">Icon only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-neutral-700">
                      Follow Suggestions
                    </label>
                    <div className="space-y-1">
                      <label className="flex items-center text-sm">
                        <Checkbox defaultChecked className="mr-2" />
                        Similar interests
                      </label>
                      <label className="flex items-center text-sm">
                        <Checkbox defaultChecked className="mr-2" />
                        Popular users
                      </label>
                      <label className="flex items-center text-sm">
                        <Checkbox className="mr-2" />
                        Mutual connections
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Right Sidebar - Statistics & Actions */}
        <section className="space-y-6">
          {/* Discovery Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Discovery Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-700">Engagement Rate</span>
                  <span className="text-lg font-bold text-neutral-900">76%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-neutral-200">
                  <div className="h-2 rounded-full bg-neutral-900" style={{ width: '76%' }}></div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-neutral-900">12,456</p>
                    <p className="text-sm text-neutral-600">Page Views</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-neutral-900">9,467</p>
                    <p className="text-sm text-neutral-600">Interactions</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Flow Step Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Flow Step Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-700">Explore Entry</span>
                  <span className="text-sm text-neutral-600">100%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-700">Filter Usage</span>
                  <span className="text-sm text-neutral-600">68%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-700">Content Inspection</span>
                  <span className="text-sm text-neutral-600">84%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-700">Like/Save Actions</span>
                  <span className="text-sm text-neutral-600">76%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-700">Profile Visits</span>
                  <span className="text-sm text-neutral-600">42%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-700">Follow Actions</span>
                  <span className="text-sm text-neutral-600">28%</span>
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
                  <Eye className="mr-2 h-4 w-4" />
                  Preview Flow
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Filter className="mr-2 h-4 w-4" />
                  Test Filters
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <BarChart className="mr-2 h-4 w-4" />
                  View Analytics
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="mr-2 h-4 w-4" />
                  Export Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Discovery Flow Optimization */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Discovery Flow Optimization</CardTitle>
            <CardDescription>A/B testing and optimization experiments</CardDescription>
          </div>
          <Button size="sm">
            <Save className="mr-2 h-4 w-4" />
            Create A/B Test
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-neutral-200 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-medium text-neutral-900">Test 1: Filter Layout</h3>
                <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
                  Active
                </span>
              </div>
              <p className="mb-3 text-xs text-neutral-600">
                Testing horizontal vs vertical filter layout
              </p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-600">Variant A: 52%</span>
                <span className="text-neutral-600">Variant B: 48%</span>
              </div>
            </div>

            <div className="rounded-lg border border-neutral-200 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-medium text-neutral-900">Test 2: Preview Mode</h3>
                <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-700">
                  Pending
                </span>
              </div>
              <p className="mb-3 text-xs text-neutral-600">
                Testing hover vs click preview interaction
              </p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-600">Starting soon</span>
              </div>
            </div>

            <div className="rounded-lg border border-neutral-200 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-medium text-neutral-900">Test 3: CTA Position</h3>
                <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs text-neutral-600">
                  Completed
                </span>
              </div>
              <p className="mb-3 text-xs text-neutral-600">
                Testing action button placement
              </p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-green-600">Winner: Variant A (+12%)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
