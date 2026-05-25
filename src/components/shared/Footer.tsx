import { Link } from '@tanstack/react-router'
import { APP_NAME } from '#/lib/constants'

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background/60 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 text-lg font-bold no-underline">
              <img src="/assets/Event_Sphere_logo.png" alt="EventSphere Logo" className="h-7 w-auto" />
              <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                {APP_NAME}
              </span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Your premier event management and ticketing platform. Discover, create, and experience amazing events.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">Explore</h4>
            <ul className="space-y-2">
              <li><Link to="/events" className="text-sm text-muted-foreground hover:text-foreground no-underline transition-colors">Browse Events</Link></li>
              <li><Link to="/events" search={{ category: 'technology' }} className="text-sm text-muted-foreground hover:text-foreground no-underline transition-colors">Tech Events</Link></li>
              <li><Link to="/events" search={{ category: 'music' }} className="text-sm text-muted-foreground hover:text-foreground no-underline transition-colors">Music Events</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">Organise</h4>
            <ul className="space-y-2">
              <li><Link to="/organiser/events/create" className="text-sm text-muted-foreground hover:text-foreground no-underline transition-colors">Create Event</Link></li>
              <li><Link to="/organiser" className="text-sm text-muted-foreground hover:text-foreground no-underline transition-colors">Dashboard</Link></li>
              <li><Link to="/auth/signup" className="text-sm text-muted-foreground hover:text-foreground no-underline transition-colors">Become Organiser</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">Support</h4>
            <ul className="space-y-2">
              <li><span className="text-sm text-muted-foreground">help@eventsphere.com</span></li>
              <li><span className="text-sm text-muted-foreground">Terms of Service</span></li>
              <li><span className="text-sm text-muted-foreground">Privacy Policy</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border/40 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground">Built with ❤️ for hackathon</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
