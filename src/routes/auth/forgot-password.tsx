import {
  createFileRoute,
  Link,
  useNavigate,
} from '@tanstack/react-router'

import { motion } from 'framer-motion'

import {
  Mail,
  ArrowLeft,
  Loader2,
  Sparkles,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
} from 'lucide-react'

import { useState } from 'react'

import { toast } from 'sonner'

import { supabase } from '#/lib/supabase'

import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'

export const Route = createFileRoute(
  '/auth/forgot-password'
)({
  component: ForgotPasswordPage,
})

function ForgotPasswordPage() {
  const navigate = useNavigate()

  const [email, setEmail] =
    useState('')

  const [loading, setLoading] =
    useState(false)

  /* SEND RECOVERY OTP */
  const handleSendOtp = async (
    e: React.FormEvent
  ) => {
    e.preventDefault()

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailRegex.test(email)) {
      toast.error(
        'Enter a valid email address.'
      )

      return
    }

    setLoading(true)

    const { error } =
      await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/auth/verify-reset-otp?email=${encodeURIComponent(email)}`,
        }
      )

    setLoading(false)

    if (error) {
      toast.error(error.message)

      return
    }

    toast.success(
      'OTP sent successfully.'
    )

    /*
      REDIRECT TO VERIFY PAGE
    */
    navigate({
      to: '/auth/verify-reset-otp',

      search: {
        email,
      },
    })
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">

      {/* BACKGROUND */}
      <div className="absolute inset-0 overflow-hidden">

        <div className="absolute left-[-10%] top-[-10%] h-[350px] w-[350px] rounded-full bg-violet-700/30 blur-3xl" />

        <div className="absolute bottom-[-10%] right-[-10%] h-[350px] w-[350px] rounded-full bg-blue-700/30 blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8">

        <div className="grid w-full max-w-7xl gap-8 lg:grid-cols-2">

          {/* LEFT SIDE */}
          <div className="hidden lg:flex flex-col justify-center">

            <motion.div
              initial={{
                opacity: 0,
                y: 18,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.35,
              }}
              className="max-w-xl"
            >

              {/* LOGO */}
              <div className="mb-8 text-5xl font-black tracking-tight">
                Ease<span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">My</span>Event
              </div>

              {/* TITLE */}
              <h1 className="text-5xl xl:text-6xl font-black leading-[0.95] tracking-tight">
                Reset Your
                <br />

                <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
                  Password
                </span>
              </h1>

              {/* DESCRIPTION */}
              <p className="mt-5 max-w-lg text-lg leading-relaxed text-zinc-400">
                Enter your registered email address and we'll send a secure OTP verification code to reset your password safely.
              </p>

              {/* FEATURES */}
              <div className="mt-8 space-y-3">

                {/* CARD */}
                <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl">

                  <div className="rounded-xl bg-violet-500/15 p-3">
                    <ShieldCheck className="h-5 w-5 text-violet-300" />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold">
                      OTP Verification
                    </h3>

                    <p className="text-sm text-zinc-400">
                      Secure account recovery using one-time verification codes.
                    </p>
                  </div>
                </div>

                {/* CARD */}
                <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl">

                  <div className="rounded-xl bg-blue-500/15 p-3">
                    <KeyRound className="h-5 w-5 text-blue-300" />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold">
                      Account Protection
                    </h3>

                    <p className="text-sm text-zinc-400">
                      Your account stays protected with secure authentication.
                    </p>
                  </div>
                </div>

                {/* CARD */}
                <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl">

                  <div className="rounded-xl bg-pink-500/15 p-3">
                    <CheckCircle2 className="h-5 w-5 text-pink-300" />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold">
                      Quick Recovery
                    </h3>

                    <p className="text-sm text-zinc-400">
                      Reset your password quickly without complicated recovery links.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-center justify-center">

            <motion.div
              initial={{
                opacity: 0,
                y: 12,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.35,
              }}
              className="w-full max-w-md"
            >

              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl backdrop-blur-2xl md:p-6">

                {/* BACK */}
                <Link
                  to="/auth/login"
                  className="mb-5 inline-flex items-center gap-2 text-sm text-zinc-400 no-underline transition hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" />

                  Back to Login
                </Link>

                {/* HEADER */}
                <div className="mb-5">

                  <div className="mb-3 inline-flex rounded-2xl bg-violet-500/15 p-3">
                    <Sparkles className="h-5 w-5 text-violet-300" />
                  </div>

                  <h2 className="text-3xl font-black tracking-tight">
                    Forgot Password
                  </h2>

                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                    Enter your email address to receive a secure verification OTP.
                  </p>
                </div>

                {/* FORM */}
                <form
                  onSubmit={handleSendOtp}
                  className="space-y-4"
                >

                  {/* EMAIL */}
                  <div className="space-y-2">

                    <Label htmlFor="email">
                      Email Address
                    </Label>

                    <div className="relative">

                      <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

                      <Input
                        id="email"
                        type="email"
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(e) =>
                          setEmail(
                            e.target.value
                          )
                        }
                        placeholder="you@example.com"
                        className="h-11 rounded-xl border-white/10 bg-white/5 pl-11 text-white placeholder:text-zinc-500"
                      />
                    </div>
                  </div>

                  {/* BUTTON */}
                  <Button
                    type="submit"
                    disabled={
                      loading || !email
                    }
                    className="h-11 w-full rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 font-semibold"
                  >
                    {loading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}

                    Send OTP
                  </Button>
                </form>

                {/* FOOTER */}
                <p className="mt-5 text-center text-sm text-zinc-400">

                  Remember your password?{' '}

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