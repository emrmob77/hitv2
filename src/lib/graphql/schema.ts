/**
 * GraphQL Schema for HitV2 API
 */

export const typeDefs = `
  # Bookmark type
  type Bookmark {
    id: ID!
    user_id: String!
    url: String!
    title: String
    description: String
    tags: [String!]
    collection_id: String
    is_public: Boolean
    metadata: JSON
    created_at: String!
    updated_at: String!

    # Relations
    collection: Collection
    user: User
  }

  # Collection type
  type Collection {
    id: ID!
    user_id: String!
    name: String!
    description: String
    is_public: Boolean
    created_at: String!
    updated_at: String!

    # Relations
    bookmarks: [Bookmark!]!
    user: User
  }

  # User type
  type User {
    id: ID!
    email: String!
    username: String
    full_name: String
    avatar_url: String
    created_at: String!

    # Relations
    bookmarks: [Bookmark!]!
    collections: [Collection!]!
  }

  # Tag with usage count
  type Tag {
    name: String!
    count: Int!
  }

  # Pagination info
  type PageInfo {
    limit: Int!
    offset: Int!
    total: Int!
    has_more: Boolean!
  }

  # Bookmark list with pagination
  type BookmarkConnection {
    data: [Bookmark!]!
    pagination: PageInfo!
  }

  # Collection list with pagination
  type CollectionConnection {
    data: [Collection!]!
    pagination: PageInfo!
  }

  # Queries
  type Query {
    # Get current user
    me: User!

    # Bookmarks
    bookmarks(
      limit: Int = 50
      offset: Int = 0
      collection_id: String
      tag: String
      search: String
    ): BookmarkConnection!

    bookmark(id: ID!): Bookmark

    # Collections
    collections(
      limit: Int = 50
      offset: Int = 0
      include_bookmarks: Boolean = false
    ): CollectionConnection!

    collection(id: ID!): Collection

    # Tags
    tags: [Tag!]!

    # Search
    searchBookmarks(query: String!, limit: Int = 20): [Bookmark!]!
  }

  # Mutations
  type Mutation {
    # Bookmark mutations
    createBookmark(input: CreateBookmarkInput!): Bookmark!
    updateBookmark(id: ID!, input: UpdateBookmarkInput!): Bookmark!
    deleteBookmark(id: ID!): Boolean!

    # Collection mutations
    createCollection(input: CreateCollectionInput!): Collection!
    updateCollection(id: ID!, input: UpdateCollectionInput!): Collection!
    deleteCollection(id: ID!): Boolean!

    # Batch operations
    addBookmarksToCollection(bookmark_ids: [ID!]!, collection_id: ID!): Boolean!
    addTagsToBookmark(bookmark_id: ID!, tags: [String!]!): Bookmark!
  }

  # Input types
  input CreateBookmarkInput {
    url: String!
    title: String
    description: String
    tags: [String!]
    collection_id: String
    is_public: Boolean
  }

  input UpdateBookmarkInput {
    title: String
    description: String
    tags: [String!]
    collection_id: String
    is_public: Boolean
  }

  input CreateCollectionInput {
    name: String!
    description: String
    is_public: Boolean
  }

  input UpdateCollectionInput {
    name: String
    description: String
    is_public: Boolean
  }

  # Custom scalar for JSON
  scalar JSON
`;
