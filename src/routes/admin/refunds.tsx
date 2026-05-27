import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { ArrowLeft, Check, X, ShieldAlert, DollarSign, AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Card } from '#/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '#/components/ui/table'
import { Input } from '#/components/ui/input'
import { Textarea } from '#/components/ui/textarea'
import { Navbar } from '#/components/shared/Navbar'
import { Footer } from '#/components/shared/Footer'
import { EmptyState } from '#/components/shared/EmptyState'
import { PageLoader } from '#/components/shared/LoadingSpinner'
import { AuthGuard } from '#/components/auth/AuthGuard'
import { useAuth } from '#/hooks/use-auth'
import { useRefundRequests, useProcessRefund } from '#/hooks/use-organiser'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '#/components/ui/dialog'
import { Badge } from '#/components/ui/badge'
import { toast } from 'sonner'

export const Route = createFileRoute('/admin/refunds')({
  meta: () => [
    { title: 'Refund Management | EaseMyEvent' },
    { name: 'robots', content: 'noindex, nofollow' }
  ],
  component: () => (
    <AuthGuard allowedRoles={['admin']}>
      <AdminRefundsPage />
    </AuthGuard>
  ),
})

function AdminRefundsPage() {
  const { user } = useAuth()
  const { data: refunds, isLoading, refetch } = useRefundRequests()
  const processRefund = useProcessRefund()

  const [activeRequest, setActiveRequest] = useState<any | null>(null)
  const [decision, setDecision] = useState<'approved' | 'rejected'>('approved')
  const [adminNotes, setAdminNotes] = useState('')
  const [refundAmount, setRefundAmount] = useState('')

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

  const handleOpenAction = (req: any, statusDecision: 'approved' | 'rejected') => {
    setActiveRequest(req)
    setDecision(statusDecision)
    setAdminNotes('')
    setRefundAmount(String(req.registration?.total_amount || 0))
  }

  const handleProcess = async () => {
    if (!activeRequest) return
    try {
      await processRefund.mutateAsync({
        id: activeRequest.id,
        status: decision,
        admin_notes: adminNotes,
        refund_amount: decision === 'approved' ? Number(refundAmount) : 0,
        processed_by: user!.id
      })
      toast.success(`Refund request ${decision} successfully!`)
      setActiveRequest(null)
      refetch()
    } catch (err: any) {
      toast.error(err.message || 'Failed to process refund request')
    }
  }

  if (isLoading) return <><Navbar /><PageLoader /><Footer /></>

  const refundsList = (refunds as any[]) || []
  const pendingRefunds = refundsList.filter(r => r.status === 'pending') || []
  const resolvedRefunds = refundsList.filter(r => r.status !== 'pending') || []

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
                <h1 className="text-2xl font-bold sm:text-3xl">Refund Claims</h1>
                <p className="text-muted-foreground text-sm mt-1">Review ticket cancellations, adjust payouts, and disburse refunds</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="h-9">
              <RefreshCw className="h-4 w-4 mr-1.5" /> Refresh Claims
            </Button>
          </div>

          {/* Pending requests */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <AlertCircle className="h-4.5 w-4.5 text-amber-500" />
              Awaiting Action ({pendingRefunds.length})
            </h3>

            {pendingRefunds.length > 0 ? (
              <Card className="border-border/50 shadow-sm overflow-hidden bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event Info</TableHead>
                      <TableHead>User / Attendee</TableHead>
                      <TableHead>Claim Amount</TableHead>
                      <TableHead>Cancellation Reason</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingRefunds.map((req: any) => (
                      <TableRow key={req.id}>
                        <TableCell className="font-semibold text-xs text-foreground/90">
                          {req.registration?.event?.title || 'Unknown Event'}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-xs font-semibold">{req.user?.full_name || 'Attendee'}</p>
                            <p className="text-[10px] text-muted-foreground">{req.user?.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-extrabold text-xs">
                          ₹{Number(req.registration?.total_amount || 0).toLocaleString('en-IN')}
                        </TableCell>
                        <TableCell className="text-xs max-w-xs truncate text-muted-foreground">{req.reason}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1.5">
                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-8 text-xs" onClick={() => handleOpenAction(req, 'approved')}>
                              <Check className="h-3.5 w-3.5 mr-1" /> Approve
                            </Button>
                            <Button size="sm" variant="destructive" className="font-bold h-8 text-xs" onClick={() => handleOpenAction(req, 'rejected')}>
                              <X className="h-3.5 w-3.5 mr-1" /> Reject
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
                icon={DollarSign}
                title="No pending requests"
                description="Perfect! All refund claims have been resolved."
              />
            )}
          </div>

          {/* Ledger History */}
          <div className="mt-12 space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Ledger Audit History</h3>
            {resolvedRefunds.length > 0 ? (
              <Card className="border-border/50 shadow-sm overflow-hidden bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event Info</TableHead>
                      <TableHead>User / Attendee</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Amount Settled</TableHead>
                      <TableHead>Resolution Notes</TableHead>
                      <TableHead>Processed At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resolvedRefunds.map((req: any) => (
                      <TableRow key={req.id}>
                        <TableCell className="font-semibold text-xs text-foreground/80">{req.registration?.event?.title || 'Unknown Event'}</TableCell>
                        <TableCell>
                          <div>
                            <p className="text-xs font-semibold">{req.user?.full_name}</p>
                            <p className="text-[10px] text-muted-foreground">{req.user?.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`border-none capitalize ${
                            req.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400'
                          }`}>
                            {req.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-extrabold text-xs">
                          ₹{Number(req.refund_amount || 0).toLocaleString('en-IN')}
                        </TableCell>
                        <TableCell className="text-xs max-w-xs truncate text-muted-foreground">{req.admin_notes || '—'}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(req.processed_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            ) : null}
          </div>
        </main>
      </div>
      <Footer />

      {/* Action Decision Dialog */}
      <Dialog open={!!activeRequest} onOpenChange={(open) => !open && setActiveRequest(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{decision === 'approved' ? 'Approve Refund' : 'Reject Refund'}</DialogTitle>
            <DialogDescription>
              Resolve claim submission for {activeRequest?.user?.full_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {decision === 'approved' && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Refund Amount (₹) *</label>
                <Input
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className="font-bold text-violet-600"
                />
              </div>
            )}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">Administrative Audit Notes</label>
              <Textarea
                placeholder="Details of audit or rejection reasons..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setActiveRequest(null)}>
              Cancel
            </Button>
            <Button onClick={handleProcess} className={decision === 'approved' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}>
              Submit Decision
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
