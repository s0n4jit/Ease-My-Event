import { createFileRoute, Link } from '@tanstack/react-router'
import { DollarSign, ArrowLeft, RefreshCw, CheckCircle, Clock, XCircle } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '#/components/ui/table'
import { Navbar } from '#/components/shared/Navbar'
import { Footer } from '#/components/shared/Footer'
import { EmptyState } from '#/components/shared/EmptyState'
import { PageLoader } from '#/components/shared/LoadingSpinner'
import { AuthGuard } from '#/components/auth/AuthGuard'
import { useAuth } from '#/hooks/use-auth'
import { useOrganiserPayouts } from '#/hooks/use-organiser'
import { Badge } from '#/components/ui/badge'

export const Route = createFileRoute('/organiser/payouts')({
  meta: () => [
    { title: 'Payout Management | EaseMyEvent' },
    { name: 'robots', content: 'noindex, nofollow' }
  ],
  component: () => (
    <AuthGuard allowedRoles={['organiser', 'admin']}>
      <OrganiserPayoutsPage />
    </AuthGuard>
  ),
})

function OrganiserPayoutsPage() {
  const { user } = useAuth()
  const { data, isLoading, refetch } = useOrganiserPayouts(user?.id)
  const payouts = (data as any[]) || []

  if (isLoading) return <><Navbar /><PageLoader /><Footer /></>

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 border-none gap-1"><CheckCircle className="h-3 w-3" /> Completed</Badge>
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400 border-none gap-1"><Clock className="h-3 w-3" /> Processing</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400 border-none gap-1"><XCircle className="h-3 w-3" /> Failed</Badge>
      default:
        return <Badge className="bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-400 border-none gap-1"><Clock className="h-3 w-3" /> Pending</Badge>
    }
  }

  const totalDisbursed = payouts
    ?.filter(p => p.status === 'completed')
    ?.reduce((sum, p) => sum + Number(p.amount), 0) || 0

  const totalPending = payouts
    ?.filter(p => p.status === 'pending' || p.status === 'processing')
    ?.reduce((sum, p) => sum + Number(p.amount), 0) || 0

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between">
      <div>
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center gap-4">
            <Link to="/organiser" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">Payout History</h1>
              <p className="text-muted-foreground text-sm mt-1">Review event earnings distributions and transaction references</p>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
            <Card className="border-border/50 shadow-sm bg-emerald-50/20 dark:bg-emerald-950/10">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs font-semibold uppercase text-emerald-600">Total Settled</CardDescription>
                <CardTitle className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">₹{totalDisbursed.toLocaleString('en-IN')}</CardTitle>
              </CardHeader>
            </Card>

            <Card className="border-border/50 shadow-sm bg-blue-50/20 dark:bg-blue-950/10">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs font-semibold uppercase text-blue-600">Pending Settlement</CardDescription>
                <CardTitle className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">₹{totalPending.toLocaleString('en-IN')}</CardTitle>
              </CardHeader>
            </Card>

            <Card className="border-border/50 shadow-sm">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold">Payment Inquiries</h4>
                  <p className="text-xs text-muted-foreground mt-1">Contact accounts at billing@easemyevent.local for settlement concerns.</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {payouts && payouts.length > 0 ? (
            <Card className="border-border/50 shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Requested Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Transaction ID / Reference</TableHead>
                    <TableHead>Settled Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payouts.map((payout: any) => (
                    <TableRow key={payout.id}>
                      <TableCell className="font-semibold text-xs">{payout.event?.title || 'System Payout'}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{new Date(payout.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="font-bold text-xs">₹{Number(payout.amount).toLocaleString('en-IN')}</TableCell>
                      <TableCell>{getStatusBadge(payout.status)}</TableCell>
                      <TableCell className="font-mono text-[10px] text-muted-foreground">{payout.transaction_id || 'N/A'}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {payout.processed_at ? new Date(payout.processed_at).toLocaleDateString() : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          ) : (
            <EmptyState
              icon={DollarSign}
              title="No payouts recorded"
              description="Payouts will be automatically scheduled and shown here after your events conclude successfully!"
            />
          )}
        </main>
      </div>
      <Footer />
    </div>
  )
}
