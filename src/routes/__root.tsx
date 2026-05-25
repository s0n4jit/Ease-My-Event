import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
  Outlet,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'
import { Toaster } from 'sonner'
import { TooltipProvider } from '#/components/ui/tooltip'

import appCss from '../styles.css?url'
import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'EventSphere' },
      { name: 'description', content: 'AI-Powered Event Management & Ticketing Platform for discovering, creating, managing, and attending events with intelligent recommendations, seamless ticketing, QR-based check-ins, and organiser analytics.' },
      { name: 'keywords', content: 'event management, event ticketing, conference platform, meetup platform, hackathon platform, event registration, event booking, ticket management, organiser dashboard, AI recommendations, event discovery, QR ticketing, event analytics' },
      { name: 'author', content: 'EventSphere Team' },
      { name: 'robots', content: 'index, follow' },
      
      // Open Graph / Facebook
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: 'https://event-sphere.vercel.app/' },
      { property: 'og:title', content: 'EventSphere' },
      { property: 'og:description', content: 'AI-Powered Event Management & Ticketing Platform' },
      { property: 'og:image', content: '/og-image.png' },
      
      // Twitter
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:url', content: 'https://event-sphere.vercel.app/' },
      { name: 'twitter:title', content: 'EventSphere' },
      { name: 'twitter:description', content: 'AI-Powered Event Management & Ticketing Platform' },
      { name: 'twitter:image', content: '/og-image.png' },
      
      // Browser PWA Metadata
      { name: 'theme-color', content: '#6D28D9' },
      { name: 'application-name', content: 'EventSphere' },
      { name: 'apple-mobile-web-app-title', content: 'EventSphere' },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' }
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap' },
      { rel: 'icon', type: 'image/x-icon', href: '/assets/favicon/favicon.ico' },
      { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/assets/favicon/favicon-16x16.png' },
      { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/assets/favicon/favicon-32x32.png' },
      { rel: 'apple-touch-icon', sizes: '180x180', href: '/assets/favicon/apple-touch-icon.png' },
      { rel: 'manifest', href: '/assets/favicon/site.webmanifest' },
    ],
    scripts: [
      { src: 'https://checkout.razorpay.com/v1/checkout.js', async: true },
    ],
  }),
  component: RootComponent,
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://event-sphere.vercel.app/#organization",
        "name": "EventSphere",
        "url": "https://event-sphere.vercel.app/",
        "logo": {
          "@type": "ImageObject",
          "url": "https://event-sphere.vercel.app/assets/Event_Sphere_logo.png"
        },
        "description": "AI-Powered Event Management & Ticketing Platform"
      },
      {
        "@type": "WebSite",
        "@id": "https://event-sphere.vercel.app/#website",
        "url": "https://event-sphere.vercel.app/",
        "name": "EventSphere",
        "description": "AI-Powered Event Management & Ticketing Platform"
      },
      {
        "@type": "SoftwareApplication",
        "@id": "https://event-sphere.vercel.app/#software",
        "name": "EventSphere",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "All",
        "url": "https://event-sphere.vercel.app/",
        "description": "AI-Powered Event Management & Ticketing Platform for discovering, creating, managing, and attending events with intelligent recommendations, seamless ticketing, QR-based check-ins, and organiser analytics."
      }
    ]
  }

  return (
    <html lang="en" className="antialiased">
      <head>
        <HeadContent />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-background font-sans text-foreground">
        {children}
        <Scripts />
      </body>
    </html>
  )
}

function RootComponent() {
  return (
    <TooltipProvider>
      <Outlet />
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'font-sans',
          style: { fontFamily: 'Inter, system-ui, sans-serif' },
        }}
        richColors
        closeButton
      />
      <TanStackDevtools
        config={{ position: 'bottom-right' }}
        plugins={[
          { name: 'Tanstack Router', render: <TanStackRouterDevtoolsPanel /> },
          TanStackQueryDevtools,
        ]}
      />
    </TooltipProvider>
  )
}
