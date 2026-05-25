import { createFileRoute, Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { Calendar, Ticket, Heart, Bell, Star, ArrowRight } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Card, CardContent } from '#/components/ui/card'
import { Badge } from '#/components/ui/badge'
import { Navbar } from '#/components/shared/Navbar'
import { Footer } from '#/components/shared/Footer'
import { StatsCard } from '#/components/shared/StatsCard'
import { PageLoader } from '#/components/shared/LoadingSpinner'
import { EmptyState } from '#/components/shared/EmptyState'
import { AuthGuard } from '#/components/auth/AuthGuard'
import { useAuth } from '#/hooks/use-auth'
import { useMyTickets } from '#/hooks/use-tickets'
import { useWishlist } from '#/hooks/use-wishlist'
import { useNotifications } from '#/hooks/use-notifications'
import { useRealtimeNotifications } from '#/hooks/use-realtime'
import { format } from 'date-fns'

export const Route = createFileRoute('/dashboard/')({
  meta: () => [
    { title: 'Attendee Dashboard | EventSphere' },
    { name: 'robots', content: 'noindex, nofollow' }
  ],
  component: () => (
    <AuthGuard>
      <DashboardPage />
    </AuthGuard>
  ),
})

function DashboardPage() {
  const { user } = useAuth()
  const { data: registrationsData, isLoading } = useMyTickets(user?.id)
  const { data: wishlist } = useWishlist(user?.id)
  const { data: notificationsData } = useNotifications(user?.id)

  const registrations = (registrationsData as any[]) || []
  const notifications = (notificationsData as any[]) || []

  useRealtimeNotifications(user?.id)

  if (isLoading) return <><Navbar /><PageLoader /><Footer /></>

  const upcomingEvents = registrations.filter(r =>
    r.status === 'confirmed' && r.event && new Date((r.event as any).start_date) > new Date()
  ) || []

  const unreadNotifications = notifications.filter(n => !n.is_read) || []

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold sm:text-3xl">
            Welcome back, {user?.full_name?.split(' ')[0] || 'there'}! 👋
          </h1>
          <p className="mt-1 text-muted-foreground">Here's what's happening with your events</p>
        </motion.div>

        {/* Stats */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard title="Upcoming Events" value={upcomingEvents.length} icon={Calendar} color="violet" index={0} />
          <StatsCard title="Tickets" value={registrations?.length || 0} icon={Ticket} color="blue" index={1} />
          <StatsCard title="Wishlist" value={wishlist?.length || 0} icon={Heart} color="rose" index={2} />
          <StatsCard title="Unread" value={unreadNotifications.length} icon={Bell} color="amber" index={3} />
        </div>

        {/* Quick Links */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { to: '/dashboard/tickets', label: 'My Tickets', icon: Ticket, desc: 'View & download tickets' },
            { to: '/dashboard/wishlist', label: 'Wishlist', icon: Heart, desc: 'Saved events' },
            { to: '/dashboard/reviews', label: 'Reviews', icon: Star, desc: 'Your event reviews' },
            { to: '/dashboard/notifications', label: 'Notifications', icon: Bell, desc: `${unreadNotifications.length} unread` },
          ].map((link, i) => (
            <motion.div key={link.to} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05 }}>
              <Link to={link.to} className="no-underline">
                <Card className="group cursor-pointer border-border/50 transition-all hover:border-violet-300 hover:shadow-md hover:-translate-y-0.5">
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="rounded-xl bg-violet-50 dark:bg-violet-950/40 p-2.5">
                      <link.icon className="h-5 w-5 text-violet-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold group-hover:text-violet-600 transition-colors">{link.label}</p>
                      <p className="text-xs text-muted-foreground">{link.desc}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Upcoming Events */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Upcoming Events</h2>
            <Link to="/dashboard/tickets" className="no-underline">
              <Button variant="ghost" size="sm">View All <ArrowRight className="ml-1 h-3.5 w-3.5" /></Button>
            </Link>
          </div>

          {upcomingEvents.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No upcoming events"
              description="Browse events and register to see them here"
              action={<Link to="/events"><Button>Browse Events</Button></Link>}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingEvents.slice(0, 3).map((reg: any, i: number) => (
                <motion.div key={reg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}>
                  <Link to="/events/$slug" params={{ slug: reg.event.slug }} className="no-underline">
                    <Card className="overflow-hidden hover:shadow-md transition-shadow">
                      <div className="h-32 bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-950 dark:to-indigo-950 flex items-center justify-center">
                        {reg.event.banner_url ? (
                          <img src={reg.event.banner_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <Calendar className="h-8 w-8 text-violet-400/50" />
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-sm line-clamp-1">{reg.event.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(reg.event.start_date), 'MMM d, yyyy • h:mm a')}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <Badge variant="secondary" className="text-[10px]">
                            {reg.tickets?.length || 0} ticket{(reg.tickets?.length || 0) !== 1 ? 's' : ''}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] capitalize">{reg.status}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}
