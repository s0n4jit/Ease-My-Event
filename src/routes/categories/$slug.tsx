import { createFileRoute, Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { Calendar, ChevronLeft, Tag } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '#/lib/supabase'
import { Navbar } from '#/components/shared/Navbar'
import { Footer } from '#/components/shared/Footer'
import { EventCard } from '#/components/shared/EventCard'
import { PageLoader } from '#/components/shared/LoadingSpinner'
import { EmptyState } from '#/components/shared/EmptyState'
import { Button } from '#/components/ui/button'

export const Route = createFileRoute('/categories/$slug')({
  meta: ({ params }) => [
    { title: 'Category Events | EaseMyEvent' },
    { name: 'description', content: 'Browse specialized event listings belonging to this category on EaseMyEvent.' }
  ],
  component: CategoryEventsPage,
})

function CategoryEventsPage() {
  const { slug } = Route.useParams()

  // Fetch category details
  const { data: category, isLoading: loadingCategory } = useQuery({
    queryKey: ['categories', 'detail', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .single()
      if (error) throw error
      return data as any
    },
  })

  // Fetch events for this category
  const { data: events, isLoading: loadingEvents } = useQuery({
    queryKey: ['events', 'category', category?.id],
    queryFn: async () => {
      if (!category?.id) return [] as any[]
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          category:categories(*),
          organiser:users!events_organiser_id_fkey(id, full_name, avatar_url),
          ticket_types(id, name, price, quantity, sold_count, is_active)
        `)
        .eq('category_id', category.id)
        .eq('status', 'published')
        .order('start_date', { ascending: true })
      if (error) throw error
      return data as any[]
    },
    enabled: !!category?.id,
  })

  const isLoading = loadingCategory || loadingEvents

  if (isLoading) return <><Navbar /><PageLoader /><Footer /></>

  if (!category) {
    return (
      <div className="min-h-screen flex flex-col justify-between">
        <Navbar />
        <div className="mx-auto max-w-7xl px-4 py-16 flex flex-col items-center justify-center text-center">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Category Not Found</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">The category you are looking for does not exist or has been removed.</p>
          <Link to="/" className="mt-6 no-underline">
            <Button className="bg-violet-600 hover:bg-violet-700 text-white">Back to Home</Button>
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between">
      <div>
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link to="/events" className="inline-flex items-center text-sm font-semibold text-violet-600 dark:text-violet-400 no-underline hover:underline mb-4">
              <ChevronLeft className="h-4 w-4 mr-1" /> Back to all events
            </Link>
            
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 text-white shadow-xl">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl flex items-center gap-3">
                  <Tag className="h-8 w-8" />
                  {category.name}
                </h1>
                <p className="mt-2 text-violet-100/90 text-sm max-w-xl">
                  {category.description || `Browse our handpicked selection of incredible events matching the ${category.name} category.`}
                </p>
              </div>
              <div className="text-violet-100 text-xs font-semibold uppercase tracking-wider bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm self-start md:self-center shrink-0">
                {events?.length || 0} event{(events?.length || 0) !== 1 ? 's' : ''} available
              </div>
            </motion.div>
          </div>

          {events && events.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((event: any, i: number) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <EventCard event={event} />
                </motion.div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Calendar}
              title="No events found"
              description={`There are currently no active events scheduled under the ${category.name} category.`}
              action={<Link to="/events"><Button className="bg-violet-600 hover:bg-violet-700 text-white">Explore Other Categories</Button></Link>}
            />
          )}
        </main>
      </div>
      <Footer />
    </div>
  )
}
