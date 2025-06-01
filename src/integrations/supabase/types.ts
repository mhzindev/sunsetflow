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
      companies: {
        Row: {
          address: string | null
          cnpj: string
          created_at: string
          email: string
          id: string
          legal_name: string
          name: string
          owner_id: string
          phone: string | null
        }
        Insert: {
          address?: string | null
          cnpj: string
          created_at?: string
          email: string
          id?: string
          legal_name: string
          name: string
          owner_id: string
          phone?: string | null
        }
        Update: {
          address?: string | null
          cnpj?: string
          created_at?: string
          email?: string
          id?: string
          legal_name?: string
          name?: string
          owner_id?: string
          phone?: string | null
        }
        Relationships: []
      }
      employee_access_codes: {
        Row: {
          code: string
          company_id: string
          created_at: string
          employee_email: string
          employee_name: string
          expires_at: string
          id: string
          is_used: boolean
          used_at: string | null
        }
        Insert: {
          code: string
          company_id: string
          created_at?: string
          employee_email: string
          employee_name: string
          expires_at?: string
          id?: string
          is_used?: boolean
          used_at?: string | null
        }
        Update: {
          code?: string
          company_id?: string
          created_at?: string
          employee_email?: string
          employee_name?: string
          expires_at?: string
          id?: string
          is_used?: boolean
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_access_codes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          active: boolean
          company_id: string | null
          created_at: string
          email: string
          id: string
          name: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          active?: boolean
          company_id?: string | null
          created_at?: string
          email: string
          id: string
          name: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          active?: boolean
          company_id?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_access_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_company_id: {
        Args: { user_id: string }
        Returns: string
      }
      is_company_owner: {
        Args: { user_id: string; company_id: string }
        Returns: boolean
      }
    }
    Enums: {
      expense_status: "pending" | "approved" | "reimbursed"
      payment_method: "pix" | "transfer" | "credit_card" | "debit_card" | "cash"
      payment_status:
        | "pending"
        | "partial"
        | "completed"
        | "overdue"
        | "cancelled"
      payment_type: "full" | "installment" | "advance"
      transaction_category:
        | "service_payment"
        | "client_payment"
        | "fuel"
        | "accommodation"
        | "meals"
        | "materials"
        | "maintenance"
        | "office_expense"
        | "other"
      transaction_status: "pending" | "completed" | "cancelled"
      user_role: "owner" | "employee"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      expense_status: ["pending", "approved", "reimbursed"],
      payment_method: ["pix", "transfer", "credit_card", "debit_card", "cash"],
      payment_status: [
        "pending",
        "partial",
        "completed",
        "overdue",
        "cancelled",
      ],
      payment_type: ["full", "installment", "advance"],
      transaction_category: [
        "service_payment",
        "client_payment",
        "fuel",
        "accommodation",
        "meals",
        "materials",
        "maintenance",
        "office_expense",
        "other",
      ],
      transaction_status: ["pending", "completed", "cancelled"],
      user_role: ["owner", "employee"],
    },
  },
} as const
