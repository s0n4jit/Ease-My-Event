import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase as supabaseClient } from '#/lib/supabase'
const supabase = supabaseClient as any

export function useMyTickets(userId?: string) {
  return useQuery({
    queryKey: ['tickets', 'mine', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('registrations')
        .select(`
          *,
          event:events(
            id, title, slug, start_date, end_date, venue_name, city, banner_url, status, event_type,
            organiser:users!events_organiser_id_fkey(id, full_name)
          ),
          tickets(
            id, qr_code, status, checked_in_at,
            ticket_type:ticket_types(id, name, price)
          ),
          payments(id, amount, status, razorpay_payment_id, created_at)
        `)
        .eq('user_id', userId!)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
    enabled: !!userId,
  })
}

export function useEventRegistrations(eventId: string) {
  return useQuery({
    queryKey: ['registrations', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('registrations')
        .select(`
          *,
          user:users!registrations_user_id_fkey(id, full_name, email, avatar_url, phone),
          tickets(
            id, qr_code, status, checked_in_at,
            ticket_type:ticket_types(id, name, price)
          ),
          payments(id, amount, status, created_at)
        `)
        .eq('event_id', eventId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
    enabled: !!eventId,
  })
}

export function useCreateRegistration() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: {
      event_id: string
      user_id: string
      total_amount: number
      discount_code_id?: string | null
      discount_amount?: number
      ticket_items: { ticket_type_id: string; quantity: number; attendee_name?: string; attendee_email?: string }[]
    }) => {
      const { data: registration, error: regError } = await supabase
        .from('registrations')
        .insert({
          event_id: params.event_id,
          user_id: params.user_id,
          total_amount: params.total_amount,
          discount_code_id: params.discount_code_id,
          discount_amount: params.discount_amount || 0,
        })
        .select()
        .single()
      if (regError) throw regError

      const tickets = params.ticket_items.flatMap(item =>
        Array.from({ length: item.quantity }, () => ({
          registration_id: registration.id,
          ticket_type_id: item.ticket_type_id,
          qr_code: `ES-${registration.id.slice(0, 8)}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`.toUpperCase(),
          attendee_name: item.attendee_name,
          attendee_email: item.attendee_email,
        }))
      )

      const { error: ticketError } = await supabase.from('tickets').insert(tickets)
      if (ticketError) throw ticketError

      for (const item of params.ticket_items) {
        await supabase.rpc('increment_sold_count', {
          p_ticket_type_id: item.ticket_type_id,
          p_quantity: item.quantity,
        })
      }

      if (params.discount_code_id) {
        await supabase.rpc('use_discount_code', { p_discount_id: params.discount_code_id })
      }

      return registration
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
      queryClient.invalidateQueries({ queryKey: ['registrations'] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

export function usePaymentHistory(userId?: string) {
  return useQuery({
    queryKey: ['payments', 'history', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          registration:registrations(
            id,
            event:events(id, title, slug)
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
