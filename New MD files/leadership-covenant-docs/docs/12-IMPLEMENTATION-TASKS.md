# Implementation Task Plan (for Antigravity)

Work top to bottom. Each phase ends with a **gate**. Read the referenced doc before starting a task. Mark `[x]` when done. Do not skip gates.

---

## Phase 0 — Setup
- [ ] 0.1 Scaffold Vite + React + TS; install Tailwind, shadcn/ui, react-router, react-hook-form, zod, lucide-react, react-helmet-async. (`04-ARCHITECTURE-AND-TECH-STACK.md`)
- [ ] 0.2 Configure ESLint, Prettier, strict TS, path alias `@/`.
- [ ] 0.3 Add `.env.example`, `.gitignore` (incl. `.env*`), `.gitleaks.toml`.
- [ ] 0.4 Create `src/config/site.ts` from `content/00-global.md`.
- [ ] 0.5 Add design tokens to Tailwind + `globals.css` (`03-DESIGN-SYSTEM.md`).
- [ ] 0.6 Set up Vitest + Playwright + axe; CI workflow.

**Gate 0:** `npm run dev` + `npm run build` + CI green.

## Phase 1 — Layout & Shared Components
- [ ] 1.1 `SiteHeader` (sticky, nav, Apply Now, mobile drawer) — `content/00-global.md`
- [ ] 1.2 `SiteFooter` (3 columns, social, copyright)
- [ ] 1.3 `Container`, `Section`, `Eyebrow`, `Button` variants, `Seo`
- [ ] 1.4 Skip link, focus styles, `ScrollToTop` on route change, hash-scroll with header offset
- [ ] 1.5 `NotFound` page

**Gate 1:** Header/footer match spec at 360 / 768 / 1280; keyboard + axe pass.

## Phase 2 — Content Modules (typed data)
- [ ] 2.1 `content/services.ts` (6 services) — `content/02-services.md`
- [ ] 2.2 `content/events.ts` seed (9 events) — `content/04-activities.md`
- [ ] 2.3 `content/testimonials.ts`, `stats.ts`, `principles.ts`, `covenant.ts`, `summit.ts`
- [ ] 2.4 Text copied **verbatim** (including ® and "—").

**Gate 2:** Unit test that the counts match (6 services, 9 events, 4 stats …).

## Phase 3 — Pages
- [ ] 3.1 **Home** — `content/01-home.md` (Hero, EventsMarquee, Stats, WhatWeDo, Voices, CtaBand)
- [ ] 3.2 **Services** — chips + 6 ServiceBlocks + CTA band
- [ ] 3.3 **About** — Vision/Mission, Covenant, Principles, CEO message
- [ ] 3.4 **Activities** — grid + ApplyForm shell
- [ ] 3.5 **Summit** — all 8 sections + SummitForm shell
- [ ] 3.6 **Contact** — info cards + EnquiryForm shell + location card
- [ ] 3.7 Images optimized (AVIF/WebP, dimensions, alt) — `09-ACCESSIBILITY-AND-PERFORMANCE.md`

**Gate 3:** Visual + verbatim content check against live site on all 6 pages; Lighthouse budgets.

## Phase 4 — Backend & Forms
- [ ] 4.1 Supabase project; run migrations from `05-DATA-MODEL-AND-API.md`; seed events.
- [ ] 4.2 Verify RLS (anon cannot read `submissions`).
- [ ] 4.3 Edge Function `submit-form` with all 9 server steps.
- [ ] 4.4 Turnstile integration (client widget + server verify).
- [ ] 4.5 Email: team notification + auto-reply templates.
- [ ] 4.6 Wire 3 forms (`06-FORMS-SPEC.md`), preselect via query params, success/error UI.
- [ ] 4.7 Switch Home/Activities to read events from DB with static fallback; auto-hide past events.

**Gate 4:** E2E E5–E13 pass; security tests in `10-TESTING-QA.md` §4 pass.

## Phase 5 — SEO & Analytics
- [ ] 5.1 Per-page meta + OG (`08-SEO-AND-METADATA.md`)
- [ ] 5.2 JSON-LD Organization + Event
- [ ] 5.3 `sitemap.xml`, `robots.txt`, canonical URLs, favicon set
- [ ] 5.4 Prerender public routes
- [ ] 5.5 Analytics events (no PII)

**Gate 5:** View-source shows full content + meta; OG previews verified.

## Phase 6 — Security Hardening
- [ ] 6.1 Security headers + CSP on host (`SECURITY.md` §7)
- [ ] 6.2 Dependency audit, Dependabot, gitleaks in CI
- [ ] 6.3 SPF/DKIM/DMARC
- [ ] 6.4 `/privacy` page written and linked (footer + forms)
- [ ] 6.5 Complete `SECURITY.md` §14 checklist

**Gate 6:** All boxes in `SECURITY.md` §14 ticked.

## Phase 7 — Admin (v1.1)
- [ ] 7.1 `/admin` login (invite-only, MFA)
- [ ] 7.2 Events CRUD (publish/unpublish)
- [ ] 7.3 Submissions list, status update, CSV export
- [ ] 7.4 Audit log

**Gate 7:** RBAC tests pass; admin `noindex`.

## Phase 8 — QA & Launch
- [ ] 8.1 Full QA (`10-TESTING-QA.md`)
- [ ] 8.2 Resolve items in `13-OPEN-QUESTIONS.md` with the client
- [ ] 8.3 Deploy + domain + monitoring (`11-DEPLOYMENT.md`)
- [ ] 8.4 Launch checklist

---

## Suggested Antigravity Prompts

**Kickoff**
> Read `AGENTS.md`, `docs/01-PRD.md`, `docs/04-ARCHITECTURE-AND-TECH-STACK.md` and `docs/03-DESIGN-SYSTEM.md`. Execute Phase 0 of `docs/12-IMPLEMENTATION-TASKS.md`. Stop at Gate 0 and summarize.

**Page build**
> Read `docs/content/02-services.md` and `docs/03-DESIGN-SYSTEM.md`. Build the Services page exactly as specified, using verbatim copy and typed data from `src/content/services.ts`. Run typecheck, lint, tests and axe. Report any deviations.

**Forms**
> Read `docs/06-FORMS-SPEC.md`, `docs/05-DATA-MODEL-AND-API.md` and `SECURITY.md`. Implement Phase 4. Do not weaken any security control. Write tests for every item in `10-TESTING-QA.md` §4.

**Review**
> Act as a security reviewer. Audit the repo against `SECURITY.md` §14 and list failures with file paths and fixes.
