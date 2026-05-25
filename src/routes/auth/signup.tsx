import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Mail, Lock, User, ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '#/components/ui/card'
import { useSignUp, useAuth } from '#/hooks/use-auth'
import { signupSchema, type SignupFormData } from '#/schemas/auth.schema'
import { APP_NAME } from '#/lib/constants'

export const Route = createFileRoute('/auth/signup')({
  head: () => ({
    meta: [
      { title: 'Create Account | EventSphere' },
      { name: 'robots', content: 'noindex, nofollow' }
    ]
  }),
  component: SignupPage,
})

function SignupPage() {
  const navigate = useNavigate()
  const signUp = useSignUp()
  const { isAuthenticated, role } = useAuth()

  if (isAuthenticated && role) {
    const target = role === 'admin'
      ? '/admin'
      : role === 'organiser'
        ? '/organiser'
        : '/dashboard'
    navigate({ to: target })
  }

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { role: 'attendee' },
  })

  const selectedRole = watch('role')

  const onSubmit = (data: SignupFormData) => {
    signUp.mutate({
      email: data.email,
      password: data.password,
      full_name: data.full_name,
      role: data.role,
    }, {
      onSuccess: () => {
        toast.success('Account created successfully! You are now signed in.')
        const target = data.role === 'organiser' ? '/organiser' : '/dashboard'
        navigate({ to: target })
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to create account')
      },
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 via-transparent to-indigo-600/5" />
        <div className="absolute top-1/3 left-1/3 h-96 w-96 rounded-full bg-violet-400/10 blur-3xl" />
        <div className="absolute bottom-1/3 right-1/3 h-96 w-96 rounded-full bg-indigo-400/10 blur-3xl" />
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
            <CardTitle className="text-2xl">Create Account</CardTitle>
            <CardDescription>Join EventSphere and start exploring</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="full_name" placeholder="John Doe" className="pl-10" {...register('full_name')} />
                </div>
                {errors.full_name && <p className="text-xs text-red-500">{errors.full_name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="you@example.com" className="pl-10" {...register('email')} />
                </div>
                {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="password" type="password" placeholder="••••••••" className="pl-10" {...register('password')} />
                </div>
                {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="confirm_password" type="password" placeholder="••••••••" className="pl-10" {...register('confirm_password')} />
                </div>
                {errors.confirm_password && <p className="text-xs text-red-500">{errors.confirm_password.message}</p>}
              </div>

              <div className="space-y-3">
                <Label>I want to</Label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'attendee' as const, label: 'Attend Events', desc: 'Discover & join events', icon: '🎫' },
                    { value: 'organiser' as const, label: 'Organise Events', desc: 'Create & manage events', icon: '🎤' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setValue('role', option.value)}
                      className={`rounded-xl border-2 p-4 text-left transition-all ${
                        selectedRole === option.value
                          ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/30 shadow-sm'
                          : 'border-border/60 hover:border-violet-300'
                      }`}
                    >
                      <span className="text-xl">{option.icon}</span>
                      <p className="mt-1.5 text-sm font-semibold">{option.label}</p>
                      <p className="text-[11px] text-muted-foreground">{option.desc}</p>
                    </button>
                  ))}
                </div>
                {errors.role && <p className="text-xs text-red-500">{errors.role.message}</p>}
              </div>

              <Button
                type="submit"
                disabled={signUp.isPending}
                className="w-full h-11 bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25"
              >
                {signUp.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Create Account
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/auth/login" className="font-semibold text-violet-600 hover:text-violet-700 no-underline">
                Sign In
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
