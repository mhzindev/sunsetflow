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
      confirmed_revenues: {
        Row: {
          account_id: string | null
          account_type: string | null
          client_name: string
          company_amount: number
          created_at: string
          description: string | null
          id: string
          mission_id: string | null
          payment_method: string
          provider_amount: number
          received_date: string
          total_amount: number
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          account_id?: string | null
          account_type?: string | null
          client_name: string
          company_amount: number
          created_at?: string
          description?: string | null
          id?: string
          mission_id?: string | null
          payment_method?: string
          provider_amount: number
          received_date?: string
          total_amount: number
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          account_id?: string | null
          account_type?: string | null
          client_name?: string
          company_amount?: number
          created_at?: string
          description?: string | null
          id?: string
          mission_id?: string | null
          payment_method?: string
          provider_amount?: number
          received_date?: string
          total_amount?: number
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "confirmed_revenues_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
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
          assigned_providers: string[] | null
          budget: number | null
          client_id: string | null
          client_name: string | null
          company_percentage: number | null
          company_value: number | null
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          is_approved: boolean | null
          location: string
          provider_id: string | null
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
          assigned_providers?: string[] | null
          budget?: number | null
          client_id?: string | null
          client_name?: string | null
          company_percentage?: number | null
          company_value?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_approved?: boolean | null
          location: string
          provider_id?: string | null
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
          assigned_providers?: string[] | null
          budget?: number | null
          client_id?: string | null
          client_name?: string | null
          company_percentage?: number | null
          company_value?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_approved?: boolean | null
          location?: string
          provider_id?: string | null
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
          {
            foreignKeyName: "missions_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
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
      pending_revenues: {
        Row: {
          account_id: string | null
          account_type: string | null
          client_name: string
          company_amount: number
          created_at: string
          description: string | null
          due_date: string
          id: string
          mission_id: string | null
          provider_amount: number
          received_at: string | null
          status: Database["public"]["Enums"]["pending_revenue_status"]
          total_amount: number
          updated_at: string
        }
        Insert: {
          account_id?: string | null
          account_type?: string | null
          client_name: string
          company_amount: number
          created_at?: string
          description?: string | null
          due_date: string
          id?: string
          mission_id?: string | null
          provider_amount: number
          received_at?: string | null
          status?: Database["public"]["Enums"]["pending_revenue_status"]
          total_amount: number
          updated_at?: string
        }
        Update: {
          account_id?: string | null
          account_type?: string | null
          client_name?: string
          company_amount?: number
          created_at?: string
          description?: string | null
          due_date?: string
          id?: string
          mission_id?: string | null
          provider_amount?: number
          received_at?: string | null
          status?: Database["public"]["Enums"]["pending_revenue_status"]
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pending_revenues_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
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
          provider_id: string | null
          role: Database["public"]["Enums"]["user_role"]
          user_type: string | null
        }
        Insert: {
          active?: boolean
          company_id?: string | null
          created_at?: string
          email: string
          id: string
          name: string
          phone?: string | null
          provider_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          user_type?: string | null
        }
        Update: {
          active?: boolean
          company_id?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          provider_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          user_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      service_provider_access: {
        Row: {
          access_code: string
          company_id: string | null
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
          company_id?: string | null
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
          company_id?: string | null
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
            foreignKeyName: "service_provider_access_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
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
          company_id: string | null
          cpf_cnpj: string | null
          created_at: string | null
          current_balance: number | null
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
          company_id?: string | null
          cpf_cnpj?: string | null
          created_at?: string | null
          current_balance?: number | null
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
          company_id?: string | null
          cpf_cnpj?: string | null
          created_at?: string | null
          current_balance?: number | null
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
      admin_find_employee_access: {
        Args: { search_email: string; search_code: string }
        Returns: {
          id: string
          code: string
          company_id: string
          employee_name: string
          employee_email: string
          is_used: boolean
          created_at: string
          expires_at: string
          used_at: string
        }[]
      }
      admin_find_service_provider_access: {
        Args: { search_email: string; search_code: string }
        Returns: {
          id: string
          provider_id: string
          email: string
          password_hash: string
          access_code: string
          is_active: boolean
          created_at: string
          last_login: string
          permissions: Json
        }[]
      }
      convert_pending_to_confirmed_revenue: {
        Args: {
          pending_revenue_id: string
          account_id: string
          account_type: string
          payment_method?: string
        }
        Returns: Json
      }
      convert_pending_to_received_revenue: {
        Args: {
          pending_revenue_id: string
          account_id: string
          account_type: string
        }
        Returns: Json
      }
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
      insert_payment_with_casting: {
        Args: {
          p_provider_name: string
          p_amount: number
          p_due_date: string
          p_status: string
          p_type: string
          p_description: string
          p_provider_id?: string
          p_payment_date?: string
          p_installments?: number
          p_current_installment?: number
          p_tags?: string[]
          p_notes?: string
          p_account_id?: string
          p_account_type?: string
        }
        Returns: {
          id: string
          provider_id: string
          provider_name: string
          amount: number
          due_date: string
          payment_date: string
          status: Database["public"]["Enums"]["payment_status"]
          type: Database["public"]["Enums"]["payment_type"]
          description: string
          installments: number
          current_installment: number
          tags: string[]
          notes: string
          account_id: string
          account_type: string
          created_at: string
          updated_at: string
        }[]
      }
      insert_payment_with_casting_wrapper: {
        Args: {
          p_provider_name: string
          p_amount: number
          p_due_date: string
          p_status: string
          p_type: string
          p_description: string
          p_provider_id?: string
          p_payment_date?: string
          p_installments?: number
          p_current_installment?: number
          p_tags?: string[]
          p_notes?: string
          p_account_id?: string
          p_account_type?: string
        }
        Returns: {
          id: string
          provider_id: string
          provider_name: string
          amount: number
          due_date: string
          payment_date: string
          status: Database["public"]["Enums"]["payment_status"]
          type: Database["public"]["Enums"]["payment_type"]
          description: string
          installments: number
          current_installment: number
          tags: string[]
          notes: string
          account_id: string
          account_type: string
          created_at: string
          updated_at: string
        }[]
      }
      insert_transaction_with_casting: {
        Args: {
          p_type: string
          p_category: string
          p_amount: number
          p_description: string
          p_date: string
          p_method: string
          p_status: string
          p_user_id: string
          p_user_name: string
          p_mission_id?: string
          p_receipt?: string
          p_tags?: string[]
          p_account_id?: string
          p_account_type?: string
        }
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
      is_company_owner: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_linked_provider: {
        Args: { transaction_user_id: string }
        Returns: boolean
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
      payment_type:
        | "full"
        | "installment"
        | "advance"
        | "balance_payment"
        | "advance_payment"
      pending_revenue_status: "pending" | "received" | "cancelled"
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
      payment_type: [
        "full",
        "installment",
        "advance",
        "balance_payment",
        "advance_payment",
      ],
      pending_revenue_status: ["pending", "received", "cancelled"],
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
