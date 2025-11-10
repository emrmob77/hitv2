/**
 * GraphQL Resolvers for HitV2 API
 */

import { createClient } from '@supabase/supabase-js';

export const resolvers = {
  Query: {
    // Get current user
    me: async (_: any, __: any, context: any) => {
      const { userId } = context;
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      const { data: user } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      return user;
    },

    // List bookmarks
    bookmarks: async (_: any, args: any, context: any) => {
      const { userId } = context;
      const { limit = 50, offset = 0, collection_id, tag, search } = args;

      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      let query = supabase
        .from('bookmarks')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (collection_id) {
        query = query.eq('collection_id', collection_id);
      }

      if (tag) {
        query = query.contains('tags', [tag]);
      }

      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
      }

      query = query.range(offset, offset + limit - 1);

      const { data: bookmarks, count } = await query;

      return {
        data: bookmarks || [],
        pagination: {
          limit,
          offset,
          total: count || 0,
          has_more: (count || 0) > offset + limit,
        },
      };
    },

    // Get single bookmark
    bookmark: async (_: any, args: any, context: any) => {
      const { userId } = context;
      const { id } = args;

      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      const { data: bookmark } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      return bookmark;
    },

    // List collections
    collections: async (_: any, args: any, context: any) => {
      const { userId } = context;
      const { limit = 50, offset = 0, include_bookmarks = false } = args;

      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      let query = supabase
        .from('collections')
        .select(
          include_bookmarks ? '*, bookmarks(*)' : '*',
          { count: 'exact' }
        )
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data: collections, count } = await query;

      return {
        data: collections || [],
        pagination: {
          limit,
          offset,
          total: count || 0,
          has_more: (count || 0) > offset + limit,
        },
      };
    },

    // Get single collection
    collection: async (_: any, args: any, context: any) => {
      const { userId } = context;
      const { id } = args;

      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      const { data: collection } = await supabase
        .from('collections')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      return collection;
    },

    // List tags
    tags: async (_: any, __: any, context: any) => {
      const { userId } = context;

      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      const { data: bookmarks } = await supabase
        .from('bookmarks')
        .select('tags')
        .eq('user_id', userId);

      const tagCounts = new Map<string, number>();

      bookmarks?.forEach((bookmark) => {
        const tags = bookmark.tags as string[];
        tags?.forEach((tag) => {
          tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
        });
      });

      return Array.from(tagCounts.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);
    },

    // Search bookmarks
    searchBookmarks: async (_: any, args: any, context: any) => {
      const { userId } = context;
      const { query, limit = 20 } = args;

      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      const { data: bookmarks } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', userId)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,url.ilike.%${query}%`)
        .limit(limit);

      return bookmarks || [];
    },
  },

  Mutation: {
    // Create bookmark
    createBookmark: async (_: any, args: any, context: any) => {
      const { userId } = context;
      const { input } = args;

      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      const { data: bookmark, error } = await supabase
        .from('bookmarks')
        .insert({
          user_id: userId,
          ...input,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);

      return bookmark;
    },

    // Update bookmark
    updateBookmark: async (_: any, args: any, context: any) => {
      const { userId } = context;
      const { id, input } = args;

      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      const { data: bookmark, error } = await supabase
        .from('bookmarks')
        .update(input)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw new Error(error.message);

      return bookmark;
    },

    // Delete bookmark
    deleteBookmark: async (_: any, args: any, context: any) => {
      const { userId } = context;
      const { id } = args;

      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw new Error(error.message);

      return true;
    },

    // Create collection
    createCollection: async (_: any, args: any, context: any) => {
      const { userId } = context;
      const { input } = args;

      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      const { data: collection, error } = await supabase
        .from('collections')
        .insert({
          user_id: userId,
          ...input,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);

      return collection;
    },

    // Update collection
    updateCollection: async (_: any, args: any, context: any) => {
      const { userId } = context;
      const { id, input } = args;

      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      const { data: collection, error } = await supabase
        .from('collections')
        .update(input)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw new Error(error.message);

      return collection;
    },

    // Delete collection
    deleteCollection: async (_: any, args: any, context: any) => {
      const { userId } = context;
      const { id } = args;

      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      const { error } = await supabase
        .from('collections')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw new Error(error.message);

      return true;
    },

    // Batch add bookmarks to collection
    addBookmarksToCollection: async (_: any, args: any, context: any) => {
      const { userId } = context;
      const { bookmark_ids, collection_id } = args;

      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      const { error } = await supabase
        .from('bookmarks')
        .update({ collection_id })
        .in('id', bookmark_ids)
        .eq('user_id', userId);

      if (error) throw new Error(error.message);

      return true;
    },

    // Add tags to bookmark
    addTagsToBookmark: async (_: any, args: any, context: any) => {
      const { userId } = context;
      const { bookmark_id, tags } = args;

      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // Get current tags
      const { data: bookmark } = await supabase
        .from('bookmarks')
        .select('tags')
        .eq('id', bookmark_id)
        .eq('user_id', userId)
        .single();

      if (!bookmark) throw new Error('Bookmark not found');

      // Merge tags
      const currentTags = (bookmark.tags as string[]) || [];
      const newTags = Array.from(new Set([...currentTags, ...tags]));

      // Update bookmark
      const { data: updated, error } = await supabase
        .from('bookmarks')
        .update({ tags: newTags })
        .eq('id', bookmark_id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw new Error(error.message);

      return updated;
    },
  },

  // Field resolvers
  Bookmark: {
    collection: async (parent: any) => {
      if (!parent.collection_id) return null;

      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      const { data: collection } = await supabase
        .from('collections')
        .select('*')
        .eq('id', parent.collection_id)
        .single();

      return collection;
    },

    user: async (parent: any) => {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      const { data: user } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', parent.user_id)
        .single();

      return user;
    },
  },

  Collection: {
    bookmarks: async (parent: any) => {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      const { data: bookmarks } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('collection_id', parent.id)
        .order('created_at', { ascending: false });

      return bookmarks || [];
    },

    user: async (parent: any) => {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      const { data: user } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', parent.user_id)
        .single();

      return user;
    },
  },

  User: {
    bookmarks: async (parent: any) => {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      const { data: bookmarks } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', parent.id)
        .order('created_at', { ascending: false });

      return bookmarks || [];
    },

    collections: async (parent: any) => {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      const { data: collections } = await supabase
        .from('collections')
        .select('*')
        .eq('user_id', parent.id)
        .order('created_at', { ascending: false });

      return collections || [];
    },
  },
};
