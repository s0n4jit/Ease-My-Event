import { Link } from "@tanstack/react-router";
import { Github, Linkedin, Mail, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { APP_NAME } from "#/lib/constants";

export function Footer() {
	const [email, setEmail] = useState("");

	const handleSubscribe = (e: React.FormEvent) => {
		e.preventDefault();
		if (!email.trim()) return;
		toast.success("Subscribed successfully to our newsletter!");
		setEmail("");
	};

	return (
		<footer className="site-footer py-16">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				{/* Top section: Brand, Columns and Newsletter */}
				<div className="grid gap-12 lg:grid-cols-12 pb-12 border-b border-[var(--line)]">
					{/* Brand Column */}
					<div className="lg:col-span-4 space-y-4">
						<Link
							to="/"
							className="flex items-center gap-2.5 no-underline shrink-0 group"
						>
							<img
								src="/assets/EaseMyEvent_E_logo.png"
								alt="EaseMyEvent E Logo"
								className="h-10 w-10 object-contain shrink-0"
							/>
							<span className="text-xl font-black tracking-tight">
								<span className="text-slate-900 dark:text-white">Ease</span>
								<span className="bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent">
									My
								</span>
								<span className="text-slate-900 dark:text-white">Event</span>
							</span>
						</Link>
						<p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
							Your premier AI-powered event management and ticketing platform.
							Discover, create, and experience extraordinary events.
						</p>

						{/* Social Icons */}
						<div className="flex items-center gap-4 pt-2">
							<a
								href="https://github.com/s0n4jit/Ease-My-Event"
								target="_blank"
								rel="noreferrer noopener"
								aria-label="EaseMyEvent GitHub"
								className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-white hover:border-violet-500/30 transition-all"
							>
								<Github className="h-4.5 w-4.5" />
							</a>
							<a
								href="https://linkedin.com"
								target="_blank"
								rel="noreferrer noopener"
								aria-label="EaseMyEvent LinkedIn"
								className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-white hover:border-violet-500/30 transition-all"
							>
								<Linkedin className="h-4.5 w-4.5" />
							</a>
							<a
								href="mailto:help@easemyevent.local"
								aria-label="Email EaseMyEvent support"
								className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-white hover:border-violet-500/30 transition-all"
							>
								<Mail className="h-4.5 w-4.5" />
							</a>
						</div>
					</div>

					{/* Navigation Links Columns */}
					<div className="lg:col-span-5 grid grid-cols-3 gap-6">
						{/* Product Column */}
						<div>
							<h4 className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-widest mb-4">
								Product
							</h4>
							<ul className="space-y-2.5">
								<li>
									<Link
										to="/events"
										className="text-xs text-slate-600 dark:text-slate-400 hover:text-violet-700 dark:hover:text-white no-underline transition-colors"
									>
										Browse Events
									</Link>
								</li>
								<li>
									<Link
										to="/organiser/events/create"
										className="text-xs text-slate-600 dark:text-slate-400 hover:text-violet-700 dark:hover:text-white no-underline transition-colors"
									>
										Create Event
									</Link>
								</li>
								<li>
									<Link
										to="/organiser"
										className="text-xs text-slate-600 dark:text-slate-400 hover:text-violet-700 dark:hover:text-white no-underline transition-colors"
									>
										Dashboard
									</Link>
								</li>
							</ul>
						</div>

						{/* Resources Column */}
						<div>
							<h4 className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-widest mb-4">
								Resources
							</h4>
							<ul className="space-y-2.5">
								<li>
									<Link
										to="/team"
										className="text-xs text-slate-600 dark:text-slate-400 hover:text-violet-700 dark:hover:text-white no-underline transition-colors"
									>
										Meet the Team
									</Link>
								</li>
								<li>
									<span className="text-xs text-slate-500 dark:text-slate-500 cursor-not-allowed">
										Developer API
									</span>
								</li>
								<li>
									<span className="text-xs text-slate-500 dark:text-slate-500 cursor-not-allowed">
										Pricing Plans
									</span>
								</li>
							</ul>
						</div>

						{/* Legal Column */}
						<div>
							<h4 className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-widest mb-4">
								Legal
							</h4>
							<ul className="space-y-2.5">
								<li>
									<Link
										to="/terms-of-service"
										className="text-xs text-slate-600 dark:text-slate-400 hover:text-violet-700 dark:hover:text-white no-underline transition-colors block"
									>
										Terms of Service
									</Link>
								</li>
								<li>
									<Link
										to="/privacy-policy"
										className="text-xs text-slate-600 dark:text-slate-400 hover:text-violet-700 dark:hover:text-white no-underline transition-colors block"
									>
										Privacy Policy
									</Link>
								</li>
								<li>
									<Link
										to="/refund-policy"
										className="text-xs text-slate-600 dark:text-slate-400 hover:text-violet-700 dark:hover:text-white no-underline transition-colors block"
									>
										Refund Policy
									</Link>
								</li>
							</ul>
						</div>
					</div>

					{/* Newsletter Signup Column */}
					<div className="lg:col-span-3 space-y-4">
						<h4 className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-widest">
							Newsletter
						</h4>
						<p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
							Subscribe to get notified about upcoming tech summits, music
							festivals, and workshops.
						</p>
						<form onSubmit={handleSubscribe} className="flex gap-2">
							<Input
								type="email"
								placeholder="Enter email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="h-10 focus-visible:ring-violet-500/30 text-xs rounded-xl"
							/>
							<Button
								type="submit"
								size="icon"
								className="h-10 w-10 shrink-0 bg-violet-600 hover:bg-violet-700 text-white rounded-xl shadow-md"
							>
								<Send className="h-4 w-4" />
							</Button>
						</form>
					</div>
				</div>

				{/* Bottom section: Copyright and Attribution */}
				{/* Bottom section: Copyright and Team Link */}
				<div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
					<p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
						© {new Date().getFullYear()} {APP_NAME}. All rights reserved.
					</p>

					<Link
						to="/team"
						className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/80 backdrop-blur-md px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:border-violet-400/60 hover:text-violet-600 dark:hover:text-violet-300"
					>
						<span className="h-2 w-2 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 animate-pulse" />

						<span>Meet the Team</span>
					</Link>
				</div>
			</div>
		</footer >
	);
}
