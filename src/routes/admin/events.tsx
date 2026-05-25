import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'

import { ArrowLeft, Search, Calendar, ShieldAlert, Star, Trash2, Eye } from 'lucide-react'
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
import { useAllEvents, useToggleEventFeatured } from '#/hooks/use-admin'
import { useDeleteEvent } from '#/hooks/use-events'
import { Badge } from '#/components/ui/badge'
import { toast } from 'sonner'

export const Route = createFileRoute('/admin/events')({
  meta: () => [
    { title: 'Event Moderation | EventSphere' },
    { name: 'robots', content: 'noindex, nofollow' }
  ],
  component: () => (
    <AuthGuard allowedRoles={['admin']}>
      <AdminEventsPage />
    </AuthGuard>
  ),
})

function AdminEventsPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const { data: events, isLoading, refetch } = useAllEvents(searchTerm)

  const toggleEventFeatured = useToggleEventFeatured()
  const deleteEvent = useDeleteEvent()

  if (user && user.role !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col justify-between">
        <Navbar />
        <div className="mx-auto max-w-md px-4 py-16 text-center">
          <ShieldAlert className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground mt-2">Only system administrators can access the admin control panel.</p>
          <Link to="/" className="mt-6 no-underline inline-block">
            <Button>Go Home</Button>
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  const handleToggleFeatured = async (id: string, isFeatured: boolean) => {
    try {
      await toggleEventFeatured.mutateAsync({ id, is_featured: !isFeatured })
      toast.success(isFeatured ? 'Event unfeatured successfully!' : 'Event featured on landing page!')
      refetch()
    } catch (err: any) {
      toast.error(err.message || 'Failed to update featured flag')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event? This action will permanently remove it from the platform.')) return
    try {
      await deleteEvent.mutateAsync(id)
      toast.success('Event deleted from platform successfully!')
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
              <Link to="/admin" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold sm:text-3xl">Audit Events</h1>
                <p className="text-muted-foreground text-sm mt-1">Audit public listings, manage featured tags, or moderate illegal events</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-6 max-w-md">
            <Search className="h-4 w-4 text-muted-foreground shrink-0 ml-3 absolute" />
            <Input
              placeholder="Search by event title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-10"
            />
          </div>

          {events && events.length > 0 ? (
            <Card className="border-border/50 shadow-sm overflow-hidden bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event Info</TableHead>
                    <TableHead>Organiser</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Featured</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event: any) => (
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
                      <TableCell>
                        <div>
                          <p className="text-xs font-semibold">{event.organiser?.full_name || 'N/A'}</p>
                          <p className="text-[10px] text-muted-foreground">{event.organiser?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">{event.category?.name || 'Uncategorized'}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(event.start_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{getStatusBadge(event.status)}</TableCell>
                      <TableCell>
                        <Badge className={`border-none ${
                          event.is_featured
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-500'
                        }`}>
                          {event.is_featured ? 'Featured' : 'Standard'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Link to="/events/$slug" params={{ slug: event.slug }} className="no-underline">
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-violet-600" title="Preview Public Page">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-muted-foreground hover:text-amber-500"
                            onClick={() => handleToggleFeatured(event.id, event.is_featured)}
                            title={event.is_featured ? 'Unfeature Event' : 'Feature Event'}
                          >
                            <Star className={`h-4 w-4 ${event.is_featured ? 'fill-amber-400 text-amber-400' : ''}`} />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-rose-600" onClick={() => handleDelete(event.id)} title="Delete Event">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          ) : (
            <EmptyState
              icon={Calendar}
              title="No events found"
              description="No listings matches the audit terms."
            />
          )}
        </main>
      </div>
      <Footer />
    </div>
  )
}
