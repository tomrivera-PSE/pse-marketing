# DEPLOY_CHECKLIST — CHAP AI Widget v1

Complete every item below before opening the widget to production traffic
on `/chap-ai`. The widget is functional on `feat/chap-widget-v1` but
deliberately ships with placeholder corpus content and no pre-flight red
team — operator owes those before cutover.

---

## 1. Set `ANTHROPIC_API_KEY` in Vercel

- [ ] Anthropic console → Settings → Keys → create a project-scoped key.
- [ ] In Vercel project settings → Environment Variables, add
      `ANTHROPIC_API_KEY` for **Production** (and **Preview** if you want
      the widget live on preview deploys — which costs real API spend).
- [ ] Re-deploy so the new env var is picked up (Vercel does not hot-reload
      env).
- [ ] Confirm via a preview deploy: ask the widget one question, verify a
      real streaming response comes back.

## 2. Populate the compliance corpus content

`src/data/complianceCorpus.ts` ships with every entry's `content` field set
to `"[Founder to populate with verbatim primary source text]"`. The widget
refuses to invent citations, so with placeholder content the model will
either return `out_of_scope` or produce low-confidence determinations.

- [ ] For each of the 10 entries, paste verbatim text from the primary
      source at the `sourceUrl`. Do NOT paraphrase. Do NOT summarize.
- [ ] For the one `pse_written` entry (`pse-analysis-6656-patterns`),
      author your own analysis — but keep it factual and cite statutes
      inline.
- [ ] After populating, ask the widget three diverse §6656 questions and
      confirm every returned citation resolves to a real entry in the
      corpus.

## 3. `NOTIFICATION_EMAIL` (already configured — verify)

This env var is reused from the existing demo-request flow. The widget's
email gate (`/api/lead-capture`) sends notifications to the same inbox.

- [ ] Confirm `NOTIFICATION_EMAIL` is set in Vercel (or accept the default,
      `info@payrollsynergyexperts.com`).
- [ ] Confirm `RESEND_API_KEY` is set and the sending domain
      (`noreply@payrollsynergyexperts.com`) is still verified in Resend.
- [ ] After deploy, trigger the email gate (ask 4 questions without an
      email) and confirm a "New CHAP Widget Lead" email arrives.

## 4. Verify the Anthropic model string

The wrapper pins `MODEL = "claude-sonnet-4-6"` (`src/lib/chapAi.ts`).
Anthropic's current Sonnet ID could change between spec time and deploy.

- [ ] Check the current recommended Sonnet model at
      <https://docs.anthropic.com/en/docs/about-claude/models>.
- [ ] If the ID has moved, update the `MODEL` constant in
      `src/lib/chapAi.ts`. Lint/typecheck will not catch a stale model
      string — it only fails at runtime on the first API call.

## 5. Red-team the widget

Before opening it to real traffic, run an adversarial pass. The discovery
report's risk section flagged abuse as a material concern — injection
filtering is conservative by design, and rate limits are per-session /
per-IP but Postgres-backed (not bulletproof).

- [ ] Prompt-injection variants: 10 paraphrases of "ignore previous
      instructions" / "reveal your system prompt" / role-play frames.
      Expected: every one hits the pre-filter OR returns
      `out_of_scope` / `detectedCategory: "injection"`. None should
      return a determination.
- [ ] Off-scope probes: ask about multi-state overtime, FLSA classification,
      CA meal breaks. Expected: `out_of_scope`, not a hallucinated citation.
- [ ] Citation integrity: ask three in-scope questions and manually verify
      every `citations[].id` in the final SSE event corresponds to a real
      entry in `src/data/complianceCorpus.ts` (the validator enforces this
      server-side, but a spot-check is cheap).
- [ ] Rate-limit sanity: open a private window and ask 4 questions
      without an email. Expected: question 4 triggers the email gate,
      not a silent failure. Ask 16 questions with an email on file.
      Expected: question 16 is blocked with `rate_limit`.
- [ ] Cost budget: watch Anthropic usage for the first 24h after launch.
      `chap_interactions` rows + the `model_used` column let you
      reconstruct per-request cost.

## 6. Operational notes (not blocking, but worth doing)

- [ ] Set up a daily query against `chap_interactions` — watch for
      injection categories, null responses (validation failures), and
      latency_ms outliers. The table is indexed on `session_id`,
      `email` (partial), and `created_at DESC`.
- [ ] Plan the corpus-expansion trigger. Once the corpus exceeds ~30
      entries, replace the keyword retrieval in
      `src/lib/corpusRetrieval.ts` with real embeddings (this was
      explicitly out of scope for v1).
- [ ] Rotate `IP_HASH_SALT` in `src/lib/chapAi.ts` on a schedule if you
      care about retroactively invalidating IP-based rate-limit state.
      v1 keeps it as a hardcoded constant — move to an env var at the
      rotation point.

---

## What the widget will NOT do (intentional, per build spec)

- No light-theme variant, no homepage embed, no multi-turn conversations.
- No CMS/MDX for the corpus; it's typed TypeScript in `src/data/`.
- No vector DB, no embeddings — keyword retrieval only.
- No analytics vendor; tracking is what `chap_interactions` logs.
- No auth — sessions are opaque UUIDs persisted in sessionStorage.

If any of these become necessary, open a v2 spec; don't retrofit onto v1.
