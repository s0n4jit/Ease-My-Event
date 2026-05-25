import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Mail, Lock, ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '#/components/ui/card'
import { useSignIn, useAuth } from '#/hooks/use-auth'
import { loginSchema, type LoginFormData } from '#/schemas/auth.schema'
import { APP_NAME } from '#/lib/constants'

import { supabase as supabaseClient } from '#/lib/supabase'
const supabase = supabaseClient as any

export const Route = createFileRoute('/auth/login')({
  head: () => ({
    meta: [
      { title: 'Sign In | EventSphere' },
      { name: 'robots', content: 'noindex, nofollow' }
    ]
  }),
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const signIn = useSignIn()
  const { isAuthenticated, role } = useAuth()

  if (isAuthenticated && role) {
    const target = role === 'admin'
      ? '/admin'
      : role === 'organiser'
        ? '/organiser'
        : '/dashboard'
    navigate({ to: target })
  }

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = (data: LoginFormData) => {
    signIn.mutate(data, {
      onSuccess: async (loginData) => {
        // Fetch user profile immediately to check suspension status
        const { data: profile, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', loginData.session.user.id)
          .single()

        if (error || !profile) {
          toast.error('Failed to retrieve user profile.')
          await supabase.auth.signOut()
          return
        }

        if (profile.is_active === false) {
          toast.error('Your account has been suspended. Contact support.')
          await supabase.auth.signOut()
          return
        }

        toast.success('Welcome back!')
        const target = profile.role === 'admin'
          ? '/admin'
          : profile.role === 'organiser'
            ? '/organiser'
            : '/dashboard'
        navigate({ to: target })
      },
      onError: (error) => {
        toast.error(error.message || 'Invalid credentials')
      },
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 via-transparent to-indigo-600/5" />
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-violet-400/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-indigo-400/10 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Link to="/" className="mb-8 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground no-underline transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to {APP_NAME}
        </Link>

        <Card className="border-border/50 shadow-xl shadow-violet-500/5">
          <CardHeader className="text-center pb-4">
            <img src="/assets/Event_Sphere_logo.png" alt="EventSphere Logo" className="mx-auto mb-3 h-12 w-auto object-contain" />
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>Sign in to your EventSphere account</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10"
                    {...register('email')}
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    {...register('password')}
                  />
                </div>
                {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
              </div>

              <Button
                type="submit"
                disabled={signIn.isPending}
                className="w-full h-11 bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25"
              >
                {signIn.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Sign In
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/auth/signup" className="font-semibold text-violet-600 hover:text-violet-700 no-underline">
                Sign Up
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
