# The Leadership Covenant — Website Documentation Pack

Complete specification set to rebuild **https://future-forward-leaders.lovable.app/** in Google Antigravity (or any AI coding workflow).

> **Learn • Develop • Lead • Transform** — *Change starts here.*

## How to Use in Antigravity

1. Create a new project folder and copy this entire pack into it (keep the `docs/` structure).
2. Open the folder as your Antigravity workspace.
3. Start with this prompt:
   > Read `AGENTS.md` and `docs/12-IMPLEMENTATION-TASKS.md`. Execute Phase 0, then stop at Gate 0 and summarize.
4. Continue phase by phase. After each phase, review and approve before moving on.
5. Keep `docs/13-OPEN-QUESTIONS.md` open — answer those with your client as you go.

## What's Inside

```
leadership-covenant-docs/
├─ README.md                         ← you are here
├─ AGENTS.md                         ← rules for the AI agent (read first)
├─ SECURITY.md                       ← full security requirements + checklist
└─ docs/
   ├─ 01-PRD.md                      ← product requirements
   ├─ 02-SITEMAP-AND-ROUTES.md       ← routes, nav map, links, slugs
   ├─ 03-DESIGN-SYSTEM.md            ← colors, type, components, motion
   ├─ 04-ARCHITECTURE-AND-TECH-STACK.md
   ├─ 05-DATA-MODEL-AND-API.md       ← SQL schema, RLS, API contract, seed data
   ├─ 06-FORMS-SPEC.md               ← all 3 forms, Zod schemas
   ├─ 08-SEO-AND-METADATA.md         ← per-page meta, JSON-LD, sitemap
   ├─ 09-ACCESSIBILITY-AND-PERFORMANCE.md
   ├─ 10-TESTING-QA.md               ← test plan + E2E scenarios
   ├─ 11-DEPLOYMENT.md               ← environments, DNS, launch checklist
   ├─ 12-IMPLEMENTATION-TASKS.md     ← phased build plan + prompts
   ├─ 13-OPEN-QUESTIONS.md           ← gaps, discrepancies, assumptions
   └─ content/                       ← VERBATIM page content
      ├─ 00-global.md                ← header, footer, brand, social
      ├─ 01-home.md                  ← /
      ├─ 02-services.md              ← /services
      ├─ 03-about.md                 ← /about
      ├─ 04-activities.md            ← /activities
      ├─ 05-contact.md               ← /contact
      └─ 06-summit.md                ← /summit
```

## Site at a Glance

| Route | Page | Key content |
|---|---|---|
| `/` | Home | Hero, 9-event strip, 4 stats, 3 service cards, quote + testimonials |
| `/services` | Services | Leader in Me, LeaderU, Professional Development, Leadership Camps, Family Sessions, Podcast |
| `/about` | Our Story | Vision, Mission, 4 promises, 3 principles, CEO message |
| `/activities` | Activities | 9 events + online application form |
| `/summit` | School Impact Summit 2026 | 28 Nov 2026, Islamabad — objectives, audience, speakers, stats, videos, testimonials, registration |
| `/contact` | Contact | Address, WhatsApp, email, enquiry form |

**Contact:** theleadershipcovenant@gmail.com · +92 319 2091249 (WhatsApp) · 171, St. 68, F-10/3, Islamabad, Pakistan

## Important Notes

- **Content files are verbatim** from the live site (extracted from all 6 pages, including the `/summit` page that is linked from Home and Activities but not in the main nav).
- **Confirmed from the site:** all copy, nav, links, meta tags, theme color `#0B2545`, form fields and dropdown options.
- **Recommended by us (not visible on the live site):** tech stack, backend, design tokens other than navy, fonts, security architecture, success/auto-reply copy. These are marked 🟡 / "recommended" in the docs.
- Several events listed on the live site have **dates that already passed**; the build must hide past events automatically (see `13-OPEN-QUESTIONS.md` B1).
- Numbering skips `07` intentionally: the security doc lives at the root as `SECURITY.md`, the standard location.

## Suggested Order of Reading (humans)

PRD → Sitemap → Content files → Design System → Architecture → Data/Forms → Security → Tasks → Open Questions.
