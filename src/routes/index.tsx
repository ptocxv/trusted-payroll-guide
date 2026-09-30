import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookCheck,
  CircleHelp,
  FileSearch,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Payroll Passport — Trusted payroll knowledge, verified" },
      {
        name: "description",
        content:
          "Payroll Passport determines which payroll information is reliable and applicable to your client, country and date — with traceable sources, expert validation and reusable knowledge.",
      },
      { property: "og:title", content: "Payroll Passport — Trusted payroll knowledge, verified" },
      {
        property: "og:description",
        content:
          "A closed loop from question to evidence, expert validation and knowledge capture for payroll consultants.",
      },
    ],
  }),
  component: LandingPage,
});

const LOOP_STEPS = [
  {
    icon: CircleHelp,
    step: "1",
    title: "Ask with context",
    text: "Pose a payroll question with the client country, employee profile and date. Context decides which rules apply.",
  },
  {
    icon: FileSearch,
    step: "2",
    title: "Evidence, ranked",
    text: "Every answer is backed by traceable sources, ranked by authority. Outdated or conflicting information is flagged — and explained.",
  },
  {
    icon: UserCheck,
    step: "3",
    title: "Expert validation",
    text: "When knowledge is insufficient, the question is routed to the most relevant expert, packaged with the draft answer and its sources.",
  },
  {
    icon: BookCheck,
    step: "4",
    title: "Knowledge captured",
    text: "The validated answer becomes reusable organisational knowledge — so the next consultant answers in seconds, not days.",
  },
];

const TRUST_POINTS = [
  {
    title: "Traceable by design",
    text: "No anonymous answers. Every claim links to the official source it came from, with publish and verification dates.",
  },
  {
    title: "Conflicts surfaced, not hidden",
    text: "When sources disagree or age out, Payroll Passport says so — and explains why one source should win.",
  },
  {
    title: "Experts stay in the loop",
    text: "AI drafts, experts validate. Critical payroll expertise stops living in inboxes and individual memory.",
  },
];

function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-navy text-navy-foreground">
        <div className="mx-auto max-w-6xl px-4 py-20 md:py-28">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-navy-foreground/20 px-3 py-1 text-xs font-medium tracking-wide uppercase">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              For payroll consultants
            </p>
            <h1 className="mt-6 text-4xl font-bold leading-tight md:text-5xl">
              Payroll answers you can defend — not just find.
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-navy-foreground/80">
              Payroll Passport determines which information is reliable and applicable to a specific
              client, country, employee context and date. Traceable sources, conflict detection,
              expert validation and knowledge capture — in one closed loop.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/ask"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Ask a payroll question
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/knowledge"
                className="inline-flex items-center gap-2 rounded-md border border-navy-foreground/25 px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-navy-foreground/10"
              >
                Browse validated knowledge
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Loop */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <h2 className="text-3xl font-bold text-foreground">The closed loop</h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          From question to evidence, expert validation and knowledge capture — every resolved
          question makes the next one faster and safer.
        </p>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {LOOP_STEPS.map((step) => (
            <div
              key={step.step}
              className="rounded-xl border border-border bg-card p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <step.icon className="h-5 w-5" />
                </span>
                <span className="text-sm font-bold text-muted-foreground">{step.step}</span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-card-foreground">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust */}
      <section className="bg-secondary">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
          <h2 className="text-3xl font-bold text-foreground">
            Not replacing experts. Making expertise reusable.
          </h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {TRUST_POINTS.map((point) => (
              <div key={point.title} className="rounded-xl border border-border bg-card p-6">
                <h3 className="text-lg font-semibold text-card-foreground">{point.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{point.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link
              to="/ask"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Try the answer engine
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
