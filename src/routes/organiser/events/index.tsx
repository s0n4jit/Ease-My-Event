import { createFileRoute, Link } from '@tanstack/react-router'
import { Calendar, Plus, Edit3, Trash2, ArrowLeft, Users, QrCode, Eye } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Card } from '#/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '#/components/ui/table'
import { Navbar } from '#/components/shared/Navbar'
import { Footer } from '#/components/shared/Footer'
import { EmptyState } from '#/components/shared/EmptyState'
import { PageLoader } from '#/components/shared/LoadingSpinner'
import { AuthGuard } from '#/components/auth/AuthGuard'
import { useAuth } from '#/hooks/use-auth'
import { useOrganiserEvents } from '#/hooks/use-organiser'
import { useDeleteEvent } from '#/hooks/use-events'
import { Badge } from '#/components/ui/badge'
import { toast } from 'sonner'

export const Route = createFileRoute('/organiser/events/')({
  meta: () => [
    { title: 'Event Management | EventSphere' },
    { name: 'robots', content: 'noindex, nofollow' }
  ],
  component: () => (
    <AuthGuard allowedRoles={['organiser', 'admin']}>
      <OrganiserEventsManagementPage />
    </AuthGuard>
  ),
})

function OrganiserEventsManagementPage() {
  const { user } = useAuth()
  const { data: events, isLoading, refetch } = useOrganiserEvents(user?.id)
  const deleteEvent = useDeleteEvent()

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this event? This action is irreversible.')) return
    try {
      await deleteEvent.mutateAsync(id)
      toast.success('Event deleted successfully!')
      refetch()
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete event')
    }
  }

  if (isLoading) return <><Navbar /><PageLoader /><Footer /></>

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-emerald-500 text-white border-none">Published</Badge>
      case 'cancelled':
        return <Badge className="bg-rose-500 text-white border-none">Cancelled</Badge>
      case 'completed':
        return <Badge className="bg-blue-500 text-white border-none">Completed</Badge>
      default:
        return <Badge className="bg-slate-500 text-white border-none">Draft</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between">
      <div>
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link to="/organiser" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold sm:text-3xl">Manage Events</h1>
                <p className="text-muted-foreground text-sm mt-1">Add, update, or preview your active and upcoming event bookings</p>
              </div>
            </div>
            <Link to="/organiser/events/create" className="no-underline">
              <Button className="bg-violet-600 hover:bg-violet-700 text-white h-10">
                <Plus className="h-4 w-4 mr-1.5" /> Create Event
              </Button>
            </Link>
          </div>

          {events && events.length > 0 ? (
            <Card className="border-border/50 shadow-sm overflow-hidden bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event Details</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tickets Sold</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event: any) => {
                    const totalSold = event.ticket_types?.reduce((acc: number, t: any) => acc + (t.sold_count || 0), 0) || 0
                    const totalQty = event.capacity || event.ticket_types?.reduce((acc: number, t: any) => acc + (t.quantity || 0), 0) || 0

                    return (
                      <TableRow key={event.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-16 rounded overflow-hidden bg-slate-100 shrink-0 flex items-center justify-center border border-border/50">
                              {event.banner_url ? (
                                <img src={event.banner_url} alt="" className="h-full w-full object-cover" />
                              ) : (
                                <Calendar className="h-5 w-5 text-slate-300" />
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-xs text-foreground/90 max-w-[200px] truncate">{event.title}</p>
                              <p className="text-[10px] text-muted-foreground capitalize">{event.event_type} • {event.city || 'Online'}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">{event.category?.name || 'Uncategorized'}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(event.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </TableCell>
                        <TableCell>{getStatusBadge(event.status)}</TableCell>
                        <TableCell className="text-xs font-semibold text-foreground/80">
                          {totalSold} / {totalQty || 'Unlimited'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1.5">
                            <Link to="/events/$slug" params={{ slug: event.slug }} className="no-underline">
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-violet-600" title="Preview Public Page">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link to="/organiser/events/$eventId/edit" params={{ eventId: event.id }} className="no-underline">
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-blue-600" title="Edit Event Details">
                                <Edit3 className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link to="/organiser/events/$eventId/checkin" params={{ eventId: event.id }} className="no-underline">
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-amber-600" title="Check-In Console">
                                <QrCode className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link to="/organiser/events/$eventId/attendees" params={{ eventId: event.id }} className="no-underline">
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-indigo-600" title="View Attendee Directory">
                                <Users className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-rose-600" onClick={() => handleDelete(event.id)} title="Delete Event">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </Card>
          ) : (
            <EmptyState
              icon={Calendar}
              title="No events yet"
              description="Create an event to start promoting, managing attendees, and sharing checkins!"
              action={<Link to="/organiser/events/create"><Button className="bg-violet-600 hover:bg-violet-700 text-white">Create Your First Event</Button></Link>}
            />
          )}
        </main>
      </div>
      <Footer />
    </div>
  )
}
