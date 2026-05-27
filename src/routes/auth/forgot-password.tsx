import { createFileRoute, Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { useState } from 'react'

import {
  Mail,
  ArrowLeft,
  Loader2,
  Sparkles,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
} from 'lucide-react'

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
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleReset = async (
    e: React.FormEvent
  ) => {
    e.preventDefault()

    setLoading(true)

    const { error } =
      await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo:
            'http://localhost:3000/auth/reset-password',
        }
      )

    setLoading(false)

    if (error) {
      toast.error(error.message)
      return
    }

    setSent(true)

    toast.success(
      'Password reset link sent successfully.'
    )
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
                Reset Your
                <br />

                <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
                  Password
                </span>
              </h1>

              <p className="mt-5 max-w-lg text-lg leading-relaxed text-zinc-400">
                Don&apos;t worry. Enter your email address and
                we&apos;ll send you a secure password reset link.
              </p>

              <div className="mt-7 space-y-3">
                <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl">
                  <div className="rounded-xl bg-violet-500/15 p-3">
                    <KeyRound className="h-5 w-5 text-violet-300" />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold">
                      Secure Reset Flow
                    </h3>

                    <p className="text-sm text-zinc-400">
                      Reset your password securely using email verification.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl">
                  <div className="rounded-xl bg-blue-500/15 p-3">
                    <ShieldCheck className="h-5 w-5 text-blue-300" />
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

                <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl">
                  <div className="rounded-xl bg-pink-500/15 p-3">
                    <CheckCircle2 className="h-5 w-5 text-pink-300" />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold">
                      Quick Recovery
                    </h3>

                    <p className="text-sm text-zinc-400">
                      Get back into your account in just a few minutes.
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
                    Forgot Password
                  </h2>

                  <p className="mt-1 text-sm text-zinc-400">
                    Enter your email to receive a reset link.
                  </p>
                </div>

                {!sent ? (
                  <form
                    onSubmit={handleReset}
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
                          required
                          value={email}
                          onChange={(e) =>
                            setEmail(e.target.value)
                          }
                          placeholder="you@example.com"
                          className="h-11 rounded-xl border-white/10 bg-white/5 pl-11 text-white placeholder:text-zinc-500"
                        />
                      </div>
                    </div>

                    {/* BUTTON */}
                    <Button
                      type="submit"
                      disabled={loading}
                      className="h-11 w-full rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 font-semibold"
                    >
                      {loading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}

                      Send Reset Link
                    </Button>
                  </form>
                ) : (
                  <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-5 text-center">
                    <CheckCircle2 className="mx-auto h-10 w-10 text-green-400" />

                    <h3 className="mt-3 text-lg font-semibold">
                      Reset Link Sent
                    </h3>

                    <p className="mt-2 text-sm text-zinc-300">
                      Check your email inbox and follow the password reset instructions.
                    </p>
                  </div>
                )}

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

                <Link
                  to="/auth/login"
                  className="mt-4 inline-flex items-center gap-2 text-sm text-zinc-500 no-underline transition hover:text-zinc-300"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Login
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}