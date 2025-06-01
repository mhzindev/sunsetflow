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
          created_at: string | null
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
          created_at?: string | null
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
          created_at?: string | null
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
          created_at: string | null
          employee_email: string
          employee_name: string
          id: string
          is_used: boolean | null
          used_at: string | null
        }
        Insert: {
          code: string
          company_id: string
          created_at?: string | null
          employee_email: string
          employee_name: string
          id?: string
          is_used?: boolean | null
          used_at?: string | null
        }
        Update: {
          code?: string
          company_id?: string
          created_at?: string | null
          employee_email?: string
          employee_name?: string
          id?: string
          is_used?: boolean | null
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
      expenses: {
        Row: {
          accommodation_details: Json | null
          amount: number
          category: Database["public"]["Enums"]["transaction_category"]
          company_id: string
          created_at: string | null
          date: string
          description: string
          employee_id: string
          employee_name: string
          id: string
          is_advanced: boolean | null
          mission_id: string
          receipt: string | null
          status: Database["public"]["Enums"]["expense_status"] | null
        }
        Insert: {
          accommodation_details?: Json | null
          amount: number
          category: Database["public"]["Enums"]["transaction_category"]
          company_id: string
          created_at?: string | null
          date: string
          description: string
          employee_id: string
          employee_name: string
          id?: string
          is_advanced?: boolean | null
          mission_id: string
          receipt?: string | null
          status?: Database["public"]["Enums"]["expense_status"] | null
        }
        Update: {
          accommodation_details?: Json | null
          amount?: number
          category?: Database["public"]["Enums"]["transaction_category"]
          company_id?: string
          created_at?: string | null
          date?: string
          description?: string
          employee_id?: string
          employee_name?: string
          id?: string
          is_advanced?: boolean | null
          mission_id?: string
          receipt?: string | null
          status?: Database["public"]["Enums"]["expense_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      missions: {
        Row: {
          company_id: string
          created_at: string | null
          description: string | null
          end_date: string
          id: string
          name: string
          start_date: string
          status: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          description?: string | null
          end_date: string
          id?: string
          name: string
          start_date: string
          status?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          description?: string | null
          end_date?: string
          id?: string
          name?: string
          start_date?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "missions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          company_id: string
          created_at: string | null
          current_installment: number | null
          description: string
          due_date: string
          id: string
          installments: number | null
          notes: string | null
          payment_date: string | null
          provider_id: string
          provider_name: string
          status: Database["public"]["Enums"]["payment_status"]
          tags: string[] | null
          type: Database["public"]["Enums"]["payment_type"]
        }
        Insert: {
          amount: number
          company_id: string
          created_at?: string | null
          current_installment?: number | null
          description: string
          due_date: string
          id?: string
          installments?: number | null
          notes?: string | null
          payment_date?: string | null
          provider_id: string
          provider_name: string
          status?: Database["public"]["Enums"]["payment_status"]
          tags?: string[] | null
          type?: Database["public"]["Enums"]["payment_type"]
        }
        Update: {
          amount?: number
          company_id?: string
          created_at?: string | null
          current_installment?: number | null
          description?: string
          due_date?: string
          id?: string
          installments?: number | null
          notes?: string | null
          payment_date?: string | null
          provider_id?: string
          provider_name?: string
          status?: Database["public"]["Enums"]["payment_status"]
          tags?: string[] | null
          type?: Database["public"]["Enums"]["payment_type"]
        }
        Relationships: [
          {
            foreignKeyName: "payments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company_id: string | null
          created_at: string | null
          email: string
          id: string
          name: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          email: string
          id: string
          name: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string
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
      service_providers: {
        Row: {
          active: boolean | null
          company_id: string
          created_at: string | null
          email: string
          id: string
          name: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          phone: string
          service: string
        }
        Insert: {
          active?: boolean | null
          company_id: string
          created_at?: string | null
          email: string
          id?: string
          name: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          phone: string
          service: string
        }
        Update: {
          active?: boolean | null
          company_id?: string
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          phone?: string
          service?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_providers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          category: Database["public"]["Enums"]["transaction_category"]
          company_id: string
          created_at: string | null
          date: string
          description: string
          id: string
          method: Database["public"]["Enums"]["payment_method"]
          mission_id: string | null
          receipt: string | null
          status: Database["public"]["Enums"]["transaction_status"]
          tags: string[] | null
          type: string
          user_id: string
          user_name: string
        }
        Insert: {
          amount: number
          category: Database["public"]["Enums"]["transaction_category"]
          company_id: string
          created_at?: string | null
          date: string
          description: string
          id?: string
          method: Database["public"]["Enums"]["payment_method"]
          mission_id?: string | null
          receipt?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          tags?: string[] | null
          type: string
          user_id: string
          user_name: string
        }
        Update: {
          amount?: number
          category?: Database["public"]["Enums"]["transaction_category"]
          company_id?: string
          created_at?: string | null
          date?: string
          description?: string
          id?: string
          method?: Database["public"]["Enums"]["payment_method"]
          mission_id?: string | null
          receipt?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          tags?: string[] | null
          type?: string
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
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
