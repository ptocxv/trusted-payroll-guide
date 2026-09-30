import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  ExternalLink,
  Loader2,
  ShieldQuestion,
  Sparkles,
} from "lucide-react";

import { COUNTRIES, type PayrollSource } from "../lib/sources";

export const Route = createFileRoute("/ask")({
  head: () => ({
    meta: [
      { title: "Ask — Payroll Passport" },
      {
        name: "description",
        content:
          "Ask a payroll question with country, employee context and date. Get an answer backed by trust-ranked, traceable sources.",
      },
      { property: "og:title", content: "Ask — Payroll Passport" },
      {
        property: "og:description",
        content: "Payroll answers grounded in trust-ranked official sources.",
      },
    ],
  }),
  component: AskPage,
});

interface AssessedSource extends PayrollSource {
  trustRank: number;
  whyTrusted: string;
  staleness: "current" | "aging" | "outdated";
}

interface Conflict {
  description: string;
  resolution: string;
}

interface AskResult {
  answer: string;
  confidence: "high" | "medium" | "low";
  insufficient: boolean;
  suggestedExpertSpecialty: string | null;
  sources: AssessedSource[];
  conflicts: Conflict[];
}

const CONFIDENCE_STYLES: Record<string, string> = {
  high: "bg-success/10 text-success border-success/30",
  medium: "bg-warning/10 text-warning-foreground border-warning/40",
  low: "bg-destructive/10 text-destructive border-destructive/30",
};

const STALENESS_STYLES: Record<string, { label: string; className: string }> = {
  current: { label: "Current", className: "bg-success/10 text-success" },
  aging: { label: "Aging — re-verify", className: "bg-warning/15 text-warning-foreground" },
  outdated: { label: "Outdated", className: "bg-destructive/10 text-destructive" },
};

const AUTHORITY_LABELS: Record<string, string> = {
  official: "Official authority",
  government_portal: "Government portal",
  secondary: "Secondary source",
};

function AskPage() {
  const [question, setQuestion] = useState("");
  const [country, setCountry] = useState<string>("Belgium");
  const [employeeContext, setEmployeeContext] = useState("");
  const [asOfDate, setAsOfDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AskResult | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!question.trim() || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question.trim(),
          country,
          employeeContext: employeeContext.trim() || undefined,
          asOfDate: asOfDate || undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setResult(data as AskResult);
    } catch {
      setError("Could not reach the answer engine. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const needsExpert =
    result && (result.insufficient || result.confidence === "low");

  const handoffSearch = result
    ? {
        question: question.trim(),
        country,
        draft: result.answer,
      }
    : undefined;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold text-foreground">Ask Payroll Passport</h1>
      <p className="mt-2 text-muted-foreground">
        Context decides which rules apply. Tell us the country, the employee situation and the date
        the answer must hold for.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 rounded-xl border border-border bg-card p-6 shadow-sm"
      >
        <label className="block text-sm font-medium text-card-foreground" htmlFor="question">
          Your payroll question
        </label>
        <textarea
          id="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={3}
          required
          placeholder="e.g. Can we apply the 30% ruling to a developer relocating from Spain in October?"
          className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-card-foreground" htmlFor="country">
              Country
            </label>
            <select
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-card-foreground" htmlFor="context">
              Employee context <span className="text-muted-foreground">(optional)</span>
            </label>
            <input
              id="context"
              value={employeeContext}
              onChange={(e) => setEmployeeContext(e.target.value)}
              placeholder="e.g. full-time white-collar, cross-border"
              className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-card-foreground" htmlFor="date">
              As-of date <span className="text-muted-foreground">(optional)</span>
            </label>
            <input
              id="date"
              type="date"
              value={asOfDate}
              onChange={(e) => setAsOfDate(e.target.value)}
              className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || question.trim().length < 5}
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Checking sources…
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Get a sourced answer
            </>
          )}
        </button>
      </form>

      {error && (
        <div className="mt-6 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-8 space-y-6">
          {/* Answer */}
          <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-card-foreground">
                <BadgeCheck className="h-5 w-5 text-success" />
                Answer
              </h2>
              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${CONFIDENCE_STYLES[result.confidence]}`}
              >
                {result.confidence} confidence
              </span>
            </div>
            <div className="mt-4 space-y-3 text-sm leading-relaxed text-card-foreground">
              {result.answer.split(/\n{2,}/).map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </section>

          {/* Sources */}
          {result.sources.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-foreground">
                Sources, ranked by trust
              </h2>
              <div className="mt-3 space-y-3">
                {result.sources.map((source) => (
                  <article
                    key={source.id}
                    className="rounded-xl border border-border bg-card p-5 shadow-sm"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline"
                        >
                          {source.title}
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {AUTHORITY_LABELS[source.authority]} · Published {source.publishedDate} ·
                          Verified {source.lastVerified}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-navy px-2.5 py-1 text-xs font-semibold text-navy-foreground">
                          Trust #{source.trustRank}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${STALENESS_STYLES[source.staleness]?.className ?? ""}`}
                        >
                          {STALENESS_STYLES[source.staleness]?.label ?? source.staleness}
                        </span>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">{source.summary}</p>
                    {source.whyTrusted && (
                      <p className="mt-2 border-l-2 border-primary/50 pl-3 text-sm italic text-card-foreground">
                        {source.whyTrusted}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* Conflicts */}
          {result.conflicts.length > 0 && (
            <section className="rounded-xl border border-warning/40 bg-warning/10 p-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Conflicting or outdated information
              </h2>
              <div className="mt-4 space-y-4">
                {result.conflicts.map((conflict, i) => (
                  <div key={i} className="rounded-lg bg-card p-4">
                    <p className="text-sm font-medium text-card-foreground">
                      {conflict.description}
                    </p>
                    <p className="mt-1.5 text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Why the preferred source wins: </span>
                      {conflict.resolution}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Expert handoff */}
          {needsExpert && (
            <section className="rounded-xl border border-primary/30 bg-accent p-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                <ShieldQuestion className="h-5 w-5 text-primary" />
                {result.insufficient
                  ? "Available knowledge is insufficient for a reliable answer"
                  : "This answer needs expert validation"}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {result.suggestedExpertSpecialty
                  ? `Recommended specialty: ${result.suggestedExpertSpecialty}. `
                  : ""}
                Route this question to an expert — the draft answer and its sources go with it, so
                validation takes minutes, not hours.
              </p>
              <Link
                to="/experts"
                search={handoffSearch}
                className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Hand off to an expert
                <ArrowRight className="h-4 w-4" />
              </Link>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
