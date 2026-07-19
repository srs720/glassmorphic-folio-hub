export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      blog_posts: {
        Row: {
          content: string
          cover_path: string | null
          created_at: string
          excerpt: string
          id: string
          published_at: string | null
          seo_description: string
          seo_title: string
          slug: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          content?: string
          cover_path?: string | null
          created_at?: string
          excerpt?: string
          id?: string
          published_at?: string | null
          seo_description?: string
          seo_title?: string
          slug: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          cover_path?: string | null
          created_at?: string
          excerpt?: string
          id?: string
          published_at?: string | null
          seo_description?: string
          seo_title?: string
          slug?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      education_entries: {
        Row: {
          created_at: string
          description: string | null
          id: string
          institution: string | null
          kind: string
          period: string | null
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          institution?: string | null
          kind: string
          period?: string | null
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          institution?: string | null
          kind?: string
          period?: string | null
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      foods: {
        Row: {
          created_at: string
          cuisine: string | null
          id: string
          image_path: string | null
          name: string
          rating: number | null
          review: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          cuisine?: string | null
          id?: string
          image_path?: string | null
          name: string
          rating?: number | null
          review?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          cuisine?: string | null
          id?: string
          image_path?: string | null
          name?: string
          rating?: number | null
          review?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      hobbies: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_path: string | null
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_path?: string | null
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_path?: string | null
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      memories: {
        Row: {
          created_at: string
          id: string
          image_path: string | null
          location: string | null
          sort_order: number
          story: string | null
          taken_on: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_path?: string | null
          location?: string | null
          sort_order?: number
          story?: string | null
          taken_on?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_path?: string | null
          location?: string | null
          sort_order?: number
          story?: string | null
          taken_on?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          archived: boolean
          created_at: string
          email: string
          id: string
          message: string
          name: string
        }
        Insert: {
          archived?: boolean
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
        }
        Update: {
          archived?: boolean
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
        }
        Relationships: []
      }
      people: {
        Row: {
          category: string
          created_at: string
          id: string
          image_path: string | null
          name: string
          note: string | null
          relation: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          image_path?: string | null
          name: string
          note?: string | null
          relation?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          image_path?: string | null
          name?: string
          note?: string | null
          relation?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          description: string
          detail_content: string
          featured: boolean
          id: string
          image_path: string | null
          images: string[]
          live_url: string | null
          sort_order: number
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          detail_content?: string
          featured?: boolean
          id?: string
          image_path?: string | null
          images?: string[]
          live_url?: string | null
          sort_order?: number
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          detail_content?: string
          featured?: boolean
          id?: string
          image_path?: string | null
          images?: string[]
          live_url?: string | null
          sort_order?: number
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      quotes: {
        Row: {
          author: string | null
          category: string | null
          created_at: string
          id: string
          sort_order: number
          text: string
          updated_at: string
        }
        Insert: {
          author?: string | null
          category?: string | null
          created_at?: string
          id?: string
          sort_order?: number
          text: string
          updated_at?: string
        }
        Update: {
          author?: string | null
          category?: string | null
          created_at?: string
          id?: string
          sort_order?: number
          text?: string
          updated_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string
          description: string
          icon_name: string
          id: string
          sort_order: number
          title: string
        }
        Insert: {
          created_at?: string
          description?: string
          icon_name?: string
          id?: string
          sort_order?: number
          title: string
        }
        Update: {
          created_at?: string
          description?: string
          icon_name?: string
          id?: string
          sort_order?: number
          title?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          avatar_path: string | null
          bio: string
          education: string
          experience: string
          greeting: string | null
          hero_image_path: string | null
          id: string
          identity_line: string | null
          location: string
          name: string
          resume_path: string | null
          tagline: string
          updated_at: string
        }
        Insert: {
          avatar_path?: string | null
          bio?: string
          education?: string
          experience?: string
          greeting?: string | null
          hero_image_path?: string | null
          id?: string
          identity_line?: string | null
          location?: string
          name?: string
          resume_path?: string | null
          tagline?: string
          updated_at?: string
        }
        Update: {
          avatar_path?: string | null
          bio?: string
          education?: string
          experience?: string
          greeting?: string | null
          hero_image_path?: string | null
          id?: string
          identity_line?: string | null
          location?: string
          name?: string
          resume_path?: string | null
          tagline?: string
          updated_at?: string
        }
        Relationships: []
      }
      skills: {
        Row: {
          category: string
          created_at: string
          id: string
          name: string
          sort_order: number
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          name: string
          sort_order?: number
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      social_links: {
        Row: {
          created_at: string
          icon_name: string
          id: string
          platform_name: string
          sort_order: number
          url: string
        }
        Insert: {
          created_at?: string
          icon_name?: string
          id?: string
          platform_name: string
          sort_order?: number
          url: string
        }
        Update: {
          created_at?: string
          icon_name?: string
          id?: string
          platform_name?: string
          sort_order?: number
          url?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          author_name: string
          author_role: string
          avatar_path: string | null
          content: string
          created_at: string
          id: string
          sort_order: number
        }
        Insert: {
          author_name: string
          author_role?: string
          avatar_path?: string | null
          content: string
          created_at?: string
          id?: string
          sort_order?: number
        }
        Update: {
          author_name?: string
          author_role?: string
          avatar_path?: string | null
          content?: string
          created_at?: string
          id?: string
          sort_order?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
