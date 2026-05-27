import { createFileRoute, Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { Calendar, Users, DollarSign, ShieldAlert, FolderKanban, CheckSquare, ArrowRight, Shield } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/ui/card'
import { Navbar } from '#/components/shared/Navbar'
import { Footer } from '#/components/shared/Footer'
import { StatsCard } from '#/components/shared/StatsCard'
import { PageLoader } from '#/components/shared/LoadingSpinner'
import { AuthGuard } from '#/components/auth/AuthGuard'
import { useAuth } from '#/hooks/use-auth'
import { useAdminStats } from '#/hooks/use-admin'

export const Route = createFileRoute('/admin/')({
  meta: () => [
    { title: 'Admin Console | EaseMyEvent' },
    { name: 'robots', content: 'noindex, nofollow' }
  ],
  component: () => (
    <AuthGuard allowedRoles={['admin']}>
      <AdminDashboardPage />
    </AuthGuard>
  ),
})

function AdminDashboardPage() {
  const { user } = useAuth()
  
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

  const { data: stats, isLoading, refetch } = useAdminStats()

  if (isLoading) return <><Navbar /><PageLoader /><Footer /></>

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between">
      <div>
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold sm:text-3xl flex items-center gap-2">
                <Shield className="h-7 w-7 text-violet-600" />
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground text-sm mt-1">Platform management console. Monitor system growth, users, and ticket volumes.</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="h-9">
              Refresh Platform Stats
            </Button>
          </motion.div>

          {/* Core Metrics */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard title="Total Platform Users" value={stats?.total_users || 0} icon={Users} color="violet" index={0} />
            <StatsCard title="Listed Events" value={stats?.total_events || 0} icon={Calendar} color="blue" index={1} />
            <StatsCard title="Total Bookings" value={stats?.total_registrations || 0} icon={CheckSquare} color="emerald" index={2} />
            <StatsCard title="Platform Revenue" value={`₹${stats?.total_revenue?.toLocaleString('en-IN') || 0}`} icon={DollarSign} color="amber" index={3} />
          </div>

          {/* Platform Performance Comparative */}
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Monthly Intake Growth</CardTitle>
                <CardDescription>Volume comparison for new records created this calendar month</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-border/50">
                  <span className="text-xs font-semibold">New Registrations</span>
                  <span className="font-bold text-sm text-emerald-600">+{stats?.registrations_this_month || 0}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-border/50">
                  <span className="text-xs font-semibold">New Events Listed</span>
                  <span className="font-bold text-sm text-violet-600">+{stats?.events_this_month || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold">Invoiced Revenue</span>
                  <span className="font-bold text-sm text-amber-600">+₹{stats?.revenue_this_month?.toLocaleString('en-IN') || 0}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Administrative Actions</CardTitle>
                <CardDescription>Direct shortcuts to platform moderation sub-consoles</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {[
                  { to: '/admin/users', label: 'User Management', icon: Users, desc: `Disable users or assign admin/organiser privileges` },
                  { to: '/admin/events', label: 'Events Audit & Feature', icon: Calendar, desc: `Audit illegal content or toggle featured listings` },
                  { to: '/admin/categories', label: 'Categories Manager', icon: FolderKanban, desc: `Create and update public interest categories` },
                  { to: '/admin/refunds', label: 'Refund Requests Ledger', icon: DollarSign, desc: `${stats?.pending_refunds || 0} requests awaiting review` },
                ].map((action) => (
                  <Link key={action.to} to={action.to} className="no-underline">
                    <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card hover:border-violet-300 hover:bg-violet-50/20 transition-all cursor-pointer">
                      <div className="flex items-center gap-2.5">
                        <action.icon className="h-4 w-4 text-violet-600" />
                        <div>
                          <p className="text-xs font-semibold text-foreground/90">{action.label}</p>
                          <p className="text-[10px] text-muted-foreground">{action.desc}</p>
                        </div>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}
