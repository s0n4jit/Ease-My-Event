import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase as supabaseClient } from '#/lib/supabase'
const supabase = supabaseClient as any
import type { Tables, UpdateTables } from '#/types/database'

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_admin_dashboard_stats')
      if (error) throw error
      return data as {
        total_users: number
        total_organisers: number
        total_admins: number
        total_events: number
        published_events: number
        total_registrations: number
        total_revenue: number
        pending_refunds: number
        total_categories: number
        events_this_month: number
        registrations_this_month: number
        revenue_this_month: number
      }
    },
  })
}

export function useAllUsers(search?: string) {
  return useQuery({
    queryKey: ['admin', 'users', search],
    queryFn: async () => {
      let query = supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (search) {
        query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
      }

      const { data, error } = await query
      if (error) throw error
      return data as Tables<'users'>[]
    },
  })
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      const { error } = await supabase
        .from('users')
        .update({ role: role as 'attendee' | 'organiser' | 'admin' })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })
}

export function useToggleUserActive() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('users')
        .update({ is_active })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })
}

export function useAllEvents(search?: string) {
  return useQuery({
    queryKey: ['admin', 'events', search],
    queryFn: async () => {
      let query = supabase
        .from('events')
        .select(`
          *,
          category:categories(name),
          organiser:users!events_organiser_id_fkey(id, full_name, email)
        `)
        .order('created_at', { ascending: false })

      if (search) {
        query = query.ilike('title', `%${search}%`)
      }

      const { data, error } = await query
      if (error) throw error
      return data
    },
  })
}

export function useToggleEventFeatured() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, is_featured }: { id: string; is_featured: boolean }) => {
      const { error } = await supabase
        .from('events')
        .update({ is_featured })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'events'] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

export function useManageCategories() {
  const queryClient = useQueryClient()

  const create = useMutation({
    mutationFn: async (category: { name: string; slug: string; description?: string; icon?: string }) => {
      const { data, error } = await supabase
        .from('categories')
        .insert(category)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })

  const update = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateTables<'categories'> }) => {
      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('categories').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })

  return { createCategory: create, updateCategory: update, removeCategory: remove }
}
