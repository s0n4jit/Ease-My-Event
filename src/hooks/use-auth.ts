import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { supabase as supabaseClient } from '#/lib/supabase'
const supabase = supabaseClient as any
import type { Tables } from '#/types/database'
import type { UserRole } from '#/types/database'
import { useEffect } from 'react'
import { toast } from 'sonner'

export function useAuth() {
  const queryClient = useQueryClient()

  const { data: session, isLoading: sessionLoading } = useQuery({
    queryKey: ['auth', 'session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession()
      return session
    },
    staleTime: 1000 * 60 * 5,
  })

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['auth', 'user', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()
      if (error) throw error
      return data as Tables<'users'>
    },
    enabled: !!session?.user?.id,
    staleTime: 1000 * 60 * 5,
  })

  // Watch suspension status dynamically in real-time
  const isSuspended = user && user.is_active === false

  useEffect(() => {
    if (isSuspended) {
      supabase.auth.signOut().then(() => {
        queryClient.clear()
        toast.error('Your account has been suspended. Contact support.')
        window.location.href = '/auth/login'
      })
    }
  }, [isSuspended, queryClient])

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: any, session: any) => {
        queryClient.setQueryData(['auth', 'session'], session)
        if (!session) {
          queryClient.setQueryData(['auth', 'user', undefined], null)
          queryClient.removeQueries({ queryKey: ['auth', 'user'] })
        }
      }
    )
    return () => subscription.unsubscribe()
  }, [queryClient])

  return {
    session,
    user,
    isLoading: sessionLoading || userLoading,
    isAuthenticated: !!session?.user && user?.is_active !== false,
    isAdmin: user?.role === 'admin' && user?.is_active !== false,
    isOrganiser: (user?.role === 'organiser' || user?.role === 'admin') && user?.is_active !== false,
    isAttendee: user?.role === 'attendee' && user?.is_active !== false,
    role: user?.is_active !== false ? (user?.role as UserRole | undefined) : undefined,
  }
}

export function useSignUp() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: { email: string; password: string; full_name: string; role: 'attendee' | 'organiser' }) => {
      const { data, error } = await supabase.auth.signUp({
        email: params.email,
        password: params.password,
        options: {
          data: {
            full_name: params.full_name,
            role: params.role,
          },
        },
      })
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] })
    },
  })
}

export function useSignIn() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: { email: string; password: string }) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: params.email,
        password: params.password,
      })
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] })
    },
  })
}

export function useSignOut() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.clear()
      navigate({ to: '/' })
    },
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: { id: string; updates: Partial<Tables<'users'>> }) => {
      const { data, error } = await supabase
        .from('users')
        .update(params.updates)
        .eq('id', params.id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['auth', 'user', data.id], data)
      queryClient.invalidateQueries({ queryKey: ['auth'] })
    },
  })
}
