import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { Input } from '#/components/ui/input'
import { Button } from '#/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '#/components/ui/select'
import { Navbar } from '#/components/shared/Navbar'
import { Footer } from '#/components/shared/Footer'
import { EventCard } from '#/components/shared/EventCard'
import { EmptyState } from '#/components/shared/EmptyState'
import { LoadingSpinner } from '#/components/shared/LoadingSpinner'
import { useEvents, useCategories } from '#/hooks/use-events'
import { CATEGORY_ICONS } from '#/lib/constants'

export const Route = createFileRoute('/events/')({
  meta: () => [
    { title: 'Browse Events | EaseMyEvent' },
    { name: 'description', content: 'Explore our catalog of exciting technology, music, business, arts, and photography events. Secure your seats with ease.' },
    { name: 'keywords', content: 'browse events, local meetups, corporate events, tickets booking' }
  ],
  component: EventsPage,
  validateSearch: (search: Record<string, unknown>) => ({
    search: (search.search as string) || undefined,
    category: (search.category as string) || undefined,
    city: (search.city as string) || undefined,
    event_type: (search.event_type as string) || undefined,
    sort_by: (search.sort_by as string) || undefined,
    page: search.page ? Number(search.page) : undefined,
  } as {
    search?: string
    category?: string
    city?: string
    event_type?: string
    sort_by?: string
    page?: number
  }),
})

function EventsPage() {
  const searchParams = Route.useSearch()
  const navigate = useNavigate()
  const [localSearch, setLocalSearch] = useState(searchParams.search || '')

  const { data: categoriesData } = useCategories()
  const categories = categoriesData || []

  const { data, isLoading } = useEvents({
    search: searchParams.search || '',
    category: searchParams.category || '',
    city: searchParams.city || '',
    event_type: searchParams.event_type as 'online' | 'offline' | 'hybrid' | undefined,
    sort_by: (searchParams.sort_by || 'start_date') as 'start_date' | 'created_at' | 'title',
    page: searchParams.page || 1,
  })

  const events = data?.events || []
  const totalPages = data?.totalPages || 1

  const updateSearch = (updates: Record<string, unknown>) => {
    navigate({
      to: '/events',
      search: { ...searchParams, page: 1, ...updates },
    })
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateSearch({ search: localSearch })
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold">Browse Events</h1>
          <p className="mt-1 text-muted-foreground">Discover events happening around you</p>
        </motion.div>

        {/* Search & Filters */}
        <div className="mb-8 space-y-4">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit">Search</Button>
          </form>

          <div className="flex flex-wrap items-center gap-3">
            <Select
              value={searchParams.category}
              onValueChange={(v) => updateSearch({ category: v === 'all' ? '' : v })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    {CATEGORY_ICONS[c.icon] || '🏷️'} {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={searchParams.event_type}
              onValueChange={(v) => updateSearch({ event_type: v === 'all' ? '' : v })}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="offline">🏢 Offline</SelectItem>
                <SelectItem value="online">🌐 Online</SelectItem>
                <SelectItem value="hybrid">🔄 Hybrid</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="City"
              value={searchParams.city}
              onChange={(e) => updateSearch({ city: e.target.value })}
              className="w-[160px]"
            />

            <Select
              value={searchParams.sort_by}
              onValueChange={(v) => updateSearch({ sort_by: v })}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="start_date">Date</SelectItem>
                <SelectItem value="created_at">Newest</SelectItem>
                <SelectItem value="title">Title</SelectItem>
              </SelectContent>
            </Select>

            {(searchParams.search || searchParams.category || searchParams.city || searchParams.event_type) && (
              <Button variant="ghost" size="sm" onClick={() => {
                setLocalSearch('')
                navigate({ to: '/events', search: {} })
              }}>
                Clear Filters
              </Button>
            )}
          </div>

          {data && (
            <p className="text-sm text-muted-foreground">
              Showing {events.length} of {data.total} events
            </p>
          )}
        </div>

        {/* Events Grid */}
        {isLoading ? (
          <LoadingSpinner text="Loading events..." />
        ) : events.length === 0 ? (
          <EmptyState
            title="No events found"
            description="Try adjusting your filters or search terms"
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event, i) => (
              <EventCard key={event.id} event={event} index={i} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={(searchParams.page || 1) <= 1}
              onClick={() => updateSearch({ page: (searchParams.page || 1) - 1 })}
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>
            <span className="px-4 text-sm text-muted-foreground">
              Page {searchParams.page || 1} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={(searchParams.page || 1) >= totalPages}
              onClick={() => updateSearch({ page: (searchParams.page || 1) + 1 })}
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
