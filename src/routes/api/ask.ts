import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { sourcesForCountry } from "../../lib/sources";

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
- Be concise and direct. Lead with the answer itself in the first sentence (yes/no, the rate, the threshold, the deadline). No preamble, no restating the question, no generic background.
- Cite at most 3 sources — only those that directly support the answer.
- Only list conflicts that genuinely exist for this question; otherwise return an empty array.

Respond with ONLY a JSON object matching this exact shape (no markdown fences):
{
  "answer": "string — max ~90 words: a one-sentence direct answer, then up to 3 short key points each on its own line starting with '- ', then one line 'Verify: ...' naming what to check in the official source",
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

/** Consume the gateway SSE stream and accumulate the output text. */
async function readOutputText(body: ReadableStream<Uint8Array>, signal: AbortSignal): Promise<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let output = "";
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const frames = buffer.split("\n\n");
      buffer = frames.pop() ?? "";
      for (const frame of frames) {
        for (const line of frame.split("\n")) {
          if (!line.startsWith("data:")) continue;
          const payload = line.slice(5).trim();
          if (!payload || payload === "[DONE]") continue;
          try {
            const event = JSON.parse(payload);
            if (event.type === "response.output_text.delta" && typeof event.delta === "string") {
              output += event.delta;
            }
          } catch {
            // incomplete frame fragment — ignore
          }
        }
      }
    }
  } finally {
    if (signal.aborted) {
      await reader.cancel().catch(() => {});
    }
    reader.releaseLock();
  }
  return output;
}

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

        try {
          const gatewayResponse = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Lovable-API-Key": apiKey,
              "Content-Type": "application/json",
              "X-Lovable-AIG-SDK": "fetch",
            },
            body: JSON.stringify({
              model: "openai/gpt-6-astra",
              store: false,
              stream: true,
              reasoning: { effort: "low" },
              input: [
                {
                  role: "system",
                  content: [{ type: "input_text", text: SYSTEM_PROMPT }],
                },
                {
                  role: "user",
                  content: [{ type: "input_text", text: userPrompt }],
                },
              ],
            }),
            signal: request.signal,
          });

          if (!gatewayResponse.ok || !gatewayResponse.body) {
            const detail = await gatewayResponse.text().catch(() => "");
            console.error("Gateway error", gatewayResponse.status, detail.slice(0, 500));
            if (gatewayResponse.status === 429 || gatewayResponse.status >= 500) {
              return Response.json(
                { error: "The answer engine is busy. Please try again in a moment." },
                { status: 503 },
              );
            }
            return Response.json(
              { error: "The answer engine could not complete this request." },
              { status: 502 },
            );
          }

          const text = await readOutputText(gatewayResponse.body, request.signal);
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
