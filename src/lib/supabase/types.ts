/**
 * Supabase database types
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string | null;
          bio: string | null;
          avatar_url: string | null;
          website_url: string | null;
          twitter_handle: string | null;
          github_handle: string | null;
          is_premium: boolean;
          is_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          website_url?: string | null;
          twitter_handle?: string | null;
          github_handle?: string | null;
          is_premium?: boolean;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          display_name?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          website_url?: string | null;
          twitter_handle?: string | null;
          github_handle?: string | null;
          is_premium?: boolean;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      bookmarks: {
        Row: {
          id: string;
          user_id: string;
          url: string;
          title: string;
          description: string | null;
          slug: string | null;
          domain: string | null;
          favicon_url: string | null;
          image_url: string | null;
          is_public: boolean;
          privacy_level: 'public' | 'private' | 'subscribers';
          view_count: number;
          like_count: number;
          comment_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          url: string;
          title: string;
          description?: string | null;
          slug?: string | null;
          domain?: string | null;
          favicon_url?: string | null;
          image_url?: string | null;
          is_public?: boolean;
          privacy_level?: 'public' | 'private' | 'subscribers';
          view_count?: number;
          like_count?: number;
          comment_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          url?: string;
          title?: string;
          description?: string | null;
          slug?: string | null;
          domain?: string | null;
          favicon_url?: string | null;
          image_url?: string | null;
          is_public?: boolean;
          privacy_level?: 'public' | 'private' | 'subscribers';
          view_count?: number;
          like_count?: number;
          comment_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      tags: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          color: string;
          usage_count: number;
          is_trending: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          color?: string;
          usage_count?: number;
          is_trending?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          color?: string;
          usage_count?: number;
          is_trending?: boolean;
          created_at?: string;
        };
      };
      bookmark_tags: {
        Row: {
          bookmark_id: string;
          tag_id: string;
        };
        Insert: {
          bookmark_id: string;
          tag_id: string;
        };
        Update: {
          bookmark_id?: string;
          tag_id?: string;
        };
      };
      collections: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          slug: string;
          description: string | null;
          cover_image_url: string | null;
          privacy_level: 'public' | 'private' | 'subscribers';
          is_collaborative: boolean;
          bookmark_count: number;
          follower_count: number;
          like_count: number;
          view_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          slug: string;
          description?: string | null;
          cover_image_url?: string | null;
          privacy_level?: 'public' | 'private' | 'subscribers';
          is_collaborative?: boolean;
          bookmark_count?: number;
          follower_count?: number;
          like_count?: number;
          view_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          cover_image_url?: string | null;
          privacy_level?: 'public' | 'private' | 'subscribers';
          is_collaborative?: boolean;
          bookmark_count?: number;
          follower_count?: number;
          like_count?: number;
          view_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      collection_bookmarks: {
        Row: {
          id: string;
          collection_id: string;
          bookmark_id: string;
          added_by: string | null;
          position: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          collection_id: string;
          bookmark_id: string;
          added_by?: string | null;
          position?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          collection_id?: string;
          bookmark_id?: string;
          added_by?: string | null;
          position?: number | null;
          created_at?: string;
        };
      };
      collection_followers: {
        Row: {
          id: string;
          collection_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          collection_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          collection_id?: string;
          user_id?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
