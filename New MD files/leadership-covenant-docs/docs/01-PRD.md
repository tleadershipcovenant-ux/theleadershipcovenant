# PRD — The Leadership Covenant Website

| | |
|---|---|
| **Product** | The Leadership Covenant marketing + lead-generation website |
| **Reference site** | https://future-forward-leaders.lovable.app/ |
| **Document status** | v1.0 — derived from the live site, ready for build |
| **Primary audience for this doc** | Antigravity agents + human reviewers |
| **Region** | Pakistan (Islamabad HQ; programs in Islamabad, Peshawar, Swat) |

---

## 1. Overview

The Leadership Covenant is the North Region (Pakistan) delivery arm for FranklinCovey Education programs: Leader in Me, LeaderU, professional development, leadership camps, family sessions, and a leadership podcast. The website's job is to **build trust, explain the programs, and convert visitors into enquiries, event applications, and summit registrations.**

**Tagline:** Learn • Develop • Lead • Transform
**Brand promise:** "Everyone has the potential to lead."

## 2. Goals

| # | Goal | Success metric |
|---|---|---|
| G1 | Generate qualified school/institution enquiries | ≥ X enquiries/month via `/contact` (baseline to be set) |
| G2 | Fill upcoming events | Application + registration completion rate ≥ 40% of form starts |
| G3 | Drive Summit 2026 registrations | Registrations tracked separately; reach target capacity |
| G4 | Build credibility | Stats, testimonials, speakers visible above the fold on key pages |
| G5 | Operational efficiency | Admin can add/edit events without developer help |

## 3. Non-Goals (v1)

- E-commerce / online payments.
- Student/parent login portals.
- Hosting the podcast audio (link out to platforms).
- Multi-language (Urdu) — recommended as v2.

## 4. Users & Personas

| Persona | Needs | Key pages |
|---|---|---|
| **School Owner / Director** | Understand Leader in Me, ROI, credibility | Home, Services, About, Contact |
| **Principal / School Head** | Programs, events, PD for staff | Services, Activities, Summit |
| **Teacher / Educator** | PD courses, wellness sessions | Activities, Services |
| **Parent / Guardian** | Family sessions, camps for kids | Services, Activities |
| **College/University student or admin** | LeaderU sessions | Services, Activities |
| **Site admin (internal)** | Manage events, view submissions | Admin area |

## 5. Scope — Pages

| Route | Purpose | Content spec |
|---|---|---|
| `/` | Brand intro, upcoming events, stats, service overview, testimonials | `content/01-home.md` |
| `/services` | Six programs in depth | `content/02-services.md` |
| `/about` | Vision, mission, covenant, principles, CEO message | `content/03-about.md` |
| `/activities` | Event listing + application form | `content/04-activities.md` |
| `/summit` | Featured event landing + registration | `content/06-summit.md` |
| `/contact` | Contact details + enquiry form | `content/05-contact.md` |
| `/privacy` *(new)* | Privacy policy (required – forms collect PII) | to be written |
| `/terms` *(new, optional)* | Terms of use | to be written |
| `*` | 404 page | branded, links home |

Shared layout: `content/00-global.md`.

## 6. Functional Requirements

### 6.1 Navigation & Layout
- FR-1: Sticky header with 5 nav links + "Apply Now" CTA (→ `/activities`).
- FR-2: Mobile drawer menu; keyboard accessible.
- FR-3: Footer with brand blurb, social links, explore links, contact info.
- FR-4: Active-link highlighting; skip-to-content link.

### 6.2 Events (data-driven)
- FR-5: Events stored in a database/CMS (fields in `05-DATA-MODEL-AND-API.md`).
- FR-6: Home strip and Activities grid read from the same source.
- FR-7: Past events auto-hidden (or labelled "Past") based on `end_date`.
- FR-8: Each event has a status label (e.g., Open enrollment, Early-bird open, Free • RSVP required, Seats limited, Family passes available, Applications open).
- FR-9: Events flagged `has_detail_page = true` link to a dedicated page (currently only the Summit).
- FR-10: Admin can create/edit/archive events.

### 6.3 Forms (3 forms)
- FR-11: **Activity Application** (`/activities#apply`).
- FR-12: **Summit Registration** (`/summit#register`).
- FR-13: **Contact Enquiry** (`/contact`).
- FR-14: Client + server validation (Zod), honeypot, rate limiting, CAPTCHA fallback.
- FR-15: Store every submission; email notification to `theleadershipcovenant@gmail.com`; optional auto-reply to submitter.
- FR-16: Success/error UI; double-submit prevention.
- FR-17: Deep-link preselection (`?interest=`, `?activity=`).

Full spec: `06-FORMS-SPEC.md`.

### 6.4 Interactive Elements
- FR-18: Home events marquee (pause on hover, reduced-motion safe).
- FR-19: Stats count-up on scroll.
- FR-20: Services anchor-chip nav with scroll-spy.
- FR-21: WhatsApp click-to-chat links.

### 6.5 SEO & Sharing
- FR-22: Unique `<title>`/description/OG per page; sitemap.xml; robots.txt; JSON-LD (Organization, Event). See `08-SEO-AND-METADATA.md`.

### 6.6 Admin (recommended)
- FR-23: Authenticated admin route (`/admin`) to manage events + view/export submissions (CSV).
- FR-24: Role-based access; audit trail for edits. See `SECURITY.md`.

## 7. Non-Functional Requirements

| Area | Requirement |
|---|---|
| Performance | Lighthouse ≥ 90 mobile; LCP < 2.5 s on 4G; CLS < 0.1; images WebP/AVIF, lazy-loaded |
| Accessibility | WCAG 2.2 AA; full keyboard use; visible focus; alt text on all images |
| Security | See `SECURITY.md` (OWASP ASVS L1 minimum) |
| Responsiveness | 360px → 1920px; mobile-first (most Pakistani traffic is mobile) |
| Browser support | Last 2 versions Chrome, Safari, Firefox, Edge; Android WebView |
| Network resilience | Works on slow 3G/4G; no layout shift; graceful form retry |
| Privacy | Consent text on forms; privacy policy; minimal data retention |
| Availability | ≥ 99.9% (static hosting + managed backend) |

## 8. Content Requirements

- Content is **verbatim** from `docs/content/*`. Do not paraphrase or "improve" copy without approval.
- Trademark symbols (®) preserved.
- All images need alt text (provided in content files).

## 9. Design Requirements

See `03-DESIGN-SYSTEM.md`. Brand navy `#0B2545` confirmed; remaining tokens are recommendations to be verified against the live CSS.

## 10. Technical Approach

See `04-ARCHITECTURE-AND-TECH-STACK.md`.

## 11. Analytics & KPIs

| Event | Trigger |
|---|---|
| `cta_apply_click` | Any "Apply Now"/"Apply →" click |
| `form_start` / `form_submit` / `form_error` | Per form |
| `summit_register_submit` | Summit form success |
| `whatsapp_click` | wa.me links |
| `social_click` | Footer/social links |
| `video_click` | Summit LinkedIn videos |

Privacy-friendly analytics (Plausible/Umami) or GA4 with consent.

## 12. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Spam/bot form submissions | Honeypot + Turnstile + rate limit |
| Stale events shown | Date-driven auto-hide; admin reminders |
| Copy inconsistencies (see Open Questions) | Client sign-off before launch |
| Image hosting tied to Lovable storage | Self-host/optimize all assets |
| PII leakage | RLS/ACL, encryption in transit/at rest, restricted admin |

## 13. Release Plan

| Phase | Scope |
|---|---|
| **MVP** | All 6 pages, shared layout, data-driven events, 3 forms with email delivery, SEO basics |
| **v1.1** | Admin panel, CSV export, analytics, Privacy page, auto-replies |
| **v1.2** | Podcast episode list/embed, blog/news, gallery |
| **v2** | Urdu (RTL) localization, payments for events, ticketing/QR check-in |

## 14. Acceptance (Definition of Done)

- All pages match content specs verbatim.
- Forms functional end-to-end with stored records + email notification.
- Security checklist in `SECURITY.md` fully ticked.
- Lighthouse and a11y thresholds met.
- QA checklist in `10-TESTING-QA.md` passed.
- Deployed to production domain with HTTPS and monitoring.
