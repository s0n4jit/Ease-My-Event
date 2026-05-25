import { createFileRoute } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { Bell, Check, CheckCheck } from 'lucide-react'
import { format } from 'date-fns'
import { Button } from '#/components/ui/button'
import { Card, CardContent } from '#/components/ui/card'
import { Navbar } from '#/components/shared/Navbar'
import { Footer } from '#/components/shared/Footer'
import { PageLoader } from '#/components/shared/LoadingSpinner'
import { EmptyState } from '#/components/shared/EmptyState'
import { AuthGuard } from '#/components/auth/AuthGuard'
import { useAuth } from '#/hooks/use-auth'
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '#/hooks/use-notifications'
import { useRealtimeNotifications } from '#/hooks/use-realtime'

export const Route = createFileRoute('/dashboard/notifications')({
  meta: () => [
    { title: 'Notifications | EventSphere' },
    { name: 'robots', content: 'noindex, nofollow' }
  ],
  component: () => <AuthGuard><NotificationsPage /></AuthGuard>,
})

function NotificationsPage() {
  const { user } = useAuth()
  const { data: notificationsData, isLoading } = useNotifications(user?.id)
  const notifications = (notificationsData as any[]) || []
  const markAsRead = useMarkAsRead()
  const markAllAsRead = useMarkAllAsRead()
  useRealtimeNotifications(user?.id)

  if (isLoading) return <><Navbar /><PageLoader /><Footer /></>

  const unreadCount = notifications.filter(n => !n.is_read).length || 0

  const typeIcon: Record<string, string> = {
    registration: '🎫', reminder: '⏰', cancellation: '❌', refund: '💰',
    review: '⭐', system: '🔔', checkin: '✅', payout: '💳',
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Notifications</h1>
            {unreadCount > 0 && <p className="text-sm text-muted-foreground mt-0.5">{unreadCount} unread</p>}
          </div>
          {unreadCount > 0 && user && (
            <Button variant="outline" size="sm" onClick={() => markAllAsRead.mutate(user.id)}>
              <CheckCheck className="h-4 w-4 mr-1.5" /> Mark All Read
            </Button>
          )}
        </div>

        {!notifications || notifications.length === 0 ? (
          <EmptyState icon={Bell} title="No notifications" description="You're all caught up!" />
        ) : (
          <div className="space-y-2">
            {notifications.map((notification, i) => (
              <motion.div key={notification.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                <Card className={`border-border/50 transition-colors ${!notification.is_read ? 'bg-violet-50/50 dark:bg-violet-950/20 border-violet-200/50' : ''}`}>
                  <CardContent className="flex items-start gap-3 p-4">
                    <span className="text-lg shrink-0 mt-0.5">{typeIcon[notification.type] || '🔔'}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!notification.is_read ? 'font-semibold' : 'font-medium'}`}>{notification.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notification.message}</p>
                      <p className="text-[11px] text-muted-foreground mt-1">{format(new Date(notification.created_at), 'MMM d, h:mm a')}</p>
                    </div>
                    {!notification.is_read && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => markAsRead.mutate(notification.id)}>
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
