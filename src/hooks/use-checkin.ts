import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase as supabaseClient } from '#/lib/supabase'
const supabase = supabaseClient as any

export function useCheckins(eventId: string) {
  return useQuery({
    queryKey: ['checkins', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('checkins')
        .select(`
          *,
          ticket:tickets(
            id, qr_code, attendee_name, attendee_email, status,
            ticket_type:ticket_types(name),
            registration:registrations(
              user:users!registrations_user_id_fkey(id, full_name, email)
            )
          )
        `)
        .eq('event_id', eventId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
    enabled: !!eventId,
  })
}

export function useCheckinStats(eventId: string) {
  return useQuery({
    queryKey: ['checkin-stats', eventId],
    queryFn: async () => {
      const { count: totalRegistered } = await supabase
        .from('registrations')
        .select('id', { count: 'exact', head: true })
        .eq('event_id', eventId)
        .eq('status', 'confirmed')

      const { count: totalCheckedIn } = await supabase
        .from('checkins')
        .select('id', { count: 'exact', head: true })
        .eq('event_id', eventId)

      return {
        totalRegistered: totalRegistered || 0,
        totalCheckedIn: totalCheckedIn || 0,
      }
    },
    enabled: !!eventId,
    refetchInterval: 5000,
  })
}

export function usePerformCheckin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ qrCode, eventId, checkedInBy }: { qrCode: string; eventId: string; checkedInBy: string }) => {
      const { data: ticket, error: ticketError } = await supabase
        .from('tickets')
        .select(`
          id, qr_code, status, registration_id,
          ticket_type:ticket_types(name),
          registration:registrations(
            event_id,
            user:users!registrations_user_id_fkey(id, full_name, email)
          )
        `)
        .eq('qr_code', qrCode)
        .single()

      if (ticketError || !ticket) {
        throw new Error('Ticket not found. Please check the QR code.')
      }

      if (ticket.status === 'used') {
        throw new Error('This ticket has already been checked in.')
      }

      if (ticket.status !== 'valid') {
        throw new Error(`This ticket is ${ticket.status} and cannot be used for check-in.`)
      }

      const registration = Array.isArray(ticket.registration) ? ticket.registration[0] : ticket.registration
      if (registration?.event_id !== eventId) {
        throw new Error('This ticket is not for this event.')
      }

      const { error: updateError } = await supabase
        .from('tickets')
        .update({ status: 'used', checked_in_at: new Date().toISOString() })
        .eq('id', ticket.id)
      if (updateError) throw updateError

      const { error: checkinError } = await supabase
        .from('checkins')
        .insert({
          ticket_id: ticket.id,
          event_id: eventId,
          checked_in_by: checkedInBy,
          method: 'manual',
        })
      if (checkinError) throw checkinError

      return ticket
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['checkins', variables.eventId] })
      queryClient.invalidateQueries({ queryKey: ['checkin-stats', variables.eventId] })
    },
  })
}
