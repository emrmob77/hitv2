# HitTags API Documentation

## 🚀 API Overview

HitTags RESTful API provides programmatic access to bookmarks, collections, premium content, and user data.

**Base URL:** `https://api.hittags.com/v1`
**Authentication:** Bearer Token (JWT)

## 🔐 Authentication

### Get Access Token
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
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
```

### Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## 📚 Bookmarks API

### List Bookmarks
```http
GET /bookmarks?page=1&limit=20&tags=javascript,react&privacy=public
Authorization: Bearer {token}
```

**Query Parameters:**
- `page` (int): Page number (default: 1)
- `limit` (int): Items per page (max: 100, default: 20)
- `tags` (string): Comma-separated tag names
- `privacy` (string): public, private, subscribers
- `user_id` (uuid): Filter by user
- `collection_id` (uuid): Filter by collection
- `sort` (string): created_at, updated_at, like_count, view_count
- `order` (string): asc, desc (default: desc)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "url": "https://example.com",
      "title": "Example Website",
      "description": "A great example website",
      "favicon_url": "https://example.com/favicon.ico",
      "preview_image_url": "https://example.com/og-image.jpg",
      "privacy_level": "public",
      "like_count": 15,
      "comment_count": 3,
      "view_count": 120,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z",
      "user": {
        "id": "uuid",
        "username": "johndoe",
        "display_name": "John Doe",
        "avatar_url": "https://example.com/avatar.jpg"
      },
      "tags": [
        {
          "id": "uuid",
          "name": "javascript",
          "slug": "javascript",
          "color": "#f7df1e"
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8,
    "has_next": true,
    "has_prev": false
  }
}
```

### Create Bookmark
```http
POST /bookmarks
Authorization: Bearer {token}
Content-Type: application/json

{
  "url": "https://example.com",
  "title": "Custom Title",
  "description": "Custom description",
  "tags": ["javascript", "tutorial"],
  "collection_id": "uuid",
  "privacy_level": "public"
}
```

### Get Bookmark
```http
GET /bookmarks/{id}
Authorization: Bearer {token}
```

### Update Bookmark
```http
PUT /bookmarks/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated description",
  "tags": ["javascript", "react"],
  "privacy_level": "private"
}
```

### Delete Bookmark
```http
DELETE /bookmarks/{id}
Authorization: Bearer {token}
```

### Like/Unlike Bookmark
```http
POST /bookmarks/{id}/like
Authorization: Bearer {token}
```

```http
DELETE /bookmarks/{id}/like
Authorization: Bearer {token}
```

## 🏷️ Tags API

### List Tags
```http
GET /tags?trending=true&limit=50
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "javascript",
      "slug": "javascript",
      "description": "JavaScript programming language resources",
      "color": "#f7df1e",
      "usage_count": 1250,
      "is_trending": true,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Get Tag Details
```http
GET /tags/{slug}
```

### Create Tag
```http
POST /tags
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Vue.js",
  "description": "Vue.js framework resources",
  "color": "#4fc08d"
}
```

## 📁 Collections API

### List Collections
```http
GET /collections?user_id=uuid&public=true
```

### Create Collection
```http
POST /collections
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Web Development Resources",
  "description": "Curated web development bookmarks",
  "is_public": true,
  "cover_image_url": "https://example.com/cover.jpg"
}
```

### Add Bookmark to Collection
```http
POST /collections/{id}/bookmarks
Authorization: Bearer {token}
Content-Type: application/json

{
  "bookmark_id": "uuid"
}
```

## 👤 Users API

### Get User Profile
```http
GET /users/{username}
```

**Response:**
```json
{
  "id": "uuid",
  "username": "johndoe",
  "display_name": "John Doe",
  "bio": "Web developer and tech enthusiast",
  "avatar_url": "https://example.com/avatar.jpg",
  "website_url": "https://johndoe.com",
  "is_premium": true,
  "is_verified": true,
  "bookmark_count": 150,
  "follower_count": 1200,
  "following_count": 300,
  "created_at": "2023-06-15T10:00:00Z"
}
```

### Follow/Unfollow User
```http
POST /users/{id}/follow
Authorization: Bearer {token}
```

```http
DELETE /users/{id}/follow
Authorization: Bearer {token}
```

### Subscribe/Unsubscribe to User
```http
POST /users/{id}/subscribe
Authorization: Bearer {token}
```

## 🎨 Premium Posts API

### List Premium Posts
```http
GET /posts?user_id=uuid&content_type=image&privacy=public
Authorization: Bearer {token}
```

**Query Parameters:**
- `content_type`: text, image, video, document, audio, mixed
- `privacy`: public, private, subscribers, premium

### Create Premium Post
```http
POST /posts
Authorization: Bearer {token}
Content-Type: multipart/form-data

{
  "title": "My Premium Post",
  "content": "Rich text content with **markdown**",
  "content_type": "mixed",
  "privacy_level": "subscribers",
  "tags": ["tutorial", "premium"],
  "media": [file1, file2]
}
```

### Get Premium Post
```http
GET /posts/{id}
Authorization: Bearer {token}
```

## 🔗 Link Groups API

### List Link Groups
```http
GET /link-groups?user_id=uuid
```

### Create Link Group
```http
POST /link-groups
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "My Links",
  "slug": "my-links",
  "description": "All my important links",
  "theme_color": "#3b82f6",
  "background_type": "solid",
  "background_value": "#ffffff"
}
```

### Add Link to Group
```http
POST /link-groups/{id}/items
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "My Website",
  "url": "https://johndoe.com",
  "description": "Personal website",
  "position": 1
}
```

## 💰 Affiliate API

### Create Affiliate Link
```http
POST /affiliate/links
Authorization: Bearer {token}
Content-Type: application/json

{
  "bookmark_id": "uuid",
  "original_url": "https://example.com/product",
  "affiliate_url": "https://affiliate.com/track?id=123",
  "commission_rate": 5.0
}
```

### Get Affiliate Analytics
```http
GET /affiliate/analytics?start_date=2024-01-01&end_date=2024-01-31
Authorization: Bearer {token}
```

## 📊 Analytics API

### Get User Analytics
```http
GET /analytics/overview?period=30d
Authorization: Bearer {token}
```

**Response:**
```json
{
  "bookmarks": {
    "total": 150,
    "growth": 12.5,
    "views": 5420,
    "likes": 890
  },
  "collections": {
    "total": 15,
    "growth": 25.0,
    "followers": 340
  },
  "premium_posts": {
    "total": 25,
    "views": 2100,
    "engagement_rate": 8.5
  },
  "affiliate": {
    "clicks": 450,
    "conversions": 23,
    "earnings": 125.50
  }
}
```

## 🔍 Search API

### Search Content
```http
GET /search?q=javascript&type=bookmarks,posts&limit=20
Authorization: Bearer {token}
```

**Query Parameters:**
- `q` (string): Search query
- `type` (string): bookmarks, posts, collections, users
- `tags` (string): Filter by tags
- `user_id` (uuid): Filter by user

## 📈 Trending API

### Get Trending Content
```http
GET /trending?type=bookmarks&period=week
```

**Query Parameters:**
- `type`: bookmarks, posts, tags, users
- `period`: day, week, month, year

## ⚠️ Error Responses

All API endpoints return consistent error responses:

```json
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
```

**Common Error Codes:**
- `UNAUTHORIZED` (401): Invalid or missing authentication
- `FORBIDDEN` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `VALIDATION_ERROR` (422): Invalid input data
- `RATE_LIMIT_EXCEEDED` (429): Too many requests
- `INTERNAL_ERROR` (500): Server error

## 🚦 Rate Limiting

- **Free users:** 100 requests/hour
- **Pro users:** 1000 requests/hour  
- **Enterprise users:** 10000 requests/hour

Rate limit headers:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## 📝 Webhooks

### Available Events
- `bookmark.created`
- `bookmark.updated` 
- `bookmark.deleted`
- `bookmark.liked`
- `post.created`
- `user.followed`
- `collection.created`

### Webhook Payload Example
```json
{
  "event": "bookmark.created",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "bookmark": {
      "id": "uuid",
      "url": "https://example.com",
      "title": "Example",
      "user_id": "uuid"
    }
  }
}
```

## 🔧 SDKs & Libraries

### JavaScript/TypeScript
```bash
npm install @hittags/sdk
```

```javascript
import { HitTagsClient } from '@hittags/sdk';

const client = new HitTagsClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.hittags.com/v1'
});

const bookmarks = await client.bookmarks.list({
  tags: ['javascript'],
  limit: 10
});
```

### Python
```bash
pip install hittags-python
```

```python
from hittags import HitTagsClient

client = HitTagsClient(api_key='your-api-key')
bookmarks = client.bookmarks.list(tags=['javascript'], limit=10)
```

## 📚 Additional Resources

- [API Changelog](https://docs.hittags.com/changelog)
- [Postman Collection](https://www.postman.com/hittags/workspace/hittags-api)
- [OpenAPI Specification](https://api.hittags.com/v1/openapi.json)
- [Status Page](https://status.hittags.com)