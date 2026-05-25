import { createFileRoute, Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { Search, ArrowRight, Calendar, Users, Sparkles, TrendingUp, Star, Zap, Globe } from 'lucide-react'
import { useState } from 'react'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Badge } from '#/components/ui/badge'
import { Card, CardContent } from '#/components/ui/card'
import { Navbar } from '#/components/shared/Navbar'
import { Footer } from '#/components/shared/Footer'
import { EventCard } from '#/components/shared/EventCard'
import { useEvents, useCategories, useFeaturedEvents } from '#/hooks/use-events'
import { CATEGORY_ICONS } from '#/lib/constants'
import { useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  meta: () => [
    { title: 'Discover Amazing Events | EventSphere' },
    { name: 'description', content: 'Discover local and global events, book tickets securely with Razorpay, and get smart AI-powered recommendations with EventSphere.' },
    { name: 'keywords', content: 'events discovery, AI ticketing, book tickets, tech meetups' },
  ],
  component: LandingPage,
})

function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()
  const { data: categoriesData } = useCategories()
  const { data: featuredData } = useFeaturedEvents()
  const { data: recentData } = useEvents({ limit: 6, sort_by: 'created_at', sort_order: 'desc' })

  const categories = categoriesData || []
  const featured = featuredData?.events || []
  const recent = recentData?.events || []

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate({ to: '/events', search: { search: searchQuery } })
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 via-transparent to-indigo-600/5" />
          <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-violet-400/10 blur-3xl" />
          <div className="absolute top-40 right-10 h-96 w-96 rounded-full bg-indigo-400/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-64 w-[800px] rounded-full bg-purple-400/5 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center"
          >
            <Badge className="mb-6 border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-300 px-3 py-1">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              AI-Powered Event Discovery
            </Badge>

            <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-7xl">
              <span className="block">Discover Events</span>
              <span className="block bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                That Inspire
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed sm:text-xl">
              Create, discover, and experience extraordinary events. From tech conferences to music festivals — your next unforgettable experience starts here.
            </p>

            <form onSubmit={handleSearch} className="mx-auto mt-10 flex max-w-xl items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search events, categories, cities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-12 pl-11 text-base rounded-xl border-border/60 bg-background/80 backdrop-blur-sm focus:border-violet-400 focus:ring-violet-400/20"
                />
              </div>
              <Button type="submit" size="lg" className="h-12 px-6 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25">
                Search
              </Button>
            </form>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <span className="text-sm text-muted-foreground">Popular:</span>
              {['Technology', 'Music', 'Business', 'Sports'].map(tag => (
                <Link
                  key={tag}
                  to="/events"
                  search={{ search: tag.toLowerCase() }}
                  className="no-underline"
                >
                  <Badge variant="secondary" className="cursor-pointer hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors">
                    {tag}
                  </Badge>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-border/40 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { icon: Calendar, label: 'Events Hosted', value: '10,000+', color: 'text-violet-600' },
              { icon: Users, label: 'Attendees', value: '500K+', color: 'text-blue-600' },
              { icon: Globe, label: 'Cities', value: '100+', color: 'text-emerald-600' },
              { icon: Star, label: 'Avg Rating', value: '4.8', color: 'text-amber-600' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <stat.icon className={`mx-auto h-6 w-6 ${stat.color} mb-2`} />
                <p className="text-2xl font-bold sm:text-3xl">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">Featured Events</h2>
              <p className="mt-1 text-muted-foreground">Hand-picked events you don't want to miss</p>
            </div>
            <Link to="/events" className="no-underline">
              <Button variant="ghost" className="group">
                View All <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((event, i) => (
              <EventCard key={event.id} event={event} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="bg-muted/20 border-y border-border/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold sm:text-3xl">Explore Categories</h2>
            <p className="mt-2 text-muted-foreground">Find events that match your interests</p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {categories.slice(0, 12).map((category, i) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to="/events"
                  search={{ category: category.id }}
                  className="no-underline"
                >
                  <Card className="group cursor-pointer border-border/50 transition-all hover:border-violet-300 hover:shadow-md hover:-translate-y-0.5">
                    <CardContent className="flex flex-col items-center gap-2 p-4 text-center">
                      <span className="text-2xl">{CATEGORY_ICONS[category.icon] || '🏷️'}</span>
                      <span className="text-xs font-medium group-hover:text-violet-600 transition-colors">{category.name}</span>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Events */}
      {recent.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">Recently Added</h2>
              <p className="mt-1 text-muted-foreground">Fresh events just listed on the platform</p>
            </div>
            <Link to="/events" className="no-underline">
              <Button variant="ghost" className="group">
                Browse All <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((event, i) => (
              <EventCard key={event.id} event={event} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* AI Showcase */}
      <section className="relative overflow-hidden border-y border-border/30">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600/5 to-indigo-600/5" />
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-10">
            <Badge className="mb-4 border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-300">
              <Zap className="mr-1.5 h-3.5 w-3.5" /> Powered by AI
            </Badge>
            <h2 className="text-2xl font-bold sm:text-3xl">Smart Event Discovery</h2>
            <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
              Our AI analyzes your preferences and past events to recommend the perfect experiences for you.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Sparkles,
                title: 'AI Recommendations',
                description: 'Get personalized event suggestions based on your interests and attendance history.',
              },
              {
                icon: TrendingUp,
                title: 'Smart Descriptions',
                description: 'Organisers can generate polished event descriptions from simple bullet points using AI.',
              },
              {
                icon: Calendar,
                title: 'Schedule Optimizer',
                description: 'AI builds optimal session schedules for multi-day events, maximizing audience engagement.',
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <Card className="h-full border-border/50 bg-background/60 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="mb-4 rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-950 dark:to-indigo-950 p-3 w-fit">
                      <feature.icon className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                    </div>
                    <h3 className="text-base font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-700 px-8 py-16 text-center text-white shadow-2xl shadow-violet-500/30 sm:px-16"
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA4KSIvPjwvc3ZnPg==')] opacity-50" />

          <div className="relative">
            <h2 className="text-3xl font-bold sm:text-4xl">Ready to Host Your Event?</h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-violet-100">
              Join thousands of organisers who trust EventSphere. Create your event in minutes and reach thousands of attendees.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/auth/signup">
                <Button size="lg" className="bg-white text-violet-700 hover:bg-violet-50 shadow-lg px-8 h-12 text-base font-semibold">
                  Get Started Free
                </Button>
              </Link>
              <Link to="/events">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 h-12 text-base">
                  Browse Events
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  )
}
