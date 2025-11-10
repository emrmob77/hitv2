import { Metadata } from 'next';
import ReactMarkdown from 'react-markdown';
import { Card, CardContent } from '@/components/ui/card';
import { Code, BookOpen, Key, Webhook, Zap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'API Documentation | HitTags',
  description: 'Complete API documentation for HitTags - RESTful API and GraphQL endpoints',
};

// API Documentation content
const apiDocs = `# HitTags API Documentation

## 🚀 API Overview

HitTags RESTful API provides programmatic access to bookmarks, collections, premium content, and user data.

**Base URL:** \`https://api.hittags.com/v1\`
**Authentication:** Bearer Token (JWT) or API Key

## 🔐 Authentication

### API Key Authentication
All API requests require authentication using an API key. You can generate API keys from the [Developer Dashboard](/dashboard/developer).

**Header Format:**
\`\`\`http
Authorization: Bearer YOUR_API_KEY:YOUR_SECRET_KEY
\`\`\`

Or use custom headers:
\`\`\`http
X-API-Key: YOUR_API_KEY
X-API-Secret: YOUR_SECRET_KEY
\`\`\`

### Get Access Token (JWT)
\`\`\`http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
\`\`\`

**Response:**
\`\`\`json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600,
  "user": {
    "id": "uuid",
    "username": "johndoe",
    "email": "user@example.com",
    "is_premium": true
  }
}
\`\`\`

## 📚 Bookmarks API

### List Bookmarks
\`\`\`http
GET /api/bookmarks?page=1&limit=20&tags=javascript,react&privacy=public
Authorization: Bearer {token}
\`\`\`

**Query Parameters:**
- \`page\` (int): Page number (default: 1)
- \`limit\` (int): Items per page (max: 100, default: 20)
- \`tags\` (string): Comma-separated tag names
- \`privacy\` (string): public, private, subscribers
- \`user_id\` (uuid): Filter by user
- \`collection_id\` (uuid): Filter by collection
- \`sort\` (string): created_at, updated_at, like_count, view_count
- \`order\` (string): asc, desc (default: desc)

### Create Bookmark
\`\`\`http
POST /api/bookmarks
Authorization: Bearer {token}
Content-Type: application/json

{
  "url": "https://example.com",
  "title": "Example Website",
  "description": "A great example",
  "tags": ["javascript", "react"],
  "privacy_level": "public",
  "collection_id": "uuid"
}
\`\`\`

### Get Bookmark
\`\`\`http
GET /api/bookmarks/{bookmarkId}
Authorization: Bearer {token}
\`\`\`

### Update Bookmark
\`\`\`http
PATCH /api/bookmarks/{bookmarkId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated description"
}
\`\`\`

### Delete Bookmark
\`\`\`http
DELETE /api/bookmarks/{bookmarkId}
Authorization: Bearer {token}
\`\`\`

## 📁 Collections API

### List Collections
\`\`\`http
GET /api/collections?user_id=uuid&public=true
\`\`\`

### Create Collection
\`\`\`http
POST /api/collections
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Web Development Resources",
  "description": "Curated web development bookmarks",
  "is_public": true,
  "cover_image_url": "https://example.com/cover.jpg"
}
\`\`\`

### Add Bookmark to Collection
\`\`\`http
POST /api/collections/{id}/bookmarks
Authorization: Bearer {token}
Content-Type: application/json

{
  "bookmark_id": "uuid"
}
\`\`\`

## 🏷️ Tags API

### List Tags
\`\`\`http
GET /api/tags?trending=true&limit=50
\`\`\`

### Get Tag Details
\`\`\`http
GET /api/tags/{slug}
\`\`\`

### Create Tag
\`\`\`http
POST /api/tags
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Vue.js",
  "description": "Vue.js framework resources",
  "color": "#4fc08d"
}
\`\`\`

## 👤 Users API

### Get User Profile
\`\`\`http
GET /api/users/{username}
\`\`\`

### Follow/Unfollow User
\`\`\`http
POST /api/follows/{id}
Authorization: Bearer {token}
\`\`\`

\`\`\`http
DELETE /api/follows/{id}
Authorization: Bearer {token}
\`\`\`

## 🔍 Search API

### Search Content
\`\`\`http
GET /api/search?q=javascript&type=bookmarks,posts&limit=20
Authorization: Bearer {token}
\`\`\`

**Query Parameters:**
- \`q\` (string): Search query
- \`type\` (string): bookmarks, posts, collections, users
- \`tags\` (string): Filter by tags
- \`user_id\` (uuid): Filter by user

## 🎯 GraphQL API

HitTags also provides a GraphQL API endpoint for flexible data queries.

### Endpoint
\`\`\`http
POST /api/graphql
Authorization: Bearer {api_key}:{secret_key}
Content-Type: application/json

{
  "query": "query GetBookmarks { bookmarks(limit: 10) { data { id title url } } }"
}
\`\`\`

### Example Query
\`\`\`graphql
query GetBookmarks {
  bookmarks(limit: 10) {
    data {
      id
      title
      url
      tags
    }
    pagination {
      total
      has_more
    }
  }
}
\`\`\`

### Example Mutation
\`\`\`graphql
mutation CreateBookmark {
  createBookmark(input: {
    url: "https://example.com"
    title: "Example"
    tags: ["example", "test"]
  }) {
    id
    title
    url
  }
}
\`\`\`

Visit [/api/graphql](/api/graphql) for schema information and examples.

## 🔔 Webhooks

### Available Events
- \`bookmark.created\`
- \`bookmark.updated\`
- \`bookmark.deleted\`
- \`bookmark.liked\`
- \`post.created\`
- \`user.followed\`
- \`collection.created\`

### Webhook Payload Example
\`\`\`json
{
  "event": "bookmark.created",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "id": "uuid",
    "url": "https://example.com",
    "title": "Example Website"
  }
}
\`\`\`

Manage webhooks from the [Developer Dashboard](/dashboard/developer/webhooks).

## ⚠️ Error Responses

All API endpoints return consistent error responses:

\`\`\`json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "url": ["Invalid URL format"],
      "title": ["Title is required"]
    }
  }
}
\`\`\`

**Common Error Codes:**
- \`UNAUTHORIZED\` (401): Invalid or missing authentication
- \`FORBIDDEN\` (403): Insufficient permissions
- \`NOT_FOUND\` (404): Resource not found
- \`VALIDATION_ERROR\` (422): Invalid input data
- \`RATE_LIMIT_EXCEEDED\` (429): Too many requests
- \`INTERNAL_ERROR\` (500): Server error

## 🚦 Rate Limiting

- **Free users:** 100 requests/hour
- **Pro users:** 1000 requests/hour  
- **Enterprise users:** 10000 requests/hour

Rate limit headers:
\`\`\`
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
\`\`\`

## 📖 Getting Started

1. **Create an API Key**
   - Go to [Developer Dashboard](/dashboard/developer)
   - Click "Create API Key"
   - Copy your API key and secret

2. **Make Your First Request**
   \`\`\`bash
   curl -X GET "https://api.hittags.com/v1/bookmarks" \\
     -H "Authorization: Bearer YOUR_API_KEY:YOUR_SECRET_KEY"
   \`\`\`

3. **Explore GraphQL**
   - Visit [/api/graphql](/api/graphql) for interactive schema
   - Use GraphQL for complex queries and relationships

## 🔗 Resources

- [Developer Dashboard](/dashboard/developer) - Manage API keys and webhooks
- [GraphQL Endpoint](/api/graphql) - GraphQL schema and examples
- [Webhook Management](/dashboard/developer/webhooks) - Configure webhooks
`;

export default function APIDocumentationPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
              <Code className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">API Documentation</h1>
              <p className="mt-1 text-sm text-neutral-600">
                Complete guide to HitTags RESTful API and GraphQL endpoints
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-4">
            <a
              href="/dashboard/developer"
              className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            >
              <Key className="h-4 w-4" />
              API Keys
            </a>
            <a
              href="/api/graphql"
              className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            >
              <Zap className="h-4 w-4" />
              GraphQL
            </a>
            <a
              href="/dashboard/developer/webhooks"
              className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            >
              <Webhook className="h-4 w-4" />
              Webhooks
            </a>
            <a
              href="#getting-started"
              className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            >
              <BookOpen className="h-4 w-4" />
              Getting Started
            </a>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <Card>
          <CardContent className="p-8">
            <div className="prose prose-neutral max-w-none prose-headings:font-semibold prose-h1:text-3xl prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3 prose-code:rounded prose-code:bg-neutral-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-pre:bg-neutral-900 prose-pre:text-neutral-100">
              <ReactMarkdown
                components={{
                  code: ({ node, inline, className, children, ...props }: any) => {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <pre className="overflow-x-auto rounded-lg bg-neutral-900 p-4 text-sm text-neutral-100">
                        <code className="text-neutral-100" {...props}>
                          {children}
                        </code>
                      </pre>
                    ) : (
                      <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-sm" {...props}>
                        {children}
                      </code>
                    );
                  },
                  a: ({ node, ...props }: any) => (
                    <a className="text-blue-600 hover:underline" {...props} />
                  ),
                }}
              >
                {apiDocs}
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

