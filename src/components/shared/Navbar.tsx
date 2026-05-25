import { Link } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Menu, X, Bell, LogOut, User, LayoutDashboard, Calendar, ChevronDown, Heart, Settings, Users, FolderKanban, DollarSign } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import { Badge } from '#/components/ui/badge'
import { useAuth, useSignOut } from '#/hooks/use-auth'
import { useUnreadCount } from '#/hooks/use-notifications'
import { APP_NAME } from '#/lib/constants'

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const { user, isAuthenticated, isOrganiser, isAdmin } = useAuth()
  const signOut = useSignOut()
  const { data: unreadCount } = useUnreadCount(user?.id)

  interface MenuItem {
    to: string
    label: string
    icon: React.ComponentType<{ className?: string }>
  }

  const menuItems: MenuItem[] = (() => {
    if (!isAuthenticated || !user) return []
    if (isAdmin) {
      return [
        { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/admin/users', label: 'Users', icon: Users },
        { to: '/admin/events', label: 'Events', icon: Calendar },
        { to: '/admin/categories', label: 'Categories', icon: FolderKanban },
        { to: '/admin/refunds', label: 'Refunds', icon: DollarSign },
        { to: '/dashboard/profile', label: 'Profile', icon: User },
        { to: '/dashboard/profile', label: 'Settings', icon: Settings },
      ]
    }
    if (isOrganiser) {
      return [
        { to: '/organiser', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/organiser/events', label: 'Manage Events', icon: Calendar },
        { to: '/dashboard/profile', label: 'Profile', icon: User },
        { to: '/dashboard/profile', label: 'Settings', icon: Settings },
      ]
    }
    // Attendee
    return [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/dashboard/tickets', label: 'My Tickets', icon: Calendar },
      { to: '/dashboard/wishlist', label: 'Wishlist', icon: Heart },
      { to: '/dashboard/profile', label: 'Profile', icon: User },
      { to: '/dashboard/profile', label: 'Settings', icon: Settings },
    ]
  })()

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight no-underline">
          <img src="/assets/Event_Sphere_logo.png" alt="EventSphere Logo" className="h-8 w-auto" />
          <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent hidden sm:inline">
            {APP_NAME}
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          <Link to="/events" className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground no-underline">
            Browse Events
          </Link>
          {isOrganiser && (
            <Link to="/organiser/events/create" className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground no-underline">
              Create Event
            </Link>
          )}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated && user ? (
            <>
              <Link to="/dashboard/notifications" className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground no-underline">
                <Bell className="h-5 w-5" />
                {(unreadCount ?? 0) > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </Link>

              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-accent"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar_url || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-500 text-xs text-white">
                      {user.full_name?.slice(0, 2).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-12 z-50 w-56 rounded-xl border bg-popover p-1.5 shadow-xl"
                      >
                        <div className="border-b px-3 py-2.5 mb-1.5">
                          <p className="text-sm font-semibold">{user.full_name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                          <Badge variant="secondary" className="mt-1 text-[10px] capitalize">{user.role}</Badge>
                        </div>

                        {menuItems.map((item) => (
                          <Link
                            key={`${item.label}-${item.to}`}
                            to={item.to}
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground no-underline transition-colors hover:bg-accent"
                          >
                            <item.icon className="h-4 w-4 text-muted-foreground" />
                            {item.label}
                          </Link>
                        ))}

                        <div className="mt-1.5 border-t pt-1.5">
                          <button
                            onClick={() => { signOut.mutate(); setDropdownOpen(false) }}
                            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30"
                          >
                            <LogOut className="h-4 w-4" /> Sign Out
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/auth/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link to="/auth/signup">
                <Button size="sm" className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>

        <button className="md:hidden rounded-lg p-2 hover:bg-accent" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t md:hidden"
          >
            <div className="space-y-1 px-4 py-3">
              <Link to="/events" onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-medium no-underline hover:bg-accent">
                Browse Events
              </Link>
              {isAuthenticated ? (
                <>
                  {menuItems.map((item) => (
                    <Link
                      key={`mobile-${item.label}-${item.to}`}
                      to={item.to}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium no-underline hover:bg-accent"
                    >
                      <item.icon className="h-4 w-4 text-muted-foreground" />
                      {item.label}
                    </Link>
                  ))}
                  <button onClick={() => { signOut.mutate(); setMobileOpen(false) }} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50">
                    <LogOut className="h-4 w-4 text-red-600" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/auth/login" onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-medium no-underline hover:bg-accent">
                    Sign In
                  </Link>
                  <Link to="/auth/signup" onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-violet-600 no-underline hover:bg-accent">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
