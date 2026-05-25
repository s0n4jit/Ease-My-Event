import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase as supabaseClient } from '#/lib/supabase'
const supabase = supabaseClient as any

export function useWishlist(userId?: string) {
  return useQuery({
    queryKey: ['wishlists', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wishlists')
        .select(`
          *,
          event:events(
            *,
            category:categories(*),
            ticket_types(id, price)
          )
        `)
        .eq('user_id', userId!)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
    enabled: !!userId,
  })
}

export function useIsWishlisted(eventId: string, userId?: string) {
  return useQuery({
    queryKey: ['wishlists', 'check', eventId, userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wishlists')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', userId!)
        .maybeSingle()
      if (error) throw error
      return !!data
    },
    enabled: !!userId && !!eventId,
  })
}

export function useToggleWishlist() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ eventId, userId, isWishlisted }: { eventId: string; userId: string; isWishlisted: boolean }) => {
      if (isWishlisted) {
        const { error } = await supabase
          .from('wishlists')
          .delete()
          .eq('event_id', eventId)
          .eq('user_id', userId)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('wishlists')
          .insert({ event_id: eventId, user_id: userId })
        if (error) throw error
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['wishlists'] })
      queryClient.setQueryData(
        ['wishlists', 'check', variables.eventId, variables.userId],
        !variables.isWishlisted
      )
    },
  })
}
