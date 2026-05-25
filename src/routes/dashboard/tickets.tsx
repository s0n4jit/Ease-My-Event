import { createFileRoute, Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { QrCode, CreditCard, Calendar, MapPin } from 'lucide-react'
import { format } from 'date-fns'
import { QRCodeSVG } from 'qrcode.react'
import { Button } from '#/components/ui/button'
import { Card, CardContent } from '#/components/ui/card'
import { Badge } from '#/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '#/components/ui/dialog'
import { Navbar } from '#/components/shared/Navbar'
import { Footer } from '#/components/shared/Footer'
import { PageLoader } from '#/components/shared/LoadingSpinner'
import { EmptyState } from '#/components/shared/EmptyState'
import { AuthGuard } from '#/components/auth/AuthGuard'
import { useAuth } from '#/hooks/use-auth'
import { useMyTickets, usePaymentHistory } from '#/hooks/use-tickets'
import { CURRENCY_SYMBOL } from '#/lib/constants'

export const Route = createFileRoute('/dashboard/tickets')({
  meta: () => [
    { title: 'My Tickets | EventSphere' },
    { name: 'robots', content: 'noindex, nofollow' }
  ],
  component: () => <AuthGuard><TicketsPage /></AuthGuard>,
})

function TicketsPage() {
  const { user } = useAuth()
  const { data: registrations, isLoading } = useMyTickets(user?.id)
  const { data: payments } = usePaymentHistory(user?.id)

  if (isLoading) return <><Navbar /><PageLoader /><Footer /></>

  const statusColor: Record<string, string> = {
    valid: 'bg-emerald-100 text-emerald-700',
    used: 'bg-blue-100 text-blue-700',
    cancelled: 'bg-red-100 text-red-700',
    refunded: 'bg-amber-100 text-amber-700',
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold mb-6">My Tickets</h1>

        <Tabs defaultValue="tickets">
          <TabsList>
            <TabsTrigger value="tickets">Tickets</TabsTrigger>
            <TabsTrigger value="payments">Payment History</TabsTrigger>
          </TabsList>

          <TabsContent value="tickets" className="mt-6">
            {!registrations || registrations.length === 0 ? (
              <EmptyState
                icon={QrCode}
                title="No tickets yet"
                description="Browse events and register to get your first ticket"
                action={<Link to="/events"><Button>Browse Events</Button></Link>}
              />
            ) : (
              <div className="space-y-4">
                {registrations.map((reg: any, i: number) => (
                  <motion.div key={reg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card className="border-border/50">
                      <CardContent className="p-5">
                        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                          <div className="flex-1">
                            <Link to="/events/$slug" params={{ slug: reg.event?.slug || '' }} className="no-underline">
                              <h3 className="font-semibold text-base hover:text-violet-600 transition-colors">{reg.event?.title}</h3>
                            </Link>
                            <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                {reg.event?.start_date ? format(new Date(reg.event.start_date), 'MMM d, yyyy') : 'N/A'}
                              </span>
                              {reg.event?.city && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3.5 w-3.5" />
                                  {reg.event.city}
                                </span>
                              )}
                            </div>

                            <div className="mt-3 flex flex-wrap gap-2">
                              {reg.tickets?.map((ticket: any) => (
                                <Dialog key={ticket.id}>
                                  <DialogTrigger asChild>
                                    <button className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors hover:opacity-80 ${statusColor[ticket.status] || 'bg-gray-100'}`}>
                                      <QrCode className="h-3 w-3" />
                                      {ticket.ticket_type?.name || 'Ticket'} — {ticket.status}
                                    </button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-sm">
                                    <DialogHeader>
                                      <DialogTitle>Ticket QR Code</DialogTitle>
                                    </DialogHeader>
                                    <div className="flex flex-col items-center gap-4 py-4">
                                      <div className="rounded-2xl bg-white p-4 shadow-lg">
                                        <QRCodeSVG value={ticket.qr_code} size={200} level="H" />
                                      </div>
                                      <div className="text-center">
                                        <p className="font-semibold">{reg.event?.title}</p>
                                        <p className="text-sm text-muted-foreground">{ticket.ticket_type?.name}</p>
                                        <p className="text-xs text-muted-foreground mt-1 font-mono">{ticket.qr_code}</p>
                                        <Badge className={`mt-2 ${statusColor[ticket.status]}`}>{ticket.status}</Badge>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              ))}
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="text-lg font-bold">
                              {Number(reg.total_amount) === 0 ? 'Free' : `${CURRENCY_SYMBOL}${reg.total_amount}`}
                            </p>
                            <Badge variant="outline" className="mt-1 capitalize">{reg.status}</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="payments" className="mt-6">
            {!payments || payments.length === 0 ? (
              <EmptyState icon={CreditCard} title="No payment history" description="Your payment records will appear here" />
            ) : (
              <div className="space-y-3">
                {payments.map((payment: any) => (
                  <Card key={payment.id} className="border-border/50">
                    <CardContent className="flex items-center justify-between p-4">
                      <div>
                        <p className="text-sm font-semibold">{payment.registration?.event?.title || 'Event'}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(payment.created_at), 'MMM d, yyyy • h:mm a')}
                        </p>
                        {payment.razorpay_payment_id && (
                          <p className="text-xs text-muted-foreground font-mono mt-0.5">
                            ID: {payment.razorpay_payment_id}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{CURRENCY_SYMBOL}{payment.amount}</p>
                        <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'} className="capitalize text-[10px]">
                          {payment.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  )
}
