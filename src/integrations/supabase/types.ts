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
      face_scans: {
        Row: {
          confidence_score: number | null
          created_at: string
          environmental_conditions: Json | null
          face_embedding: number[]
          id: string
          image_url: string
          learning_weight: number | null
          lighting_score: number | null
          quality_score: number | null
          scan_type: string
          template_rank: number | null
          user_email: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          environmental_conditions?: Json | null
          face_embedding: number[]
          id?: string
          image_url: string
          learning_weight?: number | null
          lighting_score?: number | null
          quality_score?: number | null
          scan_type: string
          template_rank?: number | null
          user_email: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          environmental_conditions?: Json | null
          face_embedding?: number[]
          id?: string
          image_url?: string
          learning_weight?: number | null
          lighting_score?: number | null
          quality_score?: number | null
          scan_type?: string
          template_rank?: number | null
          user_email?: string
        }
        Relationships: []
      }
      face_templates: {
        Row: {
          confidence_score: number
          created_at: string | null
          face_embedding: number[]
          id: string
          last_used: string | null
          lighting_conditions: Json | null
          quality_score: number
          template_rank: number | null
          usage_count: number | null
          user_email: string
        }
        Insert: {
          confidence_score?: number
          created_at?: string | null
          face_embedding: number[]
          id?: string
          last_used?: string | null
          lighting_conditions?: Json | null
          quality_score?: number
          template_rank?: number | null
          usage_count?: number | null
          user_email: string
        }
        Update: {
          confidence_score?: number
          created_at?: string | null
          face_embedding?: number[]
          id?: string
          last_used?: string | null
          lighting_conditions?: Json | null
          quality_score?: number
          template_rank?: number | null
          usage_count?: number | null
          user_email?: string
        }
        Relationships: []
      }
      feedback: {
        Row: {
          created_at: string
          description: string
          feedback_type: string
          id: string
          rating: number | null
          subject: string
          user_email: string
        }
        Insert: {
          created_at?: string
          description: string
          feedback_type: string
          id?: string
          rating?: number | null
          subject: string
          user_email: string
        }
        Update: {
          created_at?: string
          description?: string
          feedback_type?: string
          id?: string
          rating?: number | null
          subject?: string
          user_email?: string
        }
        Relationships: []
      }
      sign_in_logs: {
        Row: {
          created_at: string
          id: string
          ip_address: string | null
          sign_in_time: string
          success_status: boolean
          user_email: string
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address?: string | null
          sign_in_time?: string
          success_status?: boolean
          user_email: string
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: string | null
          sign_in_time?: string
          success_status?: boolean
          user_email?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          base_threshold: number | null
          created_at: string | null
          current_threshold: number | null
          email: string
          embedding_count: number | null
          face_embedding: number[]
          id: string
          last_updated: string | null
          learning_weight: number | null
          lighting_conditions: Json | null
          quality_score_avg: number | null
          recognition_threshold: number | null
          successful_logins: number | null
          total_logins: number | null
          updated_at: string | null
        }
        Insert: {
          base_threshold?: number | null
          created_at?: string | null
          current_threshold?: number | null
          email: string
          embedding_count?: number | null
          face_embedding: number[]
          id?: string
          last_updated?: string | null
          learning_weight?: number | null
          lighting_conditions?: Json | null
          quality_score_avg?: number | null
          recognition_threshold?: number | null
          successful_logins?: number | null
          total_logins?: number | null
          updated_at?: string | null
        }
        Update: {
          base_threshold?: number | null
          created_at?: string | null
          current_threshold?: number | null
          email?: string
          embedding_count?: number | null
          face_embedding?: number[]
          id?: string
          last_updated?: string | null
          learning_weight?: number | null
          lighting_conditions?: Json | null
          quality_score_avg?: number | null
          recognition_threshold?: number | null
          successful_logins?: number | null
          total_logins?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      check_duplicate_user: {
        Args: { p_face_embedding: number[]; p_threshold?: number }
        Returns: {
          existing_email: string
          similarity_score: number
          user_id: string
        }[]
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: unknown
      }
      manage_face_templates: {
        Args: {
          p_user_email: string
          p_face_embedding: number[]
          p_quality_score: number
          p_confidence_score: number
          p_lighting_conditions: Json
        }
        Returns: undefined
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      update_user_embedding_with_scan: {
        Args: {
          p_user_email: string
          p_new_embedding: number[]
          p_confidence: number
        }
        Returns: undefined
      }
      update_user_learning_metrics: {
        Args: {
          p_user_email: string
          p_success: boolean
          p_confidence: number
          p_quality_score: number
        }
        Returns: undefined
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
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
    Enums: {},
  },
} as const
