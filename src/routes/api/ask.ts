import { createFileRoute } from "@tanstack/react-router";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { z } from "zod";

import { sourcesForCountry } from "../../lib/sources";
import {
  createLovableAiGatewayRunIdFetch,
  getLovableAiGatewayRunId,
} from "../../lib/ai/run-id";

const requestSchema = z.object({
  question: z.string().min(5).max(2000),
  country: z.string().min(2).max(60),
  employeeContext: z.string().max(500).optional(),
  asOfDate: z.string().max(20).optional(),
});

const SYSTEM_PROMPT = `You are Payroll Passport, a trusted knowledge assistant for payroll consultants.
You answer payroll questions for a specific country, employee context and date, grounded ONLY in the curated source registry provided to you.

Rules:
- Determine which sources are reliable and applicable to the question, country and date.
- Rank sources by trust: "official" (tax/social-security authority) > "government_portal" > "secondary".
- Identify outdated or conflicting information and explain why one source should be trusted over another.
- If the available knowledge is insufficient to answer reliably, say so (insufficient: true) and name the expert specialty that should validate the answer.
- Never invent source URLs. Only cite sources from the registry provided.
- Answer in clear, consultant-ready language. Be precise about rates, thresholds and dates, and always note when a value must be verified against the linked official source.

Respond with ONLY a JSON object matching this exact shape (no markdown fences):
{
  "answer": "string — the full answer, 2-4 short paragraphs",
  "confidence": "high" | "medium" | "low",
  "insufficient": boolean,
  "suggestedExpertSpecialty": "string or null — the specialty to route to when insufficient or confidence is low",
  "sources": [
    {
      "id": "string — id from the registry",
      "trustRank": number,
      "whyTrusted": "string — one sentence on why this source is trusted for this question",
      "staleness": "current" | "aging" | "outdated"
    }
  ],
  "conflicts": [
    {
      "description": "string — what conflicts or is outdated",
      "resolution": "string — why the preferred source wins"
    }
  ]
}`;

export const Route = createFileRoute("/api/ask")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) {
          return Response.json({ error: "AI service is not configured." }, { status: 500 });
        }

        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "Invalid request body." }, { status: 400 });
        }

        const parsed = requestSchema.safeParse(body);
        if (!parsed.success) {
          return Response.json({ error: "Please provide a question and a country." }, { status: 400 });
        }

        const { question, country, employeeContext, asOfDate } = parsed.data;
        const registry = sourcesForCountry(country);

        const userPrompt = [
          `Country: ${country}`,
          employeeContext ? `Employee context: ${employeeContext}` : null,
          `As-of date: ${asOfDate ?? new Date().toISOString().slice(0, 10)}`,
          "",
          `Question: ${question}`,
          "",
          "Source registry (JSON):",
          JSON.stringify(registry, null, 2),
        ]
          .filter(Boolean)
          .join("\n");

        const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));
        const provider = createOpenAI({
          baseURL: "https://ai.gateway.lovable.dev/v1",
          apiKey,
          headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
          fetch: runIdFetch.fetch,
        });

        try {
          const result = streamText({
            model: provider.responses("openai/gpt-6-astra"),
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              { role: "user", content: userPrompt },
            ],
            abortSignal: request.signal,
            providerOptions: {
              openai: {
                store: false,
                forceReasoning: true,
                reasoningEffort: "medium",
                reasoningSummary: "auto",
                include: ["reasoning.encrypted_content"],
              },
            },
          });

          const text = await result.text;
          const cleaned = text
            .trim()
            .replace(/^```(?:json)?\s*/i, "")
            .replace(/```\s*$/, "");
          const structured = JSON.parse(cleaned);

          // Join AI source assessments back to the curated registry entries.
          const citedSources = (Array.isArray(structured.sources) ? structured.sources : [])
            .map((s: { id?: string; trustRank?: number; whyTrusted?: string; staleness?: string }) => {
              const entry = registry.find((r) => r.id === s.id);
              if (!entry) return null;
              return {
                ...entry,
                trustRank: s.trustRank ?? 99,
                whyTrusted: s.whyTrusted ?? "",
                staleness: s.staleness ?? "current",
              };
            })
            .filter(Boolean)
            .sort(
              (a: { trustRank: number }, b: { trustRank: number }) => a.trustRank - b.trustRank,
            );

          return Response.json({
            answer: structured.answer ?? "",
            confidence: structured.confidence ?? "low",
            insufficient: Boolean(structured.insufficient),
            suggestedExpertSpecialty: structured.suggestedExpertSpecialty ?? null,
            sources: citedSources,
            conflicts: Array.isArray(structured.conflicts) ? structured.conflicts : [],
          });
        } catch (error) {
          console.error("AI answer generation failed", error);
          return Response.json(
            { error: "The answer engine could not complete this request. Please try again." },
            { status: 502 },
          );
        }
      },
    },
  },
});
