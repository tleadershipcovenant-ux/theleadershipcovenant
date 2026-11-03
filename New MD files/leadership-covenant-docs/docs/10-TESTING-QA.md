# Testing & QA Plan

## 1. Test Pyramid

| Level | Tooling | Scope |
|---|---|---|
| Unit | Vitest | Zod schemas, utils (date filtering, slug mapping), hooks (`useCountUp`, `useScrollSpy`) |
| Component | React Testing Library | Forms (validation, success/error), EventCard CTA logic, ServiceChips |
| Integration | Vitest + MSW | Form → API mock flow, event list rendering from data |
| E2E | Playwright (Chromium, WebKit, Firefox; Pixel 5 + iPhone 13 viewports) | Critical journeys below |
| A11y | axe-core via Playwright | Every route |
| Security | Custom Playwright/API tests + manual | RLS, rate limit, headers |
| Visual | Playwright screenshots (optional) | Hero, services blocks, footer |

## 2. Content Verification (verbatim check)

Automate: a script compares rendered text of each page with the strings in `docs/content/*.md` (key headings, CTAs, bullets).

Manual spot check list:
- [ ] Home: 9 events, 4 stats, 3 service cards, 1 quote + 2 testimonials.
- [ ] Services: 6 blocks; ® symbols intact; 5 PD courses listed.
- [ ] About: Vision, Mission, 4 promises, 3 principles, CEO message (3 paragraphs + closing).
- [ ] Activities: 9 cards; 9 dropdown options.
- [ ] Summit: 4 objectives, 6 audiences, 2 speakers, 3 stats, 2 videos, 4 testimonials.
- [ ] Contact: 4 info cards, 9 interest options.
- [ ] Footer identical on all pages.

## 3. Critical E2E Scenarios

| # | Scenario | Expected |
|---|---|---|
| E1 | Visit `/` → click "Explore Our Services" | Lands on `/services` |
| E2 | Home strip → click Summit card | Lands on `/summit` |
| E3 | Home strip → click any non-summit card | Lands on `/activities` |
| E4 | Header "Apply Now" | Goes to `/activities` |
| E5 | Services → "Enquire about LeaderU" | `/contact?interest=leaderu`, dropdown shows LeaderU |
| E6 | Activities → "Apply →" on Principal's Academy | Scrolls to form; activity preselected |
| E7 | Submit Application with valid data | Success state; DB row created; email sent |
| E8 | Submit Application with empty required fields | Inline errors; no request sent |
| E9 | Submit Summit registration | Row `type=summit`, `activity_slug=school-impact-summit-2026` |
| E10 | Submit Contact form | Success; row `type=contact` |
| E11 | Honeypot filled | Fake success; **no** DB row, **no** email |
| E12 | 6 rapid submissions | 6th returns 429 UI message |
| E13 | Past event date | Event hidden on Home + Activities + dropdown |
| E14 | Mobile menu | Opens, traps focus, closes with Esc |
| E15 | Footer social links | Open in new tab with `rel=noopener noreferrer` |
| E16 | 404 route | Branded 404 with link home |
| E17 | Anchor chips on Services | Scroll with correct header offset; active chip updates |
| E18 | Reduced motion | No marquee/count-up animation |

## 4. Security Tests

- [ ] Using only the **anon key**, `select * from submissions` returns 0 rows / is denied.
- [ ] Anon cannot insert directly into `submissions` or `events`.
- [ ] Unpublished events not returned to anon.
- [ ] Editor cannot read `audit_log`; viewer cannot update events.
- [ ] Form endpoint rejects: wrong Origin, wrong content-type, body > 10 KB, invalid Turnstile token.
- [ ] XSS payloads (`<script>`, `"><img onerror>`) in every field are stored inert and escaped in email + admin UI.
- [ ] CRLF injection attempt in `full_name`/`email` rejected.
- [ ] Security headers present (curl + securityheaders.com).
- [ ] No secrets in built JS (`grep -r "service_role\|sk_" dist/`).

## 5. Cross-Browser / Device Matrix

| Platform | Browsers |
|---|---|
| Android (low/mid-range) | Chrome, Samsung Internet |
| iOS | Safari |
| Windows | Chrome, Edge, Firefox |
| macOS | Safari, Chrome |
| Viewports | 360, 390, 768, 1024, 1280, 1536 |

## 6. Responsive Checks

- [ ] No horizontal scroll at 360px.
- [ ] Hero stacks cleanly; buttons full-width on mobile.
- [ ] Services zig-zag collapses to image-above-text.
- [ ] Marquee readable and not clipped.
- [ ] Forms usable with on-screen keyboard (no hidden submit button).

## 7. Release Gate

All must be green before production deploy:
1. CI: typecheck, lint, unit, build, E2E, axe, Lighthouse budgets.
2. Security checklist (`SECURITY.md` §14) complete.
3. Client sign-off on copy + open questions (`13-OPEN-QUESTIONS.md`).
4. Smoke test on production URL (all 3 forms, one real email received).
