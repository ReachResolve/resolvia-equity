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
      news: {
        Row: {
          author: string
          content: string
          id: string
          timestamp: string | null
          title: string
        }
        Insert: {
          author: string
          content: string
          id?: string
          timestamp?: string | null
          title: string
        }
        Update: {
          author?: string
          content?: string
          id?: string
          timestamp?: string | null
          title?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          id: string
          price: number
          shares: number
          status: string
          timestamp: string | null
          type: string
          user_id: string
        }
        Insert: {
          id?: string
          price: number
          shares: number
          status?: string
          timestamp?: string | null
          type: string
          user_id: string
        }
        Update: {
          id?: string
          price?: number
          shares?: number
          status?: string
          timestamp?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          email: string
          id: string
          joined_at: string | null
          name: string
          "Profile Pic": string | null
          role: string
          shares_owned: number
          wallet_id: string | null
        }
        Insert: {
          email: string
          id: string
          joined_at?: string | null
          name: string
          "Profile Pic"?: string | null
          role: string
          shares_owned?: number
          wallet_id?: string | null
        }
        Update: {
          email?: string
          id?: string
          joined_at?: string | null
          name?: string
          "Profile Pic"?: string | null
          role?: string
          shares_owned?: number
          wallet_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["Wallet id"]
          },
        ]
      }
      stock_prices: {
        Row: {
          price: number
          timestamp: string | null
        }
        Insert: {
          price: number
          timestamp?: string | null
        }
        Update: {
          price?: number
          timestamp?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          counterparty_id: string | null
          credited_debited: string | null
          id: string
          price: number
          receiver_wallet_id: string | null
          sender_wallet_id: string | null
          shares: number
          timestamp: string | null
          type: string
          user_id: string
        }
        Insert: {
          counterparty_id?: string | null
          credited_debited?: string | null
          id?: string
          price: number
          receiver_wallet_id?: string | null
          sender_wallet_id?: string | null
          shares: number
          timestamp?: string | null
          type: string
          user_id: string
        }
        Update: {
          counterparty_id?: string | null
          credited_debited?: string | null
          id?: string
          price?: number
          receiver_wallet_id?: string | null
          sender_wallet_id?: string | null
          shares?: number
          timestamp?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_counterparty_id_fkey"
            columns: ["counterparty_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_receiver_wallet_id_fkey"
            columns: ["receiver_wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["Wallet id"]
          },
          {
            foreignKeyName: "transactions_sender_wallet_id_fkey"
            columns: ["sender_wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["Wallet id"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          created_at: string | null
          shares: number
          user_id: string
          "Wallet id": string
        }
        Insert: {
          created_at?: string | null
          shares?: number
          user_id: string
          "Wallet id"?: string
        }
        Update: {
          created_at?: string | null
          shares?: number
          user_id?: string
          "Wallet id"?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
