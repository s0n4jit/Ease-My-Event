import {
  createFileRoute,
  Link,
  useNavigate,
} from '@tanstack/react-router'

import { motion } from 'framer-motion'

import {
  ArrowLeft,
  Loader2,
  ShieldCheck,
  Info,
} from 'lucide-react'

import { useState, useEffect } from 'react'

import { toast } from 'sonner'

import { supabase } from '#/lib/supabase'

import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'

export const Route = createFileRoute(
  '/auth/verify-reset-otp'
)({
  validateSearch: (search) => ({
    email:
      typeof search.email === 'string'
        ? search.email
        : '',
  }),

  component: VerifyResetOtpPage,
})

function VerifyResetOtpPage() {
  const navigate = useNavigate()

  const { email } = Route.useSearch()

  const [otp, setOtp] = useState('')

  const [loading, setLoading] =
    useState(false)

  const [resendLoading, setResendLoading] =
    useState(false)

  const [countdown, setCountdown] =
    useState(60)

  /* BLOCK DIRECT ACCESS */
  useEffect(() => {
    if (!email) {
      toast.error('Unauthorized access.')

      navigate({
        to: '/auth/forgot-password',
      })

      return
    }
  }, [email, navigate])

  /* RESEND TIMER */
  useEffect(() => {
    if (countdown <= 0) return

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [countdown])

  /* VERIFY OTP */
  const handleVerify = async (
    e: React.FormEvent
  ) => {
    e.preventDefault()

    if (otp.length !== 6) {
      toast.error('OTP must be 6 digits.')
      return
    }

    setLoading(true)

    const { error } =
      await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'recovery',
      })

    setLoading(false)

    if (error) {
      toast.error(
        'Invalid or expired OTP. Please request a new one.'
      )
      return
    }

    toast.success('OTP verified successfully.')

    navigate({
      to: '/auth/reset-password',
    })
  }

  /* RESEND OTP */
  const handleResendOtp = async () => {
    setResendLoading(true)

    const { error } =
      await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/auth/verify-reset-otp?email=${encodeURIComponent(email)}`,
        }
      )

    setResendLoading(false)

    if (error) {
      toast.error(error.message)
      return
    }

    toast.success('OTP resent successfully.')

    setCountdown(60)
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4 text-white">

      {/* BACKGROUND */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-10%] h-[350px] w-[350px] rounded-full bg-violet-700/30 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[350px] w-[350px] rounded-full bg-blue-700/30 blur-3xl" />
      </div>

      {/* CARD */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-2xl"
      >

        {/* BACK */}
        <Link
          to="/auth/forgot-password"
          className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-400 no-underline transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        {/* HEADER */}
        <div className="mb-5">
          <div className="mb-3 inline-flex rounded-2xl bg-violet-500/15 p-3">
            <ShieldCheck className="h-5 w-5 text-violet-300" />
          </div>

          <h1 className="text-3xl font-black tracking-tight">
            Verify OTP
          </h1>

          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            Enter the 6-digit verification code sent to your email address.
          </p>

          <p className="mt-1 text-sm font-medium text-violet-400 break-all">
            {email}
          </p>
        </div>

        {/* INFO BANNER */}
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
          <p className="text-xs leading-relaxed text-blue-300">
            Check your inbox for the OTP email. The code expires in{' '}
            <span className="font-semibold text-white">
              10 minutes
            </span>
            . If you don't see it, check your spam folder.
          </p>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleVerify}
          className="space-y-4"
        >

          {/* OTP INPUT */}
          <div className="space-y-2">
            <Label htmlFor="otp">
              Verification Code
            </Label>

            <Input
              id="otp"
              type="text"
              inputMode="numeric"
              maxLength={6}
              required
              value={otp}
              onChange={(e) =>
                setOtp(
                  e.target.value.replace(/\D/g, '')
                )
              }
              placeholder="123456"
              className="h-12 rounded-xl border-white/10 bg-white/5 text-center text-2xl tracking-[0.4em] text-white placeholder:text-zinc-500"
            />
          </div>

          {/* BUTTON */}
          <Button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="h-11 w-full rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 font-semibold"
          >
            {loading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Verify OTP
          </Button>
        </form>

        {/* RESEND */}
        <div className="mt-5 text-center">
          {countdown > 0 ? (
            <p className="text-sm text-zinc-400">
              Resend OTP in{' '}
              <span className="font-semibold text-violet-400">
                {countdown}s
              </span>
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendLoading}
              className="text-sm font-semibold text-violet-400 transition hover:text-violet-300"
            >
              {resendLoading ? 'Resending...' : 'Resend OTP'}
            </button>
          )}
        </div>

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
      </motion.div>
    </div>
  )
}