import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'

import {
  Lock,
  Loader2,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  KeyRound,
  Eye,
  EyeOff,
} from 'lucide-react'

import { toast } from 'sonner'

import { supabase } from '#/lib/supabase'

import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'

export const Route = createFileRoute(
  '/auth/reset-password'
)({
  component: ResetPasswordPage,
})

function ResetPasswordPage() {
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] =
    useState('')

  const [loading, setLoading] = useState(false)

  const [checkingSession, setCheckingSession] =
    useState(true)

  const [showPassword, setShowPassword] =
    useState(false)

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false)

  /* SIMPLE VALIDATION */
  useEffect(() => {
    const hash = window.location.hash

    if (!hash.includes('access_token')) {
      toast.error('Invalid reset link.')

      navigate({
        to: '/auth/login',
      })

      return
    }

    setCheckingSession(false)
  }, [navigate])

  const passwordStrength = useMemo(() => {
    let score = 0

    if (password.length >= 8) score++

    if (/[A-Z]/.test(password)) score++

    if (/[0-9]/.test(password)) score++

    if (/[^A-Za-z0-9]/.test(password))
      score++

    if (score <= 1) {
      return {
        text: 'Weak',
        width: '25%',
        color: 'bg-red-500',
      }
    }

    if (score === 2) {
      return {
        text: 'Moderate',
        width: '50%',
        color: 'bg-yellow-500',
      }
    }

    if (score === 3) {
      return {
        text: 'Strong',
        width: '75%',
        color: 'bg-blue-500',
      }
    }

    return {
      text: 'Very Strong',
      width: '100%',
      color: 'bg-green-500',
    }
  }, [password])

  const isPasswordValid =
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)

  const passwordsMatch =
    password === confirmPassword

  const handleUpdate = async (
    e: React.FormEvent
  ) => {
    e.preventDefault()

    if (!isPasswordValid) {
      toast.error(
        'Password must contain uppercase, number, symbol and minimum 8 characters.'
      )

      return
    }

    if (!passwordsMatch) {
      toast.error('Passwords do not match.')
      return
    }

    setLoading(true)

    const { error } =
      await supabase.auth.updateUser({
        password,
      })

    setLoading(false)

    if (error) {
      toast.error(error.message)
      return
    }

    toast.success(
      'Password updated successfully.'
    )

    await supabase.auth.signOut()

    navigate({
      to: '/auth/login',
    })
  }

  if (checkingSession) {
    return (
      <div className="flex h-screen items-center justify-center bg-black text-white">
        <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">

      {/* BACKGROUND */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] h-[350px] w-[350px] rounded-full bg-violet-700/30 blur-3xl" />

        <div className="absolute bottom-[-10%] right-[-10%] h-[350px] w-[350px] rounded-full bg-blue-700/30 blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8">

        <div className="grid w-full max-w-7xl gap-8 lg:grid-cols-2">

          {/* LEFT */}
          <div className="hidden lg:flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="max-w-xl"
            >
              <h1 className="text-5xl xl:text-6xl font-black leading-[0.95] tracking-tight">
                Create A
                <br />

                <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
                  Strong Password
                </span>
              </h1>

              <p className="mt-5 max-w-lg text-lg leading-relaxed text-zinc-400">
                Protect your account with a secure password containing uppercase letters,
                numbers, and symbols.
              </p>

              <div className="mt-7 space-y-3">
                <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl">
                  <div className="rounded-xl bg-violet-500/15 p-3">
                    <ShieldCheck className="h-5 w-5 text-violet-300" />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold">
                      Advanced Security
                    </h3>

                    <p className="text-sm text-zinc-400">
                      Your password is securely encrypted and protected.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl">
                  <div className="rounded-xl bg-blue-500/15 p-3">
                    <KeyRound className="h-5 w-5 text-blue-300" />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold">
                      Strong Password Policy
                    </h3>

                    <p className="text-sm text-zinc-400">
                      Weak passwords are automatically rejected.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl">
                  <div className="rounded-xl bg-pink-500/15 p-3">
                    <CheckCircle2 className="h-5 w-5 text-pink-300" />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold">
                      Secure Recovery
                    </h3>

                    <p className="text-sm text-zinc-400">
                      Regain access to your account safely and quickly.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* RIGHT */}
          <div className="flex justify-center">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="w-full max-w-md"
            >
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl backdrop-blur-2xl md:p-6">

                <div className="mb-5">
                  <div className="mb-3 inline-flex rounded-2xl bg-violet-500/15 p-3">
                    <Sparkles className="h-5 w-5 text-violet-300" />
                  </div>

                  <h2 className="text-3xl font-black tracking-tight">
                    Reset Password
                  </h2>

                  <p className="mt-1 text-sm text-zinc-400">
                    Create a new secure password.
                  </p>
                </div>

                <form
                  onSubmit={handleUpdate}
                  className="space-y-4"
                >

                  {/* PASSWORD */}
                  <div className="space-y-2">
                    <Label htmlFor="password">
                      New Password
                    </Label>

                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

                      <Input
                        id="password"
                        type={
                          showPassword
                            ? 'text'
                            : 'password'
                        }
                        required
                        value={password}
                        onChange={(e) =>
                          setPassword(e.target.value)
                        }
                        placeholder="••••••••"
                        className="h-11 rounded-xl border-white/10 bg-white/5 pl-11 pr-11 text-white placeholder:text-zinc-500"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(
                            !showPassword
                          )
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    {/* STRENGTH */}
                    <div className="space-y-2">
                      <div className="h-2 overflow-hidden rounded-full bg-white/10">
                        <div
                          className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                          style={{
                            width:
                              passwordStrength.width,
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <p className="text-xs text-zinc-400">
                          Password Strength
                        </p>

                        <p className="text-xs font-medium">
                          {passwordStrength.text}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* CONFIRM */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      Confirm Password
                    </Label>

                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

                      <Input
                        id="confirmPassword"
                        type={
                          showConfirmPassword
                            ? 'text'
                            : 'password'
                        }
                        required
                        value={confirmPassword}
                        onChange={(e) =>
                          setConfirmPassword(
                            e.target.value
                          )
                        }
                        placeholder="••••••••"
                        className="h-11 rounded-xl border-white/10 bg-white/5 pl-11 pr-11 text-white placeholder:text-zinc-500"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(
                            !showConfirmPassword
                          )
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    {confirmPassword &&
                      !passwordsMatch && (
                        <p className="text-xs text-red-400">
                          Passwords do not match
                        </p>
                      )}
                  </div>

                  {/* BUTTON */}
                  <Button
                    type="submit"
                    disabled={
                      loading ||
                      !isPasswordValid ||
                      !passwordsMatch
                    }
                    className="h-11 w-full rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 font-semibold"
                  >
                    {loading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}

                    Update Password
                  </Button>
                </form>

                <p className="mt-5 text-center text-sm text-zinc-400">
                  Back to{' '}

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