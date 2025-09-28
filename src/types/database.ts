export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          display_name: string | null
          bio: string | null
          avatar_url: string | null
          website_url: string | null
          location: string | null
          is_verified: boolean | null
          is_premium: boolean | null
          subscription_tier: string | null
          bookmark_count: number | null
          follower_count: number | null
          following_count: number | null
          total_likes_received: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          username: string
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          website_url?: string | null
          location?: string | null
          is_verified?: boolean | null
          is_premium?: boolean | null
          subscription_tier?: string | null
          bookmark_count?: number | null
          follower_count?: number | null
          following_count?: number | null
          total_likes_received?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          username?: string
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          website_url?: string | null
          location?: string | null
          is_verified?: boolean | null
          is_premium?: boolean | null
          subscription_tier?: string | null
          bookmark_count?: number | null
          follower_count?: number | null
          following_count?: number | null
          total_likes_received?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      bookmarks: {
        Row: {
          id: string
          user_id: string | null
          url: string
          title: string
          description: string | null
          favicon_url: string | null
          image_url: string | null
          domain: string | null
          meta_data: Json | null
          privacy_level: string | null
          is_archived: boolean | null
          is_featured: boolean | null
          like_count: number | null
          comment_count: number | null
          click_count: number | null
          save_count: number | null
          slug: string | null
          meta_title: string | null
          meta_description: string | null
          canonical_url: string | null
          seo_keywords: string[] | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          url: string
          title: string
          description?: string | null
          favicon_url?: string | null
          image_url?: string | null
          domain?: string | null
          meta_data?: Json | null
          privacy_level?: string | null
          is_archived?: boolean | null
          is_featured?: boolean | null
          like_count?: number | null
          comment_count?: number | null
          click_count?: number | null
          save_count?: number | null
          slug?: string | null
          meta_title?: string | null
          meta_description?: string | null
          canonical_url?: string | null
          seo_keywords?: string[] | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          url?: string
          title?: string
          description?: string | null
          favicon_url?: string | null
          image_url?: string | null
          domain?: string | null
          meta_data?: Json | null
          privacy_level?: string | null
          is_archived?: boolean | null
          is_featured?: boolean | null
          like_count?: number | null
          comment_count?: number | null
          click_count?: number | null
          save_count?: number | null
          slug?: string | null
          meta_title?: string | null
          meta_description?: string | null
          canonical_url?: string | null
          seo_keywords?: string[] | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      tags: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          color: string | null
          icon: string | null
          usage_count: number | null
          is_trending: boolean | null
          is_featured: boolean | null
          created_by: string | null
          meta_title: string | null
          meta_description: string | null
          seo_content: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          color?: string | null
          icon?: string | null
          usage_count?: number | null
          is_trending?: boolean | null
          is_featured?: boolean | null
          created_by?: string | null
          meta_title?: string | null
          meta_description?: string | null
          seo_content?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          color?: string | null
          icon?: string | null
          usage_count?: number | null
          is_trending?: boolean | null
          is_featured?: boolean | null
          created_by?: string | null
          meta_title?: string | null
          meta_description?: string | null
          seo_content?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      collections: {
        Row: {
          id: string
          user_id: string | null
          name: string
          slug: string
          description: string | null
          cover_image_url: string | null
          privacy_level: string | null
          is_collaborative: boolean | null
          bookmark_count: number | null
          follower_count: number | null
          like_count: number | null
          view_count: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          slug: string
          description?: string | null
          cover_image_url?: string | null
          privacy_level?: string | null
          is_collaborative?: boolean | null
          bookmark_count?: number | null
          follower_count?: number | null
          like_count?: number | null
          view_count?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          slug?: string
          description?: string | null
          cover_image_url?: string | null
          privacy_level?: string | null
          is_collaborative?: boolean | null
          bookmark_count?: number | null
          follower_count?: number | null
          like_count?: number | null
          view_count?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      // Add other tables as needed
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_create_bookmark: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      generate_slug: {
        Args: { input_text: string }
        Returns: string
      }
      get_user_feed: {
        Args: { page_limit?: number; page_offset?: number; user_uuid: string }
        Returns: {
          author_avatar_url: string
          author_display_name: string
          author_id: string
          author_username: string
          bookmark_created_at: string
          bookmark_description: string
          bookmark_id: string
          bookmark_title: string
          bookmark_url: string
          comment_count: number
          like_count: number
          tag_names: string[]
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
