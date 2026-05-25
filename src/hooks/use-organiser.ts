import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase as supabaseClient } from '#/lib/supabase'
const supabase = supabaseClient as any

export function useOrganiserStats(organiserId?: string) {
  return useQuery({
    queryKey: ['organiser-stats', organiserId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_organiser_stats', { p_organiser_id: organiserId! })
      if (error) throw error
      return data as {
        total_events: number
        published_events: number
        total_registrations: number
        total_revenue: number
        total_checkins: number
        total_views: number
        pending_refunds: number
      }
    },
    enabled: !!organiserId,
  })
}

export function useOrganiserEvents(organiserId?: string) {
  return useQuery({
    queryKey: ['organiser-events', organiserId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          category:categories(*),
          ticket_types(id, price, quantity, sold_count)
        `)
        .eq('organiser_id', organiserId!)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
    enabled: !!organiserId,
  })
}

export function useOrganiserPayouts(organiserId?: string) {
  return useQuery({
    queryKey: ['organiser-payouts', organiserId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organiser_payouts')
        .select(`
          *,
          event:events(id, title)
        `)
        .eq('organiser_id', organiserId!)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
    enabled: !!organiserId,
  })
}

export function useRevenueByMonth(organiserId?: string) {
  return useQuery({
    queryKey: ['revenue-by-month', organiserId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('amount, created_at, registration:registrations(event:events(organiser_id))')
        .eq('status', 'completed')
        .order('created_at', { ascending: true })
      if (error) throw error

      const filtered = data.filter((p: Record<string, unknown>) => {
        const reg = p.registration as { event: { organiser_id: string } } | null
        return reg?.event?.organiser_id === organiserId
      })

      const monthly: Record<string, number> = {}
      for (const payment of filtered) {
        const month = new Date(payment.created_at).toISOString().slice(0, 7)
        monthly[month] = (monthly[month] || 0) + Number(payment.amount)
      }

      return Object.entries(monthly).map(([month, revenue]) => ({ month, revenue }))
    },
    enabled: !!organiserId,
  })
}

export function useRefundRequests(filters?: { status?: string; eventId?: string }) {
  return useQuery({
    queryKey: ['refund-requests', filters],
    queryFn: async () => {
      let query = supabase
        .from('refund_requests')
        .select(`
          *,
          user:users!refund_requests_user_id_fkey(id, full_name, email),
          registration:registrations(
            id, total_amount,
            event:events(id, title, slug)
          )
        `)
        .order('created_at', { ascending: false })

      if (filters?.status) query = query.eq('status', filters.status)

      const { data, error } = await query
      if (error) throw error
      return data
    },
  })
}

export function useProcessRefund() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status, admin_notes, refund_amount, processed_by }: {
      id: string
      status: 'approved' | 'rejected'
      admin_notes?: string
      refund_amount?: number
      processed_by: string
    }) => {
      const { error } = await supabase
        .from('refund_requests')
        .update({
          status,
          admin_notes,
          refund_amount,
          processed_by,
          processed_at: new Date().toISOString(),
        })
        .eq('id', id)
      if (error) throw error

      if (status === 'approved') {
        const { data: refundReq } = await supabase
          .from('refund_requests')
          .select('registration_id')
          .eq('id', id)
          .single()

        if (refundReq) {
          await supabase
            .from('registrations')
            .update({ status: 'refunded' })
            .eq('id', refundReq.registration_id)

          await supabase
            .from('tickets')
            .update({ status: 'refunded' })
            .eq('registration_id', refundReq.registration_id)

          await supabase
            .from('payments')
            .update({ status: 'refunded' })
            .eq('registration_id', refundReq.registration_id)
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['refund-requests'] })
      queryClient.invalidateQueries({ queryKey: ['registrations'] })
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
    },
  })
}

export function useCreateRefundRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ registration_id, user_id, reason }: { registration_id: string; user_id: string; reason: string }) => {
      const { data, error } = await supabase
        .from('refund_requests')
        .insert({ registration_id, user_id, reason })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['refund-requests'] })
    },
  })
}
