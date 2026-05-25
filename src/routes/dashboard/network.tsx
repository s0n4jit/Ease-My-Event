import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Users, Linkedin, Shield, Calendar, UserPlus } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '#/components/ui/card'
import { Switch } from '#/components/ui/switch'
import { Navbar } from '#/components/shared/Navbar'
import { Footer } from '#/components/shared/Footer'
import { EmptyState } from '#/components/shared/EmptyState'
import { PageLoader } from '#/components/shared/LoadingSpinner'
import { AuthGuard } from '#/components/auth/AuthGuard'
import { useAuth } from '#/hooks/use-auth'
import { useMyTickets } from '#/hooks/use-tickets'
import { supabase } from '#/lib/supabase'
import { toast } from 'sonner'

export const Route = createFileRoute('/dashboard/network')({
  meta: () => [
    { title: 'My Network | EventSphere' },
    { name: 'robots', content: 'noindex, nofollow' }
  ],
  component: () => (
    <AuthGuard>
      <AttendeeNetworkPage />
    </AuthGuard>
  ),
})

function AttendeeNetworkPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { data: registrationsData, isLoading: loadingRegs } = useMyTickets(user?.id)
  const registrations = (registrationsData as any[]) || []

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)

  // Fetch networking opt-ins for this attendee
  const { data: myOptInsData, isLoading: loadingOptIns } = useQuery({
    queryKey: ['network', 'mine', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attendee_networks')
        .select('*')
        .eq('user_id', user!.id)
      if (error) throw error
      return data as any[]
    },
    enabled: !!user?.id,
  })
  const myOptIns = (myOptInsData as any[]) || []

  // Fetch all networked attendees for the selected event
  const { data: networkAttendeesData, isLoading: loadingAttendees } = useQuery({
    queryKey: ['network', 'event', selectedEventId],
    queryFn: async () => {
      if (!selectedEventId) return [] as any[]
      const { data, error } = await supabase
        .from('attendee_networks')
        .select(`
          *,
          user:users(id, full_name, avatar_url, bio, linkedin_url, role)
        `)
        .eq('event_id', selectedEventId)
        .eq('share_linkedin', true)
      if (error) throw error
      return data as any[]
    },
    enabled: !!selectedEventId,
  })
  const networkAttendees = (networkAttendeesData as any[]) || []

  // Mutation to toggle opt-in
  const toggleOptInMutation = useMutation({
    mutationFn: async ({ eventId, share }: { eventId: string; share: boolean }) => {
      const { data, error } = await supabase
        .from('attendee_networks')
        .upsert({
          event_id: eventId,
          user_id: user!.id,
          share_linkedin: share,
        } as any, { onConflict: 'event_id,user_id' })
        .select()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['network', 'mine', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['network', 'event', selectedEventId] })
      toast.success('Networking preference updated!')
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update preferences')
    },
  })

  const handleToggle = (eventId: string, share: boolean) => {
    if (!user?.linkedin_url && share) {
      toast.warning('Please update your LinkedIn URL in your Profile Settings first!')
      return
    }
    toggleOptInMutation.mutate({ eventId, share })
  }

  const isLoading = loadingRegs || loadingOptIns

  if (isLoading) return <><Navbar /><PageLoader /><Footer /></>

  const activeRegistrations = registrations.filter(r => r.status === 'confirmed' && r.event) || []

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between">
      <div>
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <h1 className="text-2xl font-bold sm:text-3xl">Attendee Network</h1>
            <p className="text-muted-foreground text-sm mt-1">Connect with other attendees from your registered events by sharing your professional profile.</p>
          </motion.div>

          {activeRegistrations.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No active registrations"
              description="Register for events to connect with other attendees and build your network!"
              action={<Link to="/events"><Button>Discover Events</Button></Link>}
            />
          ) : (
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Event Select & Preferences */}
              <div className="lg:col-span-1 space-y-6">
                <Card className="border-border/50 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Your Events</CardTitle>
                    <CardDescription>Select an event and opt-in to network</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 max-h-[500px] overflow-y-auto">
                    {activeRegistrations.map((reg: any) => {
                      const isOptedIn = myOptIns?.find(o => o.event_id === reg.event.id)?.share_linkedin || false
                      const isSelected = selectedEventId === reg.event.id

                      return (
                        <div
                          key={reg.id}
                          className={`p-4 rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-violet-50/50 dark:bg-violet-950/20 border-violet-300'
                              : 'bg-card border-border/50 hover:border-violet-200'
                          }`}
                          onClick={() => setSelectedEventId(reg.event.id)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-violet-600">
                                {reg.event.title}
                              </h3>
                              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(reg.event.start_date).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 capitalize text-[10px]">
                              Registered
                            </Badge>
                          </div>

                          <div className="mt-4 flex items-center justify-between pt-3 border-t border-border/50" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center gap-2">
                              <Linkedin className={`h-4 w-4 ${isOptedIn ? 'text-[#0077B5]' : 'text-slate-400'}`} />
                              <span className="text-xs font-medium">Share LinkedIn</span>
                            </div>
                            <Switch
                              checked={isOptedIn}
                              onCheckedChange={(checked) => handleToggle(reg.event.id, checked)}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>

                <Card className="border-border/50 shadow-sm bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950/20 dark:to-indigo-950/20">
                  <CardContent className="p-4 flex gap-3">
                    <Shield className="h-6 w-6 text-violet-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-semibold text-violet-900 dark:text-violet-200">Networking Safety</h4>
                      <p className="text-[11px] text-violet-700/80 dark:text-violet-400/80 mt-1">
                        Only attendees who actively opt-in can see each other's LinkedIn links. Your profile is safe, secure, and under your control.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Network Connections */}
              <div className="lg:col-span-2">
                {selectedEventId ? (
                  <Card className="border-border/50 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="h-5 w-5 text-violet-600" />
                        Network Directory
                      </CardTitle>
                      <CardDescription>
                        Professional profiles of attendees sharing their LinkedIn contact
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loadingAttendees ? (
                        <div className="py-8 flex justify-center"><PageLoader /></div>
                      ) : networkAttendees && networkAttendees.length > 0 ? (
                        <div className="grid gap-4 sm:grid-cols-2">
                          {networkAttendees.map((member: any) => {
                            const isMe = member.user.id === user?.id
                            return (
                              <div
                                key={member.id}
                                className="flex flex-col justify-between p-4 rounded-xl border border-border/50 bg-card hover:shadow-sm transition-all"
                              >
                                <div className="flex items-start gap-3">
                                  <div className="h-10 w-10 rounded-full bg-violet-100 dark:bg-violet-950/40 text-violet-600 flex items-center justify-center font-bold text-sm shrink-0">
                                    {member.user.avatar_url ? (
                                      <img src={member.user.avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
                                    ) : (
                                      member.user.full_name?.charAt(0) || 'U'
                                    )}
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-sm flex items-center gap-1.5">
                                      {member.user.full_name}
                                      {isMe && <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 px-1.5 py-0.5 rounded font-normal">You</span>}
                                    </h4>
                                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{member.user.bio || 'Professional Attendee'}</p>
                                  </div>
                                </div>

                                <div className="mt-4 pt-3 border-t border-border/50 flex justify-end">
                                  <a href={member.user.linkedin_url || '#'} target="_blank" rel="noopener noreferrer" className="no-underline">
                                    <Button variant="outline" size="sm" className="h-8 text-xs font-semibold gap-1.5 text-[#0077B5] hover:text-[#0077B5] hover:bg-[#0077B5]/5 border-[#0077B5]/20">
                                      <Linkedin className="h-3.5 w-3.5 fill-[#0077B5]" /> Connect on LinkedIn
                                    </Button>
                                  </a>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <Users className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                          <h4 className="font-semibold text-sm">No connections yet</h4>
                          <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
                            Be the first to share your LinkedIn profile for this event and encourage others to connect!
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <div className="h-full border border-dashed border-border/50 rounded-2xl flex flex-col items-center justify-center text-center p-8 bg-card/40">
                    <UserPlus className="h-12 w-12 text-violet-400/50 mb-3" />
                    <h3 className="font-bold text-lg">Select an Event</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mt-1">
                      Choose one of your registered events from the left sidebar to view the network and connect with peers.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  )
}

// Simple Badge replacement if not present in components/ui
function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${className}`}>
      {children}
    </span>
  )
}
