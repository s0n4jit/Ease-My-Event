import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase as supabaseClient } from '#/lib/supabase'
const supabase = supabaseClient as any

export function useNotifications(userId?: string) {
  return useQuery({
    queryKey: ['notifications', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId!)
        .order('created_at', { ascending: false })
        .limit(50)
      if (error) throw error
      return data
    },
    enabled: !!userId,
  })
}

export function useUnreadCount(userId?: string) {
  return useQuery({
    queryKey: ['notifications', 'unread-count', userId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId!)
        .eq('is_read', false)
      if (error) throw error
      return count || 0
    },
    enabled: !!userId,
    refetchInterval: 30000,
  })
}

export function useMarkAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

export function useCreateNotification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: {
      user_id: string
      title: string
      message: string
      type?: string
      event_id?: string
      link?: string
    }) => {
      const { error } = await supabase.from('notifications').insert({
        user_id: params.user_id,
        title: params.title,
        message: params.message,
        type: (params.type as 'registration' | 'reminder' | 'cancellation' | 'refund' | 'review' | 'system' | 'checkin' | 'payout') || 'system',
        event_id: params.event_id,
        link: params.link,
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}
