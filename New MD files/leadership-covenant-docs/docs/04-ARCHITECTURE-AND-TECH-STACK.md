# Architecture & Tech Stack

> The live site was built with Lovable (React-based). The exact internal stack is not exposed in the page export, so the stack below is a **recommendation** that matches typical Lovable output and is easy for Antigravity to scaffold. Change only with approval.

## 1. Recommended Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **React 18 + TypeScript** | Matches Lovable output; strong typing |
| Build | **Vite** (SPA) — or **Next.js 14 App Router** if SSR/SEO is prioritized | See §2 |
| Routing | React Router v6 (Vite) / file routes (Next) | 6 pages + admin |
| Styling | **Tailwind CSS** + CSS variables for tokens | Tokens in `03-DESIGN-SYSTEM.md` |
| UI primitives | **shadcn/ui** (Radix) | Accessible dialogs, selects, toasts |
| Icons | `lucide-react` | Replace glyph/emoji icons |
| Forms | `react-hook-form` + **Zod** (`@hookform/resolvers`) | Shared schemas client + server |
| Data / backend | **Supabase** (Postgres + RLS + Edge Functions + Auth) | Fast, secure, Lovable-compatible |
| Email | **Resend** (via Edge Function) or SMTP (Gmail App Password as fallback) | Notify team + auto-reply |
| Anti-spam | **Cloudflare Turnstile** + honeypot | Privacy-friendly |
| Analytics | Plausible / Umami (or GA4 with consent) | Light, privacy-friendly |
| Hosting | **Vercel / Netlify / Cloudflare Pages** | HTTPS, CDN, preview deploys |
| Monitoring | Sentry (frontend + functions), UptimeRobot | Errors + uptime |
| Testing | Vitest + React Testing Library, Playwright (E2E), axe-core | See `10-TESTING-QA.md` |
| Lint/format | ESLint, Prettier, TypeScript strict | CI gate |

## 2. SPA vs SSR Decision

| Option | Pros | Cons | Recommendation |
|---|---|---|---|
| Vite SPA + prerender (`vite-plugin-ssg` / `react-snap`) | Matches current Lovable build, simplest | Needs prerender for SEO | ✅ Default |
| Next.js App Router | Native SSR/SSG, metadata API, image optimization | Heavier migration | Choose if SEO is the top priority |

Marketing pages are static; **prerender all public routes** so Google/WhatsApp/LinkedIn crawlers see full HTML + OG tags.

## 3. Project Structure (Vite)

```
leadership-covenant/
├─ AGENTS.md
├─ README.md
├─ SECURITY.md
├─ docs/                      # these markdown files
├─ public/
│  ├─ favicon.svg
│  ├─ og-image.png
│  ├─ robots.txt
│  └─ sitemap.xml
├─ src/
│  ├─ main.tsx
│  ├─ App.tsx                 # router
│  ├─ config/site.ts          # constants (see content/00-global.md)
│  ├─ content/                # typed content modules (services, events, testimonials…)
│  │  ├─ services.ts
│  │  ├─ events.ts            # fallback/seed when DB empty
│  │  ├─ testimonials.ts
│  │  └─ stats.ts
│  ├─ components/
│  │  ├─ layout/ (SiteHeader, SiteFooter, Container, Section, Eyebrow)
│  │  ├─ ui/     (shadcn primitives)
│  │  ├─ home/   (Hero, EventsMarquee, StatsStrip, WhatWeDo, Voices, CtaBand)
│  │  ├─ services/ (ServiceChips, ServiceBlock)
│  │  ├─ about/  (VisionMission, CovenantPromises, Principles, CeoMessage)
│  │  ├─ activities/ (EventCard, ApplyForm)
│  │  ├─ summit/ (Objectives, Audience, Speakers, PastStats, Videos, SummitForm)
│  │  └─ contact/ (ContactCards, EnquiryForm, LocationCard)
│  ├─ pages/ (Home, Services, About, Activities, Summit, Contact, Privacy, NotFound, admin/*)
│  ├─ lib/ (supabase.ts, validators.ts, analytics.ts, utils.ts)
│  ├─ hooks/ (useEvents, useScrollSpy, useCountUp, useReducedMotion)
│  ├─ styles/globals.css
│  └─ types/
├─ supabase/
│  ├─ migrations/
│  └─ functions/ (submit-form, notify-email)
├─ tests/ (unit, e2e)
└─ .env.example
```

## 4. Component Contract (key components)

| Component | Props | Notes |
|---|---|---|
| `<Eyebrow>` | `children` | Small uppercase label |
| `<Section>` | `id, tone ("default"\|"muted"\|"navy"), children` | Handles padding + anchors |
| `<EventCard>` | `event: Event` | Handles CTA target (`/summit` vs `#apply`) |
| `<ServiceBlock>` | `service: Service, reverse?: boolean` | Zig-zag layout |
| `<StatCounter>` | `value, suffix, label` | Count-up once |
| `<ApplyForm>` | `defaultActivity?: string` | Posts to `submit-form` |
| `<EnquiryForm>` | `defaultInterest?: string` | Posts to `submit-form` |
| `<SummitForm>` | — | `type="summit"` |
| `<Seo>` | `title, description, path, image?, jsonLd?` | Head management (react-helmet-async) |

## 5. Data Flow

```
Browser ── form submit ──► Edge Function `submit-form`
                              │  validate (Zod) → verify Turnstile → rate-limit
                              ├─► INSERT into Postgres (service role, RLS locked)
                              └─► Send email (team notification + optional auto-reply)
Browser ◄─ { ok: true } ──────┘

Browser ── GET events ──► Supabase (anon key, RLS: SELECT published events only)
Admin  ── Auth + RLS ───► CRUD events, read submissions
```

## 6. Environment Variables

```
# .env.example  (never commit real values)
VITE_SITE_URL=https://example.com
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=          # public by design; protected by RLS
VITE_TURNSTILE_SITE_KEY=
VITE_ANALYTICS_DOMAIN=

# Server-only (Edge Function secrets — NOT prefixed with VITE_)
SUPABASE_SERVICE_ROLE_KEY=
TURNSTILE_SECRET_KEY=
RESEND_API_KEY=
NOTIFY_EMAIL=theleadershipcovenant@gmail.com
FROM_EMAIL=
ALLOWED_ORIGINS=https://example.com
```

## 7. Performance Strategy

- Route-level code splitting (`React.lazy`).
- Image pipeline: convert to WebP/AVIF, responsive `srcset`, explicit dimensions.
- Self-host fonts; preload the hero image + primary font.
- Defer analytics + Turnstile until first interaction/form focus.
- Marquee via CSS transform (no JS layout thrash).
- Target bundle: < 200 KB JS gzip on the home route.

## 8. Error Handling

- Global `ErrorBoundary` with friendly fallback.
- Form errors: field-level inline + top summary; network failure → retry with preserved input.
- 404 page branded with link home.

## 9. Git & CI

- Branches: `main` (prod), `dev`, `feat/*`.
- Conventional Commits.
- CI (GitHub Actions): install → typecheck → lint → unit tests → build → Playwright smoke → Lighthouse CI → `npm audit`/Dependabot.
- Preview deploy on every PR.
