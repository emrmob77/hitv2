/**
 * API Documentation Portal
 *
 * Comprehensive documentation for the HitV2 Developer API
 */

'use client';

import { useState } from 'react';

export default function APIDocsPage() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">HitV2 Developer API</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Build powerful integrations with the HitV2 bookmark management platform
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'authentication', label: 'Authentication' },
            { id: 'rest', label: 'REST API' },
            { id: 'graphql', label: 'GraphQL' },
            { id: 'webhooks', label: 'Webhooks' },
            { id: 'sdk', label: 'SDKs' },
            { id: 'zapier', label: 'Zapier' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="prose dark:prose-invert max-w-none">
        {activeTab === 'overview' && <OverviewSection />}
        {activeTab === 'authentication' && <AuthenticationSection />}
        {activeTab === 'rest' && <RESTAPISection />}
        {activeTab === 'graphql' && <GraphQLSection />}
        {activeTab === 'webhooks' && <WebhooksSection />}
        {activeTab === 'sdk' && <SDKSection />}
        {activeTab === 'zapier' && <ZapierSection />}
      </div>
    </div>
  );
}

function OverviewSection() {
  return (
    <div>
      <h2>Overview</h2>
      <p>
        The HitV2 API provides programmatic access to your bookmarks, collections, and
        tags. Build custom integrations, browser extensions, mobile apps, and more.
      </p>

      <h3>Features</h3>
      <ul>
        <li><strong>RESTful API</strong> - Simple, intuitive HTTP endpoints</li>
        <li><strong>GraphQL</strong> - Flexible query language for efficient data fetching</li>
        <li><strong>Webhooks</strong> - Real-time event notifications</li>
        <li><strong>SDKs</strong> - Browser extension SDK with TypeScript support</li>
        <li><strong>Zapier Integration</strong> - Connect with 5000+ apps</li>
      </ul>

      <h3>Base URL</h3>
      <pre><code>https://hitv2.app/api/v1</code></pre>

      <h3>Rate Limits</h3>
      <p>Default rate limits (configurable per API key):</p>
      <ul>
        <li>1,000 requests per hour</li>
        <li>10,000 requests per day</li>
      </ul>
      <p>
        Rate limit information is included in response headers:
        <code>X-RateLimit-Limit-Hour</code>,
        <code>X-RateLimit-Remaining-Hour</code>
      </p>

      <h3>Quick Start</h3>
      <ol>
        <li>Create an API key in your <a href="/dashboard/developer">Developer Dashboard</a></li>
        <li>Make your first request (see Authentication tab)</li>
        <li>Build your integration using our REST API or GraphQL</li>
      </ol>
    </div>
  );
}

function AuthenticationSection() {
  return (
    <div>
      <h2>Authentication</h2>
      <p>
        All API requests require authentication using API keys. You can create and manage
        API keys from your Developer Dashboard.
      </p>

      <h3>Creating an API Key</h3>
      <ol>
        <li>Go to <a href="/dashboard/developer">Developer Dashboard</a></li>
        <li>Click "Create API Key"</li>
        <li>Set scopes and rate limits</li>
        <li>Save your API key and secret securely</li>
      </ol>

      <h3>Authentication Methods</h3>

      <h4>Method 1: Authorization Header (Recommended)</h4>
      <pre><code>{`Authorization: Bearer YOUR_API_KEY:YOUR_SECRET_KEY`}</code></pre>

      <h4>Method 2: Custom Headers</h4>
      <pre><code>{`X-API-Key: YOUR_API_KEY
X-API-Secret: YOUR_SECRET_KEY`}</code></pre>

      <h3>Example Request</h3>
      <pre><code>{`curl https://hitv2.app/api/v1/bookmarks \\
  -H "Authorization: Bearer YOUR_API_KEY:YOUR_SECRET_KEY"`}</code></pre>

      <h3>API Scopes</h3>
      <p>Control access to resources with fine-grained scopes:</p>
      <ul>
        <li><code>read:bookmarks</code> - Read bookmarks</li>
        <li><code>write:bookmarks</code> - Create and update bookmarks</li>
        <li><code>delete:bookmarks</code> - Delete bookmarks</li>
        <li><code>read:collections</code> - Read collections</li>
        <li><code>write:collections</code> - Create and update collections</li>
        <li><code>delete:collections</code> - Delete collections</li>
        <li><code>read:tags</code> - Read tags</li>
        <li><code>read:user</code> - Read user profile</li>
        <li><code>read:analytics</code> - Read analytics data</li>
      </ul>
    </div>
  );
}

function RESTAPISection() {
  return (
    <div>
      <h2>REST API</h2>
      <p>
        The REST API provides simple, intuitive endpoints for managing your bookmarks
        and collections.
      </p>

      <h3>Endpoints</h3>

      <h4>Bookmarks</h4>

      <div className="not-prose bg-gray-50 dark:bg-gray-900 p-4 rounded-lg mb-4">
        <p className="font-mono text-sm mb-2">
          <span className="text-green-600 font-bold">GET</span> /api/v1/bookmarks
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          List all bookmarks
        </p>
        <details className="text-sm">
          <summary className="cursor-pointer font-medium">Query Parameters</summary>
          <ul className="mt-2 ml-4">
            <li><code>limit</code> - Number of results (max 100, default 50)</li>
            <li><code>offset</code> - Pagination offset</li>
            <li><code>collection_id</code> - Filter by collection</li>
            <li><code>tag</code> - Filter by tag</li>
            <li><code>search</code> - Search in title/description</li>
          </ul>
        </details>
      </div>

      <div className="not-prose bg-gray-50 dark:bg-gray-900 p-4 rounded-lg mb-4">
        <p className="font-mono text-sm mb-2">
          <span className="text-blue-600 font-bold">POST</span> /api/v1/bookmarks
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          Create a new bookmark
        </p>
        <details className="text-sm">
          <summary className="cursor-pointer font-medium">Request Body</summary>
          <pre className="mt-2"><code>{`{
  "url": "https://example.com",
  "title": "Example Site",
  "description": "An example website",
  "tags": ["example", "tutorial"],
  "collection_id": "uuid",
  "is_public": false
}`}</code></pre>
        </details>
      </div>

      <div className="not-prose bg-gray-50 dark:bg-gray-900 p-4 rounded-lg mb-4">
        <p className="font-mono text-sm mb-2">
          <span className="text-yellow-600 font-bold">PUT</span> /api/v1/bookmarks/:id
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Update a bookmark
        </p>
      </div>

      <div className="not-prose bg-gray-50 dark:bg-gray-900 p-4 rounded-lg mb-4">
        <p className="font-mono text-sm mb-2">
          <span className="text-red-600 font-bold">DELETE</span> /api/v1/bookmarks/:id
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Delete a bookmark
        </p>
      </div>

      <h4>Collections</h4>

      <div className="not-prose bg-gray-50 dark:bg-gray-900 p-4 rounded-lg mb-4">
        <p className="font-mono text-sm mb-2">
          <span className="text-green-600 font-bold">GET</span> /api/v1/collections
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          List all collections
        </p>
      </div>

      <div className="not-prose bg-gray-50 dark:bg-gray-900 p-4 rounded-lg mb-4">
        <p className="font-mono text-sm mb-2">
          <span className="text-blue-600 font-bold">POST</span> /api/v1/collections
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Create a new collection
        </p>
      </div>

      <h4>Tags</h4>

      <div className="not-prose bg-gray-50 dark:bg-gray-900 p-4 rounded-lg mb-4">
        <p className="font-mono text-sm mb-2">
          <span className="text-green-600 font-bold">GET</span> /api/v1/tags
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          List all tags with usage counts
        </p>
      </div>

      <h3>Example: Create a Bookmark</h3>
      <pre><code>{`curl -X POST https://hitv2.app/api/v1/bookmarks \\
  -H "Authorization: Bearer YOUR_API_KEY:YOUR_SECRET_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://example.com",
    "title": "Example Site",
    "tags": ["example"]
  }'`}</code></pre>
    </div>
  );
}

function GraphQLSection() {
  return (
    <div>
      <h2>GraphQL API</h2>
      <p>
        The GraphQL API provides a flexible, efficient way to query your data with
        exactly the fields you need.
      </p>

      <h3>Endpoint</h3>
      <pre><code>https://hitv2.app/api/graphql</code></pre>

      <h3>Example: Query Bookmarks</h3>
      <pre><code>{`query GetBookmarks {
  bookmarks(limit: 10) {
    data {
      id
      url
      title
      tags
      created_at
      collection {
        id
        name
      }
    }
    pagination {
      total
      has_more
    }
  }
}`}</code></pre>

      <h3>Example: Create Bookmark</h3>
      <pre><code>{`mutation CreateBookmark {
  createBookmark(input: {
    url: "https://example.com"
    title: "Example Site"
    tags: ["example", "tutorial"]
  }) {
    id
    url
    title
    created_at
  }
}`}</code></pre>

      <h3>Making Requests</h3>
      <pre><code>{`curl -X POST https://hitv2.app/api/graphql \\
  -H "Authorization: Bearer YOUR_API_KEY:YOUR_SECRET_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "query { bookmarks(limit: 5) { data { title } } }"
  }'`}</code></pre>

      <h3>Available Types</h3>
      <ul>
        <li><code>Bookmark</code> - Bookmark data</li>
        <li><code>Collection</code> - Collection data</li>
        <li><code>Tag</code> - Tag with usage count</li>
        <li><code>User</code> - User profile</li>
      </ul>
    </div>
  );
}

function WebhooksSection() {
  return (
    <div>
      <h2>Webhooks</h2>
      <p>
        Webhooks allow you to receive real-time notifications when events occur in your
        HitV2 account.
      </p>

      <h3>Creating a Webhook</h3>
      <p>Create webhooks via the Developer Dashboard or API:</p>
      <pre><code>{`curl -X POST https://hitv2.app/api/developer/webhooks \\
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://your-app.com/webhooks",
    "events": ["bookmark.created", "bookmark.updated"],
    "description": "My webhook"
  }'`}</code></pre>

      <h3>Available Events</h3>
      <ul>
        <li><code>bookmark.created</code> - New bookmark created</li>
        <li><code>bookmark.updated</code> - Bookmark updated</li>
        <li><code>bookmark.deleted</code> - Bookmark deleted</li>
        <li><code>collection.created</code> - New collection created</li>
        <li><code>collection.updated</code> - Collection updated</li>
        <li><code>collection.deleted</code> - Collection deleted</li>
      </ul>

      <h3>Webhook Payload</h3>
      <pre><code>{`{
  "event": "bookmark.created",
  "data": {
    "id": "uuid",
    "url": "https://example.com",
    "title": "Example",
    "created_at": "2025-01-01T00:00:00Z"
  },
  "timestamp": "2025-01-01T00:00:00Z"
}`}</code></pre>

      <h3>Verifying Webhooks</h3>
      <p>
        Verify webhook authenticity by checking the <code>X-Webhook-Signature</code> header:
      </p>
      <pre><code>{`const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}`}</code></pre>

      <h3>Retry Logic</h3>
      <p>
        Failed webhook deliveries are automatically retried with exponential backoff:
      </p>
      <ul>
        <li>Attempt 1: Immediate</li>
        <li>Attempt 2: After 2 minutes</li>
        <li>Attempt 3: After 4 minutes</li>
      </ul>
    </div>
  );
}

function SDKSection() {
  return (
    <div>
      <h2>Browser Extension SDK</h2>
      <p>
        The official TypeScript SDK for building browser extensions that integrate with
        HitV2.
      </p>

      <h3>Installation</h3>
      <pre><code>npm install @hitv2/browser-extension-sdk</code></pre>

      <h3>Quick Start</h3>
      <pre><code>{`import { HitV2SDK } from '@hitv2/browser-extension-sdk';

const sdk = new HitV2SDK({
  apiKey: 'your-api-key',
  secretKey: 'your-secret-key',
});

// List bookmarks
const bookmarks = await sdk.bookmarks.list({ limit: 10 });

// Create bookmark
const bookmark = await sdk.bookmarks.create({
  url: 'https://example.com',
  title: 'Example',
  tags: ['example'],
});

// Bookmark current tab (Chrome/Firefox)
const result = await sdk.extension.bookmarkCurrentTab();`}</code></pre>

      <h3>Browser Extension Helpers</h3>
      <ul>
        <li>
          <code>bookmarkCurrentTab()</code> - Automatically bookmark the active tab
        </li>
        <li>
          <code>isCurrentTabBookmarked()</code> - Check if current page is bookmarked
        </li>
        <li>
          <code>getContextInfo()</code> - Get context for right-click menus
        </li>
      </ul>

      <h3>Example Extension</h3>
      <p>
        Check out the <a href="https://github.com/emrmob77/hitv2/tree/main/sdk/browser-extension/examples">
        example Chrome extension
        </a> in our repository for a complete working example.
      </p>
    </div>
  );
}

function ZapierSection() {
  return (
    <div>
      <h2>Zapier Integration</h2>
      <p>
        Connect HitV2 with 5000+ apps using Zapier. No coding required!
      </p>

      <h3>Available Triggers</h3>
      <ul>
        <li><strong>New Bookmark</strong> - Triggers when a new bookmark is created</li>
        <li><strong>New Collection</strong> - Triggers when a new collection is created</li>
      </ul>

      <h3>Available Actions</h3>
      <ul>
        <li><strong>Create Bookmark</strong> - Create a new bookmark in HitV2</li>
        <li><strong>Add Tag</strong> - Add a tag to an existing bookmark</li>
      </ul>

      <h3>Example Zaps</h3>
      <ul>
        <li>Save new Pocket items to HitV2</li>
        <li>Create HitV2 bookmarks from starred GitHub repos</li>
        <li>Send new HitV2 bookmarks to Slack</li>
        <li>Add new Feedly items to HitV2</li>
      </ul>

      <h3>Setup</h3>
      <ol>
        <li>Go to <a href="https://zapier.com" target="_blank">Zapier</a></li>
        <li>Search for "HitV2"</li>
        <li>Connect your HitV2 account with your API key</li>
        <li>Create your Zap!</li>
      </ol>
    </div>
  );
}
