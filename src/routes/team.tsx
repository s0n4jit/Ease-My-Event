import { createFileRoute } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { Github, Sparkles, Users } from 'lucide-react'
import { Footer } from '#/components/shared/Footer'
import { Navbar } from '#/components/shared/Navbar'

export const Route = createFileRoute('/team')({
	head: () => ({
		meta: [
			{ title: 'Core Team & Contributors | EaseMyEvent' },
			{
				name: 'description',
				content:
					'Meet the brilliant minds behind EaseMyEvent — the AI-powered event management and ticketing platform.',
			},
		],
	}),
	component: TeamPage,
})

const team = [
	{
		name: 'Amit',
		role: 'Team Lead',
		roleColor: 'text-violet-400',
		desc: 'Led backend architecture, database systems, and core service integrations across the platform.',
		github: 'https://github.com/mello911',
		avatar: 'https://cdn.jsdelivr.net/gh/s0n4jit/Ease-My-Event@main/public/assets/Amit_avatar.jpeg',
		initials: 'AM',
		gradient: 'from-violet-600 to-fuchsia-600',
		skills: [
			'Backend Systems',
			'Database Design',
			'API Architecture',
			'Infrastructure',
		],
	},
	{
		name: 'Sonajit',
		role: 'Frontend Architect',
		roleColor: 'text-blue-400',
		desc: 'Designed the frontend architecture, authentication flows, deployment pipeline, and production UI systems.',
		github: 'https://github.com/s0n4jit',
		avatar: 'https://cdn.jsdelivr.net/gh/s0n4jit/sonajit.in@main/public/img/heroimg/profile.jpg',
		initials: 'SR',
		gradient: 'from-blue-600 to-violet-600',
		skills: [
			'Frontend Architecture',
			'UI Development & UI responsiveness',
			'Authentication',
			'Deployments',
			'State Management',
		],
	},
	{
		name: 'Rajmohan',
		role: 'Razorpay & UI Design',
		roleColor: 'text-pink-400',
		desc: 'Implemented secure payment workflows with Razorpay and optimized responsive user experiences.',
		github: 'https://github.com/USER-00001-IND',
		avatar: 'https://avatars.githubusercontent.com/u/227919988?v=4',
		initials: 'RM',
		gradient: 'from-purple-600 to-pink-600',
		skills: [
			'Payment Integration',
			'UI Design',
			'Razorpay APIs',
		],
	},
]

const techs = [
	'React 19',
	'Vite',
	'TanStack Router',
	'Supabase',
	'Razorpay',
	'TypeScript',
	'Tailwind CSS',
]

interface AvatarProps {
	src: string
	initials: string
	gradient: string
	name: string
}

function Avatar({ src, initials, gradient, name }: AvatarProps) {
	if (src) {
		return (
			<img
				src={src}
				alt={name}
				className="h-16 w-16 rounded-2xl border border-white/10 object-cover"
			/>
		)
	}

	return (
		<div
			className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br ${gradient} text-xl font-black text-white shadow-lg`}
		>
			{initials}
		</div>
	)
}

function TeamPage() {
	return (
		<div className="min-h-screen overflow-hidden bg-[#09090B] text-white">
			<Navbar />

			{/* HERO */}
			<section className="relative border-b border-white/[0.06]">
				{/* Background Effects */}
				<div className="absolute inset-0 overflow-hidden">
					<div className="absolute left-[-10%] top-[-20%] h-[420px] w-[420px] rounded-full bg-violet-600/20 blur-3xl" />
					<div className="absolute bottom-[-20%] right-[-10%] h-[380px] w-[380px] rounded-full bg-blue-600/20 blur-3xl" />
					<div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_45%)]" />
				</div>

				<div className="relative mx-auto flex max-w-6xl flex-col items-center px-4 py-28 text-center">
					<div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">
						<Users className="h-4 w-4" />
						Core Team
					</div>

					<h1 className="text-5xl font-black leading-[1] tracking-tight sm:text-6xl lg:text-7xl">
						The people who built
						<br />
						<span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-blue-400 bg-clip-text text-transparent">
							EaseMyEvent
						</span>
					</h1>

					<p className="mt-6 max-w-2xl text-base leading-8 text-zinc-400 sm:text-lg">
						Engineers and designers building a modern platform for event
						discovery, registration, ticketing, and seamless management.
					</p>

					<div className="mt-10 flex flex-wrap items-center justify-center gap-4">
						<a
							href="https://github.com/s0n4jit/Ease-My-Event"
							target="_blank"
							rel="noreferrer"
							className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-black no-underline transition-all duration-300 hover:scale-[1.02]"
						>
							<Github className="h-4 w-4" />
							View Project Repository
						</a>

						<div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm text-zinc-400">
							React 19 • Supabase • Razorpay • TanStack
						</div>
					</div>
				</div>
			</section>

			{/* TEAM */}
			<section className="relative mx-auto max-w-6xl px-4 py-24">
				<div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
					{team.map((member, i) => (
						<motion.a
							key={member.name}
							href={member.github}
							target="_blank"
							rel="noreferrer"
							initial={{ opacity: 0, y: 30 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{
								duration: 0.5,
								delay: i * 0.12,
							}}
							className="group relative overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.03] p-7 no-underline backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/30 hover:bg-white/[0.05]"
						>
							{/* Glow */}
							<div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
								<div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500 to-transparent" />
							</div>

							{/* TOP */}
							<div className="flex items-center gap-4">
								<Avatar
									src={member.avatar}
									initials={member.initials}
									gradient={member.gradient}
									name={member.name}
								/>

								<div>
									<h3 className="text-xl font-black tracking-tight text-white">
										{member.name}
									</h3>

									<p
										className={`mt-1 text-sm font-semibold ${member.roleColor}`}
									>
										{member.role}
									</p>
								</div>
							</div>

							{/* DESCRIPTION */}
							<p className="mt-6 text-sm leading-7 text-zinc-400">
								{member.desc}
							</p>

							{/* SKILLS */}
							<div className="mt-6 flex flex-wrap gap-2">
								{member.skills.map((skill) => (
									<span
										key={skill}
										className="rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-[11px] font-medium text-zinc-300"
									>
										{skill}
									</span>
								))}
							</div>

							{/* FOOTER */}
							<div className="mt-8 flex items-center justify-between border-t border-white/[0.06] pt-5">
								<span className="text-xs uppercase tracking-[0.18em] text-zinc-500">
									Contributor
								</span>

								<div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-semibold text-zinc-300 transition-all duration-300 group-hover:border-violet-500/30 group-hover:text-violet-300">
									<Github className="h-3.5 w-3.5" />
									View Profile
								</div>
							</div>
						</motion.a>
					))}
				</div>
			</section>

			{/* TECH STACK */}
			<section className="border-y border-white/[0.06] bg-white/[0.02]">
				<div className="mx-auto max-w-5xl px-4 py-20 text-center">
					<div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-2 text-xs font-semibold text-violet-300">
						<Sparkles className="h-3.5 w-3.5" />
						Production Stack
					</div>

					<h2 className="text-3xl font-black tracking-tight sm:text-4xl">
						Built with modern technologies
					</h2>

					<p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
						A modern stack engineered for scalability, realtime
						communication, secure authentication, optimized performance,
						and seamless payment experiences.
					</p>

					<div className="mt-10 flex flex-wrap justify-center gap-3">
						{techs.map((t) => (
							<div
								key={t}
								className="rounded-2xl border border-white/[0.08] bg-black/30 px-5 py-3 text-sm font-medium text-zinc-300"
							>
								{t}
							</div>
						))}
					</div>

					<a
						href="https://github.com/s0n4jit/Ease-My-Event"
						target="_blank"
						rel="noreferrer"
						className="mt-10 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-zinc-200 no-underline transition-all duration-300 hover:border-violet-500/30 hover:text-violet-300"
					>
						<Github className="h-4 w-4" />
						Open Source Project
					</a>
				</div>
			</section>

			<Footer />
		</div>
	)
}