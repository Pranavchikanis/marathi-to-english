export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      curriculum_stages: {
        Row: {
          id: string
          level_number: number
          name: string
          is_active: boolean
        }
        Insert: {
          id?: string
          level_number: number
          name: string
          is_active?: boolean
        }
        Update: {
          id?: string
          level_number?: number
          name?: string
          is_active?: boolean
        }
      }
      concepts: {
        Row: {
          id: string
          stage_id: string
          name: string
          description: string | null
        }
        Insert: {
          id?: string
          stage_id: string
          name: string
          description?: string | null
        }
        Update: {
          id?: string
          stage_id?: string
          name?: string
          description?: string | null
        }
      }
      exercises: {
        Row: {
          id: string
          concept_id: string
          marathi_prompt: string
          reference_translations: string[]
          difficulty_level: number
        }
        Insert: {
          id?: string
          concept_id: string
          marathi_prompt: string
          reference_translations: string[]
          difficulty_level: number
        }
        Update: {
          id?: string
          concept_id?: string
          marathi_prompt?: string
          reference_translations?: string[]
          difficulty_level?: number
        }
      }
      students: {
        Row: {
          id: string
          auth_user_id: string
          display_name: string
          total_xp: number
          current_stage_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          auth_user_id: string
          display_name: string
          total_xp?: number
          current_stage_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          auth_user_id?: string
          display_name?: string
          total_xp?: number
          current_stage_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      sessions: {
        Row: {
          id: string
          student_id: string
          status: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED'
          xp_earned: number
          summary_data: Json | null
          started_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          student_id: string
          status?: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED'
          xp_earned?: number
          summary_data?: Json | null
          started_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          student_id?: string
          status?: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED'
          xp_earned?: number
          summary_data?: Json | null
          started_at?: string
          completed_at?: string | null
        }
      }
      session_exercises: {
        Row: {
          id: string
          session_id: string
          exercise_id: string
          order_index: number
          status: 'PENDING' | 'SKIPPED' | 'COMPLETED'
        }
        Insert: {
          id?: string
          session_id: string
          exercise_id: string
          order_index: number
          status?: 'PENDING' | 'SKIPPED' | 'COMPLETED'
        }
        Update: {
          id?: string
          session_id?: string
          exercise_id?: string
          order_index?: number
          status?: 'PENDING' | 'SKIPPED' | 'COMPLETED'
        }
      }
      attempts: {
        Row: {
          id: string
          session_exercise_id: string
          modality: 'TEXT' | 'VOICE'
          raw_transcription: string | null
          submitted_answer: string
          was_edited: boolean
          submitted_at: string
        }
        Insert: {
          id?: string
          session_exercise_id: string
          modality: 'TEXT' | 'VOICE'
          raw_transcription?: string | null
          submitted_answer: string
          was_edited?: boolean
          submitted_at?: string
        }
        Update: {
          id?: string
          session_exercise_id?: string
          modality?: 'TEXT' | 'VOICE'
          raw_transcription?: string | null
          submitted_answer?: string
          was_edited?: boolean
          submitted_at?: string
        }
      }
      evaluations: {
        Row: {
          id: string
          attempt_id: string
          grade: 'A' | 'B' | 'C' | 'D' | 'E' | 'F'
          corrected_text: string | null
          explanation_marathi: string | null
          alternative_valid_translations: string[] | null
          ai_metadata: Json
          evaluated_at: string
        }
        Insert: {
          id?: string
          attempt_id: string
          grade: 'A' | 'B' | 'C' | 'D' | 'E' | 'F'
          corrected_text?: string | null
          explanation_marathi?: string | null
          alternative_valid_translations?: string[] | null
          ai_metadata: Json
          evaluated_at?: string
        }
        Update: {
          id?: string
          attempt_id?: string
          grade?: 'A' | 'B' | 'C' | 'D' | 'E' | 'F'
          corrected_text?: string | null
          explanation_marathi?: string | null
          alternative_valid_translations?: string[] | null
          ai_metadata?: Json
          evaluated_at?: string
        }
      }
      evaluation_errors: {
        Row: {
          id: string
          evaluation_id: string
          category: 'GRAMMAR' | 'TENSE' | 'ARTICLE' | 'PREPOSITION' | 'WORD_ORDER' | 'AGREEMENT' | 'VOCABULARY' | 'SPELLING' | 'MISSING_WORD' | 'EXTRA_WORD' | 'MEANING' | 'NATURALNESS'
        }
        Insert: {
          id?: string
          evaluation_id: string
          category: 'GRAMMAR' | 'TENSE' | 'ARTICLE' | 'PREPOSITION' | 'WORD_ORDER' | 'AGREEMENT' | 'VOCABULARY' | 'SPELLING' | 'MISSING_WORD' | 'EXTRA_WORD' | 'MEANING' | 'NATURALNESS'
        }
        Update: {
          id?: string
          evaluation_id?: string
          category?: 'GRAMMAR' | 'TENSE' | 'ARTICLE' | 'PREPOSITION' | 'WORD_ORDER' | 'AGREEMENT' | 'VOCABULARY' | 'SPELLING' | 'MISSING_WORD' | 'EXTRA_WORD' | 'MEANING' | 'NATURALNESS'
        }
      }
      mastery: {
        Row: {
          id: string
          student_id: string
          concept_id: string
          status: 'NOT_INTRODUCED' | 'INTRODUCED' | 'PRACTICING' | 'DEVELOPING' | 'PROFICIENT' | 'NEEDS_REVIEW'
          correct_attempts: number
          incorrect_attempts: number
          last_practiced_at: string | null
        }
        Insert: {
          id?: string
          student_id: string
          concept_id: string
          status?: 'NOT_INTRODUCED' | 'INTRODUCED' | 'PRACTICING' | 'DEVELOPING' | 'PROFICIENT' | 'NEEDS_REVIEW'
          correct_attempts?: number
          incorrect_attempts?: number
          last_practiced_at?: string | null
        }
        Update: {
          id?: string
          student_id?: string
          concept_id?: string
          status?: 'NOT_INTRODUCED' | 'INTRODUCED' | 'PRACTICING' | 'DEVELOPING' | 'PROFICIENT' | 'NEEDS_REVIEW'
          correct_attempts?: number
          incorrect_attempts?: number
          last_practiced_at?: string | null
        }
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
