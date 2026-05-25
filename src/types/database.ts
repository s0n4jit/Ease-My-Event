export type UserRole = 'attendee' | 'organiser' | 'admin'
export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed'
export type EventType = 'online' | 'offline' | 'hybrid'
export type TicketStatus = 'valid' | 'used' | 'cancelled' | 'refunded'
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded'
export type RegistrationStatus = 'confirmed' | 'cancelled' | 'refunded'
export type RefundStatus = 'pending' | 'approved' | 'rejected'
export type DiscountType = 'percentage' | 'flat'
export type NotificationType = 'registration' | 'reminder' | 'cancellation' | 'refund' | 'review' | 'system' | 'checkin' | 'payout'
export type PayoutStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          avatar_url: string | null
          role: UserRole
          phone: string | null
          bio: string | null
          linkedin_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string
          avatar_url?: string | null
          role?: UserRole
          phone?: string | null
          bio?: string | null
          linkedin_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          avatar_url?: string | null
          role?: UserRole
          phone?: string | null
          bio?: string | null
          linkedin_url?: string | null
          is_active?: boolean
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          icon: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          icon?: string
          created_at?: string
        }
        Update: {
          name?: string
          slug?: string
          description?: string | null
          icon?: string
        }
      }
      events: {
        Row: {
          id: string
          organiser_id: string
          category_id: string | null
          title: string
          slug: string
          description: string | null
          short_description: string | null
          event_type: EventType
          venue_name: string | null
          venue_address: string | null
          city: string | null
          state: string | null
          country: string | null
          latitude: number | null
          longitude: number | null
          online_url: string | null
          start_date: string
          end_date: string
          capacity: number | null
          status: EventStatus
          is_featured: boolean
          banner_url: string | null
          faq: Record<string, unknown>[]
          agenda: Record<string, unknown>[]
          tags: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organiser_id: string
          category_id?: string | null
          title: string
          slug: string
          description?: string | null
          short_description?: string | null
          event_type?: EventType
          venue_name?: string | null
          venue_address?: string | null
          city?: string | null
          state?: string | null
          country?: string | null
          latitude?: number | null
          longitude?: number | null
          online_url?: string | null
          start_date: string
          end_date: string
          capacity?: number | null
          status?: EventStatus
          is_featured?: boolean
          banner_url?: string | null
          faq?: Record<string, unknown>[]
          agenda?: Record<string, unknown>[]
          tags?: string[]
        }
        Update: {
          organiser_id?: string
          category_id?: string | null
          title?: string
          slug?: string
          description?: string | null
          short_description?: string | null
          event_type?: EventType
          venue_name?: string | null
          venue_address?: string | null
          city?: string | null
          state?: string | null
          country?: string | null
          latitude?: number | null
          longitude?: number | null
          online_url?: string | null
          start_date?: string
          end_date?: string
          capacity?: number | null
          status?: EventStatus
          is_featured?: boolean
          banner_url?: string | null
          faq?: Record<string, unknown>[]
          agenda?: Record<string, unknown>[]
          tags?: string[]
        }
      }
      event_images: {
        Row: {
          id: string
          event_id: string
          image_url: string
          caption: string | null
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          image_url: string
          caption?: string | null
          sort_order?: number
        }
        Update: {
          image_url?: string
          caption?: string | null
          sort_order?: number
        }
      }
      speakers: {
        Row: {
          id: string
          event_id: string
          name: string
          title: string | null
          bio: string | null
          image_url: string | null
          linkedin_url: string | null
          twitter_url: string | null
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          name: string
          title?: string | null
          bio?: string | null
          image_url?: string | null
          linkedin_url?: string | null
          twitter_url?: string | null
          sort_order?: number
        }
        Update: {
          name?: string
          title?: string | null
          bio?: string | null
          image_url?: string | null
          linkedin_url?: string | null
          twitter_url?: string | null
          sort_order?: number
        }
      }
      ticket_types: {
        Row: {
          id: string
          event_id: string
          name: string
          description: string | null
          price: number
          currency: string
          quantity: number
          sold_count: number
          sale_start: string | null
          sale_end: string | null
          sort_order: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          name: string
          description?: string | null
          price?: number
          currency?: string
          quantity: number
          sold_count?: number
          sale_start?: string | null
          sale_end?: string | null
          sort_order?: number
          is_active?: boolean
        }
        Update: {
          name?: string
          description?: string | null
          price?: number
          currency?: string
          quantity?: number
          sold_count?: number
          sale_start?: string | null
          sale_end?: string | null
          sort_order?: number
          is_active?: boolean
        }
      }
      discount_codes: {
        Row: {
          id: string
          event_id: string
          code: string
          discount_type: DiscountType
          discount_value: number
          max_uses: number | null
          used_count: number
          min_order_amount: number | null
          expires_at: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          code: string
          discount_type?: DiscountType
          discount_value: number
          max_uses?: number | null
          used_count?: number
          min_order_amount?: number | null
          expires_at?: string | null
          is_active?: boolean
        }
        Update: {
          code?: string
          discount_type?: DiscountType
          discount_value?: number
          max_uses?: number | null
          used_count?: number
          min_order_amount?: number | null
          expires_at?: string | null
          is_active?: boolean
        }
      }
      registrations: {
        Row: {
          id: string
          event_id: string
          user_id: string
          status: RegistrationStatus
          total_amount: number
          discount_code_id: string | null
          discount_amount: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_id: string
          user_id: string
          status?: RegistrationStatus
          total_amount?: number
          discount_code_id?: string | null
          discount_amount?: number
          notes?: string | null
        }
        Update: {
          status?: RegistrationStatus
          total_amount?: number
          discount_code_id?: string | null
          discount_amount?: number
          notes?: string | null
        }
      }
      tickets: {
        Row: {
          id: string
          registration_id: string
          ticket_type_id: string
          qr_code: string
          status: TicketStatus
          attendee_name: string | null
          attendee_email: string | null
          checked_in_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          registration_id: string
          ticket_type_id: string
          qr_code: string
          status?: TicketStatus
          attendee_name?: string | null
          attendee_email?: string | null
        }
        Update: {
          status?: TicketStatus
          attendee_name?: string | null
          attendee_email?: string | null
          checked_in_at?: string | null
        }
      }
      payments: {
        Row: {
          id: string
          registration_id: string
          user_id: string
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          razorpay_signature: string | null
          amount: number
          currency: string
          status: PaymentStatus
          payment_method: string | null
          receipt_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          registration_id: string
          user_id: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          amount: number
          currency?: string
          status?: PaymentStatus
          payment_method?: string | null
          receipt_url?: string | null
        }
        Update: {
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          amount?: number
          status?: PaymentStatus
          payment_method?: string | null
          receipt_url?: string | null
        }
      }
      checkins: {
        Row: {
          id: string
          ticket_id: string
          event_id: string
          checked_in_by: string | null
          method: string
          created_at: string
        }
        Insert: {
          id?: string
          ticket_id: string
          event_id: string
          checked_in_by?: string | null
          method?: string
        }
        Update: {
          method?: string
        }
      }
      reviews: {
        Row: {
          id: string
          event_id: string
          user_id: string
          rating: number
          comment: string | null
          is_visible: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_id: string
          user_id: string
          rating: number
          comment?: string | null
          is_visible?: boolean
        }
        Update: {
          rating?: number
          comment?: string | null
          is_visible?: boolean
        }
      }
      wishlists: {
        Row: {
          id: string
          event_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          user_id: string
        }
        Update: never
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: NotificationType
          is_read: boolean
          event_id: string | null
          link: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type?: NotificationType
          is_read?: boolean
          event_id?: string | null
          link?: string | null
        }
        Update: {
          title?: string
          message?: string
          type?: NotificationType
          is_read?: boolean
          link?: string | null
        }
      }
      refund_requests: {
        Row: {
          id: string
          registration_id: string
          user_id: string
          reason: string
          status: RefundStatus
          admin_notes: string | null
          processed_by: string | null
          processed_at: string | null
          refund_amount: number | null
          created_at: string
        }
        Insert: {
          id?: string
          registration_id: string
          user_id: string
          reason: string
          status?: RefundStatus
          admin_notes?: string | null
          processed_by?: string | null
          refund_amount?: number | null
        }
        Update: {
          reason?: string
          status?: RefundStatus
          admin_notes?: string | null
          processed_by?: string | null
          processed_at?: string | null
          refund_amount?: number | null
        }
      }
      organiser_payouts: {
        Row: {
          id: string
          organiser_id: string
          event_id: string
          amount: number
          currency: string
          status: PayoutStatus
          transaction_id: string | null
          notes: string | null
          processed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          organiser_id: string
          event_id: string
          amount: number
          currency?: string
          status?: PayoutStatus
          transaction_id?: string | null
          notes?: string | null
        }
        Update: {
          amount?: number
          status?: PayoutStatus
          transaction_id?: string | null
          notes?: string | null
          processed_at?: string | null
        }
      }
      attendee_networks: {
        Row: {
          id: string
          event_id: string
          user_id: string
          share_linkedin: boolean
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          user_id: string
          share_linkedin?: boolean
        }
        Update: {
          share_linkedin?: boolean
        }
      }
      event_views: {
        Row: {
          id: string
          event_id: string
          user_id: string | null
          ip_address: string | null
          user_agent: string | null
          viewed_at: string
        }
        Insert: {
          id?: string
          event_id: string
          user_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
        }
        Update: never
      }
      ai_recommendations: {
        Row: {
          id: string
          user_id: string
          event_id: string
          score: number
          reason: string | null
          model_version: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          event_id: string
          score?: number
          reason?: string | null
          model_version?: string | null
        }
        Update: {
          score?: number
          reason?: string | null
        }
      }
      ai_generated_descriptions: {
        Row: {
          id: string
          event_id: string | null
          user_id: string
          prompt: string
          generated_text: string
          model_version: string | null
          is_accepted: boolean
          created_at: string
        }
        Insert: {
          id?: string
          event_id?: string | null
          user_id: string
          prompt: string
          generated_text: string
          model_version?: string | null
          is_accepted?: boolean
        }
        Update: {
          is_accepted?: boolean
        }
      }
    }
    Functions: {
      get_user_role: {
        Args: Record<string, never>
        Returns: UserRole
      }
      is_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
      is_organiser: {
        Args: Record<string, never>
        Returns: boolean
      }
      is_event_organiser: {
        Args: { p_event_id: string }
        Returns: boolean
      }
      get_event_stats: {
        Args: { p_event_id: string }
        Returns: Record<string, unknown>
      }
      get_organiser_stats: {
        Args: { p_organiser_id: string }
        Returns: Record<string, unknown>
      }
      get_admin_dashboard_stats: {
        Args: Record<string, never>
        Returns: Record<string, unknown>
      }
      validate_discount_code: {
        Args: { p_code: string; p_event_id: string }
        Returns: Record<string, unknown>
      }
      generate_event_slug: {
        Args: { p_title: string }
        Returns: string
      }
      increment_sold_count: {
        Args: { p_ticket_type_id: string; p_quantity: number }
        Returns: void
      }
      decrement_sold_count: {
        Args: { p_ticket_type_id: string; p_quantity: number }
        Returns: void
      }
      use_discount_code: {
        Args: { p_discount_id: string }
        Returns: void
      }
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
