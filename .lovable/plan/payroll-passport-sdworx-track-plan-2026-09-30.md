# Payroll Passport — SDWorx Track Plan

A trusted knowledge assistant for payroll consultants: answers questions with traceable, trust-ranked sources, flags outdated/conflicting info, hands off to experts when knowledge is insufficient, and captures validated answers as reusable knowledge.

## What we'll build

### 1. Landing page (`/`)
- Professional corporate design: clean whites, deep navy, one strong accent (SDWorx-adjacent red), enterprise SaaS feel
- Hero explaining the closed loop: Question → Evidence → Expert validation → Knowledge capture
- "How it works" loop diagram, trust signals, CTA into the app

### 2. Ask — the answer engine (`/ask`)
- Consultant asks a payroll question with context: country, employee type, date
- Real AI answer (Lovable AI Gateway) grounded in a curated knowledge base of live public payroll sources (government/tax authority pages for Belgium, Netherlands, France)
- Every answer shows:
  - **Source cards** with trust ranking (official authority > government portal > secondary), publish/verify dates, and direct links
  - **Conflict & staleness flags** — outdated or contradictory sources highlighted with an explanation of why one source wins
  - **Confidence indicator** — when confidence is low, offer expert handoff

### 3. Expert handoff (`/experts`)
- When knowledge is insufficient, route the question to the most relevant expert
- Expert directory seeded with realistic profiles (country, specialty, seniority)
- Handoff flow: question + AI draft + sources packaged for the expert; expert validates or corrects

### 4. Knowledge base (`/knowledge`)
- Validated answers become reusable organisational knowledge entries
- Searchable library showing validated Q&A, source lineage, validator, and validity dates
- Completes the closed loop: a resolved question improves the next answer

## Technical details

- **Stack**: TanStack Start, Tailwind v4, shadcn-style tokens; semantic colors only, professional corporate theme in `src/styles.css`
- **AI**: Lovable AI Gateway, model `openai/gpt-6-astra` via Responses API, streamed server-side through a server route; structured output for answer + citations + conflict analysis
- **Sources**: curated seed dataset of real public payroll sources (official URLs, dates, authority level) for BE/NL/FR; the AI grounds answers in these and links out — no scraping pipeline in v1
- **Storage**: Lovable Cloud (Supabase) for knowledge entries, expert directory, and handoff requests — enabled during build
- **Routes**: `/` (landing), `/ask`, `/experts`, `/knowledge` — each with its own head() metadata
- **Verification**: build check plus a live test of one full loop (ask → sourced answer → expert handoff → knowledge capture)

## Out of scope for v1
- Real user accounts/roles (demo personas instead)
- Automated document ingestion or live web crawling
- Email notifications to experts
