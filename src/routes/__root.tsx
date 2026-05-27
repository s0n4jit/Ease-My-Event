import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { Toaster } from "sonner";
import { TooltipProvider } from "#/components/ui/tooltip";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";
import appCss from "../styles.css?url";

interface MyRouterContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{ title: "EaseMyEvent" },
			{
				name: "description",
				content:
					"AI-Powered Event Management & Ticketing Platform for discovering, creating, managing, and attending events with intelligent recommendations, seamless ticketing, QR-based check-ins, and organiser analytics.",
			},
			{
				name: "keywords",
				content:
					"event management, event ticketing, conference platform, meetup platform, hackathon platform, event registration, event booking, ticket management, organiser dashboard, AI recommendations, event discovery, QR ticketing, event analytics",
			},
			{ name: "author", content: "EaseMyEvent Team" },
			{ name: "robots", content: "index, follow" },

			// Open Graph / Facebook
			{ property: "og:type", content: "website" },
			{ property: "og:site_name", content: "EaseMyEvent" },
			{ property: "og:url", content: "https://easemyevent.vercel.app/" },
			{ property: "og:title", content: "EaseMyEvent" },
			{
				property: "og:description",
				content: "AI-Powered Event Management & Ticketing Platform",
			},
			{
				property: "og:image",
				content: "https://easemyevent.vercel.app/og-image.png",
			},
			{
				property: "og:image:alt",
				content:
					"EaseMyEvent — AI-Powered Event Management & Ticketing Platform",
			},

			// Twitter
			{ name: "twitter:card", content: "summary_large_image" },
			{ name: "twitter:url", content: "https://easemyevent.vercel.app/" },
			{ name: "twitter:title", content: "EaseMyEvent" },
			{
				name: "twitter:description",
				content: "AI-Powered Event Management & Ticketing Platform",
			},
			{
				name: "twitter:image",
				content: "https://easemyevent.vercel.app/og-image.png",
			},
			{
				name: "twitter:image:alt",
				content:
					"EaseMyEvent — AI-Powered Event Management & Ticketing Platform",
			},

			// Browser PWA Metadata
			{ name: "theme-color", content: "#6D28D9" },
			{ name: "application-name", content: "EaseMyEvent" },
			{ name: "apple-mobile-web-app-title", content: "EaseMyEvent" },
			{ name: "apple-mobile-web-app-capable", content: "yes" },
			{
				name: "apple-mobile-web-app-status-bar-style",
				content: "black-translucent",
			},
		],
		links: [
			{ rel: "stylesheet", href: appCss },
			{ rel: "preconnect", href: "https://fonts.googleapis.com" },
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous",
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap",
			},
			{
				rel: "icon",
				type: "image/x-icon",
				href: "/assets/favicon/favicon.ico",
			},
			{
				rel: "icon",
				type: "image/png",
				sizes: "16x16",
				href: "/assets/favicon/favicon-16x16.png",
			},
			{
				rel: "icon",
				type: "image/png",
				sizes: "32x32",
				href: "/assets/favicon/favicon-32x32.png",
			},
			{
				rel: "apple-touch-icon",
				sizes: "180x180",
				href: "/assets/favicon/apple-touch-icon.png",
			},
			{ rel: "manifest", href: "/assets/favicon/site.webmanifest" },
		],
		scripts: [
			{ src: "https://checkout.razorpay.com/v1/checkout.js", async: true },
		],
	}),
	component: RootComponent,
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	const jsonLd = {
		"@context": "https://schema.org",
		"@graph": [
			{
				"@type": "Organization",
				"@id": "https://easemyevent.vercel.app/#organization",
				name: "EaseMyEvent",
				url: "https://easemyevent.vercel.app/",
				logo: {
					"@type": "ImageObject",
					url: "https://easemyevent.vercel.app/assets/EaseMyEvent_logo.png",
				},
				description: "AI-Powered Event Management & Ticketing Platform",
			},
			{
				"@type": "WebSite",
				"@id": "https://easemyevent.vercel.app/#website",
				url: "https://easemyevent.vercel.app/",
				name: "EaseMyEvent",
				description: "AI-Powered Event Management & Ticketing Platform",
			},
			{
				"@type": "SoftwareApplication",
				"@id": "https://easemyevent.vercel.app/#software",
				name: "EaseMyEvent",
				applicationCategory: "BusinessApplication",
				operatingSystem: "All",
				url: "https://easemyevent.vercel.app/",
				description:
					"AI-Powered Event Management & Ticketing Platform for discovering, creating, managing, and attending events with intelligent recommendations, seamless ticketing, QR-based check-ins, and organiser analytics.",
			},
		],
	};

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
	);
}

function RootComponent() {
	return (
		<TooltipProvider>
			<Outlet />
			<Toaster
				position="top-right"
				toastOptions={{
					className: "font-sans",
					style: { fontFamily: "Inter, system-ui, sans-serif" },
				}}
				richColors
				closeButton
			/>
			<TanStackDevtools
				config={{ position: "bottom-right" }}
				plugins={[
					{ name: "Tanstack Router", render: <TanStackRouterDevtoolsPanel /> },
					TanStackQueryDevtools,
				]}
			/>
		</TooltipProvider>
	);
}
