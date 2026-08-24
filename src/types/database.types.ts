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
    PostgrestVersion: "14.15"
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
      academic_programs: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      academic_terms: {
        Row: {
          created_at: string
          end_date: string
          id: string
          is_current: boolean
          start_date: string
          term: Database["public"]["Enums"]["academic_term"]
          updated_at: string
          year: number
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          is_current?: boolean
          start_date: string
          term: Database["public"]["Enums"]["academic_term"]
          updated_at?: string
          year: number
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          is_current?: boolean
          start_date?: string
          term?: Database["public"]["Enums"]["academic_term"]
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      human_capital: {
        Row: {
          academic_term_id: string
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          term: Database["public"]["Enums"]["academic_term"]
          tm_tuesday: number
          tv_thursday: number
          updated_at: string
          year: number
        }
        Insert: {
          academic_term_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          term: Database["public"]["Enums"]["academic_term"]
          tm_tuesday?: number
          tv_thursday?: number
          updated_at?: string
          year: number
        }
        Update: {
          academic_term_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          term?: Database["public"]["Enums"]["academic_term"]
          tm_tuesday?: number
          tv_thursday?: number
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "human_capital_academic_term_id_fkey"
            columns: ["academic_term_id"]
            isOneToOne: false
            referencedRelation: "academic_terms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "human_capital_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      internship_participation: {
        Row: {
          academic_level: Database["public"]["Enums"]["academic_level"]
          academic_program_id: string
          academic_term_id: string
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          participant_count: number
          updated_at: string
        }
        Insert: {
          academic_level?: Database["public"]["Enums"]["academic_level"]
          academic_program_id: string
          academic_term_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          participant_count: number
          updated_at?: string
        }
        Update: {
          academic_level?: Database["public"]["Enums"]["academic_level"]
          academic_program_id?: string
          academic_term_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          participant_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "internship_participation_academic_program_id_fkey"
            columns: ["academic_program_id"]
            isOneToOne: false
            referencedRelation: "academic_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internship_participation_academic_term_id_fkey"
            columns: ["academic_term_id"]
            isOneToOne: false
            referencedRelation: "academic_terms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internship_participation_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      materials: {
        Row: {
          active: boolean
          co2_factor: number
          created_at: string
          id: string
          name: string
        }
        Insert: {
          active?: boolean
          co2_factor?: number
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          active?: boolean
          co2_factor?: number
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      notification_reads: {
        Row: {
          notification_id: string
          read_at: string
          user_id: string
        }
        Insert: {
          notification_id: string
          read_at?: string
          user_id: string
        }
        Update: {
          notification_id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_reads_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_reads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          audience: string
          created_at: string
          created_by: string | null
          id: string
          kind: string
          link: string | null
          message: string
          recipient_id: string | null
          title: string
        }
        Insert: {
          audience?: string
          created_at?: string
          created_by?: string | null
          id?: string
          kind?: string
          link?: string | null
          message: string
          recipient_id?: string | null
          title: string
        }
        Update: {
          audience?: string
          created_at?: string
          created_by?: string | null
          id?: string
          kind?: string
          link?: string | null
          message?: string
          recipient_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          active: boolean
          created_at: string
          first_name: string
          id: string
          last_name: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          active?: boolean
          created_at?: string
          first_name?: string
          id: string
          last_name?: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          active?: boolean
          created_at?: string
          first_name?: string
          id?: string
          last_name?: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      waste_collections: {
        Row: {
          academic_term_id: string | null
          co2_factor_applied: number
          collection_date: string | null
          created_at: string
          created_by: string | null
          id: string
          kilograms: number
          location: string | null
          material_id: string
          notes: string | null
          record_type: Database["public"]["Enums"]["waste_record_type"]
          updated_at: string
          year: number
        }
        Insert: {
          academic_term_id?: string | null
          co2_factor_applied?: number
          collection_date?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          kilograms: number
          location?: string | null
          material_id: string
          notes?: string | null
          record_type?: Database["public"]["Enums"]["waste_record_type"]
          updated_at?: string
          year: number
        }
        Update: {
          academic_term_id?: string | null
          co2_factor_applied?: number
          collection_date?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          kilograms?: number
          location?: string | null
          material_id?: string
          notes?: string | null
          record_type?: Database["public"]["Enums"]["waste_record_type"]
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "waste_collections_academic_term_id_fkey"
            columns: ["academic_term_id"]
            isOneToOne: false
            referencedRelation: "academic_terms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waste_collections_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waste_collections_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_recent_notifications: {
        Args: { limit_count?: number }
        Returns: {
          created_at: string
          id: string
          link: string
          message: string
          notification_kind: string
          read_at: string
          title: string
        }[]
      }
      get_unread_notification_count: { Args: never; Returns: number }
      is_active_user: { Args: never; Returns: boolean }
      is_admin: { Args: never; Returns: boolean }
      mark_all_notifications_read: { Args: never; Returns: undefined }
      mark_notification_read: {
        Args: { target_notification_id: string }
        Returns: undefined
      }
      set_current_academic_term: {
        Args: { target_id: string }
        Returns: string
      }
    }
    Enums: {
      academic_level: "TSU" | "Licenciatura" | "Sin especificar"
      academic_term: "E-A" | "M-A" | "S-D"
      user_role: "admin" | "user"
      waste_record_type: "historical" | "collection"
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
      academic_level: ["TSU", "Licenciatura", "Sin especificar"],
      academic_term: ["E-A", "M-A", "S-D"],
      user_role: ["admin", "user"],
      waste_record_type: ["historical", "collection"],
    },
  },
} as const
