/**
 * Public API v1 - Info & Documentation
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    name: 'HitV2 API',
    version: '1.0.0',
    description: 'RESTful API for bookmark management',
    documentation: '/api/docs',
    endpoints: {
      bookmarks: {
        list: 'GET /api/v1/bookmarks',
        get: 'GET /api/v1/bookmarks/:id',
        create: 'POST /api/v1/bookmarks',
        update: 'PUT /api/v1/bookmarks/:id',
        delete: 'DELETE /api/v1/bookmarks/:id',
      },
      collections: {
        list: 'GET /api/v1/collections',
        get: 'GET /api/v1/collections/:id',
        create: 'POST /api/v1/collections',
        update: 'PUT /api/v1/collections/:id',
        delete: 'DELETE /api/v1/collections/:id',
      },
      tags: {
        list: 'GET /api/v1/tags',
      },
      user: {
        profile: 'GET /api/v1/user',
      },
    },
    authentication: {
      method: 'API Key + Secret',
      header: 'Authorization: Bearer {api_key}:{secret_key}',
      alternative_headers: {
        api_key: 'X-API-Key',
        secret_key: 'X-API-Secret',
      },
    },
    rate_limits: {
      default_hourly: 1000,
      default_daily: 10000,
      headers: {
        hourly_limit: 'X-RateLimit-Limit-Hour',
        hourly_remaining: 'X-RateLimit-Remaining-Hour',
        daily_limit: 'X-RateLimit-Limit-Day',
        daily_remaining: 'X-RateLimit-Remaining-Day',
      },
    },
    scopes: {
      'read:bookmarks': 'Read bookmarks',
      'write:bookmarks': 'Create and update bookmarks',
      'delete:bookmarks': 'Delete bookmarks',
      'read:collections': 'Read collections',
      'write:collections': 'Create and update collections',
      'delete:collections': 'Delete collections',
      'read:tags': 'Read tags',
      'write:tags': 'Create and update tags',
      'read:user': 'Read user profile',
      'read:analytics': 'Read analytics data',
      'admin:webhooks': 'Manage webhooks',
      'admin:api_keys': 'Manage API keys',
    },
    graphql: {
      endpoint: '/api/graphql',
      playground: '/api/graphql',
    },
  });
}
