import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Github, Sparkles, Users } from "lucide-react";
import { Footer } from "#/components/shared/Footer";
import { Navbar } from "#/components/shared/Navbar";

export const Route = createFileRoute("/team")({
	head: () => ({
		meta: [
			{ title: "Core Team & Contributors | EaseMyEvent" },
			{
				name: "description",
				content:
					"Meet the brilliant minds behind EaseMyEvent - the AI-powered event management and ticketing platform.",
			},
		],
	}),
	component: TeamPage,
});

const team = [
	{
		name: "Amit",
		role: "Team Lead",
		desc: "Led database architecture design, backend service development, and key UI/UX polished enhancements.",
		github: "https://github.com/mello911",
		initials: "AM",
		gradient: "from-violet-600 to-fuchsia-600",
		skills: [
			"Database Design",
			"Backend Services",
			"API Architecture",
			"UI/UX Polish",
		],
	},
	{
		name: "Sonajit",
		role: "Frontend Architect & Core Developer",
		desc: "Architected system frontend, designed security & authentication integration, payment processing setup, and production deployment.",
		github: "https://github.com/s0n4jit",
		initials: "SR",
		gradient: "from-blue-600 to-indigo-600",
		skills: [
			"Frontend Architecture",
			"Auth Integration",
			"System Deployments",
			"State Management",
		],
	},
	{
		name: "Rajmohan",
		role: "Razorpay Integration & UI Specialist",
		desc: "Crafted the secure payment flow with Razorpay integration and optimized responsive layouts across primary features.",
		github: "https://github.com/USER-00001-IND",
		initials: "RM",
		gradient: "from-purple-600 to-pink-600",
		skills: [
			"Payment Integration",
			"Tailwind CSS",
			"Responsive UI",
			"Performance Optimization",
		],
	},
];

function TeamPage() {
	return (
		<div className="min-h-screen bg-background">
			<Navbar />

			{/* Hero Section */}
			<section className="relative overflow-hidden border-b border-border/40 bg-muted/20 py-24">
				<div className="absolute inset-0 -z-10">
					<div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 via-transparent to-indigo-600/5" />
					<div className="absolute top-10 left-10 h-72 w-72 rounded-full bg-violet-400/10 blur-3xl" />
					<div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-indigo-400/10 blur-3xl" />
				</div>
				<div className="mx-auto max-w-4xl px-4 text-center">
					<div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25">
						<Users className="h-7 w-7" />
					</div>
					<h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
						Meet the{" "}
						<span className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
							Core Team
						</span>
					</h1>
					<p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
						The innovative engineers and designers who built EaseMyEvent — an
						AI-powered ecosystem transforming how events are discovered,
						registered, and managed.
					</p>
				</div>
			</section>

			{/* Team Cards Section */}
			<section className="mx-auto max-w-6xl px-4 py-20">
				<div className="grid gap-8 md:grid-cols-3">
					{team.map((member, i) => (
						<motion.div
							key={member.name}
							initial={{ opacity: 0, y: 30 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: i * 0.15 }}
							className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/50 bg-card/60 p-6 backdrop-blur-sm transition-all hover:border-violet-500/30 hover:shadow-xl hover:shadow-violet-500/5"
						>
							<div>
								{/* Visual Avatar Header */}
								<div className="flex items-center gap-4 mb-6">
									<div
										className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${member.gradient} text-white font-bold text-lg shadow-md`}
									>
										{member.initials}
									</div>
									<div>
										<h3 className="text-xl font-bold tracking-tight text-foreground">
											{member.name}
										</h3>
										<p className="text-xs font-semibold text-violet-600 dark:text-violet-400 mt-0.5">
											{member.role}
										</p>
									</div>
								</div>

								<p className="text-sm text-muted-foreground leading-relaxed mb-6">
									{member.desc}
								</p>

								{/* Skill Badges */}
								<div className="flex flex-wrap gap-1.5 mb-6">
									{member.skills.map((skill) => (
										<span
											key={skill}
											className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground ring-1 ring-inset ring-border/50"
										>
											{skill}
										</span>
									))}
								</div>
							</div>

							{/* Github link */}
							<div className="mt-4 pt-4 border-t border-border/40 flex items-center justify-between">
								<a
									href={member.github}
									target="_blank"
									rel="noreferrer"
									className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors no-underline font-medium"
								>
									<Github className="h-4.5 w-4.5" />
									View GitHub Profile
								</a>
							</div>
						</motion.div>
					))}
				</div>
			</section>

			{/* Engineering Vision Section */}
			<section className="bg-muted/10 border-t border-border/40 py-20">
				<div className="mx-auto max-w-4xl px-4 text-center">
					<div className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700 dark:bg-violet-950/30 dark:text-violet-400 border border-violet-100 dark:border-violet-900/30 mb-6">
						<Sparkles className="h-3.5 w-3.5" />
						Engineering Excellence
					</div>
					<h2 className="text-2xl font-bold sm:text-3xl">
						Built with modern tech & paradigms
					</h2>
					<p className="mt-4 text-muted-foreground leading-relaxed max-w-2xl mx-auto">
						EaseMyEvent was developed utilizing a powerful reactive stack
						including React 19, Vite, TanStack Router for type-safe routing,
						Supabase for realtime DB, and Razorpay for seamless transactional
						payments.
					</p>
				</div>
			</section>

			<Footer />
		</div>
	);
}
