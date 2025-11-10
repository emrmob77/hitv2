/**
 * GraphQL API Endpoint
 *
 * Provides a GraphQL interface for the HitV2 API
 * Note: This is a simplified implementation. For production, consider using
 * a dedicated GraphQL server like Apollo Server or similar.
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticateAPIRequest, recordAPISuccess } from '@/lib/api/api-auth-middleware';
import { typeDefs } from '@/lib/graphql/schema';
import { resolvers } from '@/lib/graphql/resolvers';

/**
 * Simple GraphQL executor
 * In production, replace with a proper GraphQL server like Apollo Server
 */
async function executeGraphQL(
  query: string,
  variables: any,
  context: any
): Promise<any> {
  try {
    // This is a simplified implementation
    // In production, use a proper GraphQL execution engine

    // Parse the query to determine if it's a query or mutation
    const isQuery = query.trim().startsWith('query') || (!query.includes('mutation') && !query.includes('subscription'));
    const isMutation = query.trim().startsWith('mutation');

    // Extract operation name
    const operationMatch = query.match(/(?:query|mutation)\s+(\w+)|^\s*\{?\s*(\w+)/);
    const operation = operationMatch ? (operationMatch[1] || operationMatch[2]) : null;

    if (!operation) {
      return {
        errors: [{ message: 'Could not determine operation from query' }],
      };
    }

    // Execute resolver
    let result;
    if (isQuery && resolvers.Query[operation]) {
      result = await resolvers.Query[operation](null, variables, context);
    } else if (isMutation && resolvers.Mutation[operation]) {
      result = await resolvers.Mutation[operation](null, variables, context);
    } else {
      return {
        errors: [{ message: `Unknown operation: ${operation}` }],
      };
    }

    return { data: { [operation]: result } };
  } catch (error) {
    console.error('GraphQL execution error:', error);
    return {
      errors: [
        {
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      ],
    };
  }
}

// POST /api/graphql - Execute GraphQL query
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  // Authenticate
  const authResult = await authenticateAPIRequest(request);
  if (!authResult.success) {
    return authResult.error;
  }

  const { apiKey, userId } = authResult.context;

  try {
    const body = await request.json();
    const { query, variables, operationName } = body;

    if (!query) {
      await recordAPISuccess(apiKey.id, request, 400, startTime);
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Create context
    const context = {
      userId,
      apiKey,
    };

    // Execute GraphQL query
    const result = await executeGraphQL(query, variables || {}, context);

    // Record usage
    await recordAPISuccess(apiKey.id, request, 200, startTime);

    return NextResponse.json(result);
  } catch (error) {
    console.error('GraphQL API error:', error);
    await recordAPISuccess(apiKey.id, request, 500, startTime);

    return NextResponse.json(
      {
        errors: [
          {
            message: error instanceof Error ? error.message : 'Unknown error',
          },
        ],
      },
      { status: 500 }
    );
  }
}

// GET /api/graphql - GraphQL Playground / Schema introspection
export async function GET(request: NextRequest) {
  // Return schema information
  return NextResponse.json({
    message: 'GraphQL API',
    endpoint: '/api/graphql',
    documentation: '/api/docs#graphql',
    note: 'Use POST requests to execute GraphQL queries. For a full GraphQL experience with playground, consider integrating Apollo Server or GraphQL Yoga.',
    schema: {
      types: [
        'Bookmark',
        'Collection',
        'User',
        'Tag',
        'BookmarkConnection',
        'CollectionConnection',
        'PageInfo',
      ],
      queries: [
        'me',
        'bookmarks',
        'bookmark',
        'collections',
        'collection',
        'tags',
        'searchBookmarks',
      ],
      mutations: [
        'createBookmark',
        'updateBookmark',
        'deleteBookmark',
        'createCollection',
        'updateCollection',
        'deleteCollection',
        'addBookmarksToCollection',
        'addTagsToBookmark',
      ],
    },
    example: {
      query: `
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
      `,
      mutation: `
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
      `,
    },
  });
}
