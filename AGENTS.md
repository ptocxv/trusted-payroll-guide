<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# AGENTS.md

## Architecture decisions

- Payroll knowledge sources live in a curated in-code registry (`src/lib/sources.ts`), not a database table — the AI answer engine grounds answers in this registry and links out; no scraping pipeline.
- The AI answer engine is a TanStack server route at `/api/ask` (not a server function or edge function): it streams `openai/gpt-6-astra` via the Lovable AI Gateway Responses API, consumes the stream server-side, and returns structured JSON (answer, confidence, ranked sources, conflicts).
- Persistent data (experts, knowledge entries, handoff requests) lives in Lovable Cloud tables with public read policies — the demo has no auth, so anon read/insert policies are intentional.
- Design: professional corporate theme — navy surface (`--navy`), red primary accent, Sora headings / Inter body loaded via Google Fonts link in `__root.tsx`.
