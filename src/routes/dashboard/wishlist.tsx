import { createFileRoute, Link } from '@tanstack/react-router'
import { Heart } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Navbar } from '#/components/shared/Navbar'
import { Footer } from '#/components/shared/Footer'
import { EventCard } from '#/components/shared/EventCard'
import { PageLoader } from '#/components/shared/LoadingSpinner'
import { EmptyState } from '#/components/shared/EmptyState'
import { AuthGuard } from '#/components/auth/AuthGuard'
import { useAuth } from '#/hooks/use-auth'
import { useWishlist } from '#/hooks/use-wishlist'

export const Route = createFileRoute('/dashboard/wishlist')({
  meta: () => [
    { title: 'My Wishlist | EaseMyEvent' },
    { name: 'robots', content: 'noindex, nofollow' }
  ],
  component: () => <AuthGuard><WishlistPage /></AuthGuard>,
})

function WishlistPage() {
  const { user } = useAuth()
  const { data: wishlist, isLoading } = useWishlist(user?.id)

  if (isLoading) return <><Navbar /><PageLoader /><Footer /></>

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold mb-6">My Wishlist</h1>
        {!wishlist || wishlist.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="Your wishlist is empty"
            description="Save events you're interested in to access them later"
            action={<Link to="/events"><Button>Browse Events</Button></Link>}
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {wishlist.map((item: any, i: number) => (
              item.event && <EventCard key={item.id} event={item.event} index={i} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
