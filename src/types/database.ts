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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      fields: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      invitation_attempts: {
        Row: {
          consumed_at: string | null
          created_at: string
          expires_at: string
          id: string
          invitation_id: string
          opaque_token_hash: string
        }
        Insert: {
          consumed_at?: string | null
          created_at?: string
          expires_at: string
          id?: string
          invitation_id: string
          opaque_token_hash: string
        }
        Update: {
          consumed_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          invitation_id?: string
          opaque_token_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitation_attempts_invitation_id_fkey"
            columns: ["invitation_id"]
            isOneToOne: false
            referencedRelation: "shared_invitations"
            referencedColumns: ["id"]
          },
        ]
      }
      invitation_redemptions: {
        Row: {
          id: string
          invitation_id: string
          redeemed_at: string
          user_id: string
        }
        Insert: {
          id?: string
          invitation_id: string
          redeemed_at?: string
          user_id: string
        }
        Update: {
          id?: string
          invitation_id?: string
          redeemed_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitation_redemptions_invitation_id_fkey"
            columns: ["invitation_id"]
            isOneToOne: false
            referencedRelation: "shared_invitations"
            referencedColumns: ["id"]
          },
        ]
      }
      journey_entries: {
        Row: {
          activity: string
          created_at: string
          end_year: number | null
          id: string
          place_id: string | null
          profile_id: string
          sort_order: number
          start_year: number | null
          story: string | null
          updated_at: string
        }
        Insert: {
          activity: string
          created_at?: string
          end_year?: number | null
          id?: string
          place_id?: string | null
          profile_id: string
          sort_order?: number
          start_year?: number | null
          story?: string | null
          updated_at?: string
        }
        Update: {
          activity?: string
          created_at?: string
          end_year?: number | null
          id?: string
          place_id?: string | null
          profile_id?: string
          sort_order?: number
          start_year?: number | null
          story?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "journey_entries_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journey_entries_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journey_entries_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "published_profile_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journey_entries_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "published_profile_details"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          joined_at: string
          role: Database["public"]["Enums"]["member_role"]
          status: Database["public"]["Enums"]["member_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          joined_at?: string
          role?: Database["public"]["Enums"]["member_role"]
          status?: Database["public"]["Enums"]["member_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          joined_at?: string
          role?: Database["public"]["Enums"]["member_role"]
          status?: Database["public"]["Enums"]["member_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      places: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      profile_fields: {
        Row: {
          created_at: string
          field_id: string
          profile_id: string
        }
        Insert: {
          created_at?: string
          field_id: string
          profile_id: string
        }
        Update: {
          created_at?: string
          field_id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_fields_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "fields"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_fields_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_fields_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "published_profile_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_fields_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "published_profile_details"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          generation_key: string
          bio: string | null
          created_at: string
          current_activity: string | null
          current_direction_story: string | null
          current_place_id: string | null
          id: string
          instagram_url: string | null
          is_published: boolean
          linkedin_url: string | null
          location: string | null
          name: string
          owner_id: string
          photo_path: string | null
          since_soon_story: string | null
          slug: string
          turning_point_story: string | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          generation_key: string
          bio?: string | null
          created_at?: string
          current_activity?: string | null
          current_direction_story?: string | null
          current_place_id?: string | null
          id?: string
          instagram_url?: string | null
          is_published?: boolean
          linkedin_url?: string | null
          location?: string | null
          name: string
          owner_id: string
          photo_path?: string | null
          since_soon_story?: string | null
          slug: string
          turning_point_story?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          generation_key?: string
          bio?: string | null
          created_at?: string
          current_activity?: string | null
          current_direction_story?: string | null
          current_place_id?: string | null
          id?: string
          instagram_url?: string | null
          is_published?: boolean
          linkedin_url?: string | null
          location?: string | null
          name?: string
          owner_id?: string
          photo_path?: string | null
          since_soon_story?: string | null
          slug?: string
          turning_point_story?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_current_place_id_fkey"
            columns: ["current_place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: true
            referencedRelation: "members"
            referencedColumns: ["user_id"]
          },
        ]
      }
      proud_moments: {
        Row: {
          created_at: string
          description: string | null
          external_url: string | null
          id: string
          image_path: string | null
          place_id: string | null
          profile_id: string
          title: string
          updated_at: string
          year: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          external_url?: string | null
          id?: string
          image_path?: string | null
          place_id?: string | null
          profile_id: string
          title: string
          updated_at?: string
          year?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          external_url?: string | null
          id?: string
          image_path?: string | null
          place_id?: string | null
          profile_id?: string
          title?: string
          updated_at?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "proud_moments_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proud_moments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proud_moments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "published_profile_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proud_moments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "published_profile_details"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string
          description: string | null
          id: string
          profile_id: string | null
          proud_moment_id: string | null
          reason: string
          reporter_id: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: Database["public"]["Enums"]["report_status"]
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          profile_id?: string | null
          proud_moment_id?: string | null
          reason: string
          reporter_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["report_status"]
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          profile_id?: string | null
          proud_moment_id?: string | null
          reason?: string
          reporter_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["report_status"]
        }
        Relationships: [
          {
            foreignKeyName: "reports_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "published_profile_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "published_profile_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_proud_moment_id_fkey"
            columns: ["proud_moment_id"]
            isOneToOne: false
            referencedRelation: "proud_moments"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_invitations: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          label: string
          revoked_at: string | null
          status: Database["public"]["Enums"]["invitation_status"]
          token_hash: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          label: string
          revoked_at?: string | null
          status?: Database["public"]["Enums"]["invitation_status"]
          token_hash: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          label?: string
          revoked_at?: string | null
          status?: Database["public"]["Enums"]["invitation_status"]
          token_hash?: string
        }
        Relationships: []
      }
    }
    Views: {
      published_profile_cards: {
        Row: {
          generation_key: string | null
          current_activity: string | null
          current_place_name: string | null
          current_place_slug: string | null
          field_labels: string[] | null
          id: string | null
          name: string | null
          photo_path: string | null
          slug: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      published_profile_details: {
        Row: {
          generation_key: string | null
          bio: string | null
          current_activity: string | null
          current_direction_story: string | null
          current_place_name: string | null
          current_place_slug: string | null
          id: string | null
          instagram_url: string | null
          linkedin_url: string | null
          location: string | null
          name: string | null
          photo_path: string | null
          since_soon_story: string | null
          slug: string | null
          turning_point_story: string | null
          updated_at: string | null
          website_url: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      complete_invitation_attempt: {
        Args: { actor_user_id: string; raw_attempt: string }
        Returns: undefined
      }
      create_shared_invitation: {
        Args: { actor_user_id: string; label: string }
        Returns: {
          invitation_id: string
          raw_token: string
        }[]
      }
      immutable_unaccent: { Args: { value: string }; Returns: string }
      is_active_member: { Args: never; Returns: boolean }
      is_admin: { Args: never; Returns: boolean }
      merge_fields: {
        Args: { source_id: string; target_id: string }
        Returns: {
          profiles_affected: number
        }[]
      }
      merge_places: {
        Args: { source_id: string; target_id: string }
        Returns: {
          journeys_affected: number
          profiles_affected: number
          proud_moments_affected: number
        }[]
      }
      normalize_slug_source: { Args: { value: string }; Returns: string }
      replace_own_journey_entries: {
        Args: { entries: Json; profile_id: string }
        Returns: {
          activity: string
          created_at: string
          end_year: number | null
          id: string
          place_id: string | null
          profile_id: string
          sort_order: number
          start_year: number | null
          story: string | null
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "journey_entries"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      replace_own_profile_fields: {
        Args: { field_ids: string[]; profile_id: string }
        Returns: {
          created_at: string
          field_id: string
          profile_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "profile_fields"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      revoke_shared_invitation: {
        Args: { actor_user_id: string; invitation_id: string }
        Returns: undefined
      }
      search_profiles: {
        Args: {
          generation_key?: string
          field_slug?: string
          place_slug?: string
          query?: string
          result_limit?: number
          result_offset?: number
        }
        Returns: {
          generation_key: string
          current_activity: string
          current_place_name: string
          current_place_slug: string
          field_labels: string[]
          id: string
          name: string
          photo_path: string
          rank: number
          slug: string
          updated_at: string
        }[]
      }
      start_invitation_attempt: {
        Args: { raw_token: string }
        Returns: {
          attempt_token: string
          expires_at: string
        }[]
      }
      transfer_profile_owner: {
        Args: { new_owner_id: string; profile_id: string }
        Returns: undefined
      }
    }
    Enums: {
      invitation_status: "active" | "revoked"
      member_role: "member" | "admin"
      member_status: "active" | "disabled"
      report_status: "open" | "resolved" | "dismissed"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      invitation_status: ["active", "revoked"],
      member_role: ["member", "admin"],
      member_status: ["active", "disabled"],
      report_status: ["open", "resolved", "dismissed"],
    },
  },
} as const
