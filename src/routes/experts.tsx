import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BadgeCheck, Loader2, Mail, Send, UserRound } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";

interface Expert {
  id: string;
  name: string;
  title: string;
  country: string;
  specialties: string[];
  seniority_years: number;
  availability: string;
  email: string;
}

interface HandoffSearch {
  question?: string | undefined;
  country?: string | undefined;
  draft?: string | undefined;
}

export const Route = createFileRoute("/experts")({
  validateSearch: (search: Record<string, unknown>): HandoffSearch => ({
    question: typeof search["question"] === "string" ? search["question"] : undefined,
    country: typeof search["country"] === "string" ? search["country"] : undefined,
    draft: typeof search["draft"] === "string" ? search["draft"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Experts — Payroll Passport" },
      {
        name: "description",
        content:
          "When knowledge is insufficient, Payroll Passport routes your question to the most relevant payroll expert — with the draft answer and sources attached.",
      },
      { property: "og:title", content: "Experts — Payroll Passport" },
      {
        property: "og:description",
        content: "Expert handoff for payroll questions that need human validation.",
      },
    ],
  }),
  component: ExpertsPage,
});

function ExpertsPage() {
  const search = Route.useSearch();
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loadingExperts, setLoadingExperts] = useState(true);
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [question, setQuestion] = useState(search.question ?? "");
  const [country, setCountry] = useState(search.country ?? "Belgium");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("experts")
      .select("*")
      .order("seniority_years", { ascending: false })
      .then(({ data, error: fetchError }) => {
        if (cancelled) return;
        if (fetchError) {
          setError("Could not load the expert directory.");
        } else {
          setExperts((data as Expert[]) ?? []);
        }
        setLoadingExperts(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = experts.filter(
    (e) => e.country === country || e.specialties.some((s) => /cross-border|multi-country/i.test(s)),
  );
  const shown = filtered.length > 0 ? filtered : experts;

  async function handleHandoff(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedExpert || !question.trim() || sending) return;
    setSending(true);
    setError(null);
    const { error: insertError } = await supabase.from("handoff_requests").insert({
      question: question.trim(),
      country,
      ai_draft: search.draft ?? null,
      expert_id: selectedExpert.id,
      status: "pending",
    });
    setSending(false);
    if (insertError) {
      setError("The handoff could not be sent. Please try again.");
      return;
    }
    setSent(true);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold text-foreground">Expert handoff</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        When the knowledge base can't answer reliably, the question goes to the most relevant
        expert — packaged with the AI draft and its sources, so validation is fast.
      </p>

      <div className="mt-10 grid gap-8 lg:grid-cols-5">
        {/* Directory */}
        <section className="lg:col-span-3">
          <h2 className="text-lg font-semibold text-foreground">Expert directory</h2>
          {loadingExperts ? (
            <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading experts…
            </div>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {shown.map((expert) => (
                <button
                  key={expert.id}
                  type="button"
                  onClick={() => {
                    setSelectedExpert(expert);
                    setSent(false);
                  }}
                  className={`rounded-xl border p-5 text-left shadow-sm transition-colors ${
                    selectedExpert?.id === expert.id
                      ? "border-primary bg-accent"
                      : "border-border bg-card hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-navy text-navy-foreground">
                        <UserRound className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="font-semibold text-card-foreground">{expert.name}</p>
                        <p className="text-xs text-muted-foreground">{expert.title}</p>
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        expert.availability === "Available"
                          ? "bg-success/10 text-success"
                          : "bg-warning/15 text-warning-foreground"
                      }`}
                    >
                      {expert.availability}
                    </span>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    {expert.country} · {expert.seniority_years} years experience
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {expert.specialties.map((specialty) => (
                      <span
                        key={specialty}
                        className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Handoff form */}
        <section className="lg:col-span-2">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm lg:sticky lg:top-20">
            <h2 className="text-lg font-semibold text-card-foreground">Send for validation</h2>
            {sent ? (
              <div className="mt-4 rounded-lg border border-success/30 bg-success/10 p-4">
                <p className="flex items-center gap-2 text-sm font-medium text-success">
                  <BadgeCheck className="h-4 w-4" />
                  Handoff sent to {selectedExpert?.name}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Once validated, the answer is captured in the knowledge base automatically.
                </p>
              </div>
            ) : (
              <form onSubmit={handleHandoff} className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-card-foreground" htmlFor="ho-question">
                    Question
                  </label>
                  <textarea
                    id="ho-question"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    rows={3}
                    required
                    className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground" htmlFor="ho-country">
                    Country
                  </label>
                  <select
                    id="ho-country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {["Belgium", "Netherlands", "France"].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                {search.draft && (
                  <div className="rounded-lg bg-secondary p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      AI draft attached
                    </p>
                    <p className="mt-1 line-clamp-4 text-xs text-secondary-foreground">
                      {search.draft}
                    </p>
                  </div>
                )}
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  {selectedExpert
                    ? `Will be sent to ${selectedExpert.name}`
                    : "Select an expert from the directory"}
                </p>
                <button
                  type="submit"
                  disabled={!selectedExpert || !question.trim() || sending}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Send handoff
                </button>
              </form>
            )}
            {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
