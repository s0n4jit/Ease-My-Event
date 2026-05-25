import { Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { Calendar, MapPin } from 'lucide-react'
import { Badge } from '#/components/ui/badge'
import { Card, CardContent } from '#/components/ui/card'
import { format } from 'date-fns'
import { CURRENCY_SYMBOL, CATEGORY_ICONS } from '#/lib/constants'
import type { Tables } from '#/types/database'

interface EventCardProps {
  event: Tables<'events'> & {
    category?: Tables<'categories'> | null
    ticket_types?: Pick<Tables<'ticket_types'>, 'id' | 'price'>[]
  }
  index?: number
}

export function EventCard({ event, index = 0 }: EventCardProps) {
  const minPrice = event.ticket_types?.length
    ? Math.min(...event.ticket_types.map(t => Number(t.price)))
    : 0
  const isFree = minPrice === 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
    >
      <Link to="/events/$slug" params={{ slug: event.slug }} className="no-underline group block">
        <Card className="overflow-hidden border-border/50 transition-all duration-300 hover:border-violet-300 hover:shadow-xl hover:shadow-violet-100/50 dark:hover:shadow-violet-900/20 hover:-translate-y-1">
          <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-950 dark:to-indigo-950">
            {event.banner_url ? (
              <img
                src={event.banner_url}
                alt={event.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Calendar className="h-12 w-12 text-violet-400/50" />
              </div>
            )}

            <div className="absolute top-3 left-3 flex gap-1.5">
              {event.category && (
                <Badge className="bg-white/90 text-foreground text-[11px] backdrop-blur-sm border-0 shadow-sm">
                  {CATEGORY_ICONS[event.category.icon] || '🏷️'} {event.category.name}
                </Badge>
              )}
            </div>

            <div className="absolute top-3 right-3">
              <Badge
                className={`text-[11px] border-0 shadow-sm ${
                  isFree
                    ? 'bg-emerald-500/90 text-white'
                    : 'bg-violet-600/90 text-white'
                }`}
              >
                {isFree ? 'Free' : `${CURRENCY_SYMBOL}${minPrice}+`}
              </Badge>
            </div>

            {event.event_type !== 'offline' && (
              <div className="absolute bottom-3 right-3">
                <Badge variant="secondary" className="text-[10px] bg-blue-500/90 text-white border-0">
                  {event.event_type === 'online' ? '🌐 Online' : '🔄 Hybrid'}
                </Badge>
              </div>
            )}
          </div>

          <CardContent className="p-4">
            <h3 className="text-base font-semibold leading-snug line-clamp-2 group-hover:text-violet-600 transition-colors">
              {event.title}
            </h3>

            <div className="mt-3 space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5 shrink-0" />
                <span>{format(new Date(event.start_date), 'MMM d, yyyy • h:mm a')}</span>
              </div>

              {event.city && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{event.venue_name ? `${event.venue_name}, ${event.city}` : event.city}</span>
                </div>
              )}
            </div>

            {event.short_description && (
              <p className="mt-2.5 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                {event.short_description}
              </p>
            )}
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}
