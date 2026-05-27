import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { ArrowLeft, QrCode, Clock, RefreshCw, UserCheck } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/ui/card'
import { Input } from '#/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '#/components/ui/table'
import { Navbar } from '#/components/shared/Navbar'
import { Footer } from '#/components/shared/Footer'
import { PageLoader } from '#/components/shared/LoadingSpinner'
import { AuthGuard } from '#/components/auth/AuthGuard'
import { useAuth } from '#/hooks/use-auth'
import { useCheckins, useCheckinStats, usePerformCheckin } from '#/hooks/use-checkin'
import { useEventById } from '#/hooks/use-events'
import { toast } from 'sonner'
import { Progress } from '#/components/ui/progress'

export const Route = createFileRoute('/organiser/events/$eventId/checkin')({
  meta: () => [
    { title: 'Attendee Check-In Console | EaseMyEvent' },
    { name: 'robots', content: 'noindex, nofollow' }
  ],
  component: () => (
    <AuthGuard allowedRoles={['organiser', 'admin']}>
      <EventCheckinConsolePage />
    </AuthGuard>
  ),
})

function EventCheckinConsolePage() {
  const { eventId } = Route.useParams()
  const { user } = useAuth()

  const { data: eventData, isLoading: loadingEvent } = useEventById(eventId)
  const event = eventData as any
  const { data: checkins, isLoading: loadingCheckins, refetch: refetchLog } = useCheckins(eventId)
  const { data: stats, isLoading: loadingStats, refetch: refetchStats } = useCheckinStats(eventId)

  const performCheckin = usePerformCheckin()
  const [ticketCodeInput, setTicketCodeInput] = useState('')
  const [checkingIn, setCheckingIn] = useState(false)

  const handleManualCheckIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ticketCodeInput) {
      toast.error('Please enter a ticket code!')
      return
    }
    setCheckingIn(true)
    try {
      const ticket = (await performCheckin.mutateAsync({
        qrCode: ticketCodeInput.trim().toUpperCase(),
        eventId,
        checkedInBy: user!.id,
      })) as any
      
      const attendeeName = ticket.attendee_name || (ticket.registration as any)?.user?.full_name || 'Attendee'
      toast.success(`Checked-in ${attendeeName} successfully!`)
      setTicketCodeInput('')
      refetchLog()
      refetchStats()
    } catch (err: any) {
      toast.error(err.message || 'Failed to check-in attendee')
    } finally {
      setCheckingIn(false)
    }
  }

  if (loadingEvent || loadingCheckins || loadingStats) {
    return <><Navbar /><PageLoader /><Footer /></>
  }

  const registered = stats?.totalRegistered || 0
  const checkedIn = stats?.totalCheckedIn || 0
  const progressPercent = registered > 0 ? Math.round((checkedIn / registered) * 100) : 0

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between">
      <div>
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link to="/organiser/events" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold sm:text-3xl">Check-In Desk</h1>
                <p className="text-muted-foreground text-sm mt-1">Manual pass verification and active entry ledger for {event?.title}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => { refetchLog(); refetchStats(); }} className="h-9">
              <RefreshCw className="h-4 w-4 mr-1.5" /> Refresh Console
            </Button>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Verification Panel */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="border-border/50 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">Verify Ticket Code</CardTitle>
                  <CardDescription>Enter code in ES-XXXX-XXXX-XXXX format</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleManualCheckIn} className="space-y-4">
                    <div className="flex flex-col gap-2">
                      <Input
                        placeholder="ES-..."
                        value={ticketCodeInput}
                        onChange={(e) => setTicketCodeInput(e.target.value)}
                        className="h-10 text-center font-mono font-bold tracking-widest text-violet-600 placeholder:font-sans placeholder:tracking-normal placeholder:font-normal"
                        disabled={checkingIn}
                      />
                    </div>
                    <Button type="submit" disabled={checkingIn} className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold h-10 gap-1.5">
                      {checkingIn ? 'Checking-in...' : <><QrCode className="h-4 w-4" /> Check-In Attendee</>}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Stats Visuals */}
              <Card className="border-border/50 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">Entry Completion</CardTitle>
                  <CardDescription>Visual metrics of checked-in vs registered attendees</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-border/50">
                      <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{checkedIn}</p>
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-1">Checked In</p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-border/50">
                      <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{registered}</p>
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-1">Registered</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-muted-foreground">
                      <span>Venue Occupancy</span>
                      <span>{progressPercent}%</span>
                    </div>
                    <Progress value={progressPercent} className="h-2.5 bg-slate-100 dark:bg-slate-800" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Check-in Ledger */}
            <div className="lg:col-span-2">
              <Card className="border-border/50 shadow-md bg-card">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-violet-600" />
                    Entry Log
                  </CardTitle>
                  <CardDescription>Live list of checked-in ticket records</CardDescription>
                </CardHeader>
                <CardContent>
                  {checkins && checkins.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Attendee Info</TableHead>
                          <TableHead>Ticket ID</TableHead>
                          <TableHead>Tier</TableHead>
                          <TableHead>Checked In At</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {checkins.map((item: any) => {
                          const attendee = item.ticket?.attendee_name || item.ticket?.registration?.user?.full_name || 'Attendee'
                          const email = item.ticket?.attendee_email || item.ticket?.registration?.user?.email || 'N/A'
                          const tierName = item.ticket?.ticket_type?.name || 'General'

                          return (
                            <TableRow key={item.id}>
                              <TableCell>
                                <div>
                                  <p className="font-semibold text-xs text-foreground/90">{attendee}</p>
                                  <p className="text-[10px] text-muted-foreground">{email}</p>
                                </div>
                              </TableCell>
                              <TableCell className="font-mono text-[10px] text-muted-foreground">{item.ticket?.qr_code}</TableCell>
                              <TableCell className="text-xs font-semibold">{tierName}</TableCell>
                              <TableCell className="text-xs text-muted-foreground">
                                {new Date(item.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-12">
                      <Clock className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                      <h4 className="font-semibold text-sm">Waiting for first scan...</h4>
                      <p className="text-xs text-muted-foreground max-w-xs mx-auto mt-1">
                        Use the verification panel on the left to confirm ticket passes.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}
