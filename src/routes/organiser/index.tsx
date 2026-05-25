import { createFileRoute, Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { Calendar, Users, DollarSign, QrCode, TrendingUp, AlertCircle, ArrowRight, Eye, RefreshCw } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/ui/card'
import { Navbar } from '#/components/shared/Navbar'
import { Footer } from '#/components/shared/Footer'
import { StatsCard } from '#/components/shared/StatsCard'
import { PageLoader } from '#/components/shared/LoadingSpinner'
import { EmptyState } from '#/components/shared/EmptyState'
import { AuthGuard } from '#/components/auth/AuthGuard'
import { useAuth } from '#/hooks/use-auth'
import { useOrganiserStats, useOrganiserEvents, useRevenueByMonth } from '#/hooks/use-organiser'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export const Route = createFileRoute('/organiser/')({
  meta: () => [
    { title: 'Organiser Dashboard | EventSphere' },
    { name: 'robots', content: 'noindex, nofollow' }
  ],
  component: () => (
    <AuthGuard allowedRoles={['organiser', 'admin']}>
      <OrganiserDashboardPage />
    </AuthGuard>
  ),
})

function OrganiserDashboardPage() {
  const { user } = useAuth()
  
  if (user && user.role !== 'organiser' && user.role !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col justify-between">
        <Navbar />
        <div className="mx-auto max-w-md px-4 py-16 text-center">
          <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground mt-2">Only registered organisers can access the organiser dashboard.</p>
          <Link to="/" className="mt-6 no-underline inline-block">
            <Button>Go Home</Button>
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  const { data: stats, isLoading: loadingStats, refetch } = useOrganiserStats(user?.id)
  const { data: events, isLoading: loadingEvents } = useOrganiserEvents(user?.id)
  const { data: revenueData, isLoading: loadingRevenue } = useRevenueByMonth(user?.id)

  const isLoading = loadingStats || loadingEvents || loadingRevenue

  if (isLoading) return <><Navbar /><PageLoader /><Footer /></>

  const formattedChartData = revenueData?.map(item => ({
    Month: new Date(item.month + '-02').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    Revenue: item.revenue
  })) || []

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between">
      <div>
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">Organiser Console</h1>
              <p className="text-muted-foreground text-sm mt-1">Manage your events, analyze registrations, and check performance metrics</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => refetch()} className="h-9">
                <RefreshCw className="h-4 w-4 mr-1.5" /> Refresh Stats
              </Button>
              <Link to="/organiser/events/create" className="no-underline">
                <Button className="bg-violet-600 hover:bg-violet-700 text-white h-9">
                  <Calendar className="h-4 w-4 mr-1.5" /> Create Event
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats Section */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard title="Total Events" value={stats?.total_events || 0} icon={Calendar} color="violet" index={0} />
            <StatsCard title="Total Registrations" value={stats?.total_registrations || 0} icon={Users} color="blue" index={1} />
            <StatsCard title="Total Revenue" value={`₹${stats?.total_revenue?.toLocaleString('en-IN') || 0}`} icon={DollarSign} color="emerald" index={2} />
            <StatsCard title="Checked In" value={stats?.total_checkins || 0} icon={QrCode} color="amber" index={3} />
          </div>

          <div className="grid gap-8 lg:grid-cols-3 mt-8">
            {/* Chart */}
            <Card className="lg:col-span-2 border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-violet-600" />
                  Monthly Earnings
                </CardTitle>
                <CardDescription>Visual summary of total revenue generated per month</CardDescription>
              </CardHeader>
              <CardContent className="h-[280px]">
                {formattedChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={formattedChartData}>
                      <XAxis dataKey="Month" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                      <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Revenue']} contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                      <Bar dataKey="Revenue" fill="#7c3aed" radius={[4, 4, 0, 0]} maxBarSize={45} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-xs">
                    No payment history found yet.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Quick Shortcuts</CardTitle>
                <CardDescription>Easily navigate your console management tools</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {[
                  { to: '/organiser/events', label: 'Manage All Events', icon: Calendar, desc: 'Update details, check-in, or delete' },
                  { to: '/organiser/payouts', label: 'Payout History', icon: DollarSign, desc: 'View requested and completed payouts' },
                  { to: '/dashboard/profile', label: 'Console Profile Settings', icon: Users, desc: 'Edit public organiser information' },
                ].map((shortcut) => (
                  <Link key={shortcut.to} to={shortcut.to} className="no-underline">
                    <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/50 bg-card hover:border-violet-300 hover:bg-violet-50/20 transition-all cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="bg-violet-100 dark:bg-violet-950/40 text-violet-600 p-2 rounded-lg">
                          <shortcut.icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold">{shortcut.label}</p>
                          <p className="text-[10px] text-muted-foreground">{shortcut.desc}</p>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Recent Events List */}
          <div className="mt-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Your Active Events</h2>
              <Link to="/organiser/events" className="no-underline">
                <Button variant="ghost" size="sm">View All Events <ArrowRight className="ml-1 h-3.5 w-3.5" /></Button>
              </Link>
            </div>

            {!events || events.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="No events created"
                description="Create your first event to start accepting ticket bookings!"
                action={<Link to="/organiser/events/create"><Button className="bg-violet-600 hover:bg-violet-700 text-white">Create an Event</Button></Link>}
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {events.slice(0, 3).map((event: any) => {
                  const totalCapacity = event.capacity || 0
                  const totalTicketsSold = event.ticket_types?.reduce((acc: number, t: any) => acc + (t.sold_count || 0), 0) || 0
                  const percentSold = totalCapacity > 0 ? Math.min(100, Math.round((totalTicketsSold / totalCapacity) * 100)) : 0

                  return (
                    <Card key={event.id} className="overflow-hidden hover:shadow-md transition-all border-border/50 flex flex-col justify-between">
                      <div>
                        <div className="h-32 bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-950 dark:to-indigo-950 flex items-center justify-center relative">
                          {event.banner_url ? (
                            <img src={event.banner_url} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <Calendar className="h-8 w-8 text-violet-400/50" />
                          )}
                          <span className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                            event.status === 'published'
                              ? 'bg-emerald-500 text-white'
                              : event.status === 'draft'
                              ? 'bg-slate-500 text-white'
                              : 'bg-rose-500 text-white'
                          }`}>
                            {event.status}
                          </span>
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-sm line-clamp-1">{event.title}</h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(event.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                          <div className="mt-4 space-y-1.5">
                            <div className="flex justify-between text-[11px] font-medium">
                              <span>Tickets Sold</span>
                              <span>{totalTicketsSold} / {totalCapacity || 'Unlimited'} ({percentSold}%)</span>
                            </div>
                            {totalCapacity > 0 && (
                              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-violet-600 h-full transition-all" style={{ width: `${percentSold}%` }} />
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </div>

                      <div className="p-4 pt-0 border-t border-border/50 mt-4 flex items-center justify-between">
                        <Link to="/events/$slug" params={{ slug: event.slug }} className="text-xs font-semibold text-violet-600 hover:text-violet-700 no-underline inline-flex items-center">
                          <Eye className="h-3.5 w-3.5 mr-1" /> Preview Page
                        </Link>
                        <div className="flex gap-2">
                          <Link to="/organiser/events/$eventId/checkin" params={{ eventId: event.id }} className="no-underline">
                            <Button size="sm" variant="outline" className="h-8 px-2.5 text-xs font-semibold">
                              <QrCode className="h-3 w-3 mr-1" /> Check-In
                            </Button>
                          </Link>
                          <Link to="/organiser/events/$eventId/attendees" params={{ eventId: event.id }} className="no-underline">
                            <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-white h-8 px-2.5 text-xs font-semibold">
                              Attendees
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}
