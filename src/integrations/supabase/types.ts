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
      bank_accounts: {
        Row: {
          account_number: string
          account_type: string
          agency: string
          balance: number
          bank: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_number: string
          account_type: string
          agency: string
          balance?: number
          bank: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_number?: string
          account_type?: string
          agency?: string
          balance?: number
          bank?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          active: boolean
          address: string | null
          company_name: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          address?: string | null
          company_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          address?: string | null
          company_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          address: string | null
          cnpj: string
          created_at: string | null
          email: string
          id: string
          legal_name: string
          name: string
          owner_id: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          cnpj: string
          created_at?: string | null
          email: string
          id?: string
          legal_name: string
          name: string
          owner_id?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          cnpj?: string
          created_at?: string | null
          email?: string
          id?: string
          legal_name?: string
          name?: string
          owner_id?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_cards: {
        Row: {
          available_limit: number
          bank: string
          brand: string
          card_number: string
          closing_date: number
          created_at: string
          credit_limit: number
          due_date: number
          id: string
          is_active: boolean
          name: string
          updated_at: string
          used_limit: number
          user_id: string
        }
        Insert: {
          available_limit?: number
          bank: string
          brand: string
          card_number: string
          closing_date: number
          created_at?: string
          credit_limit?: number
          due_date: number
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
          used_limit?: number
          user_id: string
        }
        Update: {
          available_limit?: number
          bank?: string
          brand?: string
          card_number?: string
          closing_date?: number
          created_at?: string
          credit_limit?: number
          due_date?: number
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
          used_limit?: number
          user_id?: string
        }
        Relationships: []
      }
      employee_access_codes: {
        Row: {
          code: string
          company_id: string | null
          created_at: string | null
          employee_email: string
          employee_name: string
          expires_at: string | null
          id: string
          is_used: boolean | null
          used_at: string | null
        }
        Insert: {
          code: string
          company_id?: string | null
          created_at?: string | null
          employee_email: string
          employee_name: string
          expires_at?: string | null
          id?: string
          is_used?: boolean | null
          used_at?: string | null
        }
        Update: {
          code?: string
          company_id?: string | null
          created_at?: string | null
          employee_email?: string
          employee_name?: string
          expires_at?: string | null
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
      employees: {
        Row: {
          active: boolean | null
          created_at: string | null
          email: string
          id: string
          name: string
          phone: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          email: string
          id?: string
          name: string
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      expenses: {
        Row: {
          accommodation_details: Json | null
          account_id: string | null
          account_type: string | null
          actual_amount: number | null
          amount: number
          category: string
          created_at: string | null
          date: string
          description: string
          employee_id: string | null
          employee_name: string
          employee_role: string | null
          id: string
          invoice_amount: number | null
          is_advanced: boolean | null
          mission_id: string | null
          receipt: string | null
          receipt_amount: number | null
          status: Database["public"]["Enums"]["expense_status"]
          travel_km: number | null
          travel_km_rate: number | null
          travel_total_value: number | null
          updated_at: string | null
        }
        Insert: {
          accommodation_details?: Json | null
          account_id?: string | null
          account_type?: string | null
          actual_amount?: number | null
          amount: number
          category: string
          created_at?: string | null
          date: string
          description: string
          employee_id?: string | null
          employee_name: string
          employee_role?: string | null
          id?: string
          invoice_amount?: number | null
          is_advanced?: boolean | null
          mission_id?: string | null
          receipt?: string | null
          receipt_amount?: number | null
          status?: Database["public"]["Enums"]["expense_status"]
          travel_km?: number | null
          travel_km_rate?: number | null
          travel_total_value?: number | null
          updated_at?: string | null
        }
        Update: {
          accommodation_details?: Json | null
          account_id?: string | null
          account_type?: string | null
          actual_amount?: number | null
          amount?: number
          category?: string
          created_at?: string | null
          date?: string
          description?: string
          employee_id?: string | null
          employee_name?: string
          employee_role?: string | null
          id?: string
          invoice_amount?: number | null
          is_advanced?: boolean | null
          mission_id?: string | null
          receipt?: string | null
          receipt_amount?: number | null
          status?: Database["public"]["Enums"]["expense_status"]
          travel_km?: number | null
          travel_km_rate?: number | null
          travel_total_value?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          approved_at: string | null
          approved_by: string | null
          assigned_employees: string[] | null
          budget: number | null
          client_id: string | null
          client_name: string | null
          company_percentage: number | null
          company_value: number | null
          created_at: string | null
          created_by: string | null
          description: string | null
          employee_names: string[] | null
          end_date: string | null
          id: string
          is_approved: boolean | null
          location: string
          provider_percentage: number | null
          provider_value: number | null
          service_value: number | null
          start_date: string
          status: string
          title: string
          total_expenses: number | null
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          assigned_employees?: string[] | null
          budget?: number | null
          client_id?: string | null
          client_name?: string | null
          company_percentage?: number | null
          company_value?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          employee_names?: string[] | null
          end_date?: string | null
          id?: string
          is_approved?: boolean | null
          location: string
          provider_percentage?: number | null
          provider_value?: number | null
          service_value?: number | null
          start_date: string
          status?: string
          title: string
          total_expenses?: number | null
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          assigned_employees?: string[] | null
          budget?: number | null
          client_id?: string | null
          client_name?: string | null
          company_percentage?: number | null
          company_value?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          employee_names?: string[] | null
          end_date?: string | null
          id?: string
          is_approved?: boolean | null
          location?: string
          provider_percentage?: number | null
          provider_value?: number | null
          service_value?: number | null
          start_date?: string
          status?: string
          title?: string
          total_expenses?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "missions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          account_id: string | null
          account_type: string | null
          amount: number
          created_at: string | null
          current_installment: number | null
          description: string
          due_date: string
          id: string
          installments: number | null
          notes: string | null
          payment_date: string | null
          provider_id: string | null
          provider_name: string
          status: Database["public"]["Enums"]["payment_status"]
          tags: string[] | null
          type: Database["public"]["Enums"]["payment_type"]
          updated_at: string | null
        }
        Insert: {
          account_id?: string | null
          account_type?: string | null
          amount: number
          created_at?: string | null
          current_installment?: number | null
          description: string
          due_date: string
          id?: string
          installments?: number | null
          notes?: string | null
          payment_date?: string | null
          provider_id?: string | null
          provider_name: string
          status?: Database["public"]["Enums"]["payment_status"]
          tags?: string[] | null
          type?: Database["public"]["Enums"]["payment_type"]
          updated_at?: string | null
        }
        Update: {
          account_id?: string | null
          account_type?: string | null
          amount?: number
          created_at?: string | null
          current_installment?: number | null
          description?: string
          due_date?: string
          id?: string
          installments?: number | null
          notes?: string | null
          payment_date?: string | null
          provider_id?: string | null
          provider_name?: string
          status?: Database["public"]["Enums"]["payment_status"]
          tags?: string[] | null
          type?: Database["public"]["Enums"]["payment_type"]
          updated_at?: string | null
        }
        Relationships: [
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
      service_provider_access: {
        Row: {
          access_code: string
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          last_login: string | null
          password_hash: string
          permissions: Json | null
          provider_id: string | null
        }
        Insert: {
          access_code: string
          created_at?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          password_hash: string
          permissions?: Json | null
          provider_id?: string | null
        }
        Update: {
          access_code?: string
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          password_hash?: string
          permissions?: Json | null
          provider_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_provider_access_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      service_providers: {
        Row: {
          active: boolean | null
          address: string | null
          cpf_cnpj: string | null
          created_at: string | null
          email: string
          has_system_access: boolean | null
          hourly_rate: number | null
          id: string
          name: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          phone: string
          service: string
          specialties: string[] | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          address?: string | null
          cpf_cnpj?: string | null
          created_at?: string | null
          email: string
          has_system_access?: boolean | null
          hourly_rate?: number | null
          id?: string
          name: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          phone: string
          service: string
          specialties?: string[] | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          address?: string | null
          cpf_cnpj?: string | null
          created_at?: string | null
          email?: string
          has_system_access?: boolean | null
          hourly_rate?: number | null
          id?: string
          name?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          phone?: string
          service?: string
          specialties?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          account_id: string | null
          account_type: string | null
          amount: number
          category: Database["public"]["Enums"]["transaction_category"]
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
          updated_at: string | null
          user_id: string | null
          user_name: string
        }
        Insert: {
          account_id?: string | null
          account_type?: string | null
          amount: number
          category: Database["public"]["Enums"]["transaction_category"]
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
          updated_at?: string | null
          user_id?: string | null
          user_name: string
        }
        Update: {
          account_id?: string | null
          account_type?: string | null
          amount?: number
          category?: Database["public"]["Enums"]["transaction_category"]
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
          updated_at?: string | null
          user_id?: string | null
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      cash_flow_projections: {
        Row: {
          amount: number | null
          description: string | null
          month: string | null
          type: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_active_employees: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          name: string
          email: string
          phone: string
          role: string
          active: boolean
          created_at: string
          updated_at: string
        }[]
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_financial_summary: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_income: number
          total_expenses: number
          pending_payments: number
          pending_expenses: number
          monthly_income: number
          monthly_expenses: number
        }[]
      }
      get_user_transactions_simple: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          type: string
          category: string
          amount: number
          description: string
          date: string
          method: string
          status: string
          user_id: string
          user_name: string
          receipt: string
          tags: string[]
          mission_id: string
          account_id: string
          account_type: string
          created_at: string
          updated_at: string
        }[]
      }
      use_access_code: {
        Args: { access_code: string }
        Returns: Json
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
      user_role: "admin" | "user"
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
      user_role: ["admin", "user"],
    },
  },
} as const
