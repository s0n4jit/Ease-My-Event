import { createFileRoute } from "@tanstack/react-router";
import { ScrollText } from "lucide-react";
import { Footer } from "#/components/shared/Footer";
import { Navbar } from "#/components/shared/Navbar";

export const Route = createFileRoute("/terms-of-service")({
	head: () => ({
		meta: [
			{ title: "Terms of Service | EaseMyEvent" },
			{
				name: "description",
				content:
					"Read the terms and conditions for using the EaseMyEvent event management and ticketing platform.",
			},
		],
	}),
	component: TermsPage,
});

function TermsPage() {
	const lastUpdated = "May 27, 2026";

	return (
		<div className="min-h-screen bg-background">
			<Navbar />

			{/* Hero Section */}
			<section className="relative overflow-hidden border-b border-border/40 bg-muted/20 py-20">
				<div className="absolute inset-0 -z-10">
					<div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 via-transparent to-indigo-600/5" />
					<div className="absolute top-10 left-10 h-72 w-72 rounded-full bg-violet-400/10 blur-3xl" />
					<div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-indigo-400/10 blur-3xl" />
				</div>
				<div className="mx-auto max-w-4xl px-4 text-center">
					<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400 shadow-md">
						<ScrollText className="h-6 w-6" />
					</div>
					<h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
						Terms of{" "}
						<span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
							Service
						</span>
					</h1>
					<p className="mt-4 text-muted-foreground">
						Last Updated: {lastUpdated}
					</p>
				</div>
			</section>

			{/* Content Section */}
			<section className="mx-auto max-w-4xl px-4 py-16">
				<div className="prose prose-violet dark:prose-invert max-w-none space-y-12">
					<div className="rounded-2xl border border-border/60 bg-card/50 p-6 backdrop-blur-sm sm:p-8">
						<p className="text-base leading-relaxed text-muted-foreground mt-0">
							Welcome to <strong>EaseMyEvent</strong> (&quot;we,&quot;
							&quot;our,&quot; or &quot;us&quot;). By downloading, accessing, or
							using our event management application and related services (the
							&quot;Service&quot;), you agree to be bound by these Terms of
							Service. If you do not agree, please do not use the Service.
						</p>
					</div>

					<div className="grid gap-8 md:grid-cols-1">
						<div className="space-y-4">
							<div className="flex items-center gap-3">
								<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400 font-semibold text-sm">
									1
								</div>
								<h2 className="text-xl font-bold m-0">Account Registration</h2>
							</div>
							<div className="pl-11 space-y-3">
								<p className="text-muted-foreground leading-relaxed">
									<strong>Eligibility:</strong> You must be at least 18 years
									old (or the age of majority in your jurisdiction) to create an
									account.
								</p>
								<p className="text-muted-foreground leading-relaxed">
									<strong>Account Types:</strong> The Service accommodates two
									primary user types: Organizers (who create and manage events)
									and Attendees (who register for or purchase tickets to
									events).
								</p>
								<p className="text-muted-foreground leading-relaxed">
									<strong>Responsibility:</strong> You are responsible for
									maintaining the confidentiality of your account credentials
									and for all activities that occur under your account.
								</p>
							</div>
						</div>

						<div className="space-y-4">
							<div className="flex items-center gap-3">
								<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400 font-semibold text-sm">
									2
								</div>
								<h2 className="text-xl font-bold m-0">
									Event Creation and Ticketing
								</h2>
							</div>
							<div className="pl-11 space-y-3">
								<p className="text-muted-foreground leading-relaxed">
									<strong>Organizer Responsibilities:</strong> Organizers are
									solely responsible for the events they create, including
									accuracy of details, safety, compliance with local laws, and
									fulfilling the promised experience.
								</p>
								<p className="text-muted-foreground leading-relaxed">
									<strong>Payments and Fees:</strong> We use secure, third-party
									payment processors (such as Razorpay) to handle transactions.
									EaseMyEvent may charge platform service fees on ticket sales,
									which will be clearly disclosed prior to purchase.
								</p>
								<p className="text-muted-foreground leading-relaxed">
									<strong>Cancellations and Refunds:</strong> Organizers dictate
									their own refund policies. We are not responsible for issuing
									refunds unless required by law or if we determine, in our sole
									discretion, that an Organizer has violated these Terms.
								</p>
							</div>
						</div>

						<div className="space-y-4">
							<div className="flex items-center gap-3">
								<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400 font-semibold text-sm">
									3
								</div>
								<h2 className="text-xl font-bold m-0">User Conduct</h2>
							</div>
							<div className="pl-11 space-y-3">
								<p className="text-muted-foreground leading-relaxed">
									You agree not to use the Service to:
								</p>
								<ul className="list-disc space-y-2 text-muted-foreground pl-5">
									<li>Post false, misleading, or fraudulent event listings.</li>
									<li>
										Organize events that promote illegal activities, violence,
										hate speech, or harassment.
									</li>
									<li>
										Interfere with the security, performance, or functionality
										of the Service.
									</li>
									<li>
										Scrape, data-mine, or extract content from the Service
										without explicit permission.
									</li>
								</ul>
							</div>
						</div>

						<div className="space-y-4">
							<div className="flex items-center gap-3">
								<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400 font-semibold text-sm">
									4
								</div>
								<h2 className="text-xl font-bold m-0">Intellectual Property</h2>
							</div>
							<div className="pl-11 space-y-3">
								<p className="text-muted-foreground leading-relaxed">
									<strong>Our Content:</strong> All code, design, assets, and
									original content on the Service are owned exclusively by
									EaseMyEvent.
								</p>
								<p className="text-muted-foreground leading-relaxed">
									<strong>Your Content:</strong> You retain ownership of the
									content you upload (event descriptions, images). By uploading,
									you grant us a worldwide, non-exclusive, royalty-free license
									to use, display, and promote that content to operate the
									Service.
								</p>
							</div>
						</div>

						<div className="space-y-4">
							<div className="flex items-center gap-3">
								<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400 font-semibold text-sm">
									5
								</div>
								<h2 className="text-xl font-bold m-0">
									Limitation of Liability
								</h2>
							</div>
							<div className="pl-11 space-y-3">
								<p className="text-muted-foreground leading-relaxed">
									To the maximum extent permitted by law, EaseMyEvent shall not
									be liable for any indirect, incidental, or consequential
									damages arising from your use of the Service, your attendance
									at any event, or the actions of any Organizer or Attendee. The
									Service is provided &quot;AS IS&quot; and &quot;AS
									AVAILABLE.&quot;
								</p>
							</div>
						</div>

						<div className="space-y-4">
							<div className="flex items-center gap-3">
								<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400 font-semibold text-sm">
									6
								</div>
								<h2 className="text-xl font-bold m-0">Governing Law</h2>
							</div>
							<div className="pl-11 space-y-3">
								<p className="text-muted-foreground leading-relaxed">
									These Terms shall be governed by the laws of India, without
									regard to its conflict of law principles. Any dispute arising
									from these terms shall be subject to the exclusive
									jurisdiction of the competent courts of India.
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			<Footer />
		</div>
	);
}
