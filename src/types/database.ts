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
      active_sessions: {
        Row: {
          created_at: string
          device_fingerprint: string | null
          id: string
          ip_address: unknown
          last_heartbeat_at: string
          session_token_hash: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          device_fingerprint?: string | null
          id?: string
          ip_address?: unknown
          last_heartbeat_at?: string
          session_token_hash: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          device_fingerprint?: string | null
          id?: string
          ip_address?: unknown
          last_heartbeat_at?: string
          session_token_hash?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "active_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "batch_members"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "active_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "active_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          after: Json | null
          before: Json | null
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          after?: Json | null
          before?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          after?: Json | null
          before?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "batch_members"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "audit_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      batch_enrollments: {
        Row: {
          attendance_count: number
          batch_id: string
          created_at: string
          granted_at: string
          id: string
          payment_id: string | null
          revoked_at: string | null
          revoked_reason: string | null
          status: Database["public"]["Enums"]["enrollment_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          attendance_count?: number
          batch_id: string
          created_at?: string
          granted_at?: string
          id?: string
          payment_id?: string | null
          revoked_at?: string | null
          revoked_reason?: string | null
          status?: Database["public"]["Enums"]["enrollment_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          attendance_count?: number
          batch_id?: string
          created_at?: string
          granted_at?: string
          id?: string
          payment_id?: string | null
          revoked_at?: string | null
          revoked_reason?: string | null
          status?: Database["public"]["Enums"]["enrollment_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "batch_enrollments_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batch_enrollments_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batch_enrollments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "batch_members"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "batch_enrollments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batch_enrollments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      batch_private_links: {
        Row: {
          batch_id: string
          facebook_group_url: string | null
          telegram_url: string | null
          updated_at: string
          whatsapp_group_url: string | null
        }
        Insert: {
          batch_id: string
          facebook_group_url?: string | null
          telegram_url?: string | null
          updated_at?: string
          whatsapp_group_url?: string | null
        }
        Update: {
          batch_id?: string
          facebook_group_url?: string | null
          telegram_url?: string | null
          updated_at?: string
          whatsapp_group_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "batch_private_links_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: true
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
        ]
      }
      batches: {
        Row: {
          compare_at_price_bdt: number | null
          course_id: string | null
          created_at: string
          description: string | null
          ends_at: string | null
          enrollment_closes_at: string | null
          enrollment_opens_at: string | null
          id: string
          includes_course_access: boolean
          instructor_id: string | null
          price_bdt: number
          schedule_note: string | null
          seat_limit: number
          seats_taken: number
          seo_description: string | null
          seo_title: string | null
          slug: string
          starts_at: string
          status: Database["public"]["Enums"]["batch_status"]
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          compare_at_price_bdt?: number | null
          course_id?: string | null
          created_at?: string
          description?: string | null
          ends_at?: string | null
          enrollment_closes_at?: string | null
          enrollment_opens_at?: string | null
          id?: string
          includes_course_access?: boolean
          instructor_id?: string | null
          price_bdt: number
          schedule_note?: string | null
          seat_limit: number
          seats_taken?: number
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          starts_at: string
          status?: Database["public"]["Enums"]["batch_status"]
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          compare_at_price_bdt?: number | null
          course_id?: string | null
          created_at?: string
          description?: string | null
          ends_at?: string | null
          enrollment_closes_at?: string | null
          enrollment_opens_at?: string | null
          id?: string
          includes_course_access?: boolean
          instructor_id?: string | null
          price_bdt?: number
          schedule_note?: string | null
          seat_limit?: number
          seats_taken?: number
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          starts_at?: string
          status?: Database["public"]["Enums"]["batch_status"]
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "batches_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batches_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "batch_members"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "batches_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batches_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bkash_tokens: {
        Row: {
          id: number
          id_token: string | null
          id_token_expires_at: string | null
          refresh_token: string | null
          refresh_token_expires_at: string | null
          updated_at: string
        }
        Insert: {
          id?: number
          id_token?: string | null
          id_token_expires_at?: string | null
          refresh_token?: string | null
          refresh_token_expires_at?: string | null
          updated_at?: string
        }
        Update: {
          id?: number
          id_token?: string | null
          id_token_expires_at?: string | null
          refresh_token?: string | null
          refresh_token_expires_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_id: string | null
          content_html: string | null
          cover_image_url: string | null
          created_at: string
          excerpt: string | null
          id: string
          is_published: boolean
          lang: string
          og_image_url: string | null
          published_at: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          content_html?: string | null
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_published?: boolean
          lang?: string
          og_image_url?: string | null
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          content_html?: string | null
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_published?: boolean
          lang?: string
          og_image_url?: string | null
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "batch_members"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "blog_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bundle_items: {
        Row: {
          batch_id: string | null
          bundle_product_id: string
          course_id: string | null
          created_at: string
          id: string
        }
        Insert: {
          batch_id?: string | null
          bundle_product_id: string
          course_id?: string | null
          created_at?: string
          id?: string
        }
        Update: {
          batch_id?: string | null
          bundle_product_id?: string
          course_id?: string | null
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bundle_items_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bundle_items_bundle_product_id_fkey"
            columns: ["bundle_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bundle_items_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      certificates: {
        Row: {
          batch_id: string | null
          certificate_number: string
          course_id: string | null
          created_at: string
          id: string
          is_revoked: boolean
          issued_at: string
          pdf_storage_path: string | null
          user_id: string
        }
        Insert: {
          batch_id?: string | null
          certificate_number: string
          course_id?: string | null
          created_at?: string
          id?: string
          is_revoked?: boolean
          issued_at?: string
          pdf_storage_path?: string | null
          user_id: string
        }
        Update: {
          batch_id?: string | null
          certificate_number?: string
          course_id?: string | null
          created_at?: string
          id?: string
          is_revoked?: boolean
          issued_at?: string
          pdf_storage_path?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "batch_members"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "certificates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coupon_redemptions: {
        Row: {
          coupon_id: string
          created_at: string
          id: string
          payment_id: string | null
          user_id: string
        }
        Insert: {
          coupon_id: string
          created_at?: string
          id?: string
          payment_id?: string | null
          user_id: string
        }
        Update: {
          coupon_id?: string
          created_at?: string
          id?: string
          payment_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupon_redemptions_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_redemptions_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_redemptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "batch_members"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "coupon_redemptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_redemptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          discount_type: string
          discount_value: number
          ends_at: string | null
          id: string
          is_active: boolean
          max_uses: number | null
          min_amount_bdt: number | null
          per_user_limit: number
          product_id: string | null
          starts_at: string | null
          updated_at: string
          used_count: number
        }
        Insert: {
          code: string
          created_at?: string
          discount_type: string
          discount_value: number
          ends_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          min_amount_bdt?: number | null
          per_user_limit?: number
          product_id?: string | null
          starts_at?: string | null
          updated_at?: string
          used_count?: number
        }
        Update: {
          code?: string
          created_at?: string
          discount_type?: string
          discount_value?: number
          ends_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          min_amount_bdt?: number | null
          per_user_limit?: number
          product_id?: string | null
          starts_at?: string | null
          updated_at?: string
          used_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "coupons_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          compare_at_price_bdt: number | null
          created_at: string
          description: string | null
          id: string
          is_primary: boolean
          is_published: boolean
          og_image_url: string | null
          outcomes: Json | null
          price_bdt: number
          requirements: Json | null
          seo_description: string | null
          seo_title: string | null
          sequential_unlock: boolean
          slug: string
          sort_order: number | null
          subtitle: string | null
          thumbnail_url: string | null
          title: string
          total_duration_seconds: number
          total_lessons: number
          trailer_video_id: string | null
          updated_at: string
        }
        Insert: {
          compare_at_price_bdt?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_primary?: boolean
          is_published?: boolean
          og_image_url?: string | null
          outcomes?: Json | null
          price_bdt: number
          requirements?: Json | null
          seo_description?: string | null
          seo_title?: string | null
          sequential_unlock?: boolean
          slug: string
          sort_order?: number | null
          subtitle?: string | null
          thumbnail_url?: string | null
          title: string
          total_duration_seconds?: number
          total_lessons?: number
          trailer_video_id?: string | null
          updated_at?: string
        }
        Update: {
          compare_at_price_bdt?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_primary?: boolean
          is_published?: boolean
          og_image_url?: string | null
          outcomes?: Json | null
          price_bdt?: number
          requirements?: Json | null
          seo_description?: string | null
          seo_title?: string | null
          sequential_unlock?: boolean
          slug?: string
          sort_order?: number | null
          subtitle?: string | null
          thumbnail_url?: string | null
          title?: string
          total_duration_seconds?: number
          total_lessons?: number
          trailer_video_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      email_log: {
        Row: {
          created_at: string
          error: string | null
          id: string
          provider_message_id: string | null
          recipient: string
          status: string | null
          template: string | null
        }
        Insert: {
          created_at?: string
          error?: string | null
          id?: string
          provider_message_id?: string | null
          recipient: string
          status?: string | null
          template?: string | null
        }
        Update: {
          created_at?: string
          error?: string | null
          id?: string
          provider_message_id?: string | null
          recipient?: string
          status?: string | null
          template?: string | null
        }
        Relationships: []
      }
      enrollments: {
        Row: {
          completed_at: string | null
          course_id: string
          created_at: string
          granted_at: string
          id: string
          payment_id: string | null
          progress_percent: number
          revoked_at: string | null
          revoked_reason: string | null
          status: Database["public"]["Enums"]["enrollment_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          created_at?: string
          granted_at?: string
          id?: string
          payment_id?: string | null
          progress_percent?: number
          revoked_at?: string | null
          revoked_reason?: string | null
          status?: Database["public"]["Enums"]["enrollment_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          created_at?: string
          granted_at?: string
          id?: string
          payment_id?: string | null
          progress_percent?: number
          revoked_at?: string | null
          revoked_reason?: string | null
          status?: Database["public"]["Enums"]["enrollment_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "batch_members"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "enrollments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      faqs: {
        Row: {
          answer: string
          category: string | null
          created_at: string
          id: string
          is_published: boolean
          question: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          answer: string
          category?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          question: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          answer?: string
          category?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          question?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          converted_user_id: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          message: string | null
          phone: string | null
          query_type: string | null
          source: Database["public"]["Enums"]["lead_source"] | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          converted_user_id?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          message?: string | null
          phone?: string | null
          query_type?: string | null
          source?: Database["public"]["Enums"]["lead_source"] | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          converted_user_id?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          message?: string | null
          phone?: string | null
          query_type?: string | null
          source?: Database["public"]["Enums"]["lead_source"] | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_converted_user_id_fkey"
            columns: ["converted_user_id"]
            isOneToOne: false
            referencedRelation: "batch_members"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "leads_converted_user_id_fkey"
            columns: ["converted_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_converted_user_id_fkey"
            columns: ["converted_user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_notes: {
        Row: {
          content: string | null
          created_at: string
          id: string
          lesson_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          lesson_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          lesson_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_notes_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "course_outline_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_notes_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_notes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "batch_members"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "lesson_notes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_notes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_progress: {
        Row: {
          completed_at: string | null
          course_id: string
          created_at: string
          first_viewed_at: string | null
          id: string
          is_completed: boolean
          last_position_seconds: number
          last_viewed_at: string | null
          lesson_id: string
          updated_at: string
          user_id: string
          watched_seconds: number
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          created_at?: string
          first_viewed_at?: string | null
          id?: string
          is_completed?: boolean
          last_position_seconds?: number
          last_viewed_at?: string | null
          lesson_id: string
          updated_at?: string
          user_id: string
          watched_seconds?: number
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          created_at?: string
          first_viewed_at?: string | null
          id?: string
          is_completed?: boolean
          last_position_seconds?: number
          last_viewed_at?: string | null
          lesson_id?: string
          updated_at?: string
          user_id?: string
          watched_seconds?: number
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "course_outline_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "batch_members"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "lesson_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_resources: {
        Row: {
          created_at: string
          download_count: number
          file_size_bytes: number | null
          id: string
          lesson_id: string
          mime_type: string | null
          sort_order: number | null
          storage_path: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          download_count?: number
          file_size_bytes?: number | null
          id?: string
          lesson_id: string
          mime_type?: string | null
          sort_order?: number | null
          storage_path: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          download_count?: number
          file_size_bytes?: number | null
          id?: string
          lesson_id?: string
          mime_type?: string | null
          sort_order?: number | null
          storage_path?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_resources_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "course_outline_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_resources_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          bunny_video_id: string | null
          content_html: string | null
          course_id: string
          created_at: string
          description: string | null
          duration_seconds: number
          global_order: number | null
          id: string
          image_paths: Json | null
          is_preview: boolean
          is_published: boolean
          module_id: string
          slug: string
          sort_order: number
          title: string
          type: Database["public"]["Enums"]["lesson_type"]
          updated_at: string
        }
        Insert: {
          bunny_video_id?: string | null
          content_html?: string | null
          course_id: string
          created_at?: string
          description?: string | null
          duration_seconds?: number
          global_order?: number | null
          id?: string
          image_paths?: Json | null
          is_preview?: boolean
          is_published?: boolean
          module_id: string
          slug: string
          sort_order: number
          title: string
          type?: Database["public"]["Enums"]["lesson_type"]
          updated_at?: string
        }
        Update: {
          bunny_video_id?: string | null
          content_html?: string | null
          course_id?: string
          created_at?: string
          description?: string | null
          duration_seconds?: number
          global_order?: number | null
          id?: string
          image_paths?: Json | null
          is_preview?: boolean
          is_published?: boolean
          module_id?: string
          slug?: string
          sort_order?: number
          title?: string
          type?: Database["public"]["Enums"]["lesson_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      live_sessions: {
        Row: {
          batch_id: string
          created_at: string
          description: string | null
          duration_minutes: number
          id: string
          is_cancelled: boolean
          recording_bunny_video_id: string | null
          scheduled_at: string
          sort_order: number | null
          title: string
          updated_at: string
          zoom_join_url: string | null
          zoom_meeting_id: string | null
          zoom_password: string | null
        }
        Insert: {
          batch_id: string
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          is_cancelled?: boolean
          recording_bunny_video_id?: string | null
          scheduled_at: string
          sort_order?: number | null
          title: string
          updated_at?: string
          zoom_join_url?: string | null
          zoom_meeting_id?: string | null
          zoom_password?: string | null
        }
        Update: {
          batch_id?: string
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          is_cancelled?: boolean
          recording_bunny_video_id?: string | null
          scheduled_at?: string
          sort_order?: number | null
          title?: string
          updated_at?: string
          zoom_join_url?: string | null
          zoom_meeting_id?: string | null
          zoom_password?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "live_sessions_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          course_id: string
          created_at: string
          description: string | null
          id: string
          is_published: boolean
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean
          sort_order: number
          title: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      otp_codes: {
        Row: {
          attempts: number
          code_hash: string
          consumed_at: string | null
          created_at: string
          expires_at: string
          id: string
          phone: string
          purpose: Database["public"]["Enums"]["otp_purpose"]
        }
        Insert: {
          attempts?: number
          code_hash: string
          consumed_at?: string | null
          created_at?: string
          expires_at: string
          id?: string
          phone: string
          purpose?: Database["public"]["Enums"]["otp_purpose"]
        }
        Update: {
          attempts?: number
          code_hash?: string
          consumed_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          phone?: string
          purpose?: Database["public"]["Enums"]["otp_purpose"]
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount_bdt: number
          bkash_create_response: Json | null
          bkash_customer_msisdn: string | null
          bkash_execute_response: Json | null
          bkash_payer_reference: string | null
          bkash_payment_id: string | null
          bkash_query_response: Json | null
          bkash_trx_id: string | null
          coupon_id: string | null
          created_at: string
          discount_bdt: number
          failure_reason: string | null
          gateway: Database["public"]["Enums"]["payment_gateway"]
          id: string
          ip_address: unknown
          merchant_invoice_number: string
          paid_at: string | null
          product_id: string
          refund_reason: string | null
          refunded_at: string | null
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          amount_bdt: number
          bkash_create_response?: Json | null
          bkash_customer_msisdn?: string | null
          bkash_execute_response?: Json | null
          bkash_payer_reference?: string | null
          bkash_payment_id?: string | null
          bkash_query_response?: Json | null
          bkash_trx_id?: string | null
          coupon_id?: string | null
          created_at?: string
          discount_bdt?: number
          failure_reason?: string | null
          gateway: Database["public"]["Enums"]["payment_gateway"]
          id?: string
          ip_address?: unknown
          merchant_invoice_number: string
          paid_at?: string | null
          product_id: string
          refund_reason?: string | null
          refunded_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          amount_bdt?: number
          bkash_create_response?: Json | null
          bkash_customer_msisdn?: string | null
          bkash_execute_response?: Json | null
          bkash_payer_reference?: string | null
          bkash_payment_id?: string | null
          bkash_query_response?: Json | null
          bkash_trx_id?: string | null
          coupon_id?: string | null
          created_at?: string
          discount_bdt?: number
          failure_reason?: string | null
          gateway?: Database["public"]["Enums"]["payment_gateway"]
          id?: string
          ip_address?: unknown
          merchant_invoice_number?: string
          paid_at?: string | null
          product_id?: string
          refund_reason?: string | null
          refunded_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "batch_members"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          batch_id: string | null
          course_id: string | null
          created_at: string
          id: string
          is_active: boolean
          price_bdt: number
          title: string
          type: Database["public"]["Enums"]["product_type"]
          updated_at: string
        }
        Insert: {
          batch_id?: string | null
          course_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          price_bdt: number
          title: string
          type: Database["public"]["Enums"]["product_type"]
          updated_at?: string
        }
        Update: {
          batch_id?: string | null
          course_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          price_bdt?: number
          title?: string
          type?: Database["public"]["Enums"]["product_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          admin_notes: string | null
          avatar_url: string | null
          ban_reason: string | null
          bio: string | null
          business_category: string | null
          business_name: string | null
          created_at: string
          district: string | null
          email: string
          facebook_url: string | null
          full_name: string | null
          id: string
          is_banned: boolean
          last_seen_at: string | null
          onboarding_completed: boolean
          phone: string | null
          phone_verified: boolean
          role: Database["public"]["Enums"]["user_role"]
          show_facebook: boolean
          updated_at: string
          username: string | null
          visibility: Database["public"]["Enums"]["profile_visibility"]
        }
        Insert: {
          admin_notes?: string | null
          avatar_url?: string | null
          ban_reason?: string | null
          bio?: string | null
          business_category?: string | null
          business_name?: string | null
          created_at?: string
          district?: string | null
          email: string
          facebook_url?: string | null
          full_name?: string | null
          id: string
          is_banned?: boolean
          last_seen_at?: string | null
          onboarding_completed?: boolean
          phone?: string | null
          phone_verified?: boolean
          role?: Database["public"]["Enums"]["user_role"]
          show_facebook?: boolean
          updated_at?: string
          username?: string | null
          visibility?: Database["public"]["Enums"]["profile_visibility"]
        }
        Update: {
          admin_notes?: string | null
          avatar_url?: string | null
          ban_reason?: string | null
          bio?: string | null
          business_category?: string | null
          business_name?: string | null
          created_at?: string
          district?: string | null
          email?: string
          facebook_url?: string | null
          full_name?: string | null
          id?: string
          is_banned?: boolean
          last_seen_at?: string | null
          onboarding_completed?: boolean
          phone?: string | null
          phone_verified?: boolean
          role?: Database["public"]["Enums"]["user_role"]
          show_facebook?: boolean
          updated_at?: string
          username?: string | null
          visibility?: Database["public"]["Enums"]["profile_visibility"]
        }
        Relationships: []
      }
      reports: {
        Row: {
          admin_notes: string | null
          created_at: string
          id: string
          reason: string | null
          reported_user_id: string
          reporter_id: string
          status: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          reason?: string | null
          reported_user_id: string
          reporter_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          reason?: string | null
          reported_user_id?: string
          reporter_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_reported_user_id_fkey"
            columns: ["reported_user_id"]
            isOneToOne: false
            referencedRelation: "batch_members"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "reports_reported_user_id_fkey"
            columns: ["reported_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reported_user_id_fkey"
            columns: ["reported_user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "batch_members"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      session_attendance: {
        Row: {
          created_at: string
          id: string
          joined_at: string | null
          live_session_id: string
          marked_by: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          joined_at?: string | null
          live_session_id: string
          marked_by?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          joined_at?: string | null
          live_session_id?: string
          marked_by?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_attendance_live_session_id_fkey"
            columns: ["live_session_id"]
            isOneToOne: false
            referencedRelation: "live_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_attendance_marked_by_fkey"
            columns: ["marked_by"]
            isOneToOne: false
            referencedRelation: "batch_members"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "session_attendance_marked_by_fkey"
            columns: ["marked_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_attendance_marked_by_fkey"
            columns: ["marked_by"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_attendance_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "batch_members"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "session_attendance_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_attendance_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      sms_log: {
        Row: {
          cost_bdt: number | null
          created_at: string
          error: string | null
          id: string
          recipient: string
          status: string | null
          template: string | null
        }
        Insert: {
          cost_bdt?: number | null
          created_at?: string
          error?: string | null
          id?: string
          recipient: string
          status?: string | null
          template?: string | null
        }
        Update: {
          cost_bdt?: number | null
          created_at?: string
          error?: string | null
          id?: string
          recipient?: string
          status?: string | null
          template?: string | null
        }
        Relationships: []
      }
      store_requests: {
        Row: {
          assigned_to: string | null
          budget_range: string | null
          business_name: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          internal_notes: string | null
          message: string | null
          phone: string
          product_category: string | null
          source: string | null
          status: Database["public"]["Enums"]["store_request_status"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          budget_range?: string | null
          business_name?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          internal_notes?: string | null
          message?: string | null
          phone: string
          product_category?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["store_request_status"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          budget_range?: string | null
          business_name?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          internal_notes?: string | null
          message?: string | null
          phone?: string
          product_category?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["store_request_status"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "store_requests_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "batch_members"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "store_requests_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_requests_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "batch_members"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "store_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonials: {
        Row: {
          business_name: string | null
          created_at: string
          id: string
          is_published: boolean
          name: string
          photo_url: string | null
          quote: string
          rating: number | null
          role: string | null
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          business_name?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          name: string
          photo_url?: string | null
          quote: string
          rating?: number | null
          role?: string | null
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          business_name?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          name?: string
          photo_url?: string | null
          quote?: string
          rating?: number | null
          role?: string | null
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      video_access_log: {
        Row: {
          bunny_video_id: string | null
          id: string
          ip_address: unknown
          lesson_id: string | null
          token_issued_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          bunny_video_id?: string | null
          id?: string
          ip_address?: unknown
          lesson_id?: string | null
          token_issued_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          bunny_video_id?: string | null
          id?: string
          ip_address?: unknown
          lesson_id?: string | null
          token_issued_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_access_log_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "course_outline_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_access_log_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_access_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "batch_members"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "video_access_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_access_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      batch_members: {
        Row: {
          avatar_url: string | null
          batch_id: string | null
          business_name: string | null
          district: string | null
          full_name: string | null
          user_id: string | null
          username: string | null
        }
        Relationships: [
          {
            foreignKeyName: "batch_enrollments_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
        ]
      }
      course_outline_public: {
        Row: {
          course_id: string | null
          duration_seconds: number | null
          global_order: number | null
          id: string | null
          is_preview: boolean | null
          module_id: string | null
          module_sort_order: number | null
          module_title: string | null
          sort_order: number | null
          title: string | null
          type: Database["public"]["Enums"]["lesson_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      public_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          business_category: string | null
          business_name: string | null
          created_at: string | null
          district: string | null
          facebook_url: string | null
          full_name: string | null
          id: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          business_category?: string | null
          business_name?: string | null
          created_at?: string | null
          district?: string | null
          facebook_url?: never
          full_name?: string | null
          id?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          business_category?: string | null
          business_name?: string | null
          created_at?: string | null
          district?: string | null
          facebook_url?: never
          full_name?: string | null
          id?: string | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      can_access_lesson: {
        Args: { lid: string; uid: string }
        Returns: boolean
      }
      cleanup_expired_otp_codes: { Args: never; Returns: undefined }
      cleanup_stale_sessions: { Args: never; Returns: number }
      generate_certificate_number: { Args: never; Returns: string }
      grant_access_for_payment: {
        Args: { p_payment_id: string }
        Returns: undefined
      }
      has_batch_access: { Args: { bid: string; uid: string }; Returns: boolean }
      has_course_access: {
        Args: { cid: string; uid: string }
        Returns: boolean
      }
      is_admin: { Args: { uid: string }; Returns: boolean }
      is_enrolled_student: { Args: { uid: string }; Returns: boolean }
    }
    Enums: {
      batch_status:
        | "upcoming"
        | "enrolling"
        | "running"
        | "completed"
        | "cancelled"
      enrollment_status: "active" | "revoked"
      lead_source: "organic" | "facebook" | "referral" | "webinar" | "other"
      lesson_type: "video" | "image" | "text" | "resource"
      otp_purpose: "login"
      payment_gateway: "bkash" | "manual" | "free"
      payment_status:
        | "pending"
        | "processing"
        | "completed"
        | "failed"
        | "cancelled"
        | "refunded"
      product_type: "course" | "batch" | "bundle"
      profile_visibility: "public" | "students_only" | "private"
      store_request_status:
        | "new"
        | "contacted"
        | "in_progress"
        | "delivered"
        | "declined"
      user_role: "student" | "instructor" | "admin" | "superadmin"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      batch_status: [
        "upcoming",
        "enrolling",
        "running",
        "completed",
        "cancelled",
      ],
      enrollment_status: ["active", "revoked"],
      lead_source: ["organic", "facebook", "referral", "webinar", "other"],
      lesson_type: ["video", "image", "text", "resource"],
      otp_purpose: ["login"],
      payment_gateway: ["bkash", "manual", "free"],
      payment_status: [
        "pending",
        "processing",
        "completed",
        "failed",
        "cancelled",
        "refunded",
      ],
      product_type: ["course", "batch", "bundle"],
      profile_visibility: ["public", "students_only", "private"],
      store_request_status: [
        "new",
        "contacted",
        "in_progress",
        "delivered",
        "declined",
      ],
      user_role: ["student", "instructor", "admin", "superadmin"],
    },
  },
} as const
