import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

import {
  Mail,
  Lock,
  Loader2,
  Sparkles,
  ShieldCheck,
  CalendarDays,
  Rocket,
} from 'lucide-react'

import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'

import { useSignIn, useAuth } from '#/hooks/use-auth'
import { loginSchema, type LoginFormData } from '#/schemas/auth.schema'

import { supabase as supabaseClient } from '#/lib/supabase'

const supabase = supabaseClient as any

export const Route = createFileRoute('/auth/login')({
  head: () => ({
    meta: [
      { title: 'Sign In | EaseMyEvent' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const signIn = useSignIn()
  const { isAuthenticated, role } = useAuth()

  if (isAuthenticated && role) {
    const target =
      role === 'admin'
        ? '/admin'
        : role === 'organiser'
          ? '/organiser'
          : '/dashboard'

    navigate({ to: target })
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = (data: LoginFormData) => {
    signIn.mutate(data, {
      onSuccess: async (loginData) => {
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
          toast.error('Your account has been suspended.')
          await supabase.auth.signOut()
          return
        }

        toast.success('Welcome back!')

        const target =
          profile.role === 'admin'
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
    <div className="relative h-screen overflow-hidden bg-black text-white">
      {/* BACKGROUND */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] h-[350px] w-[350px] rounded-full bg-violet-700/30 blur-3xl" />

        <div className="absolute bottom-[-10%] right-[-10%] h-[350px] w-[350px] rounded-full bg-blue-700/30 blur-3xl" />
      </div>

      <div className="relative z-10 flex h-screen items-center justify-center overflow-hidden px-4 py-2 lg:px-8">
        <div className="grid w-full max-w-7xl items-center gap-8 lg:grid-cols-2">

          {/* LEFT SIDE */}
          <div className="hidden lg:flex flex-col justify-center">
            <Link
              to="/"
              className="mb-8 inline-flex items-center gap-3 no-underline"
            >
              <img
                src="/assets/EaseMyEvent_E_logo.png"
                alt="Logo"
                className="h-11 w-11 object-contain"
              />

              <span className="text-4xl font-black tracking-tight">
                Ease
                <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
                  My
                </span>
                Event
              </span>
            </Link>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="max-w-xl"
            >
              <h1 className="text-5xl xl:text-6xl font-black leading-[0.95] tracking-tight">
                Welcome Back
                <br />

                <span className="ml-35">
                  To
                </span>

                <br />

                <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
                  EaseMyEvent
                </span>
              </h1>
              <p className="mt-5 max-w-lg text-lg leading-relaxed text-zinc-400">
                Sign in to continue managing events, accessing registrations,
                booking tickets, and exploring communities seamlessly.
              </p>

              <div className="mt-7 space-y-3">
                <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl">
                  <div className="rounded-xl bg-violet-500/15 p-3">
                    <CalendarDays className="h-5 w-5 text-violet-300" />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold">
                      Manage Your Events
                    </h3>

                    <p className="text-sm text-zinc-400">
                      Access registrations, tickets, and dashboards instantly.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl">
                  <div className="rounded-xl bg-blue-500/15 p-3">
                    <ShieldCheck className="h-5 w-5 text-blue-300" />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold">
                      Secure Authentication
                    </h3>

                    <p className="text-sm text-zinc-400">
                      Protected login with secure account verification.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl">
                  <div className="rounded-xl bg-pink-500/15 p-3">
                    <Rocket className="h-5 w-5 text-pink-300" />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold">
                      Faster Experience
                    </h3>

                    <p className="text-sm text-zinc-400">
                      Continue where you left off with seamless access.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex justify-center lg:justify-end">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="w-full max-w-md"
            >
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 md:p-6 shadow-2xl backdrop-blur-2xl">

                {/* HEADER */}
                <div className="mb-5">
                  <div className="mb-3 inline-flex rounded-2xl bg-violet-500/15 p-3">
                    <Sparkles className="h-5 w-5 text-violet-300" />
                  </div>

                  <h2 className="text-3xl font-black tracking-tight">
                    Sign In
                  </h2>

                  <p className="mt-1 text-sm text-zinc-400">
                    Access your EaseMyEvent account.
                  </p>
                </div>

                {/* FORM */}
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  {/* EMAIL */}
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email
                    </Label>

                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        className="h-11 rounded-xl border-white/10 bg-white/5 pl-11 text-white placeholder:text-zinc-500"
                        {...register('email')}
                      />
                    </div>

                    {errors.email && (
                      <p className="text-xs text-red-400">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* PASSWORD */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">
                        Password
                      </Label>

                      <button
                        type="button"
                        className="text-xs text-violet-400 transition hover:text-violet-300"
                      >
                        Forgot Password?
                      </button>
                    </div>

                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        className="h-11 rounded-xl border-white/10 bg-white/5 pl-11 text-white placeholder:text-zinc-500"
                        {...register('password')}
                      />
                    </div>

                    {errors.password && (
                      <p className="text-xs text-red-400">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  {/* BUTTON */}
                  <Button
                    type="submit"
                    disabled={signIn.isPending}
                    className="h-11 w-full rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 font-semibold"
                  >
                    {signIn.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}

                    Sign In
                  </Button>
                </form>

                {/* FOOTER */}
                <p className="mt-5 text-center text-sm text-zinc-400">
                  Don&apos;t have an account?{' '}
                  <Link
                    to="/auth/signup"
                    className="font-semibold text-violet-400 no-underline"
                  >
                    Sign Up
                  </Link>
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}