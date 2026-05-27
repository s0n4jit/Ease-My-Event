import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { ArrowLeft, Download, Search, Users, ShieldAlert } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Card } from '#/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '#/components/ui/table'
import { Input } from '#/components/ui/input'
import { Navbar } from '#/components/shared/Navbar'
import { Footer } from '#/components/shared/Footer'
import { EmptyState } from '#/components/shared/EmptyState'
import { PageLoader } from '#/components/shared/LoadingSpinner'
import { AuthGuard } from '#/components/auth/AuthGuard'
import { useAuth } from '#/hooks/use-auth'
import { useEventRegistrations } from '#/hooks/use-tickets'
import { useEventById } from '#/hooks/use-events'
import { Badge } from '#/components/ui/badge'
import Papa from 'papaparse'

export const Route = createFileRoute('/organiser/events/$eventId/attendees')({
  meta: () => [
    { title: 'Event Attendees | EaseMyEvent' },
    { name: 'robots', content: 'noindex, nofollow' }
  ],
  component: () => (
    <AuthGuard allowedRoles={['organiser', 'admin']}>
      <EventAttendeesPage />
    </AuthGuard>
  ),
})

function EventAttendeesPage() {
  const { eventId } = Route.useParams()
  const { user } = useAuth()
  
  const { data: eventData, isLoading: loadingEvent } = useEventById(eventId)
  const event = eventData as any
  const { data: registrations, isLoading: loadingRegs } = useEventRegistrations(eventId)
  
  const [searchTerm, setSearchTerm] = useState('')

  if (loadingEvent || loadingRegs) return <><Navbar /><PageLoader /><Footer /></>

  if (!event || (event.organiser_id !== user?.id && user?.role !== 'admin')) {
    return (
      <div className="min-h-screen flex flex-col justify-between">
        <Navbar />
        <div className="mx-auto max-w-md px-4 py-16 text-center">
          <ShieldAlert className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground mt-2">You do not have permission to view this attendee directory.</p>
          <Link to="/organiser/events" className="mt-6 no-underline inline-block">
            <Button>Back to Events</Button>
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  // Filter registrations
  const filteredRegs = registrations?.filter((reg: any) => {
    const term = searchTerm.toLowerCase()
    return (
      reg.user?.full_name?.toLowerCase().includes(term) ||
      reg.user?.email?.toLowerCase().includes(term) ||
      reg.user?.phone?.toLowerCase().includes(term)
    )
  }) || []

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredRegs.length === 0) return
    const csvData = filteredRegs.map((reg: any) => ({
      'Registration ID': reg.id,
      'Attendee Name': reg.user?.full_name || 'N/A',
      'Attendee Email': reg.user?.email || 'N/A',
      'Attendee Phone': reg.user?.phone || 'N/A',
      'Status': reg.status,
      'Total Paid (INR)': reg.total_amount,
      'Registration Date': new Date(reg.created_at).toLocaleDateString(),
      'Tickets Count': reg.tickets?.length || 0,
    }))

    const csv = Papa.unparse(csvData)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${event.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-attendees.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between">
      <div>
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link to="/organiser/events" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold sm:text-3xl">Attendee Directory</h1>
                <p className="text-muted-foreground text-sm mt-1">Directory of all users registered for {event.title}</p>
              </div>
            </div>
            {filteredRegs.length > 0 && (
              <Button onClick={handleExportCSV} className="bg-violet-600 hover:bg-violet-700 text-white gap-1.5 h-10">
                <Download className="h-4 w-4" /> Export CSV
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2 mb-6 max-w-md">
            <Search className="h-4 w-4 text-muted-foreground shrink-0 ml-3 absolute" />
            <Input
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-10"
            />
          </div>

          {filteredRegs.length > 0 ? (
            <Card className="border-border/50 shadow-sm overflow-hidden bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Attendee Info</TableHead>
                    <TableHead>Registration Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tickets</TableHead>
                    <TableHead>Paid Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegs.map((reg: any) => (
                    <TableRow key={reg.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-violet-100 dark:bg-violet-950/40 text-violet-600 flex items-center justify-center font-bold text-xs shrink-0">
                            {reg.user?.avatar_url ? (
                              <img src={reg.user.avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
                            ) : (
                              reg.user?.full_name?.charAt(0) || 'U'
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-xs text-foreground/90">{reg.user?.full_name || 'Anonymous User'}</p>
                            <p className="text-[10px] text-muted-foreground">{reg.user?.email || 'N/A'} • {reg.user?.phone || 'N/A'}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(reg.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </TableCell>
                      <TableCell>
                        <Badge className={`border-none ${
                          reg.status === 'confirmed'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950/30 dark:text-rose-400'
                        }`}>
                          {reg.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-foreground/80">
                        {reg.tickets?.length || 0} Pass{(reg.tickets?.length || 0) !== 1 ? 'es' : ''}
                      </TableCell>
                      <TableCell className="text-xs font-extrabold text-slate-800 dark:text-slate-100">
                        ₹{Number(reg.total_amount).toLocaleString('en-IN')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          ) : (
            <EmptyState
              icon={Users}
              title="No attendees found"
              description="No attendee matches the search parameters or no bookings have been made yet."
            />
          )}
        </main>
      </div>
      <Footer />
    </div>
  )
}
