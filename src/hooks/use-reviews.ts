import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase as supabaseClient } from '#/lib/supabase'
const supabase = supabaseClient as any
import type { InsertTables } from '#/types/database'

export function useEventReviews(eventId: string) {
  return useQuery({
    queryKey: ['reviews', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          user:users!reviews_user_id_fkey(id, full_name, avatar_url)
        `)
        .eq('event_id', eventId)
        .eq('is_visible', true)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
    enabled: !!eventId,
  })
}

export function useMyReviews(userId?: string) {
  return useQuery({
    queryKey: ['reviews', 'mine', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          event:events(id, title, slug, banner_url)
        `)
        .eq('user_id', userId!)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
    enabled: !!userId,
  })
}

export function useCreateReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (review: InsertTables<'reviews'>) => {
      const { data, error } = await supabase
        .from('reviews')
        .insert(review)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', data.event_id] })
      queryClient.invalidateQueries({ queryKey: ['reviews', 'mine'] })
    },
  })
}

export function useUpdateReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: { rating?: number; comment?: string } }) => {
      const { data, error } = await supabase
        .from('reviews')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', data.event_id] })
      queryClient.invalidateQueries({ queryKey: ['reviews', 'mine'] })
    },
  })
}

export function useDeleteReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('reviews').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
    },
  })
}
