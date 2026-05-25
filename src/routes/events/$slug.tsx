import { createFileRoute } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { Calendar, MapPin, Clock, Globe, Heart, Share2, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'
import { Button } from '#/components/ui/button'
import { Badge } from '#/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import { Separator } from '#/components/ui/separator'
import { Navbar } from '#/components/shared/Navbar'
import { Footer } from '#/components/shared/Footer'
import { StarRating } from '#/components/shared/StarRating'
import { EventCard } from '#/components/shared/EventCard'
import { PageLoader } from '#/components/shared/LoadingSpinner'
import { EmptyState } from '#/components/shared/EmptyState'
import { useEvent, useSimilarEvents } from '#/hooks/use-events'
import { useEventReviews } from '#/hooks/use-reviews'
import { useIsWishlisted, useToggleWishlist } from '#/hooks/use-wishlist'
import { useAuth } from '#/hooks/use-auth'
import { CURRENCY_SYMBOL, CATEGORY_ICONS } from '#/lib/constants'
import { toast } from 'sonner'
import { useState } from 'react'
import { useCreateRegistration } from '#/hooks/use-tickets'
import { createRazorpayOrder, verifyRazorpayPayment, getRazorpayKeyId } from '#/server/razorpay'
import { supabase as supabaseClient } from '#/lib/supabase'
const supabase = supabaseClient as any

export const Route = createFileRoute('/events/$slug')({
  meta: ({ params }) => [
    { title: 'Event Details & Booking | EventSphere' },
    { name: 'description', content: 'Secure your tickets, view speaker profiles, and explore agendas for this premium listing on EventSphere.' }
  ],
  component: EventDetailPage,
})

function EventDetailPage() {
  const { slug } = Route.useParams()
  const { data: eventData, isLoading } = useEvent(slug)
  const event = eventData as any
  const { user, isAuthenticated } = useAuth()
  const { data: isWishlisted } = useIsWishlisted(event?.id || '', user?.id)
  const toggleWishlist = useToggleWishlist()
  const { data: reviews } = useEventReviews(event?.id || '')
  const { data: similarEventsData } = useSimilarEvents(event?.id || '', event?.category_id || null)
  const [selectedTickets, setSelectedTickets] = useState<Record<string, number>>({})
  const createRegistration = useCreateRegistration()
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  if (isLoading) return <><Navbar /><PageLoader /><Footer /></>
  if (!event) return <><Navbar /><EmptyState title="Event not found" /><Footer /></>

  const ticketTypes = (event as Record<string, unknown>).ticket_types as Array<{
    id: string; name: string; description: string | null; price: number; quantity: number; sold_count: number; is_active: boolean; sale_start: string | null; sale_end: string | null
  }> || []
  const speakers = (event as Record<string, unknown>).speakers as Array<{
    id: string; name: string; title: string | null; bio: string | null; image_url: string | null; linkedin_url: string | null
  }> || []
  const eventReviews = (reviews as any[]) || []
  const similarEvents = (similarEventsData as any[]) || []
  const organiser = (event as Record<string, unknown>).organiser as { id: string; full_name: string; avatar_url: string | null; bio: string | null; linkedin_url: string | null } | null
  const category = (event as Record<string, unknown>).category as { name: string; icon: string; slug: string } | null

  const totalAmount = Object.entries(selectedTickets).reduce((sum, [id, qty]) => {
    const ticket = ticketTypes.find(t => t.id === id)
    return sum + (ticket ? Number(ticket.price) * qty : 0)
  }, 0)

  const totalQty = Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0)

  const handleWishlistToggle = () => {
    if (!isAuthenticated || !user) {
      toast.error('Please sign in to add to wishlist')
      return
    }
    toggleWishlist.mutate({ eventId: event.id, userId: user.id, isWishlisted: !!isWishlisted })
  }

  const handleCheckout = async () => {
    if (!isAuthenticated || !user) {
      toast.error('Please sign in to purchase tickets')
      return
    }
    if (totalQty === 0) {
      toast.error('Please select at least one ticket')
      return
    }

    try {
      setIsCheckingOut(true)
      
      // Handle free registration bypass
      if (totalAmount === 0) {
        toast.loading('Processing free registration...')
        const ticketItems = Object.entries(selectedTickets)
          .filter(([_, qty]) => qty > 0)
          .map(([id, qty]) => ({ ticket_type_id: id, quantity: qty }))

        const registration = await createRegistration.mutateAsync({
          event_id: event.id,
          user_id: user.id,
          total_amount: 0,
          ticket_items: ticketItems,
        })

        // Free payment record
        const { error: payError } = await supabase
          .from('payments')
          .insert({
            registration_id: registration.id,
            user_id: user.id,
            amount: 0,
            currency: 'INR',
            status: 'completed',
            razorpay_order_id: 'FREE_EVENT',
            razorpay_payment_id: 'FREE_EVENT_' + Date.now(),
            razorpay_signature: 'FREE_EVENT',
          })

        if (payError) console.error('Payment DB Log Error:', payError)
        toast.dismiss()
        toast.success('Successfully registered for the event!')
        setSelectedTickets({})
        setIsCheckingOut(false)
        return
      }

      toast.loading('Initializing secure payment gateway...')

      // 1. Get Razorpay Key
      const { key_id } = await getRazorpayKeyId()
      if (!key_id) {
        toast.dismiss()
        toast.error('Payment gateway setup is incomplete. Please contact support.')
        setIsCheckingOut(false)
        return
      }

      // 2. Create Order in Razorpay via Server Function
      const receipt = `rcpt_${event.id.slice(0, 8)}_${Date.now()}`
      const order = await createRazorpayOrder({
        data: {
          amount: totalAmount,
          currency: 'INR',
          receipt,
          notes: {
            event_id: event.id,
            user_id: user.id,
          }
        }
      })

      toast.dismiss()

      // 3. Open Razorpay Checkout Dialog
      const options = {
        key: key_id,
        amount: order.amount,
        currency: order.currency,
        name: 'EventSphere',
        description: `Tickets for ${event.title}`,
        order_id: order.id,
        prefill: {
          name: user.full_name || '',
          email: user.email || '',
        },
        theme: {
          color: '#7c3aed',
        },
        modal: {
          ondismiss: function () {
            setIsCheckingOut(false)
            toast.info('Payment checkout dismissed.')
          }
        },
        handler: async function (response: any) {
          try {
            setIsCheckingOut(true)
            toast.loading('Verifying secure transaction...')

            // 4. Verify Razorpay Payment via Server Function
            const verification = await verifyRazorpayPayment({
              data: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }
            })

            if (!verification.verified) {
              toast.dismiss()
              toast.error('Secure verification failed. Please check transaction history.')
              setIsCheckingOut(false)
              return
            }

            // 5. Create Registration & Tickets
            const ticketItems = Object.entries(selectedTickets)
              .filter(([_, qty]) => qty > 0)
              .map(([id, qty]) => ({ ticket_type_id: id, quantity: qty }))

            const registration = await createRegistration.mutateAsync({
              event_id: event.id,
              user_id: user.id,
              total_amount: totalAmount,
              ticket_items: ticketItems,
            })

            // 6. Insert Completed Payment Record
            const { error: payError } = await supabase
              .from('payments')
              .insert({
                registration_id: registration.id,
                user_id: user.id,
                amount: totalAmount,
                currency: 'INR',
                status: 'completed',
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              })

            if (payError) {
              console.error('Payment DB Log Error:', payError)
            }

            toast.dismiss()
            toast.success('Your tickets have been successfully booked!')
            setSelectedTickets({})
          } catch (err: any) {
            console.error('Payment callback error:', err)
            toast.dismiss()
            toast.error(err.message || 'Verification or ticket generation failed.')
          } finally {
            setIsCheckingOut(false)
          }
        }
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.open()
    } catch (err: any) {
      console.error('Checkout error:', err)
      toast.dismiss()
      toast.error(err.message || 'Failed to initialize payment order.')
      setIsCheckingOut(false)
    }
  }

  const avgRating = eventReviews.length > 0
    ? eventReviews.reduce((sum, r) => sum + r.rating, 0) / eventReviews.length
    : 0

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Banner */}
      <div className="relative h-64 sm:h-80 lg:h-96 bg-gradient-to-br from-violet-600/20 to-indigo-600/20">
        {event.banner_url ? (
          <img src={event.banner_url} alt={event.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Calendar className="h-20 w-20 text-violet-300/50" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-border/50 shadow-xl">
                <CardContent className="p-6 sm:p-8">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    {category && (
                      <Badge variant="secondary">
                        {CATEGORY_ICONS[category.icon] || '🏷️'} {category.name}
                      </Badge>
                    )}
                    <Badge variant={event.event_type === 'online' ? 'default' : 'outline'}>
                      {event.event_type === 'online' ? '🌐 Online' : event.event_type === 'hybrid' ? '🔄 Hybrid' : '🏢 Offline'}
                    </Badge>
                  </div>

                  <h1 className="text-2xl font-bold sm:text-3xl lg:text-4xl">{event.title}</h1>

                  <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(event.start_date), 'MMM d, yyyy')} — {format(new Date(event.end_date), 'MMM d, yyyy')}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      {format(new Date(event.start_date), 'h:mm a')}
                    </span>
                    {event.city && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        {event.venue_name ? `${event.venue_name}, ${event.city}` : event.city}
                      </span>
                    )}
                    {event.online_url && (
                      <span className="flex items-center gap-1.5">
                        <Globe className="h-4 w-4" /> Online Event
                      </span>
                    )}
                  </div>

                  {avgRating > 0 && (
                    <div className="mt-3 flex items-center gap-2">
                      <StarRating value={Math.round(avgRating)} readonly size="sm" />
                      <span className="text-sm text-muted-foreground">
                        {avgRating.toFixed(1)} ({eventReviews.length} reviews)
                      </span>
                    </div>
                  )}

                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleWishlistToggle}>
                      <Heart className={`h-4 w-4 mr-1.5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                      {isWishlisted ? 'Wishlisted' : 'Wishlist'}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => {
                      navigator.clipboard.writeText(window.location.href)
                      toast.success('Link copied!')
                    }}>
                      <Share2 className="h-4 w-4 mr-1.5" /> Share
                    </Button>
                  </div>

                  <Separator className="my-6" />

                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <h3 className="text-lg font-semibold mb-2">About This Event</h3>
                    <div className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                      {event.description || 'No description available.'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Speakers */}
            {speakers.length > 0 && (
              <Card className="border-border/50">
                <CardHeader><CardTitle>Speakers</CardTitle></CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  {speakers.map(speaker => (
                    <div key={speaker.id} className="flex gap-3 rounded-xl border border-border/50 p-4">
                      <Avatar className="h-14 w-14 shrink-0">
                        <AvatarImage src={speaker.image_url || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-500 text-white">
                          {speaker.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{speaker.name}</p>
                        {speaker.title && <p className="text-xs text-muted-foreground">{speaker.title}</p>}
                        {speaker.bio && <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{speaker.bio}</p>}
                        {speaker.linkedin_url && (
                          <a href={speaker.linkedin_url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-violet-600 no-underline hover:underline">
                            <ExternalLink className="h-3 w-3" /> LinkedIn
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Reviews */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Reviews ({eventReviews.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {eventReviews.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No reviews yet. Be the first to review!</p>
                ) : (
                  <div className="space-y-4">
                    {eventReviews.map(review => {
                      const reviewer = (review as Record<string, unknown>).user as { full_name: string; avatar_url: string | null } | null
                      return (
                        <div key={review.id} className="flex gap-3 rounded-xl border border-border/40 p-4">
                          <Avatar className="h-9 w-9 shrink-0">
                            <AvatarImage src={reviewer?.avatar_url || undefined} />
                            <AvatarFallback className="text-xs">{reviewer?.full_name?.slice(0, 2).toUpperCase() || 'U'}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold">{reviewer?.full_name}</span>
                              <StarRating value={review.rating} readonly size="sm" />
                            </div>
                            {review.comment && <p className="mt-1 text-sm text-muted-foreground">{review.comment}</p>}
                            <p className="mt-1 text-xs text-muted-foreground">{format(new Date(review.created_at), 'MMM d, yyyy')}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Ticket Selector */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="border-border/50 shadow-xl sticky top-24">
                <CardHeader>
                  <CardTitle className="text-lg">Select Tickets</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {ticketTypes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No tickets available</p>
                  ) : (
                    ticketTypes.filter(t => t.is_active).map(ticket => {
                      const available = ticket.quantity - ticket.sold_count
                      const qty = selectedTickets[ticket.id] || 0
                      return (
                        <div key={ticket.id} className="rounded-xl border border-border/50 p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-semibold text-sm">{ticket.name}</p>
                              {ticket.description && <p className="text-xs text-muted-foreground mt-0.5">{ticket.description}</p>}
                              <p className="mt-1 text-lg font-bold text-violet-600">
                                {Number(ticket.price) === 0 ? 'Free' : `${CURRENCY_SYMBOL}${ticket.price}`}
                              </p>
                              <p className="text-[11px] text-muted-foreground">{available} remaining</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                disabled={qty <= 0}
                                onClick={() => setSelectedTickets(prev => ({ ...prev, [ticket.id]: Math.max(0, qty - 1) }))}
                              >
                                -
                              </Button>
                              <span className="w-6 text-center text-sm font-semibold">{qty}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                disabled={qty >= Math.min(available, 10)}
                                onClick={() => setSelectedTickets(prev => ({ ...prev, [ticket.id]: qty + 1 }))}
                              >
                                +
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}

                  {totalQty > 0 && (
                    <div className="border-t pt-3 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{totalQty} ticket{totalQty > 1 ? 's' : ''}</span>
                        <span className="font-bold">{totalAmount === 0 ? 'Free' : `${CURRENCY_SYMBOL}${totalAmount}`}</span>
                      </div>
                      <Button
                        className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700"
                        onClick={handleCheckout}
                        disabled={isCheckingOut}
                      >
                        {isCheckingOut ? 'Processing...' : totalAmount === 0 ? 'Register Now' : `Pay ${CURRENCY_SYMBOL}${totalAmount}`}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Organiser */}
            {organiser && (
              <Card className="border-border/50">
                <CardHeader><CardTitle className="text-sm">Organised by</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={organiser.avatar_url || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-500 text-white">
                        {organiser.full_name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{organiser.full_name}</p>
                      {organiser.bio && <p className="text-xs text-muted-foreground line-clamp-2">{organiser.bio}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Similar Events */}
        {similarEvents && similarEvents.length > 0 && (
          <section className="mt-12 mb-8">
            <h2 className="text-xl font-bold mb-6">Similar Events</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {similarEvents.map((event, i) => (
                <EventCard key={event.id} event={event as any} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>

      <Footer />
    </div>
  )
}
