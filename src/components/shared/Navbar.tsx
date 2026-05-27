import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
	BarChart3,
	Bell,
	Calendar,
	Check,
	ChevronDown,
	DollarSign,
	FolderKanban,
	Heart,
	Info,
	Laptop,
	LayoutDashboard,
	LogOut,
	Menu,
	Moon,
	QrCode,
	Search,
	Settings,
	Sparkles,
	Sun,
	Ticket,
	User,
	Users,
	X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { useAuth, useSignOut } from "#/hooks/use-auth";
import { useUnreadCount } from "#/hooks/use-notifications";

export function Navbar() {
	const [mobileOpen, setMobileOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);
	const [themeMode, setThemeMode] = useState<"light" | "dark" | "system">(
		"system",
	);
	const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);

	useEffect(() => {
		const savedMode = localStorage.getItem("theme-mode") as
			| "light"
			| "dark"
			| "system"
			| null;
		const initialMode = savedMode || "system";
		setThemeMode(initialMode);

		const applyTheme = (mode: "light" | "dark" | "system") => {
			if (mode === "dark") {
				document.documentElement.classList.add("dark");
			} else if (mode === "light") {
				document.documentElement.classList.remove("dark");
			} else {
				const prefersDark = window.matchMedia(
					"(prefers-color-scheme: dark)",
				).matches;
				if (prefersDark) {
					document.documentElement.classList.add("dark");
				} else {
					document.documentElement.classList.remove("dark");
				}
			}
		};

		applyTheme(initialMode);

		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
		const handleSystemThemeChange = () => {
			const currentSaved = localStorage.getItem("theme-mode");
			if (!currentSaved || currentSaved === "system") {
				applyTheme("system");
			}
		};

		mediaQuery.addEventListener("change", handleSystemThemeChange);
		return () =>
			mediaQuery.removeEventListener("change", handleSystemThemeChange);
	}, []);

	const selectThemeMode = (mode: "light" | "dark" | "system") => {
		setThemeMode(mode);
		localStorage.setItem("theme-mode", mode);

		if (mode === "dark") {
			document.documentElement.classList.add("dark");
			toast.success("Switched to dark mode!");
		} else if (mode === "light") {
			document.documentElement.classList.remove("dark");
			toast.success("Switched to light mode!");
		} else {
			const prefersDark = window.matchMedia(
				"(prefers-color-scheme: dark)",
			).matches;
			if (prefersDark) {
				document.documentElement.classList.add("dark");
			} else {
				document.documentElement.classList.remove("dark");
			}
			toast.success("Switched to system mode!");
		}
		setThemeDropdownOpen(false);
	};

	const cycleTheme = () => {
		if (themeMode === "system") {
			selectThemeMode("light");
		} else if (themeMode === "light") {
			selectThemeMode("dark");
		} else {
			selectThemeMode("system");
		}
	};

	// Active desktop hover dropdown state
	const [activeDropdown, setActiveDropdown] = useState<
		"categories" | "organisers" | "profile" | null
	>(null);

	const { user, isAuthenticated, isOrganiser, isAdmin } = useAuth();
	const signOut = useSignOut();
	const { data: unreadCount } = useUnreadCount(user?.id);

	// Tracking scroll for dynamic header height & blur shrink
	useEffect(() => {
		const handleScroll = () => {
			if (window.scrollY > 20) {
				setScrolled(true);
			} else {
				setScrolled(false);
			}
		};
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	// Categories List
	const categories = [
		{ name: "Tech", slug: "technology" },
		{ name: "Hackathons", slug: "hackathons" },
		{ name: "Workshops", slug: "workshops" },
		{ name: "Conferences", slug: "conferences" },
		{ name: "Music", slug: "music" },
		{ name: "Startup", slug: "startup" },
		{ name: "Education", slug: "education" },
	];

	// Organiser Tools List
	const organiserTools = [
		{
			label: "Create Event",
			to: "/organiser/events/create",
			icon: Sparkles,
			desc: "AI-assisted event generation wizard",
		},
		{
			label: "Event Analytics",
			to: "/organiser",
			icon: BarChart3,
			desc: "Realtime sales and attendee stats",
		},
		{
			label: "Ticket Management",
			to: "/organiser/events",
			icon: Ticket,
			desc: "Setup tiers, discounts and early-birds",
		},
		{
			label: "QR Check-ins",
			to: "/organiser/events",
			icon: QrCode,
			desc: "Scan attendee QR codes at the door",
		},
	];

	// Role-aware profile menus
	const profileMenus = (() => {
		if (!isAuthenticated || !user) return [];
		if (isAdmin) {
			return [
				{ to: "/admin", label: "Admin Console", icon: LayoutDashboard },
				{ to: "/admin/users", label: "Users Registry", icon: Users },
				{ to: "/admin/events", label: "Manage Events", icon: Calendar },
				{
					to: "/admin/categories",
					label: "Global Categories",
					icon: FolderKanban,
				},
				{ to: "/admin/refunds", label: "Refund Requests", icon: DollarSign },
				{ to: "/dashboard/profile", label: "My Profile", icon: User },
			];
		}
		if (isOrganiser) {
			return [
				{ to: "/organiser", label: "Organiser Portal", icon: LayoutDashboard },
				{ to: "/organiser/events", label: "Manage Events", icon: Calendar },
				{ to: "/dashboard/profile", label: "My Profile", icon: User },
				{ to: "/dashboard/profile", label: "Account Settings", icon: Settings },
			];
		}
		// Attendee role
		return [
			{ to: "/dashboard", label: "Attendee Dashboard", icon: LayoutDashboard },
			{ to: "/dashboard/tickets", label: "My Tickets", icon: Calendar },
			{ to: "/dashboard/wishlist", label: "Wishlist", icon: Heart },
			{ to: "/dashboard/profile", label: "My Profile", icon: User },
			{ to: "/dashboard/profile", label: "Account Settings", icon: Settings },
		];
	})();

	return (
		<header
			className={`sticky top-0 z-50 w-full transition-all duration-300 ${
				scrolled
					? "h-16 bg-[var(--header-bg)] border-b border-[var(--line)] shadow-lg shadow-slate-900/5 dark:shadow-black/30 backdrop-blur-xl"
					: "h-20 bg-[var(--header-bg)] border-b border-[var(--line)]/80 backdrop-blur-md"
			}`}
		>
			<nav className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
				{/* LEFT: Branding */}
				<div className="flex items-center gap-6">
					<Link
						to="/"
						className="flex items-center gap-2.5 no-underline shrink-0 group"
					>
						<img
							src="/assets/EaseMyEvent_E_logo.png"
							alt="EaseMyEvent E Logo"
							className={`object-contain transition-all duration-300 ${scrolled ? "h-8 w-8" : "h-10 w-10"}`}
						/>
						<span
							className={`font-black tracking-tight transition-all duration-300 ${scrolled ? "text-base" : "text-lg"}`}
						>
							<span className="text-slate-900 dark:text-white">Ease</span>
							<span className="bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent">
								My
							</span>
							<span className="text-slate-900 dark:text-white">Event</span>
						</span>
					</Link>
				</div>

				{/* CENTER: Navigation Options */}
				<div className="hidden md:flex items-center gap-1.5 z-50">
					{/* Discover */}
					<Link
						to="/events"
						className="rounded-xl px-3.5 py-2 text-sm font-semibold text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)] transition-colors hover:bg-[var(--link-bg-hover)]/80 no-underline"
					>
						Discover
					</Link>

					{/* Categories Dropdown Container */}
					<div
						role="none"
						className="relative"
						onMouseEnter={() => setActiveDropdown("categories")}
						onMouseLeave={() => setActiveDropdown(null)}
					>
						<button
							type="button"
							className={`flex items-center gap-1 rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors hover:bg-[var(--link-bg-hover)]/80 ${
								activeDropdown === "categories"
									? "text-violet-400"
									: "text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]"
							}`}
						>
							Categories <ChevronDown className="h-3.5 w-3.5" />
						</button>
						<AnimatePresence>
							{activeDropdown === "categories" && (
								<motion.div
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: 10 }}
									transition={{ duration: 0.15 }}
									className="premium-menu absolute left-1/2 -translate-x-1/2 top-12 z-50 w-72 rounded-2xl p-4"
								>
									<span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2 px-2">
										Browse Sectors
									</span>
									<div className="grid grid-cols-1 gap-1">
										{categories.map((c) => (
											<Link
												key={c.slug}
												to="/events"
												search={{ category: c.slug }}
												onClick={() => setActiveDropdown(null)}
												className="premium-menu-item flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold no-underline transition-colors border border-transparent hover:border-violet-100 dark:hover:border-violet-500/20"
											>
												<FolderKanban className="h-4 w-4 text-violet-400/80" />
												{c.name}
											</Link>
										))}
									</div>
								</motion.div>
							)}
						</AnimatePresence>
					</div>

					{/* For Organisers Dropdown */}
					<div
						role="none"
						className="relative"
						onMouseEnter={() => setActiveDropdown("organisers")}
						onMouseLeave={() => setActiveDropdown(null)}
					>
						<button
							type="button"
							className={`flex items-center gap-1 rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors hover:bg-[var(--link-bg-hover)]/80 ${
								activeDropdown === "organisers"
									? "text-violet-400"
									: "text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]"
							}`}
						>
							For Organisers <ChevronDown className="h-3.5 w-3.5" />
						</button>
						<AnimatePresence>
							{activeDropdown === "organisers" && (
								<motion.div
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: 10 }}
									transition={{ duration: 0.15 }}
									className="premium-menu absolute left-1/2 -translate-x-1/2 top-12 z-50 w-80 rounded-2xl p-4"
								>
									<span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2.5 px-2.5">
										Organiser Toolbox
									</span>
									<div className="grid gap-2">
										{organiserTools.map((tool) => (
											<Link
												key={tool.label}
												to={tool.to}
												onClick={() => setActiveDropdown(null)}
												className="premium-menu-item flex items-start gap-3 rounded-xl p-2.5 transition-colors no-underline group"
											>
												<div className="rounded-lg bg-violet-100 dark:bg-violet-950/40 p-2 text-violet-600 dark:text-violet-400 border border-violet-200/50 dark:border-violet-500/10 group-hover:bg-violet-200/30 dark:group-hover:bg-violet-950/60 transition-colors shrink-0">
													<tool.icon className="h-4 w-4" />
												</div>
												<div>
													<p className="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-violet-600 dark:group-hover:text-violet-300 transition-colors">
														{tool.label}
													</p>
													<p className="text-[10px] text-slate-500 mt-0.5 leading-normal">
														{tool.desc}
													</p>
												</div>
											</Link>
										))}
									</div>
								</motion.div>
							)}
						</AnimatePresence>
					</div>

					{/* Pricing */}
					<Link
						to="/events"
						className="rounded-xl px-3.5 py-2 text-sm font-semibold text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)] transition-colors hover:bg-[var(--link-bg-hover)]/80 no-underline"
					>
						Pricing
					</Link>

					{/* About Team */}
					<Link
						to="/team"
						className="rounded-xl px-3.5 py-2 text-sm font-semibold text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)] transition-colors hover:bg-[var(--link-bg-hover)]/80 no-underline"
					>
						About
					</Link>
				</div>

				{/* RIGHT: Actions and Authentication */}
				<div className="hidden md:flex items-center gap-3">
					{/* Small Search visual triggers */}
					<Link
						to="/events"
						className="relative rounded-xl p-2.5 text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)] hover:bg-[var(--link-bg-hover)]/80 transition-all no-underline shrink-0"
						aria-label="Search Events"
					>
						<Search className="h-4.5 w-4.5" />
					</Link>

					{/* Theme Dropdown */}
					<div className="relative animate-fade-in" role="none">
						<button
							type="button"
							onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
							className="relative rounded-xl p-2.5 text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)] hover:bg-[var(--link-bg-hover)]/80 transition-all shrink-0 cursor-pointer"
							aria-label="Toggle Theme"
						>
							{themeMode === "dark" && <Moon className="h-4.5 w-4.5" />}
							{themeMode === "light" && <Sun className="h-4.5 w-4.5" />}
							{themeMode === "system" && <Laptop className="h-4.5 w-4.5" />}
						</button>
						<AnimatePresence>
							{themeDropdownOpen && (
								<>
									<button
										type="button"
										className="fixed inset-0 z-40 cursor-default w-full h-full bg-transparent border-none"
										aria-label="Close theme selector"
										onClick={() => setThemeDropdownOpen(false)}
									/>
									<motion.div
										initial={{ opacity: 0, scale: 0.95, y: 8 }}
										animate={{ opacity: 1, scale: 1, y: 0 }}
										exit={{ opacity: 0, scale: 0.95, y: 8 }}
										transition={{ duration: 0.15, ease: "easeOut" }}
										className="premium-menu absolute right-0 top-12 z-50 w-44 rounded-xl p-1.5"
									>
										{(
											[
												{ id: "light", label: "Light", icon: Sun },
												{ id: "dark", label: "Dark", icon: Moon },
												{ id: "system", label: "System", icon: Laptop },
											] as const
										).map((t) => (
											<button
												key={t.id}
												type="button"
												onClick={() => selectThemeMode(t.id)}
												className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
													themeMode === t.id
														? "text-violet-700 dark:text-white bg-violet-50 dark:bg-white/10"
														: "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5"
												}`}
											>
												<div className="flex items-center gap-3">
													<t.icon
														className={`h-4 w-4 shrink-0 ${themeMode === t.id ? "text-violet-600 dark:text-white" : "text-slate-400 dark:text-slate-500"}`}
													/>
													<span>{t.label}</span>
												</div>
												{themeMode === t.id && (
													<Check
														className="h-4 w-4 text-violet-600 dark:text-white"
														strokeWidth={2.5}
													/>
												)}
											</button>
										))}
									</motion.div>
								</>
							)}
						</AnimatePresence>
					</div>

					{isAuthenticated && user ? (
						<>
							{/* Notifications bell */}
							<Link
								to="/dashboard/notifications"
								className="relative rounded-xl p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors hover:bg-slate-100 dark:hover:bg-white/8 no-underline shrink-0"
							>
								<Bell className="h-4.5 w-4.5" />
								{(unreadCount ?? 0) > 0 && (
									<span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-violet-600 text-[9px] font-black text-white shadow shadow-violet-500/20">
										{unreadCount}
									</span>
								)}
							</Link>

							{/* User Profile dropdown */}
							<div
								role="none"
								className="relative"
								onMouseEnter={() => setActiveDropdown("profile")}
								onMouseLeave={() => setActiveDropdown(null)}
							>
								<button
									type="button"
									className="flex items-center gap-2 rounded-xl p-1 hover:bg-slate-100 dark:hover:bg-white/8 transition-colors"
								>
									<Avatar className="h-8.5 w-8.5 border border-slate-200 dark:border-slate-700">
										<AvatarImage src={user.avatar_url || undefined} />
										<AvatarFallback className="bg-gradient-to-br from-violet-600 to-indigo-600 text-xs font-bold text-white">
											{user.full_name?.slice(0, 2).toUpperCase() || "US"}
										</AvatarFallback>
									</Avatar>
									<ChevronDown className="h-3.5 w-3.5 text-slate-400" />
								</button>
								<AnimatePresence>
									{activeDropdown === "profile" && (
										<motion.div
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: 10 }}
											transition={{ duration: 0.15 }}
											className="premium-menu absolute right-0 top-11 z-50 w-56 rounded-2xl p-2"
										>
											<div className="border-b border-slate-100 dark:border-slate-800 px-3 py-2.5 mb-1.5">
												<p className="text-xs font-bold text-slate-800 dark:text-white leading-none">
													{user.full_name}
												</p>
												<p className="text-[10px] text-slate-500 mt-1 truncate">
													{user.email}
												</p>
												<Badge className="mt-2 text-[9px] font-bold uppercase tracking-wider bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-300 border border-violet-200 dark:border-violet-500/10">
													{user.role}
												</Badge>
											</div>

											{profileMenus.map((item) => (
												<Link
													key={`${item.label}-${item.to}`}
													to={item.to}
													onClick={() => setActiveDropdown(null)}
													className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white no-underline transition-colors hover:bg-slate-50 dark:hover:bg-white/5"
												>
													<item.icon className="h-4 w-4 text-slate-400 dark:text-slate-500 shrink-0" />
													{item.label}
												</Link>
											))}

											<div className="mt-1.5 border-t border-slate-100 dark:border-white/10 pt-1.5">
												<button
													type="button"
													onClick={() => {
														signOut.mutate();
														setActiveDropdown(null);
													}}
													className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950/20"
												>
													<LogOut className="h-4 w-4 shrink-0" /> Sign Out
												</button>
											</div>
										</motion.div>
									)}
								</AnimatePresence>
							</div>
						</>
					) : (
						<div className="flex items-center gap-2">
							<Link to="/auth/login" className="no-underline">
								<Button
									variant="ghost"
									size="sm"
									className="h-9 px-4 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/8 text-xs font-bold"
								>
									Sign In
								</Button>
							</Link>
							<Link to="/auth/signup" className="no-underline">
								<Button
									size="sm"
									className="h-9 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-xs hover:from-violet-700 hover:to-indigo-700 shadow-md"
								>
									Create Event
								</Button>
							</Link>
						</div>
					)}
				</div>

				{/* MOBILE: Toggle hamburger */}
				<div className="flex items-center gap-1 md:hidden">
					<button
						type="button"
						onClick={cycleTheme}
						className="rounded-xl p-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/8 transition-colors cursor-pointer"
						aria-label="Toggle Theme"
					>
						{themeMode === "dark" && <Moon className="h-5 w-5" />}
						{themeMode === "light" && <Sun className="h-5 w-5" />}
						{themeMode === "system" && <Laptop className="h-5 w-5" />}
					</button>
					<button
						type="button"
						className="rounded-xl p-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/8 transition-colors cursor-pointer"
						onClick={() => setMobileOpen(!mobileOpen)}
						aria-label={mobileOpen ? "Close Menu" : "Open Menu"}
					>
						{mobileOpen ? (
							<X className="h-5 w-5" />
						) : (
							<Menu className="h-5 w-5" />
						)}
					</button>
				</div>
			</nav>

			{/* MOBILE: Navigation Sliding Drawer */}
			<AnimatePresence>
				{mobileOpen && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.2 }}
						className="overflow-hidden border-b border-[var(--line)] md:hidden bg-[var(--surface-strong)] backdrop-blur-xl"
					>
						<div className="space-y-1.5 px-4 py-4 border-t border-slate-100 dark:border-white/10">
							<Link
								to="/events"
								onClick={() => setMobileOpen(false)}
								className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 no-underline"
							>
								<Search className="h-4.5 w-4.5 text-slate-500" /> Discover
								Events
							</Link>

							{/* Mobile Categories list */}
							<div className="py-1">
								<span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 block mb-1">
									Categories
								</span>
								<div className="grid grid-cols-2 gap-1 px-3">
									{categories.slice(0, 6).map((c) => (
										<Link
											key={`mob-cat-${c.slug}`}
											to="/events"
											search={{ category: c.slug }}
											onClick={() => setMobileOpen(false)}
											className="text-xs text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-white no-underline py-1.5 block font-medium transition-colors"
										>
											{c.name}
										</Link>
									))}
								</div>
							</div>

							<Link
								to="/team"
								onClick={() => setMobileOpen(false)}
								className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 no-underline"
							>
								<Info className="h-4.5 w-4.5 text-slate-500" /> About Platform
							</Link>

							{isAuthenticated ? (
								<div className="border-t border-slate-200 dark:border-white/10 mt-3 pt-3">
									<span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 block mb-1">
										My Dashboard
									</span>
									{profileMenus.map((item) => (
										<Link
											key={`mobile-p-${item.label}`}
											to={item.to}
											onClick={() => setMobileOpen(false)}
											className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 no-underline"
										>
											<item.icon className="h-4.5 w-4.5 text-slate-400 dark:text-slate-500 shrink-0" />
											{item.label}
										</Link>
									))}
									<button
										type="button"
										onClick={() => {
											signOut.mutate();
											setMobileOpen(false);
										}}
										className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
									>
										<LogOut className="h-4.5 w-4.5 text-red-500 shrink-0" />
										Sign Out
									</button>
								</div>
							) : (
								<div className="border-t border-slate-200 dark:border-white/10 mt-4 pt-4 grid grid-cols-2 gap-2">
									<Link
										to="/auth/login"
										onClick={() => setMobileOpen(false)}
										className="no-underline"
									>
										<Button
											variant="outline"
											className="w-full h-10 rounded-xl text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 text-xs font-semibold"
										>
											Sign In
										</Button>
									</Link>
									<Link
										to="/auth/signup"
										onClick={() => setMobileOpen(false)}
										className="no-underline"
									>
										<Button className="w-full h-10 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-xs hover:from-violet-700 hover:to-indigo-700 shadow-md">
											Get Started
										</Button>
									</Link>
								</div>
							)}

							{/* Mobile Theme Selection */}
							<div className="border-t border-slate-200 dark:border-white/10 mt-4 pt-4">
								<span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 block mb-2">
									Theme Mode
								</span>
								<div className="flex items-center gap-2 px-3 pb-1">
									{(
										[
											{ id: "light", label: "Light", icon: Sun },
											{ id: "dark", label: "Dark", icon: Moon },
											{ id: "system", label: "System", icon: Laptop },
										] as const
									).map((t) => (
										<button
											key={`mob-theme-${t.id}`}
											type="button"
											onClick={() => selectThemeMode(t.id)}
											className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold border transition-all cursor-pointer ${
												themeMode === t.id
													? "bg-violet-600 text-white border-violet-700"
													: "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:text-violet-600 dark:hover:text-white hover:bg-violet-50 dark:hover:bg-white/8"
											}`}
										>
											<t.icon className="h-3.5 w-3.5" />
											{t.label}
										</button>
									))}
								</div>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</header>
	);
}
