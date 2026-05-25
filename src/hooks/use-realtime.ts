import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '#/lib/supabase'

export function useRealtimeRegistrations(eventId: string) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!eventId) return

    const channel = supabase
      .channel(`registrations:${eventId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'registrations',
          filter: `event_id=eq.${eventId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['registrations', eventId] })
          queryClient.invalidateQueries({ queryKey: ['event-stats', eventId] })
          queryClient.invalidateQueries({ queryKey: ['checkin-stats', eventId] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [eventId, queryClient])
}

export function useRealtimeNotifications(userId?: string) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['notifications', userId] })
          queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count', userId] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, queryClient])
}

export function useRealtimeCheckins(eventId: string) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!eventId) return

    const channel = supabase
      .channel(`checkins:${eventId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'checkins',
          filter: `event_id=eq.${eventId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['checkins', eventId] })
          queryClient.invalidateQueries({ queryKey: ['checkin-stats', eventId] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [eventId, queryClient])
}

export function useRealtimePayments(userId?: string) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel(`payments:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['payments'] })
          queryClient.invalidateQueries({ queryKey: ['tickets', 'mine', userId] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, queryClient])
}
