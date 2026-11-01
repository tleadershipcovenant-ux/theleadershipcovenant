# Open Questions & Content Discrepancies

Items found while extracting the live site. Resolve with the client before launch. Until answered, implement **as-is (verbatim)** unless noted.

## A. Content inconsistencies

| # | Where | Observation | Default action |
|---|---|---|---|
| A1 | About vs Summit | Ubaid ur Rehman is "CEO, The Leadership Covenant" (About) but "Regional Manager, FranklinCovey Education North Region" (Summit speakers). | Keep both verbatim; ask client to confirm titles. |
| A2 | Summit videos | First video title says "School Impact Summit, **Lahore**", while the 2026 summit is in Islamabad. | Keep verbatim (past event); confirm. |
| A3 | Services meta/Contact | "Open Sessions" appears in the Services meta description and the Contact interest dropdown, but there is **no Open Sessions block** on `/services`. | Keep dropdown option; ask whether to add a block or drop the option. |
| A4 | Services meta | Podcast referred to as "**Change Starts Here**", but the on-page title is "Leadership Podcast". | Keep both; confirm official name. |
| A5 | Home vs Activities | Home says "Apply now →" on every card and all go to `/activities` (not to a preselected form). | Improve: preselect activity (documented). |
| A6 | Activities cards | The Summit card CTA reads "Event details →" and routes to `/summit`; all others read "Apply →". | Keep. |
| A7 | Home | Hero eyebrow "A Covenant to Build Leaders" acts as the headline; no distinct H1 text is exposed. | Render as H1. |

## B. Missing information (needed to finish)

| # | Question | Needed for |
|---|---|---|
| B1 | **Years** for events other than Summit and Camp (assumed 2026). Several dates (Jul 19, Aug 29, Oct 03, Oct 08, Oct 22) are already in the past relative to today's date. Should they be removed, archived, or shown as "Past events"? | Events data, auto-hide logic |
| B2 | Event venues, times, prices, seat counts, early-bird deadlines, group discount terms. | Event detail, JSON-LD, form copy |
| B3 | Summit agenda/schedule, ticket price, venue name, capacity. | `/summit` enhancements |
| B4 | Final production domain name. | Canonical URLs, OG, sitemap, CORS |
| B5 | Where do submissions go? Confirm recipient email(s) and whether an auto-reply is wanted (and its copy). | Email pipeline |
| B6 | Preferred email sender (domain email vs Gmail). | Deliverability / SPF/DKIM |
| B7 | Privacy policy / terms text and data-retention period. | `/privacy` |
| B8 | Is the "Role" field free text or a fixed list (e.g., Principal, Teacher, Parent, Student)? Live site export shows a required Role field without options. | Forms |
| B9 | Podcast: platform links (Spotify/Apple/YouTube) and episode list. | Podcast section |
| B10 | Real testimonial attribution permission (names/schools) — currently anonymous roles. | Testimonials |
| B11 | Stats source/date (8,000+ schools, 50+ countries, 3M+ students, 25+ years) — these are FranklinCovey global figures; confirm they may be displayed and whether to add a "Source: FranklinCovey" note. | Home stats |
| B12 | Trademark/licensing guidance for FranklinCovey marks and logos (®, "Leader in Me", "LeaderU", etc.). | Legal footer note |
| B13 | Does the "Pakistan Reach / North Region Spread" stats label row have numbers? On the live export only the labels appear, no values. | Home stats |
| B14 | Brand fonts, exact color palette, official logo SVGs. | Design system |
| B15 | Google Maps pin / directions link for the F-10/3 address. | Contact page |
| B16 | Image licensing for hero/service/CEO photos (AI-generated or stock?). | Launch |

## C. Recommended additions (not on live site)

| # | Addition | Why |
|---|---|---|
| C1 | `/privacy` (and optional `/terms`) | Required — forms collect PII |
| C2 | Branded 404 | UX |
| C3 | FAQ block on Services or Contact | SEO + fewer enquiries |
| C4 | Past events / gallery | Social proof |
| C5 | Urdu (RTL) version | Wider Pakistani reach |
| C6 | Newsletter signup | Lead nurturing |
| C7 | WhatsApp floating button | High-conversion channel in Pakistan |
| C8 | Admin panel to manage events | Removes developer dependency |

## D. Assumptions made in these docs

1. Tech stack is a recommendation (live site is Lovable/React; internals not visible).
2. Design tokens other than `#0B2545` are recommendations.
3. Year 2026 assumed for all events.
4. Success/auto-reply copy is suggested wording, not from the live site.
5. Backend (Supabase) is a recommendation — the live site's backend for forms was not observable.
