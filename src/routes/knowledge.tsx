import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, BookCheck, ExternalLink, Loader2, Plus, Search } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";

interface KnowledgeSource {
  title: string;
  url: string;
  authority: string;
  date: string;
}

interface KnowledgeEntry {
  id: string;
  question: string;
  answer: string;
  country: string;
  topic: string;
  sources: KnowledgeSource[];
  validated_by: string;
  valid_from: string;
  valid_until: string | null;
  status: string;
  created_at: string;
}

export const Route = createFileRoute("/knowledge")({
  head: () => ({
    meta: [
      { title: "Knowledge base — Payroll Passport" },
      {
        name: "description",
        content:
          "Validated payroll answers captured as reusable organisational knowledge, with full source lineage and validity dates.",
      },
      { property: "og:title", content: "Knowledge base — Payroll Passport" },
      {
        property: "og:description",
        content: "Reusable, expert-validated payroll knowledge with traceable sources.",
      },
    ],
  }),
  component: KnowledgePage,
});

function KnowledgePage() {
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    question: "",
    answer: "",
    country: "Belgium",
    topic: "",
    validatedBy: "",
  });

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("knowledge_entries")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error: fetchError }) => {
        if (cancelled) return;
        if (fetchError) {
          setError("Could not load the knowledge base.");
        } else {
          setEntries((data as unknown as KnowledgeEntry[]) ?? []);
        }
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter(
      (e) =>
        e.question.toLowerCase().includes(q) ||
        e.answer.toLowerCase().includes(q) ||
        e.topic.toLowerCase().includes(q) ||
        e.country.toLowerCase().includes(q),
    );
  }, [entries, query]);

  async function handleCapture(event: React.FormEvent) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError(null);
    const { data, error: insertError } = await supabase
      .from("knowledge_entries")
      .insert({
        question: form.question.trim(),
        answer: form.answer.trim(),
        country: form.country,
        topic: form.topic.trim() || "General",
        validated_by: form.validatedBy.trim() || "Expert validation",
        sources: [],
        status: "validated",
      })
      .select()
      .single();
    setSaving(false);
    if (insertError) {
      setError("The entry could not be saved. Please try again.");
      return;
    }
    setEntries((prev) => [data as unknown as KnowledgeEntry, ...prev]);
    setShowForm(false);
    setForm({ question: "", answer: "", country: "Belgium", topic: "", validatedBy: "" });
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Knowledge base</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Every validated answer becomes reusable organisational knowledge — with source lineage,
            the validator's name and validity dates.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Capture knowledge
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCapture}
          className="mt-6 rounded-xl border border-border bg-card p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-card-foreground">
            Capture a validated answer
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-card-foreground" htmlFor="kb-q">
                Question
              </label>
              <input
                id="kb-q"
                value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })}
                required
                className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-card-foreground" htmlFor="kb-a">
                Validated answer
              </label>
              <textarea
                id="kb-a"
                value={form.answer}
                onChange={(e) => setForm({ ...form, answer: e.target.value })}
                rows={4}
                required
                className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-card-foreground" htmlFor="kb-c">
                Country
              </label>
              <select
                id="kb-c"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {["Belgium", "Netherlands", "France"].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-card-foreground" htmlFor="kb-t">
                Topic
              </label>
              <input
                id="kb-t"
                value={form.topic}
                onChange={(e) => setForm({ ...form, topic: e.target.value })}
                placeholder="e.g. Social security"
                className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-card-foreground" htmlFor="kb-v">
                Validated by
              </label>
              <input
                id="kb-v"
                value={form.validatedBy}
                onChange={(e) => setForm({ ...form, validatedBy: e.target.value })}
                placeholder="Expert name"
                className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="mt-5 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <BookCheck className="h-4 w-4" />}
            Save to knowledge base
          </button>
        </form>
      )}

      <div className="relative mt-8">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search questions, answers, topics…"
          className="w-full rounded-md border border-input bg-background py-2.5 pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      {loading ? (
        <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading knowledge…
        </div>
      ) : filtered.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">
          No entries match your search.
        </p>
      ) : (
        <div className="mt-6 space-y-4">
          {filtered.map((entry) => (
            <article
              key={entry.id}
              className="rounded-xl border border-border bg-card p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-navy px-2.5 py-0.5 text-xs font-semibold text-navy-foreground">
                  {entry.country}
                </span>
                <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground">
                  {entry.topic}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
                  <BadgeCheck className="h-3 w-3" />
                  Validated
                </span>
              </div>
              <h2 className="mt-3 text-lg font-semibold text-card-foreground">{entry.question}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{entry.answer}</p>
              {entry.sources.length > 0 && (
                <div className="mt-4 space-y-1.5">
                  {entry.sources.map((source, i) => (
                    <a
                      key={i}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      {source.title}
                      <span className="text-xs text-muted-foreground">({source.date})</span>
                    </a>
                  ))}
                </div>
              )}
              <p className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">
                Validated by <span className="font-medium text-foreground">{entry.validated_by}</span>
                {" · "}Valid from {entry.valid_from}
                {entry.valid_until ? ` until ${entry.valid_until}` : " (open-ended)"}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
