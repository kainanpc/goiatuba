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
      activities: {
        Row: {
          active: boolean
          category: string | null
          created_at: string
          created_by: string | null
          default_points: number
          description: string | null
          icon: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          category?: string | null
          created_at?: string
          created_by?: string | null
          default_points?: number
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          category?: string | null
          created_at?: string
          created_by?: string | null
          default_points?: number
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          entity: string | null
          entity_id: string | null
          id: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity?: string | null
          entity_id?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity?: string | null
          entity_id?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      badges: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          icon: string
          id: string
          name: string
          required_points: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          name: string
          required_points?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          name?: string
          required_points?: number
          updated_at?: string
        }
        Relationships: []
      }
      child_badges: {
        Row: {
          awarded_at: string
          awarded_by: string | null
          badge_id: string
          child_id: string
          created_at: string
          id: string
        }
        Insert: {
          awarded_at?: string
          awarded_by?: string | null
          badge_id: string
          child_id: string
          created_at?: string
          id?: string
        }
        Update: {
          awarded_at?: string
          awarded_by?: string | null
          badge_id?: string
          child_id?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "child_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_badges_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      children: {
        Row: {
          active: boolean
          avatar_url: string | null
          birth_date: string | null
          created_at: string
          created_by: string | null
          full_name: string
          gender: string | null
          guardian_name: string | null
          guardian_phone: string | null
          id: string
          notes: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          avatar_url?: string | null
          birth_date?: string | null
          created_at?: string
          created_by?: string | null
          full_name: string
          gender?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          id?: string
          notes?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          avatar_url?: string | null
          birth_date?: string | null
          created_at?: string
          created_by?: string | null
          full_name?: string
          gender?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          id?: string
          notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      point_entries: {
        Row: {
          activity_id: string | null
          awarded_by: string
          child_id: string
          created_at: string
          entry_date: string
          id: string
          points: number
          reason: string | null
        }
        Insert: {
          activity_id?: string | null
          awarded_by: string
          child_id: string
          created_at?: string
          entry_date?: string
          id?: string
          points: number
          reason?: string | null
        }
        Update: {
          activity_id?: string | null
          awarded_by?: string
          child_id?: string
          created_at?: string
          entry_date?: string
          id?: string
          points?: number
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "point_entries_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "point_entries_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_status: Database["public"]["Enums"]["account_status"]
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          role_title: string | null
          status_changed_at: string | null
          status_changed_by: string | null
          status_reason: string | null
          updated_at: string
        }
        Insert: {
          account_status?: Database["public"]["Enums"]["account_status"]
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          role_title?: string | null
          status_changed_at?: string | null
          status_changed_by?: string | null
          status_reason?: string | null
          updated_at?: string
        }
        Update: {
          account_status?: Database["public"]["Enums"]["account_status"]
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          role_title?: string | null
          status_changed_at?: string | null
          status_changed_by?: string | null
          status_reason?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reward_redemptions: {
        Row: {
          child_id: string
          created_at: string
          id: string
          notes: string | null
          points_spent: number
          redeemed_at: string
          redeemed_by: string | null
          reward_id: string
        }
        Insert: {
          child_id: string
          created_at?: string
          id?: string
          notes?: string | null
          points_spent: number
          redeemed_at?: string
          redeemed_by?: string | null
          reward_id: string
        }
        Update: {
          child_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          points_spent?: number
          redeemed_at?: string
          redeemed_by?: string | null
          reward_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_redemptions_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_redemptions_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards: {
        Row: {
          active: boolean
          cost_points: number
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
          stock: number | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          cost_points: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          stock?: number | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          cost_points?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          stock?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      time_entries: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          entry_date: string
          entry_type: Database["public"]["Enums"]["time_entry_type"]
          hours: number
          id: string
          review_note: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["time_entry_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          entry_date?: string
          entry_type: Database["public"]["Enums"]["time_entry_type"]
          hours: number
          id?: string
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["time_entry_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          entry_date?: string
          entry_type?: Database["public"]["Enums"]["time_entry_type"]
          hours?: number
          id?: string
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["time_entry_status"]
          updated_at?: string
          user_id?: string
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
      get_current_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      set_account_status: {
        Args: {
          _reason?: string
          _status: Database["public"]["Enums"]["account_status"]
          _user_id: string
        }
        Returns: undefined
      }
      set_user_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      account_status: "pending" | "approved" | "rejected" | "disabled"
      app_role: "owner" | "admin" | "employee"
      time_entry_status: "pending" | "approved" | "rejected"
      time_entry_type:
        | "extra"
        | "plantao"
        | "feriado"
        | "folga_usada"
        | "ajuste"
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
      account_status: ["pending", "approved", "rejected", "disabled"],
      app_role: ["owner", "admin", "employee"],
      time_entry_status: ["pending", "approved", "rejected"],
      time_entry_type: ["extra", "plantao", "feriado", "folga_usada", "ajuste"],
    },
  },
} as const
