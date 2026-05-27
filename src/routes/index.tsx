import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
	Activity,
	ArrowRight,
	ArrowUpRight,
	Bell,
	Calendar,
	CheckCircle,
	MessageSquare,
	QrCode,
	Search,
	Shield,
	Sparkles,
	Star,
	Ticket,
	TrendingUp,
} from "lucide-react";
import { useState } from "react";
import {
	Area,
	AreaChart,
	Bar,
	BarChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { toast } from "sonner";
import { EventCard } from "#/components/shared/EventCard";
import { Footer } from "#/components/shared/Footer";
import { Navbar } from "#/components/shared/Navbar";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Textarea } from "#/components/ui/textarea";
import { useAdminStats } from "#/hooks/use-admin";
import { useAuth } from "#/hooks/use-auth";
import { useCategories, useFeaturedEvents } from "#/hooks/use-events";

export const Route = createFileRoute("/")({
	head: () => ({
		meta: [
			{ title: "Discover Amazing Events | EaseMyEvent" },
			{
				name: "description",
				content:
					"Discover local and global events, book tickets securely with Razorpay, and get smart AI-powered recommendations with EaseMyEvent.",
			},
			{
				name: "keywords",
				content: "events discovery, AI ticketing, book tickets, tech meetups",
			},
		],
	}),
	component: LandingPage,
});

// Mock Interactive Data
const REVENUE_DATA = [
	{ name: "Jan", sales: 2400, revenue: 14000 },
	{ name: "Feb", sales: 1398, revenue: 22100 },
	{ name: "Mar", sales: 9800, revenue: 32900 },
	{ name: "Apr", sales: 3908, revenue: 51000 },
	{ name: "May", sales: 4800, revenue: 68000 },
	{ name: "Jun", sales: 7800, revenue: 95000 },
];

const REGISTRATIONS_DATA = [
	{ name: "Mon", attendees: 400 },
	{ name: "Tue", attendees: 600 },
	{ name: "Wed", attendees: 800 },
	{ name: "Thu", attendees: 1200 },
	{ name: "Fri", attendees: 1800 },
	{ name: "Sat", attendees: 2400 },
	{ name: "Sun", attendees: 3200 },
];

const ATTENDANCE_DATA = [
	{ name: "Confs", rate: 94 },
	{ name: "Music", rate: 88 },
	{ name: "Hackathons", rate: 97 },
	{ name: "Gaming", rate: 85 },
	{ name: "Tech", rate: 92 },
];

const MOCK_TESTIMONIALS = [
	{
		id: 1,
		name: "Amit",
		role: "Hackathon Organizer",
		avatar: "AM",
		comment:
			"EaseMyEvent completely changed how we ran our hackathon. The automated QR check-in and dashboard were smooth!",
		rating: 5,
		event: "DevFusion Hackathon 2026",
	},
	{
		id: 2,
		name: "Sonajit",
		role: "Lead Developer",
		avatar: "SR",
		comment:
			"The AI description helper is pure magic. I generated early bird ticket campaigns in just two clicks.",
		rating: 5,
		event: "Web3 Summit",
	},
	{
		id: 3,
		name: "Rajmohan",
		role: "Conference Chair",
		avatar: "RM",
		comment:
			"Payments via Razorpay integrated instantly, and check-in times dropped by 75%. Solid platform.",
		rating: 5,
		event: "National Tech Expo",
	},
];

function LandingPage() {
	const navigate = useNavigate();
	const { isAuthenticated, user } = useAuth();

	// Search states
	const [searchQuery, setSearchQuery] = useState("");
	const [searchCategory, setSearchCategory] = useState("");
	const [searchLocation, setSearchLocation] = useState("");
	const [searchDate, _setSearchDate] = useState("");

	// Queries
	const { data: categoriesData } = useCategories();
	const { data: featuredData } = useFeaturedEvents();

	const { data: adminStats } = useAdminStats();

	const categories = categoriesData || [];
	const featured = featuredData?.events || [];

	// Interactive Showcase state
	const [chartTab, setChartTab] = useState<
		"revenue" | "registrations" | "attendance"
	>("revenue");

	// Testimonials review writer state
	const [testimonials, setTestimonials] = useState(MOCK_TESTIMONIALS);
	const [newReviewComment, setNewReviewComment] = useState("");
	const [newReviewRating, setNewReviewRating] = useState(5);
	const [newReviewEvent, setNewReviewEvent] = useState("");
	const [isSubmittingReview, setIsSubmittingReview] = useState(false);

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		const searchParams: Record<string, string> = {};
		if (searchQuery.trim()) searchParams.search = searchQuery;
		if (searchCategory) searchParams.category = searchCategory;
		if (searchLocation.trim()) searchParams.location = searchLocation;
		if (searchDate) searchParams.date = searchDate;

		navigate({ to: "/events", search: searchParams });
	};

	const postCustomReview = (e: React.FormEvent) => {
		e.preventDefault();
		if (!newReviewComment.trim() || !newReviewEvent.trim()) {
			toast.warning("Please fill in all fields!");
			return;
		}

		setIsSubmittingReview(true);
		setTimeout(() => {
			const addedReview = {
				id: Date.now(),
				name: user?.full_name || "Community Member",
				role: user?.role === "organiser" ? "Event Organiser" : "Attendee",
				avatar: (user?.full_name || "CM").substring(0, 2).toUpperCase(),
				comment: newReviewComment,
				rating: newReviewRating,
				event: newReviewEvent,
			};
			setTestimonials([addedReview, ...testimonials]);
			setNewReviewComment("");
			setNewReviewEvent("");
			setNewReviewRating(5);
			setIsSubmittingReview(false);
			toast.success(
				"Thank you for sharing your experience! Testimonial added.",
			);
		}, 600);
	};

	return (
		<div className="min-h-screen bg-[var(--bg-base)] text-[var(--sea-ink)] transition-colors duration-300 overflow-x-hidden font-sans">
			{/* Dynamic Glass Navigation */}
			<Navbar />

			{/* Hero Section */}
			<section className="relative pt-6 pb-20 lg:pt-8 lg:pb-28 overflow-hidden border-b border-[var(--line)]">
				{/* Visual Glow Ambient Backgrounds */}
				<div className="absolute inset-0 -z-10">
					<div className="absolute top-[-10%] left-[-10%] h-[600px] w-[600px] rounded-full bg-violet-600/10 blur-3xl opacity-60" />
					<div className="absolute bottom-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-indigo-600/10 blur-3xl opacity-60" />
					<div className="absolute top-[30%] left-[50%] -translate-x-1/2 h-[400px] w-[800px] rounded-full bg-purple-500/5 blur-3xl" />
				</div>

				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="grid gap-12 lg:grid-cols-12 items-center">
						{/* Left Hero Panel */}
						<div className="lg:col-span-7 space-y-8 text-center lg:text-left">
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5 }}
							>
								<Badge className="px-3.5 py-1.5 border border-violet-200 dark:border-violet-500/30 bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-200 font-semibold tracking-wide rounded-full text-xs shadow-lg shadow-violet-500/10">
									<Sparkles className="mr-1.5 h-3.5 w-3.5 text-violet-400 animate-pulse" />
									🚀 AI-Powered Event Management Platform
								</Badge>
							</motion.div>

							<motion.h1
								initial={{ opacity: 0, y: 30 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: 0.1 }}
								className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight"
							>
								Make Event <br className="hidden sm:inline" />
								<span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
									Management Effortless
								</span>
							</motion.h1>

							<motion.p
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: 0.2 }}
								className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal"
							>
								Discover events. Create experiences. Manage everything in one
								place.
							</motion.p>

							{/* Actions */}
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: 0.3 }}
								className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
							>
								<Link to="/events" className="w-full sm:w-auto no-underline">
									<Button
										size="lg"
										className="w-full sm:w-auto h-13 px-8 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold hover:from-violet-700 hover:to-indigo-700 shadow-xl shadow-violet-500/20 group text-sm"
									>
										Explore Events
										<ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
									</Button>
								</Link>
								<Link
									to={
										isAuthenticated
											? "/organiser/events/create"
											: "/auth/signup"
									}
									className="w-full sm:w-auto no-underline"
								>
									<Button
										size="lg"
										variant="outline"
										className="w-full sm:w-auto h-13 px-8 rounded-xl border-slate-300 dark:border-slate-800 hover:border-violet-500/30 bg-slate-100/60 dark:bg-slate-900/60 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white text-sm"
									>
										Create Event
									</Button>
								</Link>
							</motion.div>

							{/* Trust Indicators */}
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ duration: 0.8, delay: 0.4 }}
								className="pt-8 border-t border-[var(--line)] grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0"
							>
								{[
									{
										label: "Attendees",
										value: adminStats?.total_users
											? `${adminStats.total_users.toLocaleString()}+`
											: "10K+",
									},
									{
										label: "Active Events",
										value: adminStats?.published_events
											? `${adminStats.published_events.toLocaleString()}+`
											: "500+",
									},
									{
										label: "Organisers",
										value: adminStats?.total_organisers
											? `${adminStats.total_organisers.toLocaleString()}+`
											: "50+",
									},
								].map((stat) => (
									<div key={stat.label} className="text-center lg:text-left">
										<p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
											{stat.value}
										</p>
										<p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
											{stat.label}
										</p>
									</div>
								))}
							</motion.div>
						</div>

						{/* Right Hero Panel: Interactive Glass Dashboard Card */}
						<div className="lg:col-span-5 relative flex justify-center">
							<motion.div
								initial={{ opacity: 0, scale: 0.95 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ duration: 0.7, delay: 0.2 }}
								className="w-full max-w-md rounded-3xl border border-[var(--line)] bg-white/90 dark:bg-slate-900/80 p-6 shadow-2xl shadow-slate-900/10 dark:shadow-black/60 backdrop-blur-md relative"
							>
								{/* Card header */}
								<div className="flex items-center justify-between border-b border-[var(--line)] pb-4 mb-4">
									<div className="flex items-center gap-2.5">
										<div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
										<span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
											Live Organiser Feed
										</span>
									</div>
									<Activity className="h-4 w-4 text-violet-400" />
								</div>

								{/* Sales metrics */}
								<div className="space-y-4">
									<div className="rounded-2xl bg-slate-50 dark:bg-slate-800/70 p-4 border border-slate-200 dark:border-white/10">
										<span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
											Ticket Revenue Today
										</span>
										<div className="flex items-baseline gap-2 mt-1">
											<span className="text-2xl font-black text-slate-900 dark:text-white">
												₹143,900
											</span>
											<span className="text-xs font-bold text-emerald-400 flex items-center gap-0.5">
												<ArrowUpRight className="h-3 w-3" /> +28%
											</span>
										</div>
									</div>

									{/* Mini chart visualizer */}
									<div className="h-24 pt-2">
										<ResponsiveContainer width="100%" height="100%">
											<AreaChart data={REVENUE_DATA.slice(2)}>
												<defs>
													<linearGradient
														id="glowColor"
														x1="0"
														y1="0"
														x2="0"
														y2="1"
													>
														<stop
															offset="5%"
															stopColor="#8B5CF6"
															stopOpacity={0.4}
														/>
														<stop
															offset="95%"
															stopColor="#8B5CF6"
															stopOpacity={0}
														/>
													</linearGradient>
												</defs>
												<Area
													type="monotone"
													dataKey="revenue"
													stroke="#8B5CF6"
													strokeWidth={2}
													fillOpacity={1}
													fill="url(#glowColor)"
												/>
											</AreaChart>
										</ResponsiveContainer>
									</div>

									{/* Floating Check-in state */}
									<div className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800/70 p-3.5 border border-slate-200 dark:border-white/10">
										<div className="flex items-center gap-3">
											<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-500/20 text-violet-600 dark:text-violet-400">
												<QrCode className="h-4.5 w-4.5" />
											</div>
											<div>
												<p className="text-xs font-bold text-slate-800 dark:text-slate-200">
													QR Ticket Scanned
												</p>
												<p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
													Attendee #104 checked in
												</p>
											</div>
										</div>
										<span className="text-xs font-semibold px-2 py-0.5 bg-emerald-950/40 text-emerald-400 border border-emerald-500/10 rounded">
											Success
										</span>
									</div>
								</div>

								{/* Floating decorative absolute elements */}
								<div className="absolute top-10 -right-6 h-12 w-12 rounded-2xl bg-indigo-500/10 blur-xl -z-10" />
								<div className="absolute -bottom-6 -left-6 h-20 w-20 rounded-full bg-violet-500/10 blur-xl -z-10" />
							</motion.div>
						</div>
					</div>
				</div>
			</section>

			{/* Search & Dynamic Filter Panel */}
			<section className="relative -translate-y-1/2 z-20 max-w-6xl mx-auto px-4">
				<form
					onSubmit={handleSearch}
					className="rounded-2xl border border-[var(--line)] bg-white/95 dark:bg-slate-900/90 p-4 shadow-xl shadow-slate-900/10 dark:shadow-black/50 backdrop-blur-lg"
				>
					<div className="grid gap-3 md:grid-cols-12 items-center">
						{/* Text Search */}
						<div className="relative md:col-span-4">
							<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
							<Input
								type="text"
								placeholder="Search event title, speaker..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="h-11 pl-9 rounded-xl focus-visible:ring-violet-500/30 text-sm"
							/>
						</div>

						{/* Category dropdown */}
						<div className="md:col-span-3">
							<select
								value={searchCategory}
								onChange={(e) => setSearchCategory(e.target.value)}
								className="w-full h-11 px-3 border rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:ring-3 focus:ring-violet-500/20"
							>
								<option value="">All Categories</option>
								{categories.map((c) => (
									<option key={c.id} value={c.id}>
										{c.name}
									</option>
								))}
							</select>
						</div>

						{/* Location text */}
						<div className="relative md:col-span-3">
							<Input
								type="text"
								placeholder="City or location"
								value={searchLocation}
								onChange={(e) => setSearchLocation(e.target.value)}
								className="h-11 rounded-xl focus-visible:ring-violet-500/30 text-sm"
							/>
						</div>

						{/* Action Search button */}
						<div className="md:col-span-2">
							<Button
								type="submit"
								className="w-full h-11 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold rounded-xl text-sm shadow-md"
							>
								Find Events
							</Button>
						</div>
					</div>
				</form>
			</section>

			{/* Featured Events Grid */}
			{featured.length > 0 && (
				<section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
					<div className="flex flex-col sm:flex-row items-baseline justify-between gap-2 mb-10">
						<div>
							<Badge className="mb-2 bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-500/20 text-violet-700 dark:text-violet-200 rounded-full font-semibold px-2.5 py-0.5 text-[10px]">
								🔥 Handpicked For You
							</Badge>
							<h2 className="text-3xl font-extrabold tracking-tight">
								Featured Experiences
							</h2>
							<p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
								Discover trending meetups and popular summits on EaseMyEvent
							</p>
						</div>
						<Link to="/events" className="no-underline">
							<Button
								variant="ghost"
								className="text-violet-400 hover:text-violet-300 font-semibold group p-0 text-sm"
							>
								View All Events{" "}
								<ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
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

			{/* Why EaseMyEvent section */}
			<section className="bg-[var(--alt-section)] border-y border-[var(--line)] py-24 relative overflow-hidden">
				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[500px] rounded-full bg-violet-600/5 blur-3xl -z-10" />

				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
						<Badge className="bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-500/20 text-violet-700 dark:text-violet-200 rounded-full font-semibold px-2.5 py-0.5 text-[10px]">
							⚡ Unmatched Features
						</Badge>
						<h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
							Built For Modern Scale
						</h2>
						<p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
							Discover how our platform simplifies planning, enhances audience
							connection, and streamlines scaling for event organizers.
						</p>
					</div>

					<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{[
							{
								icon: Ticket,
								title: "Smart Ticketing",
								desc: "Define custom ticket tiers, issue early birds, and accept dynamic pricing easily.",
							},
							{
								icon: Sparkles,
								title: "AI Recommendations",
								desc: "Discover tailored events matched perfectly to your preferences and browsing history.",
							},
							{
								icon: TrendingUp,
								title: "Real-Time Analytics",
								desc: "Access instantly updated dashboards mapping ticket sales, total revenue, and performance.",
							},
							{
								icon: QrCode,
								title: "QR Check-Ins",
								desc: "Validate digital QR-code passes at the door within seconds with our organiser tool.",
							},
							{
								icon: Bell,
								title: "Smart Notifications",
								desc: "Keep attendees up-to-date with automated schedules, broadcasts, and push updates.",
							},
							{
								icon: Shield,
								title: "Cloud Secured",
								desc: "Secure payments and high-performance user profile storage protected by Supabase authentication.",
							},
						].map((item, _index) => (
							<div
								key={item.title}
								className="feature-card p-6 rounded-2xl backdrop-blur-sm group"
							>
								<div className="mb-4 rounded-xl bg-violet-100 dark:bg-violet-950/50 border border-violet-200 dark:border-violet-500/20 p-3 w-fit text-violet-700 dark:text-violet-300 group-hover:bg-violet-200/70 dark:group-hover:bg-violet-950/70 transition-all">
									<item.icon className="h-5.5 w-5.5" />
								</div>
								<h3 className="text-lg font-bold mb-2 text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-white transition-colors">
									{item.title}
								</h3>
								<p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
									{item.desc}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* How it works */}
			<section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
				<div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
					<Badge className="bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-500/20 text-violet-700 dark:text-violet-200 rounded-full font-semibold px-2.5 py-0.5 text-[10px]">
						🛠 Simplicity In Action
					</Badge>
					<h2 className="text-3xl font-extrabold tracking-tight">
						How It Works
					</h2>
					<p className="text-sm text-slate-600 dark:text-slate-300">
						Launch and sell tickets to your next major experience in just four
						easy steps.
					</p>
				</div>

				<div className="grid gap-6 md:grid-cols-4 relative">
					{[
						{
							step: "01",
							name: "Create Event",
							desc: "Add title, dates, custom ticket tiers, and set parameters.",
						},
						{
							step: "02",
							name: "Publish Tickets",
							desc: "List details online instantly, ready for global registration.",
						},
						{
							step: "03",
							name: "Sell & Manage",
							desc: "Accept secure digital payments and track registration trends.",
						},
						{
							step: "04",
							name: "Check-In",
							desc: "Scan attendee passes at the door with direct QR confirmations.",
						},
					].map((item, _i) => (
						<div
							key={item.step}
							className="feature-card p-6 rounded-2xl relative"
						>
							<span className="text-5xl font-black text-violet-600/15 block mb-4">
								{item.step}
							</span>
							<h3 className="text-lg font-bold mb-2 text-slate-900 dark:text-white">
								{item.name}
							</h3>
							<p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
								{item.desc}
							</p>
						</div>
					))}
				</div>
			</section>

			{/* Live Analytics Showcase */}
			<section className="bg-[var(--alt-section)] border-t border-[var(--line)] py-24">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="grid gap-12 lg:grid-cols-12 items-center">
						{/* Left analytics info */}
						<div className="lg:col-span-5 space-y-6">
							<Badge className="bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-500/20 text-violet-700 dark:text-violet-200 rounded-full font-semibold px-2.5 py-0.5 text-[10px]">
								📈 Live Data Insights
							</Badge>
							<h2 className="text-3xl font-extrabold tracking-tight">
								Platform Insights at a Glance
							</h2>
							<p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
								Gain a detailed view of EaseMyEvent&apos;s active registration
								counts, ongoing ticketing revenue scales, and average category
								attendance ratios.
							</p>

							{/* Interactive tab controllers */}
							<div className="flex flex-col gap-2 pt-4">
								{[
									{ id: "revenue", label: "Ticketing Revenue Growth" },
									{ id: "registrations", label: "Weekly Registrations Feed" },
									{ id: "attendance", label: "Sector Attendance Rates" },
								].map((t) => (
									<button
										key={t.id}
										type="button"
										onClick={() =>
											setChartTab(
												t.id as "revenue" | "registrations" | "attendance",
											)
										}
										className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${
											chartTab === t.id
												? "bg-violet-100 dark:bg-violet-950/50 border-violet-300 dark:border-violet-500/40 text-violet-800 dark:text-violet-100 shadow-sm"
												: "bg-white/70 dark:bg-slate-900/40 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-violet-300 dark:hover:border-violet-500/30"
										}`}
									>
										{t.label}
									</button>
								))}
							</div>
						</div>

						{/* Right live charts container */}
						<div className="lg:col-span-7 rounded-3xl border border-[var(--line)] bg-white/90 dark:bg-slate-900/85 p-6 shadow-xl shadow-slate-900/10 dark:shadow-black/50 backdrop-blur-sm min-h-[350px] flex flex-col justify-between">
							<div className="flex items-center justify-between border-b border-[var(--line)] pb-4 mb-6">
								<span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-300">
									Interactive Metric Graph
								</span>
								<span className="text-[10px] px-2 py-0.5 bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-200 border border-violet-200 dark:border-violet-500/20 rounded font-semibold">
									Realtime Stats
								</span>
							</div>

							<div className="h-64">
								<ResponsiveContainer width="100%" height="100%">
									{chartTab === "revenue" ? (
										<AreaChart data={REVENUE_DATA}>
											<defs>
												<linearGradient
													id="mainColor"
													x1="0"
													y1="0"
													x2="0"
													y2="1"
												>
													<stop
														offset="5%"
														stopColor="#8B5CF6"
														stopOpacity={0.3}
													/>
													<stop
														offset="95%"
														stopColor="#8B5CF6"
														stopOpacity={0}
													/>
												</linearGradient>
											</defs>
											<XAxis
												dataKey="name"
												stroke="var(--sea-ink-soft)"
												fontSize={11}
											/>
											<YAxis stroke="var(--sea-ink-soft)" fontSize={11} />
											<Tooltip
												contentStyle={{
													backgroundColor: "var(--surface-strong)",
													borderColor: "var(--line)",
													color: "var(--sea-ink)",
													borderRadius: "12px",
													fontSize: "12px",
												}}
											/>
											<Area
												type="monotone"
												dataKey="revenue"
												stroke="#8B5CF6"
												strokeWidth={2}
												fillOpacity={1}
												fill="url(#mainColor)"
											/>
										</AreaChart>
									) : chartTab === "registrations" ? (
										<BarChart data={REGISTRATIONS_DATA}>
											<XAxis
												dataKey="name"
												stroke="var(--sea-ink-soft)"
												fontSize={11}
											/>
											<YAxis stroke="var(--sea-ink-soft)" fontSize={11} />
											<Tooltip
												contentStyle={{
													backgroundColor: "var(--surface-strong)",
													borderColor: "var(--line)",
													color: "var(--sea-ink)",
													borderRadius: "12px",
													fontSize: "12px",
												}}
											/>
											<Bar
												dataKey="attendees"
												fill="#4F46E5"
												radius={[6, 6, 0, 0]}
											/>
										</BarChart>
									) : (
										<BarChart data={ATTENDANCE_DATA} layout="vertical">
											<XAxis
												type="number"
												stroke="var(--sea-ink-soft)"
												fontSize={11}
											/>
											<YAxis
												dataKey="name"
												type="category"
												stroke="var(--sea-ink-soft)"
												fontSize={11}
												width={80}
											/>
											<Tooltip
												contentStyle={{
													backgroundColor: "var(--surface-strong)",
													borderColor: "var(--line)",
													color: "var(--sea-ink)",
													borderRadius: "12px",
													fontSize: "12px",
												}}
											/>
											<Bar
												dataKey="rate"
												fill="#EC4899"
												radius={[0, 6, 6, 0]}
											/>
										</BarChart>
									)}
								</ResponsiveContainer>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Futuristic AI Features Showcase */}
			<section className="relative overflow-hidden border-t border-[var(--line)] py-24">
				<div className="absolute inset-0 bg-gradient-to-r from-violet-600/5 to-indigo-600/5 -z-10" />
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
						<Badge className="bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-500/20 text-violet-700 dark:text-violet-200 rounded-full font-semibold px-2.5 py-0.5 text-[10px]">
							🤖 Smart Artificial Intelligence
						</Badge>
						<h2 className="text-3xl font-extrabold tracking-tight">
							AI Event Innovations
						</h2>
						<p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl mx-auto">
							Experience how advanced AI modules completely automate planning
							tasks and maximize discovery reach.
						</p>
					</div>

					<div className="grid gap-6 md:grid-cols-3">
						{[
							{
								icon: Sparkles,
								title: "Bespoke Recommendations",
								desc: "Get personalized event suggestions tailored to your interests and previous check-ins.",
							},
							{
								icon: TrendingUp,
								title: "Smart Description Generator",
								desc: "Draft polished, high-converting descriptions from simple outline prompts in seconds.",
							},
							{
								icon: Calendar,
								title: "Schedule Optimizer",
								desc: "AI builds optimal session schedules for multi-day conventions, maximizing user reach.",
							},
						].map((feature, _i) => (
							<div
								key={feature.title}
								className="feature-card p-6 rounded-2xl backdrop-blur-sm"
							>
								<div className="mb-4 rounded-xl bg-violet-100 dark:bg-violet-950/50 p-3 w-fit text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-500/20">
									<feature.icon className="h-6 w-6" />
								</div>
								<h3 className="text-base font-bold mb-2 text-slate-900 dark:text-white">
									{feature.title}
								</h3>
								<p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
									{feature.desc}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Testimonials Carousel & Interactive Reviews Feed */}
			<section className="bg-[var(--alt-section)] border-t border-[var(--line)] py-24 relative">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="grid gap-12 lg:grid-cols-12 items-start">
						{/* Left: Testimonials view */}
						<div className="lg:col-span-7 space-y-8">
							<div>
								<Badge className="bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-500/20 text-violet-700 dark:text-violet-200 rounded-full font-semibold px-2.5 py-0.5 text-[10px]">
									💬 User Reviews & Feedback
								</Badge>
								<h2 className="text-3xl font-extrabold tracking-tight mt-2">
									What Our Community Says
								</h2>
								<p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
									Read reviews written directly by event organizers and
									attendees.
								</p>
							</div>

							<div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
								<AnimatePresence mode="popLayout">
									{testimonials.map((t) => (
										<motion.div
											key={t.id}
											initial={{ opacity: 0, x: -10 }}
											animate={{ opacity: 1, x: 0 }}
											exit={{ opacity: 0, x: 10 }}
											className="feature-card p-5 rounded-2xl backdrop-blur-sm space-y-3"
										>
											<div className="flex items-center justify-between gap-3">
												<div className="flex items-center gap-3">
													<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white font-bold text-sm">
														{t.avatar}
													</div>
													<div>
														<h4 className="text-sm font-bold text-slate-900 dark:text-white leading-none">
															{t.name}
														</h4>
														<span className="text-[10px] text-slate-500 mt-1 block">
															{t.role}
														</span>
													</div>
												</div>
												<div className="flex gap-0.5">
													{[1, 2, 3, 4, 5].slice(0, t.rating).map((num) => (
														<Star
															key={`${t.id}-star-${num}`}
															className="h-3.5 w-3.5 fill-amber-500 text-amber-500"
														/>
													))}
												</div>
											</div>
											<p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic mt-1">
												&quot;{t.comment}&quot;
											</p>
											<div className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 dark:bg-violet-950/40 px-2 py-0.5 text-[9px] font-semibold text-violet-700 dark:text-violet-200 border border-violet-200 dark:border-violet-500/20">
												<CheckCircle className="h-3 w-3" /> Reviewed for{" "}
												{t.event}
											</div>
										</motion.div>
									))}
								</AnimatePresence>
							</div>
						</div>

						{/* Right: Post a Testimonial form */}
						<div className="lg:col-span-5">
							<div className="p-6 rounded-2xl border border-[var(--line)] bg-white/95 dark:bg-slate-900/85 shadow-xl shadow-slate-900/10 dark:shadow-black/50 backdrop-blur-sm">
								<h3 className="text-lg font-bold mb-2 flex items-center gap-2">
									<MessageSquare className="h-5 w-5 text-violet-400" />
									Write a Review
								</h3>
								<p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
									{isAuthenticated
										? "Share your latest event experience with our community!"
										: "Please sign in to write and share platform reviews."}
								</p>

								{isAuthenticated ? (
									<form onSubmit={postCustomReview} className="space-y-4">
										<div className="flex flex-col gap-1.5">
											<Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
												Reviewed Event *
											</Label>
											<Input
												placeholder="eg: DevFusion Hackathon 2026"
												value={newReviewEvent}
												onChange={(e) => setNewReviewEvent(e.target.value)}
												className="text-xs h-9"
											/>
										</div>

										<div className="flex flex-col gap-1.5">
											<Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
												Rating *
											</Label>
											<select
												value={newReviewRating}
												onChange={(e) =>
													setNewReviewRating(Number(e.target.value))
												}
												aria-label="Rating"
												className="w-full h-9 px-3 border rounded-lg text-xs focus:outline-none focus:border-violet-500 focus:ring-3 focus:ring-violet-500/20"
											>
												<option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
												<option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
												<option value={3}>⭐⭐⭐ (3 Stars)</option>
												<option value={2}>⭐⭐ (2 Stars)</option>
												<option value={1}>⭐ (1 Star)</option>
											</select>
										</div>

										<div className="flex flex-col gap-1.5">
											<Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
												Review Comments *
											</Label>
											<Textarea
												placeholder="Describe your registration, payment, or attendee experience..."
												value={newReviewComment}
												onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
													setNewReviewComment(e.target.value)
												}
												rows={4}
												className="text-xs"
											/>
										</div>

										<Button
											type="submit"
											disabled={isSubmittingReview}
											className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold text-xs h-9 shadow-md mt-2"
										>
											{isSubmittingReview ? "Submitting..." : "Post Review"}
										</Button>
									</form>
								) : (
									<div className="text-center py-8">
										<p className="text-xs text-slate-500 mb-4">
											To post a testimonial, log into your EaseMyEvent account.
										</p>
										<Link to="/auth/login" className="no-underline">
											<Button
												variant="outline"
												size="sm"
												className="h-9 px-6 rounded-lg text-xs font-semibold"
											>
												Sign In
											</Button>
										</Link>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Large Gradient CTA banner */}
			<section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-700 px-8 py-16 text-center text-white shadow-2xl shadow-violet-500/20 sm:px-16"
				>
					<div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA4KSIvPjwvc3ZnPg==')] opacity-50" />

					<div className="relative max-w-2xl mx-auto space-y-6">
						<h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
							Ready to Host Your Next Event?
						</h2>
						<p className="text-base text-violet-100/90 leading-relaxed font-normal">
							Join thousands of coordinators globally who trust EaseMyEvent.
							Plan details, publish ticket tiers, and accept secure payments in
							minutes.
						</p>
						<div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
							<Link
								to={
									isAuthenticated ? "/organiser/events/create" : "/auth/signup"
								}
								className="w-full sm:w-auto no-underline"
							>
								<Button
									size="lg"
									className="w-full sm:w-auto h-12 px-8 bg-white text-violet-700 hover:bg-violet-50 font-bold rounded-xl text-sm shadow-md"
								>
									Get Started Free
								</Button>
							</Link>
							<Link to="/events" className="w-full sm:w-auto no-underline">
								<Button
									size="lg"
									variant="ghost"
									className="w-full sm:w-auto h-12 px-8 border border-white/30 text-white hover:bg-white/10 font-semibold rounded-xl text-sm"
								>
									Browse Events
								</Button>
							</Link>
						</div>
					</div>
				</motion.div>
			</section>

			{/* Premium Multi-Column Footer */}
			<Footer />
		</div>
	);
}
