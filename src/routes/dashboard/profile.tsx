import { createFileRoute } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Save, Loader2 } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '#/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import { Badge } from '#/components/ui/badge'
import { Navbar } from '#/components/shared/Navbar'
import { Footer } from '#/components/shared/Footer'
import { FileUpload } from '#/components/shared/FileUpload'
import { PageLoader } from '#/components/shared/LoadingSpinner'
import { AuthGuard } from '#/components/auth/AuthGuard'
import { useAuth, useUpdateProfile } from '#/hooks/use-auth'
import { profileSchema, type ProfileFormData } from '#/schemas/auth.schema'
import { STORAGE_BUCKETS } from '#/lib/constants'

export const Route = createFileRoute('/dashboard/profile')({
  meta: () => [
    { title: 'My Profile | EventSphere' },
    { name: 'robots', content: 'noindex, nofollow' }
  ],
  component: () => <AuthGuard><ProfilePage /></AuthGuard>,
})

function ProfilePage() {
  const { user, isLoading: authLoading } = useAuth()
  const updateProfile = useUpdateProfile()

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    values: user ? {
      full_name: user.full_name,
      phone: user.phone || '',
      bio: user.bio || '',
      linkedin_url: user.linkedin_url || '',
    } : undefined,
  })

  if (authLoading) return <><Navbar /><PageLoader /><Footer /></>

  const onSubmit = (data: ProfileFormData) => {
    if (!user) return
    updateProfile.mutate({
      id: user.id,
      updates: data,
    }, {
      onSuccess: () => toast.success('Profile updated'),
      onError: (err) => toast.error(err.message),
    })
  }

  const handleAvatarUpload = (url: string) => {
    if (!user) return
    updateProfile.mutate({ id: user.id, updates: { avatar_url: url } }, {
      onSuccess: () => toast.success('Avatar updated'),
    })
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>

        <div className="space-y-6">
          {/* Avatar */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Profile Photo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user?.avatar_url || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-500 text-2xl text-white">
                    {user?.full_name?.slice(0, 2).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <FileUpload
                    bucket={STORAGE_BUCKETS.PROFILE_IMAGES}
                    path={user?.id || 'temp'}
                    onUpload={handleAvatarUpload}
                    label="Upload Photo"
                    currentUrl={user?.avatar_url}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Info */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Personal Information</CardTitle>
              <CardDescription>
                <Badge variant="secondary" className="capitalize">{user?.role}</Badge>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input id="full_name" {...register('full_name')} />
                    {errors.full_name && <p className="text-xs text-red-500">{errors.full_name.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={user?.email || ''} disabled className="bg-muted" />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" {...register('phone')} placeholder="+91 XXXXX XXXXX" />
                    {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                    <Input id="linkedin_url" {...register('linkedin_url')} placeholder="https://linkedin.com/in/..." />
                    {errors.linkedin_url && <p className="text-xs text-red-500">{errors.linkedin_url.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea id="bio" {...register('bio')} placeholder="Tell us about yourself..." rows={4} />
                  {errors.bio && <p className="text-xs text-red-500">{errors.bio.message}</p>}
                </div>

                <Button type="submit" disabled={updateProfile.isPending}>
                  {updateProfile.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  )
}
