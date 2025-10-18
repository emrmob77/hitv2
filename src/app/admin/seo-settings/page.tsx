import { Metadata } from 'next';
import { Save, RefreshCw, Edit, Check, Link as LinkIcon, Eye, Image, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'SEO Settings',
};

export default function AdminSeoSettingsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="mb-2 text-3xl font-semibold text-neutral-900">SEO Settings</h1>
        <p className="text-neutral-600">Manage your platform's search engine optimization settings</p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Meta Tags Management - 2 columns */}
        <section className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Meta Tag Management</CardTitle>
              <Button size="sm">
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  Global Title Template
                </label>
                <Input
                  type="text"
                  defaultValue="%s | HitTags - Social Bookmark Platform"
                  className="w-full"
                />
                <p className="mt-1 text-xs text-neutral-500">
                  Use %s as placeholder for page-specific titles
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  Global Description
                </label>
                <Textarea
                  rows={3}
                  defaultValue="Discover, organize and share your favorite web content with HitTags. The social bookmark platform for content curators, researchers and digital enthusiasts."
                  placeholder="Default meta description for your platform"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-700">
                    Open Graph Image
                  </label>
                  <div className="rounded-lg border border-neutral-300 p-4 text-center">
                    <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-lg bg-neutral-100">
                      <Image className="h-6 w-6 text-neutral-400" />
                    </div>
                    <p className="text-sm text-neutral-600">1200x630px recommended</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Upload Image
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-700">Favicon</label>
                  <div className="rounded-lg border border-neutral-300 p-4 text-center">
                    <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-lg bg-neutral-100">
                      <Bookmark className="h-6 w-6 text-neutral-400" />
                    </div>
                    <p className="text-sm text-neutral-600">32x32px ICO format</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Upload Favicon
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">Keywords</label>
                <Input
                  type="text"
                  defaultValue="bookmarks, social bookmarking, content curation, web organization"
                  className="w-full"
                />
                <p className="mt-1 text-xs text-neutral-500">Separate keywords with commas</p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Right Sidebar - 1 column */}
        <section className="space-y-6">
          {/* SEO Tools */}
          <Card>
            <CardHeader>
              <CardTitle>SEO Tools</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-neutral-200 p-4">
                <div>
                  <p className="text-sm font-medium text-neutral-900">Sitemap</p>
                  <p className="text-xs text-neutral-600">Last updated: 2 hours ago</p>
                </div>
                <Button variant="outline" size="sm">
                  <RefreshCw className="mr-1 h-4 w-4" />
                  Regenerate
                </Button>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-neutral-200 p-4">
                <div>
                  <p className="text-sm font-medium text-neutral-900">Robots.txt</p>
                  <p className="text-xs text-neutral-600">Configure crawler access</p>
                </div>
                <Button variant="outline" size="sm">
                  <Edit className="mr-1 h-4 w-4" />
                  Edit
                </Button>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-neutral-200 p-4">
                <div>
                  <p className="text-sm font-medium text-neutral-900">Schema Markup</p>
                  <p className="text-xs text-neutral-600">Structured data validation</p>
                </div>
                <Button variant="outline" size="sm">
                  <Check className="mr-1 h-4 w-4" />
                  Validate
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Analytics Integration */}
          <Card>
            <CardHeader>
              <CardTitle>Analytics Integration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  Google Analytics ID
                </label>
                <Input type="text" placeholder="G-XXXXXXXXXX" />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  Google Search Console
                </label>
                <Input type="text" placeholder="Verification code" />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  Bing Webmaster
                </label>
                <Input type="text" placeholder="Verification code" />
              </div>

              <Button className="w-full">
                <LinkIcon className="mr-2 h-4 w-4" />
                Connect Analytics
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Robots.txt Editor */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Robots.txt Editor</CardTitle>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
            <Button size="sm">
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700">
                Robots.txt Content
              </label>
              <Textarea
                rows={12}
                defaultValue={`User-agent: *
Allow: /

User-agent: Googlebot
Allow: /
Crawl-delay: 1

User-agent: Bingbot
Allow: /
Crawl-delay: 2

Disallow: /admin/
Disallow: /api/
Disallow: /private/

Sitemap: https://hittags.com/sitemap.xml`}
                className="font-mono text-sm"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700">
                Quick Templates
              </label>
              <div className="space-y-2">
                <button className="w-full rounded-lg border border-neutral-200 p-3 text-left hover:bg-neutral-50">
                  <p className="text-sm font-medium text-neutral-900">Allow All Crawlers</p>
                  <p className="text-xs text-neutral-600">Basic configuration for most sites</p>
                </button>
                <button className="w-full rounded-lg border border-neutral-200 p-3 text-left hover:bg-neutral-50">
                  <p className="text-sm font-medium text-neutral-900">Restrict Admin Areas</p>
                  <p className="text-xs text-neutral-600">Block access to sensitive directories</p>
                </button>
                <button className="w-full rounded-lg border border-neutral-200 p-3 text-left hover:bg-neutral-50">
                  <p className="text-sm font-medium text-neutral-900">Development Mode</p>
                  <p className="text-xs text-neutral-600">Block all crawlers during development</p>
                </button>
              </div>

              <div className="mt-6">
                <h3 className="mb-3 text-sm font-medium text-neutral-700">Validation Status</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span className="text-sm text-neutral-600">Syntax: Valid</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span className="text-sm text-neutral-600">Sitemap: Referenced</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 rounded-full bg-neutral-300"></div>
                    <span className="text-sm text-neutral-600">Last crawled: 12 hours ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SEO Performance */}
      <Card>
        <CardHeader>
          <CardTitle>SEO Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <p className="mb-1 text-2xl font-bold text-neutral-900">94</p>
              <p className="text-sm text-neutral-600">PageSpeed Score</p>
            </div>
            <div className="text-center">
              <p className="mb-1 text-2xl font-bold text-neutral-900">12,453</p>
              <p className="text-sm text-neutral-600">Indexed Pages</p>
            </div>
            <div className="text-center">
              <p className="mb-1 text-2xl font-bold text-neutral-900">847</p>
              <p className="text-sm text-neutral-600">Organic Keywords</p>
            </div>
            <div className="text-center">
              <p className="mb-1 text-2xl font-bold text-neutral-900">23,891</p>
              <p className="text-sm text-neutral-600">Monthly Clicks</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <h3 className="mb-4 text-lg font-semibold text-neutral-900">Top Keywords</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-700">social bookmarking</span>
                  <span className="text-sm text-neutral-600">Position 3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-700">bookmark manager</span>
                  <span className="text-sm text-neutral-600">Position 7</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-700">content curation</span>
                  <span className="text-sm text-neutral-600">Position 12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-700">web organization</span>
                  <span className="text-sm text-neutral-600">Position 15</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-lg font-semibold text-neutral-900">Recent Issues</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="mt-2 h-2 w-2 rounded-full bg-yellow-400"></div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900">
                      Missing alt tags on 23 images
                    </p>
                    <p className="text-xs text-neutral-600">Accessibility impact</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="mt-2 h-2 w-2 rounded-full bg-orange-400"></div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900">Slow loading on mobile</p>
                    <p className="text-xs text-neutral-600">Core Web Vitals</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="mt-2 h-2 w-2 rounded-full bg-red-400"></div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900">
                      Duplicate meta descriptions
                    </p>
                    <p className="text-xs text-neutral-600">12 pages affected</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
