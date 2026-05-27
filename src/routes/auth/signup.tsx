import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

import {
  Mail,
  Lock,
  User,
  Loader2,
  Sparkles,
  ShieldCheck,
  CalendarDays,
  Rocket,
  Ticket,
} from 'lucide-react'

import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'

import { useSignUp, useAuth } from '#/hooks/use-auth'
import { signupSchema, type SignupFormData } from '#/schemas/auth.schema'

export const Route = createFileRoute('/auth/signup')({
  head: () => ({
    meta: [
      { title: 'Create Account | EaseMyEvent' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: SignupPage,
})

function SignupPage() {
  const navigate = useNavigate()
  const signUp = useSignUp()
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
    setValue,
    watch,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      role: 'attendee',
    },
  })

  const selectedRole = watch('role')

  const roleContent = {
    attendee: {
      title: (
        <>
          Discover Events
          <br />
          Like Never
          <br />
          Before.
        </>
      ),

      description:
        'Explore amazing events, connect with communities, and book tickets instantly from one modern platform.',

      features: [
        {
          icon: <Ticket className="h-5 w-5 text-violet-300" />,
          title: 'Easy Event Booking',
          desc: 'Find and join events in just a few clicks.',
          color: 'bg-violet-500/15',
        },
        {
          icon: <ShieldCheck className="h-5 w-5 text-blue-300" />,
          title: 'Secure Ticket Access',
          desc: 'Protected registration and seamless check-ins.',
          color: 'bg-blue-500/15',
        },
      ],
    },

    organiser: {
      title: (
        <>
          Manage Events
          <br />
          Like Never
          <br />
          Before.
        </>
      ),

      description:
        'Create, organise, and manage events with powerful tools designed for modern organisers.',

      features: [
        {
          icon: <CalendarDays className="h-5 w-5 text-violet-300" />,
          title: 'Smart Event Management',
          desc: 'Handle registrations and attendees effortlessly.',
          color: 'bg-violet-500/15',
        },
        {
          icon: <Rocket className="h-5 w-5 text-blue-300" />,
          title: 'Grow Your Audience',
          desc: 'Reach more people and manage events efficiently.',
          color: 'bg-blue-500/15',
        },
      ],
    },
  }

  const currentContent = roleContent[selectedRole]

  const onSubmit = (data: SignupFormData) => {
    signUp.mutate(
      {
        email: data.email,
        password: data.password,
        full_name: data.full_name,
        role: data.role,
      },
      {
        onSuccess: () => {
          toast.success('Account created successfully!')

          const target =
            data.role === 'organiser'
              ? '/organiser'
              : '/dashboard'

          navigate({ to: target })
        },

        onError: (error) => {
          toast.error(error.message || 'Failed to create account')
        },
      }
    )
  }

  return (
    <div className="relative h-screen overflow-hidden bg-black text-white">
      {/* Background */}
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

            <AnimatePresence mode="wait">
              <motion.div
                key={selectedRole}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                transition={{ duration: 0.35 }}
                className="max-w-xl"
              >
                <h1 className="text-5xl xl:text-6xl font-black leading-[0.95] tracking-tight">
                  {currentContent.title}
                </h1>

                <p className="mt-5 max-w-lg text-lg leading-relaxed text-zinc-400">
                  {currentContent.description}
                </p>

                <div className="mt-7 space-y-3">
                  {currentContent.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl"
                    >
                      <div className={`rounded-xl p-3 ${feature.color}`}>
                        {feature.icon}
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold">
                          {feature.title}
                        </h3>

                        <p className="text-sm text-zinc-400">
                          {feature.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
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

                {/* Header */}
                <div className="mb-5">
                  <div className="mb-3 inline-flex rounded-2xl bg-violet-500/15 p-3">
                    <Sparkles className="h-5 w-5 text-violet-300" />
                  </div>

                  <h2 className="text-3xl font-black tracking-tight">
                    Create Account
                  </h2>

                  <p className="mt-1 text-sm text-zinc-400">
                    Join the next generation event platform.
                  </p>
                </div>

                {/* FORM */}
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-3"
                >
                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label htmlFor="full_name">
                      Full Name
                    </Label>

                    <div className="relative">
                      <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

                      <Input
                        id="full_name"
                        placeholder="John Doe"
                        className="h-11 rounded-xl border-white/10 bg-white/5 pl-11 text-white placeholder:text-zinc-500"
                        {...register('full_name')}
                      />
                    </div>
                  </div>

                  {/* Email */}
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
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password">
                      Password
                    </Label>

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
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label htmlFor="confirm_password">
                      Confirm Password
                    </Label>

                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

                      <Input
                        id="confirm_password"
                        type="password"
                        placeholder="••••••••"
                        className="h-11 rounded-xl border-white/10 bg-white/5 pl-11 text-white placeholder:text-zinc-500"
                        {...register('confirm_password')}
                      />
                    </div>
                  </div>

                  {/* ROLE */}
                  <div className="space-y-2">
                    <Label>
                      Select Role
                    </Label>

                    <div className="grid grid-cols-2 gap-3">
                      {[
                        {
                          value: 'attendee' as const,
                          label: 'Attendee',
                          desc: 'Join events',
                          icon: '🎟️',
                        },
                        {
                          value: 'organiser' as const,
                          label: 'Organiser',
                          desc: 'Create events',
                          icon: '🚀',
                        },
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setValue('role', option.value)}
                          className={`rounded-2xl border p-4 text-left transition-all duration-300 ${
                            selectedRole === option.value
                              ? 'border-violet-500 bg-violet-500/20'
                              : 'border-white/10 bg-white/[0.03]'
                          }`}
                        >
                          <div className="text-xl">
                            {option.icon}
                          </div>

                          <p className="mt-2 text-sm font-semibold">
                            {option.label}
                          </p>

                          <p className="text-[11px] text-zinc-400">
                            {option.desc}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* BUTTON */}
                  <Button
                    type="submit"
                    disabled={signUp.isPending}
                    className="h-11 w-full rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 font-semibold"
                  >
                    {signUp.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}

                    Create Account
                  </Button>
                </form>

                {/* FOOTER */}
                <p className="mt-4 text-center text-sm text-zinc-400">
                  Already have an account?{' '}
                  <Link
                    to="/auth/login"
                    className="font-semibold text-violet-400 no-underline"
                  >
                    Sign In
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