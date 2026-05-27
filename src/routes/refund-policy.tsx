import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeftRight } from "lucide-react";
import { Footer } from "#/components/shared/Footer";
import { Navbar } from "#/components/shared/Navbar";

export const Route = createFileRoute("/refund-policy")({
	head: () => ({
		meta: [
			{ title: "Refund Policy | EaseMyEvent" },
			{
				name: "description",
				content:
					"Read the Cancellation and Refund Policy for EaseMyEvent ticket bookings.",
			},
		],
	}),
	component: RefundPolicyPage,
});

function RefundPolicyPage() {
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
						<ArrowLeftRight className="h-6 w-6" />
					</div>
					<h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
						Cancellation &{" "}
						<span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
							Refund Policy
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
							Thank you for using EaseMyEvent. We want to ensure a fair and
							transparent experience for both our Event Organizers and
							Attendees. Please read this Cancellation and Refund Policy
							carefully before purchasing tickets or registering for events.
						</p>
					</div>

					<div className="grid gap-8 md:grid-cols-1">
						<div className="space-y-4">
							<div className="flex items-center gap-3">
								<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400 font-semibold text-sm">
									1
								</div>
								<h2 className="text-xl font-bold m-0">
									Organizer-Driven Refund Policies
								</h2>
							</div>
							<div className="pl-11 space-y-3">
								<p className="text-muted-foreground leading-relaxed">
									EaseMyEvent provides the technology platform to enable
									ticketing, but does not organize, host, or set policies for
									the events themselves:
								</p>
								<ul className="list-disc space-y-2 text-muted-foreground pl-5">
									<li>
										<strong>Organizer Discretion:</strong> Each Event Organizer
										dictates their own specific refund policies (e.g., &quot;No
										Refunds,&quot; &quot;Refunds up to 7 days before
										event,&quot; etc.).
									</li>
									<li>
										<strong>Reviewing Policies:</strong> Attendees must review
										the specific event details and refund policies listed by the
										Organizer on the event detail page prior to making any
										ticket purchases.
									</li>
									<li>
										<strong>Contacting Organizers:</strong> Any request for a
										ticket cancellation or refund must be initiated directly
										with the Event Organizer through their contact information
										provided on the event page.
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
									Event Cancellations or Postponement
								</h2>
							</div>
							<div className="pl-11 space-y-3">
								<p className="text-muted-foreground leading-relaxed">
									If an event is cancelled entirely or postponed by the
									Organizer:
								</p>
								<ul className="list-disc space-y-2 text-muted-foreground pl-5">
									<li>
										<strong>Cancelled Events:</strong> In the event of a full
										cancellation by the Organizer, attendees are generally
										entitled to a refund. The Event Organizer is responsible for
										initiating and funding the refund process.
									</li>
									<li>
										<strong>Postponed Events:</strong> If an event is postponed
										or rescheduled, tickets will typically remain valid for the
										new date. If you cannot attend the new date, you must
										contact the Organizer to request a refund.
									</li>
									<li>
										<strong>Service Fees:</strong> Please note that EaseMyEvent
										platform service fees and payment processor gateway fees may
										be non-refundable depending on the specific event setup and
										transaction details.
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
									Platform Intervention and Disputes
								</h2>
							</div>
							<div className="pl-11 space-y-3">
								<p className="text-muted-foreground leading-relaxed">
									While we encourage peaceful resolution directly between
									attendees and organizers, EaseMyEvent reserves the right to
									intervene in exceptional circumstances:
								</p>
								<p className="text-muted-foreground leading-relaxed">
									If an organizer acts fraudulently, fails to host the promised
									event without notice, or violates our Terms of Service,
									EaseMyEvent may, in its sole discretion, lock the
									organizer&apos;s payouts and assist attendees in obtaining
									refunds from remaining platform event balances.
								</p>
							</div>
						</div>

						<div className="space-y-4">
							<div className="flex items-center gap-3">
								<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400 font-semibold text-sm">
									4
								</div>
								<h2 className="text-xl font-bold m-0">
									Processing Time for Refunds
								</h2>
							</div>
							<div className="pl-11 space-y-3">
								<p className="text-muted-foreground leading-relaxed">
									Once a refund is approved and initiated by the Event Organizer
									or EaseMyEvent:
								</p>
								<p className="text-muted-foreground leading-relaxed">
									The funds will be returned to the original payment source
									(Credit/Debit Card, UPI, Net Banking, or Mobile Wallet) used
									during purchase. Standard processing times range between{" "}
									<strong>5 to 7 business days</strong> depending on your bank
									and our third-party payment processor (Razorpay).
								</p>
							</div>
						</div>

						<div className="space-y-4">
							<div className="flex items-center gap-3">
								<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400 font-semibold text-sm">
									5
								</div>
								<h2 className="text-xl font-bold m-0">Need Assistance?</h2>
							</div>
							<div className="pl-11 space-y-3">
								<p className="text-muted-foreground leading-relaxed">
									If you have tried contacting the Event Organizer and have not
									received a response after 3 business days, or if you believe
									there is a billing error, please reach out to us:
								</p>
								<p className="text-muted-foreground leading-relaxed">
									<strong>Support Email:</strong> billing@easemyevent.com
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
