# AGENTS.md — Rules for AI Coding Agents (Antigravity)

Project: **The Leadership Covenant website** — a marketing + lead-gen site for FranklinCovey Education programs in Pakistan's North Region.
Reference (live) site: https://future-forward-leaders.lovable.app/

## 0. Read First (in this order)

1. `README.md` — map of all docs
2. `docs/01-PRD.md` — what and why
3. `docs/12-IMPLEMENTATION-TASKS.md` — what to do next
4. `docs/content/*.md` — the exact page content (verbatim)
5. `docs/03-DESIGN-SYSTEM.md` — look and feel
6. `docs/04-ARCHITECTURE-AND-TECH-STACK.md` — how to build
7. `SECURITY.md` — non-negotiable security rules
8. `docs/13-OPEN-QUESTIONS.md` — known gaps; don't guess, flag

## 1. Golden Rules

1. **Content is verbatim.** Copy text exactly from `docs/content/*`. Never rewrite, shorten, "improve", or translate copy. Preserve ®, em-dashes (—), bullets (•), and apostrophes.
2. **Single source of truth.** Contact details, social links, nav, and tagline come from `src/config/site.ts`. Services, events, testimonials, and stats come from typed modules in `src/content/`. Never hardcode these in components.
3. **Security is non-negotiable.** Follow `SECURITY.md`. Never weaken RLS, CSP, validation, rate limiting, or Turnstile to make something work.
4. **Don't invent facts.** If data is missing (venues, prices, years, links), leave a clearly marked `TODO(client)` and add it to `13-OPEN-QUESTIONS.md`. Never fabricate testimonials, stats, speaker bios, or URLs.
5. **Accessibility and performance are requirements, not extras.** (`docs/09-…`).
6. **Small, reviewable changes.** One concern per commit; Conventional Commits.
7. **Ask when ambiguous.** Stop and ask rather than guess on security, data, or legal matters.

## 2. Tech Stack (summary)

React 18 + TypeScript (strict) · Vite · Tailwind CSS · shadcn/ui · React Router · react-hook-form + Zod · Supabase (Postgres, RLS, Edge Functions, Auth) · Cloudflare Turnstile · Resend · Vitest + Playwright + axe.
Do not add frameworks or major dependencies without justification in the PR description.

## 3. Pages & Routes

`/` Home · `/services` · `/about` (Our Story) · `/activities` (+ `#apply`) · `/summit` (+ `#register`, `#audience`) · `/contact` · `/privacy` · `/admin/*` · 404.
Main nav: Home, Services, Our Story, Activities, Contact + "Apply Now" button → `/activities`. `/summit` is **not** in the nav.

## 4. Code Conventions

- TypeScript `strict: true`; no `any` without a comment explaining why.
- Functional components + hooks; co-locate component, test, and types.
- Naming: components `PascalCase.tsx`, hooks `useX.ts`, utils `camelCase.ts`, constants `UPPER_SNAKE` or `SITE`.
- Imports via `@/` alias; no deep relative `../../../`.
- Tailwind utility classes; extract repeated patterns to components, not `@apply` sprawl.
- Colors/spacing only from design tokens. No arbitrary hex in components.
- Icons: `lucide-react`; decorative icons `aria-hidden`.
- One `<h1>` per page; semantic landmarks; every image has `alt` (from the content files).
- No `console.log` in committed code. No commented-out dead code.
- Env access only through `src/lib/env.ts` (validated with Zod).

## 4a. Forms

- Shared Zod schemas in `src/lib/validators.ts`, imported by both client and Edge Function.
- Fields, labels, required flags, button text, consent text: exactly as `docs/06-FORMS-SPEC.md`.
- Always include honeypot + Turnstile; never log field values.
- Never write form data directly to the DB from the browser.

## 4b. Data

- Events are data-driven from DB with a static fallback in `src/content/events.ts`.
- Hide events whose `end_date < today`.
- Event CTA: `has_detail_page ? detail_path : /activities?activity=<slug>#apply`.

## 5. Definition of Done (every task)

- [ ] Matches spec in the relevant `docs/` file
- [ ] `npm run typecheck && npm run lint && npm run test` pass
- [ ] axe: no serious/critical violations on affected routes
- [ ] Responsive at 360 / 768 / 1280
- [ ] Keyboard-operable with visible focus
- [ ] No new secrets, no new unvetted dependencies
- [ ] Docs updated if behavior changed
- [ ] Summary of changes + any deviations/assumptions reported

## 6. Forbidden

- `dangerouslySetInnerHTML`, `eval`, `new Function`, raw `innerHTML` with dynamic data
- Committing `.env`, keys, or tokens; putting service-role keys in client code
- Disabling ESLint/TS rules globally; `// @ts-ignore` without justification
- Hotlinking images/fonts from third-party or Lovable asset URLs
- Adding the "Edit with Lovable" badge
- Changing copy, nav order, or page structure without explicit instruction
- Using localStorage for any personal data

## 7. Commands

```bash
npm ci                 # install
npm run dev            # local dev
npm run typecheck      # tsc --noEmit
npm run lint           # eslint
npm run test           # vitest
npm run test:e2e       # playwright
npm run build          # production build (prerender)
npm run preview        # serve build
```

## 8. How to Report Back

After each task, reply with:
1. **What changed** (files)
2. **How verified** (commands + results)
3. **Deviations/assumptions**
4. **Open questions** (also added to `docs/13-OPEN-QUESTIONS.md`)
5. **Next suggested task** (from `docs/12-IMPLEMENTATION-TASKS.md`)
