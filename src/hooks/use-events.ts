import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase as supabaseClient } from '#/lib/supabase'
const supabase = supabaseClient as any
import type { Tables, InsertTables, UpdateTables } from '#/types/database'
import { ITEMS_PER_PAGE } from '#/lib/constants'

interface EventFilters {
  search?: string
  category?: string
  city?: string
  event_type?: string
  is_free?: boolean
  status?: string
  start_date?: string
  end_date?: string
  sort_by?: 'start_date' | 'created_at' | 'title'
  sort_order?: 'asc' | 'desc'
  page?: number
  limit?: number
  organiser_id?: string
  is_featured?: boolean
}

export function useEvents(filters: EventFilters = {}) {
  const {
    search, category, city, event_type, is_free,
    status = 'published', sort_by = 'start_date', sort_order = 'asc',
    page = 1, limit = ITEMS_PER_PAGE, organiser_id, is_featured,
  } = filters

  return useQuery({
    queryKey: ['events', filters],
    queryFn: async () => {
      let query = supabase
        .from('events')
        .select(`
          *,
          category:categories(*),
          organiser:users!events_organiser_id_fkey(id, full_name, avatar_url),
          ticket_types(id, name, price, quantity, sold_count, is_active)
        `, { count: 'exact' })

      if (status) query = query.eq('status', status)
      if (organiser_id) query = query.eq('organiser_id', organiser_id)
      if (category) query = query.eq('category_id', category)
      if (city) query = query.ilike('city', `%${city}%`)
      if (event_type) query = query.eq('event_type', event_type)
      if (is_featured) query = query.eq('is_featured', true)
      if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
      if (is_free !== undefined) {
        if (is_free) {
          query = query.contains('tags', ['free'])
        }
      }

      const from = (page - 1) * limit
      const to = from + limit - 1

      query = query
        .order(sort_by, { ascending: sort_order === 'asc' })
        .range(from, to)

      const { data, error, count } = await query
      if (error) throw error

      return {
        events: data as (Tables<'events'> & {
          category: Tables<'categories'> | null
          organiser: Pick<Tables<'users'>, 'id' | 'full_name' | 'avatar_url'>
          ticket_types: Tables<'ticket_types'>[]
        })[],
        total: count || 0,
        page,
        totalPages: Math.ceil((count || 0) / limit),
      }
    },
  })
}

export function useEvent(slug: string) {
  return useQuery({
    queryKey: ['events', 'detail', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          category:categories(*),
          organiser:users!events_organiser_id_fkey(id, full_name, avatar_url, bio, linkedin_url),
          event_images(*),
          speakers(*),
          ticket_types(*),
          reviews(*, user:users!reviews_user_id_fkey(id, full_name, avatar_url))
        `)
        .eq('slug', slug)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!slug,
  })
}

export function useEventById(id: string) {
  return useQuery({
    queryKey: ['events', 'by-id', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          category:categories(*),
          event_images(*),
          speakers(*),
          ticket_types(*),
          discount_codes(*)
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!id,
  })
}

export function useCreateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (event: InsertTables<'events'>) => {
      const { data, error } = await supabase
        .from('events')
        .insert(event)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

export function useUpdateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateTables<'events'> }) => {
      const { data, error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['events', 'by-id', data.id] })
    },
  })
}

export function useDeleteEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

export function useSpeakers(eventId: string) {
  return useQuery({
    queryKey: ['speakers', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('speakers')
        .select('*')
        .eq('event_id', eventId)
        .order('sort_order')
      if (error) throw error
      return data
    },
    enabled: !!eventId,
  })
}

export function useManageSpeakers() {
  const queryClient = useQueryClient()

  const create = useMutation({
    mutationFn: async (speaker: InsertTables<'speakers'>) => {
      const { data, error } = await supabase
        .from('speakers')
        .insert(speaker)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['speakers', data.event_id] })
    },
  })

  const remove = useMutation({
    mutationFn: async ({ id, eventId }: { id: string; eventId: string }) => {
      const { error } = await supabase.from('speakers').delete().eq('id', id)
      if (error) throw error
      return eventId
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['speakers', variables.eventId] })
    },
  })

  return { createSpeaker: create, removeSpeaker: remove }
}

export function useManageTicketTypes() {
  const queryClient = useQueryClient()

  const create = useMutation({
    mutationFn: async (ticketType: InsertTables<'ticket_types'>) => {
      const { data, error } = await supabase
        .from('ticket_types')
        .insert(ticketType)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })

  const update = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateTables<'ticket_types'> }) => {
      const { data, error } = await supabase
        .from('ticket_types')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('ticket_types').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })

  return { createTicketType: create, updateTicketType: update, removeTicketType: remove }
}

export function useManageDiscountCodes() {
  const queryClient = useQueryClient()

  const create = useMutation({
    mutationFn: async (code: InsertTables<'discount_codes'>) => {
      const { data, error } = await supabase
        .from('discount_codes')
        .insert(code)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })

  return { createDiscountCode: create }
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')
      if (error) throw error
      return data as Tables<'categories'>[]
    },
    staleTime: 1000 * 60 * 30,
  })
}

export function useEventStats(eventId: string) {
  return useQuery({
    queryKey: ['event-stats', eventId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_event_stats', { p_event_id: eventId })
      if (error) throw error
      return data as {
        total_registrations: number
        total_revenue: number
        total_checkins: number
        total_tickets_sold: number
        total_capacity: number
        avg_rating: number
        total_reviews: number
        total_views: number
        wishlist_count: number
      }
    },
    enabled: !!eventId,
  })
}

export function useFeaturedEvents() {
  return useEvents({ is_featured: true, limit: 6 })
}

export function useSimilarEvents(eventId: string, categoryId: string | null) {
  return useQuery({
    queryKey: ['events', 'similar', eventId],
    queryFn: async () => {
      let query = supabase
        .from('events')
        .select(`
          *,
          category:categories(*),
          ticket_types(id, price)
        `)
        .eq('status', 'published')
        .neq('id', eventId)
        .limit(4)

      if (categoryId) {
        query = query.eq('category_id', categoryId)
      }

      const { data, error } = await query
      if (error) throw error
      return data
    },
    enabled: !!eventId,
  })
}

export function useRecordView(eventId: string, userId?: string) {
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('event_views')
        .insert({ event_id: eventId, user_id: userId || null })
      if (error) throw error
    },
  })
}
