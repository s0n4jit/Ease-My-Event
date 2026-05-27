import { createFileRoute } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { Footer } from "#/components/shared/Footer";
import { Navbar } from "#/components/shared/Navbar";

export const Route = createFileRoute("/privacy-policy")({
	head: () => ({
		meta: [
			{ title: "Privacy Policy | EaseMyEvent" },
			{
				name: "description",
				content:
					"Read the Privacy Policy for EaseMyEvent. Learn how we collect, use, and protect your personal information.",
			},
		],
	}),
	component: PrivacyPage,
});

function PrivacyPage() {
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
						<Lock className="h-6 w-6" />
					</div>
					<h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
						Privacy{" "}
						<span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
							Policy
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
							At <strong>EaseMyEvent</strong>, we value your trust and are
							committed to protecting your personal information. This Privacy
							Policy explains how we collect, use, disclose, and safeguard your
							data when you use our application and ticketing services.
						</p>
					</div>

					<div className="grid gap-8 md:grid-cols-1">
						<div className="space-y-4">
							<div className="flex items-center gap-3">
								<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400 font-semibold text-sm">
									1
								</div>
								<h2 className="text-xl font-bold m-0">
									Information We Collect
								</h2>
							</div>
							<div className="pl-11 space-y-3">
								<p className="text-muted-foreground leading-relaxed">
									We collect information to provide and continuously improve our
									services:
								</p>
								<ul className="list-disc space-y-2 text-muted-foreground pl-5">
									<li>
										<strong>Account Information:</strong> Name, email address,
										password, and phone number when you sign up.
									</li>
									<li>
										<strong>Event Information:</strong> Data related to the
										events you host or attend, including ticket purchases,
										RSVPs, and preferences.
									</li>
									<li>
										<strong>Payment Information:</strong> Billing address and
										payment details. These are processed securely via our
										trusted payment gateways (like Razorpay/Stripe); we do not
										store full credit card numbers or sensitive payment
										credentials on our servers.
									</li>
									<li>
										<strong>Device and Usage Data:</strong> IP address,
										operating system, app usage patterns, and crash logs to help
										us optimize application performance and stability.
									</li>
								</ul>
							</div>
						</div>

						<div className="space-y-4">
							<div className="flex items-center gap-3">
								<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400 font-semibold text-sm">
									2
								</div>
								<h2 className="text-xl font-bold m-0">
									How We Use Your Information
								</h2>
							</div>
							<div className="pl-11 space-y-3">
								<p className="text-muted-foreground leading-relaxed">
									We process your information for purposes based on legitimate
									business interests, the fulfillment of our contract with you,
									and compliance with our legal obligations:
								</p>
								<ul className="list-disc space-y-2 text-muted-foreground pl-5">
									<li>
										To facilitate seamless account creation, authentication, and
										secure login.
									</li>
									<li>
										To process ticket transactions, issue digital QR-code
										tickets, and deliver booking confirmations.
									</li>
									<li>
										To allow Event Organizers to view and manage attendee lists
										and broadcast critical event updates.
									</li>
									<li>
										To provide intelligent AI-driven event recommendations.
									</li>
									<li>
										To deliver prompt customer support and resolve user
										inquiries.
									</li>
									<li>
										To send security updates, administrative alerts, and
										promotional communications (which you can opt out of at any
										time).
									</li>
								</ul>
							</div>
						</div>

						<div className="space-y-4">
							<div className="flex items-center gap-3">
								<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400 font-semibold text-sm">
									3
								</div>
								<h2 className="text-xl font-bold m-0">
									How We Share Your Information
								</h2>
							</div>
							<div className="pl-11 space-y-3">
								<p className="text-muted-foreground leading-relaxed">
									We respect your privacy and never sell your personal data. We
									only share it in the following necessary contexts:
								</p>
								<p className="text-muted-foreground leading-relaxed">
									<strong>With Organizers:</strong> When you purchase a ticket
									or RSVP to an event, we share your name and email with the
									Organizer so they can manage event operations and verify
									tickets.
								</p>
								<p className="text-muted-foreground leading-relaxed">
									<strong>With Service Providers:</strong> We share essential
									data with trusted third parties who perform services for us
									(e.g., payment gateways, database hosting, analytical
									tracking, and automated email delivery).
								</p>
								<p className="text-muted-foreground leading-relaxed">
									<strong>For Legal Reasons:</strong> We may disclose data if
									legally required to do so to comply with applicable laws,
									governmental requests, judicial proceedings, or court orders.
								</p>
							</div>
						</div>

						<div className="space-y-4">
							<div className="flex items-center gap-3">
								<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400 font-semibold text-sm">
									4
								</div>
								<h2 className="text-xl font-bold m-0">Data Security</h2>
							</div>
							<div className="pl-11 space-y-3">
								<p className="text-muted-foreground leading-relaxed">
									We implement robust industry-standard technical and
									organizational security measures (such as SSL encryption,
									hashing, and secure network infrastructure) to protect your
									personal data. However, please remember that no electronic
									transmission over the internet or information storage
									technology can be guaranteed 100% secure.
								</p>
							</div>
						</div>

						<div className="space-y-4">
							<div className="flex items-center gap-3">
								<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400 font-semibold text-sm">
									5
								</div>
								<h2 className="text-xl font-bold m-0">
									Your Rights and Choices
								</h2>
							</div>
							<div className="pl-11 space-y-3">
								<p className="text-muted-foreground leading-relaxed">
									Depending on your jurisdiction, you may have rights enabling
									you to:
								</p>
								<ul className="list-disc space-y-2 text-muted-foreground pl-5">
									<li>
										<strong>Access:</strong> Request a digital copy of the
										personal data we hold about you.
									</li>
									<li>
										<strong>Correction:</strong> Request that we update or
										rectify inaccurate or incomplete profile information.
									</li>
									<li>
										<strong>Deletion:</strong> Request that we permanently
										delete your account and associated personal data.
									</li>
									<li>
										<strong>Opt-Out:</strong> Unsubscribe from marketing emails
										at any time via the link in our footers.
									</li>
								</ul>
							</div>
						</div>

						<div className="space-y-4">
							<div className="flex items-center gap-3">
								<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400 font-semibold text-sm">
									6
								</div>
								<h2 className="text-xl font-bold m-0">Contact Us</h2>
							</div>
							<div className="pl-11 space-y-3">
								<p className="text-muted-foreground leading-relaxed">
									If you have any questions or feedback regarding this Privacy
									Policy, please get in touch:
								</p>
								<p className="text-muted-foreground leading-relaxed">
									<strong>Email:</strong> privacy@easemyevent.com
									<br />
									<strong>Address:</strong> EaseMyEvent HQ, Bengaluru, India
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
