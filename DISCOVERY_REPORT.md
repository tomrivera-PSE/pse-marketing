# DISCOVERY_REPORT.md — PSE CHAP AI Widget Integration

**Scope:** Read-only investigation of `signal-interface/pse-marketing` to ground the CHAP AI widget build.

---

## 1 — Stack & framework

- **Framework:** Next.js `^15.1.0`, **App Router** (`src/app/*`, route handlers under `src/app/api/*/route.ts`).
- **React:** `^19.0.0`.
- **Node:** not pinned (no `.nvmrc`, no `engines`).
- **Package manager:** **npm** (`package-lock.json` only).
- **TypeScript:** strict, `paths: { "@/*": ["./src/*"] }`.
- **Deploy target:** **Vercel.** `next.config.ts` redirects `www → apex`. `opengraph-image.tsx` uses edge runtime.
- **CI/CD:** none in repo (no `.github/workflows`). Vercel preview deploys are de facto CI.
- **Testing:** Vitest `^4.0.18`, node env. Exactly one test file: `src/app/api/demo-request/__tests__/route.test.ts`.

Confidence: high

---

## 2 — Styling system

**Hybrid.** Tailwind v4 utility classes dominate the homepage, nav, footer, and form components. `/chap-ai`, `/services`, and `/compliance-risk` use hand-written prefixed class families inside a 1,012-line `src/app/globals.css`.

- **Tailwind v4** (`^4.0.0`) via `@tailwindcss/postcss`. **No `tailwind.config.js/ts`.** Tokens live in CSS `@theme` at the top of `globals.css`:
  - Navy/steel/ice palettes, functional text/border colors, status colors (green/amber/red/blue-accent), DM Sans + JetBrains Mono, four shadow tiers.
- **Dark CHAP palette** (separate `:root` block in `globals.css`) — `--chap-bg`, `--chap-bg-mid`, `--chap-bg-card`, `--chap-border`, `--chap-border-hi`, `--chap-glow`, `--chap-accent`, `--chap-accent-hi`, `--chap-text`, `--chap-text-muted`. **Widget must use these on dark surfaces.**
- **Class namespaces in `globals.css`:** `.pse-*`, `.chap-*`, `.chap-interface__*`, `.svc-*`/`.svc-sub-*`, `.est-*`, `.cred-strip*`, `.pss-*`.
- **Fonts:** `next/font/google` loads `DM_Sans` → `--font-sans`, `JetBrains_Mono` → `--font-mono` (both `display: swap`).
- **Global base:** just `html { scroll-behavior: smooth }` and `section[id] { scroll-margin-top: 88px }`. Relies on Tailwind preflight.

Confidence: high

---

## 3 — Component patterns

- **Layout:** `src/components/{layout,sections,forms,templates,ui}`.
- **No component library** (no shadcn, Radix, Headless UI, Chakra). `src/components/ui/` contains only `RevealOnScroll.tsx` and `ProductScreenshot.tsx`.
- **Icon set:** `lucide-react ^0.460.0`.
- **Utility:** `src/lib/utils.ts` exports `cn()` built on `clsx + tailwind-merge`.

### Visual siblings for the widget

| Component | Path | Verdict |
|---|---|---|
| **`ChapaInterface`** | `src/components/sections/ChapaInterface.tsx` | **The existing CHAP chat mockup.** Fully styled via `.chap-interface__*` — header, status pills, two tabs, scrolling messages, typing dots, suggestion grid, input row. Hard-codes canned `RESPONSES` and a fake exceptions list. **Strongest reuse candidate — the widget refactors this file in place.** |
| `DemoRequestForm` | `src/components/forms/DemoRequestForm.tsx` | Tailwind form card pattern, honeypot, `fetch("/api/demo-request")`, post-submit success state swap. |
| `ComplianceEstimator` | `src/components/sections/ComplianceEstimator.tsx` | Two-pane `.est-wrapper` on `bg-ice`. Pure `.est-*` classes. Reference for calculator-like light-theme surfaces. |
| `ChapAI` (homepage section) | `src/components/sections/ChapAI.tsx` | Dark card grid on `bg-navy` with `border-white/[0.06] rounded-2xl p-7`. |
| `ServicePage` template | `src/components/templates/ServicePage.tsx` | Canonical page shell. |
| `RevealOnScroll` | `src/components/ui/RevealOnScroll.tsx` | IntersectionObserver-driven scroll-in. Used everywhere for section reveals. |

### Callout / alert patterns

No `Alert` primitive. Inline idioms: green success card (`border-2 border-green` + `bg-green-bg` circle), `.chap-interface__exception--blocksPayroll`/`--advisory` (red/amber left border), `.est-gate__error`.

Confidence: high

---

## 4 — Backend & data layer

- **API routes:**
  - `POST /api/demo-request` — honeypot → `ensureDemoRequestsTable()` → Vercel Postgres insert → Resend sends two emails via `Promise.allSettled`. 200 even if emails fail.
  - `POST /api/lead-capture` — **stub.** Validates email, `console.log`s, returns `{ success: true }`. Two `TODO Sprint 3b` markers. Not wired from UI.
- **Database:** **Vercel Postgres** via `@vercel/postgres ^0.10.0`. Lazy `ensureDemoRequestsTable()` in `src/lib/db.ts`. **No migration framework.** No Supabase, Prisma, Drizzle, Kysely.
- **Auth:** none.
- **Email:** **Resend** `^6.9.2`. Templates in `src/lib/emails.ts` (`internalNotificationHtml`, `autoResponseHtml`).
- **PDF:** `jspdf ^4.2.0` **client-side only**, dynamic-imported.
- **Env vars** (complete list): `POSTGRES_URL`, `RESEND_API_KEY`, `NOTIFICATION_EMAIL` (optional, defaults to `info@payrollsynergyexperts.com`).
- **Rate limiting / middleware:** **none.** No `middleware.ts`, no Upstash, no Edge Config.

Confidence: high

---

## 5 — Demo / lead capture flow

- **Form:** `src/components/forms/DemoRequestForm.tsx` (`"use client"`), rendered in `src/app/page.tsx` inside `<section id="demo">` (the anchor for every `/#demo` link site-wide).
- **Fields:** `name*`, `email*`, `company`, `employees` (select). Honeypot `ref_120` off-screen.
- **Path:** POST `/api/demo-request` → three side effects: (1) `INSERT INTO demo_requests`, (2) Resend email to notification inbox, (3) Resend auto-response to submitter.
- **No third-party forms** (no HubSpot/Formspree/Calendly).
- **No CRM integration, no analytics** (no Segment/GA4/PostHog/Vercel Analytics).
- `/api/lead-capture` exists but is not called by any component today.

Confidence: high

---

## 6 — Risk Estimator page

- **Route:** `src/app/compliance-risk/page.tsx` → `<ComplianceEstimator />`.
- **Client-only.** No backend call. Calculation in `src/lib/estimator.ts`. PDF generation in `src/lib/generateReport.ts` (dynamic-imported `jspdf`).
- **Inputs:** `employees` (10–5000), `states` (1–20), `industry` select. Constants in `src/data/estimatorConstants.ts`.
- **Styling:** pure `.est-*` CSS classes on a light card over `bg-ice`. Statute citations in mono type. The widget would sit naturally on this page — same visual language.

Confidence: high

---

## 7 — Routing & content structure

Routes in `src/app/`: `/`, `/chap-ai`, `/compliance-risk`, `/services`, `/services/[slug]`, `/privacy`, `/terms`, plus `not-found.tsx`, `opengraph-image.tsx`, `sitemap.ts`.

- **No `/compliance-reference`, `/articles`, `/resources`, `/blog`** — adding any would be net-new.
- **No MDX, no CMS.** Content is hardcoded in JSX + TS constants (`src/lib/constants.ts`, `src/data/services.ts`, `src/data/estimatorConstants.ts`).
- **`sitemap.ts`** currently lists only the apex URL — does not enumerate `/chap-ai`, `/services/*`, `/compliance-risk`.
- **`robots.txt`:** `Allow: /`. No disallows.
- `NAV_LINKS` includes `Why PSE → /#proof`, but `WhyPSE.tsx` is not imported on the homepage — dead anchor.

Confidence: high

---

## 8 — Build, bundle, perf

- **No perf budgets, Lighthouse targets, or CI perf checks.**
- **No production build run during discovery** (read-only).
- Images via `next/image` (`ProductScreenshot` uses `width={1280} height={800} quality={90}`). No remote image patterns configured.
- Fonts preloaded via `next/font/google`.
- `jspdf` is dynamic-imported — kept out of initial bundle.

Confidence: medium (nothing measured).

---

## 9 — Dependencies audit

### Runtime
```
@vercel/postgres   ^0.10.0
clsx               ^2.1.1
jspdf              ^4.2.0
lucide-react       ^0.460.0
next               ^15.1.0
react              ^19.0.0
react-dom          ^19.0.0
resend             ^6.9.2
tailwind-merge     ^2.6.0
```

### Dev
```
@eslint/eslintrc       ^3.2.0
@tailwindcss/postcss   ^4.0.0
@types/node            ^22.10.0
@types/react           ^19.0.0
@types/react-dom       ^19.0.0
@vitejs/plugin-react   ^5.1.4
eslint                 ^9.16.0
eslint-config-next     ^15.1.0
playwright             ^1.58.2
tailwindcss            ^4.0.0
typescript             ^5.7.0
vitest                 ^4.0.18
```

### Flags for widget spec

- `@anthropic-ai/sdk` — **NOT installed.**
- `@upstash/redis` / `@upstash/ratelimit` — **NOT installed.**
- `voyageai`, any vector DB — **NOT installed.**
- `zod` — **NOT installed** (repo uses hand-rolled validation).
- `ai` / `@ai-sdk/*` — **NOT installed.**

**Zero AI deps today.** Every AI-related dep is new.

Confidence: high

---

## 10 — Risks & blockers

1. **Styling is hybrid and inconsistent.** Tailwind utilities vs hand-written `.chap-*`/`.svc-*`/`.est-*` families. Widget must pick a lane per surface (Tailwind for light themes; `.chap-*` tokens for dark `/chap-ai`).
2. **`ChapaInterface` already consumes the "CHAP chat" visual real estate.** Widget should refactor in place, not sit alongside.
3. **No backend/AI plumbing exists.** Anthropic SDK, rate limiting, validation, and any retrieval are all greenfield. Streaming (SSE/`ReadableStream`) is not yet used anywhere.
4. **No rate limiting or abuse protection anywhere.** A per-call-cost AI endpoint with zero abuse controls is a financial risk.
5. **`/api/lead-capture` is a half-finished TODO.** Natural home for widget lead gate; needs finishing.
6. **No CMS / MDX.** If the widget cites `/compliance-reference/*`, that route tree doesn't exist.
7. **No CI, no perf budgets.**
8. **Sitemap is stub-level** — new routes must be added explicitly.
9. **No error tracking / observability** (no Sentry, Log Drains, etc.).
10. **Node version unpinned.**

---

## 11 — Open questions for product owner

1. Where does the widget live? `/chap-ai` (dark), `/compliance-risk` (light), homepage section, or a new route?
2. Does the widget replace `ChapaInterface`, or sit alongside?
3. Light theme, dark theme, or both?
4. Model / provider choice? Streaming vs request/response?
5. Lead capture — reuse `/api/demo-request` or introduce a widget-specific route?
6. Rate-limit tier — per-IP, per-session, per-email?
7. Source citations — hardcoded TS, external links, or new MDX `/compliance-reference/*`?
8. New DB table, or piggyback `demo_requests`?
9. PII / prompt-injection / logging / retention policy?
10. Analytics — add tracking layer now, or ship blind?
11. `/api/lead-capture` — finish, absorb, or delete?
12. Widget response format — structured determination renderer, or plain markdown?

---

**End of report.**
