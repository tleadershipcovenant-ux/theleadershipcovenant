# CONTENT — Activities Page (`/activities`)

> Source: https://future-forward-leaders.lovable.app/activities
> All text is verbatim from the live site.

## Page Meta

- **Title:** Upcoming Activities & Apply Online — The Leadership Covenant
- **Description:** See upcoming leadership camps, workshops and open sessions from The Leadership Covenant. Apply online in minutes.
- **OG/Twitter title:** Upcoming Activities — The Leadership Covenant
- **OG/Twitter description:** Camps, workshops, family sessions and open events — apply online.

## Section Order

1. Hero (H1 + intro)
2. Activities grid (9 cards)
3. Apply Online (info + form) — `id="apply"`

---

## 1. HERO

**Eyebrow:** Upcoming Activities
**H1:** Find your next leadership moment.
**Intro:** Camps, cohorts, summits, family evenings and open workshops — pick what fits and apply in minutes.

---

## 2. ACTIVITIES (card spec)

Card anatomy: **date block** (month + day) · **category chip** · **city** · **H3 title** · **description** · **status badge (●)** · **CTA link**.

### Card 1 — 7 Habits of Highly Effective People
- **Date:** Jul 19 · **Category:** Professional Development · **City:** Islamabad
- **Description:** A transformational one-day experience of the world's most trusted personal effectiveness framework — for educators, leaders and lifelong learners.
- **Status:** ● Open enrollment
- **CTA:** Apply → → `#apply` (preselect activity)

### Card 2 — 4 Disciplines of Execution for Educators
- **Date:** Aug 29 · **Category:** Professional Development · **City:** Islamabad
- **Description:** Learn the proven 4DX operating system to execute your school's most important goals in the whirlwind of daily demands.
- **Status:** ● Early-bird open
- **CTA:** Apply → → `#apply`

### Card 3 — LiM Community Event 2026
- **Date:** Oct 03 · **Category:** LiM Community Event · **City:** Islamabad
- **Description:** A full day of open coaching, peer learning and inspiration with our Leader in Me community of educators, coaches and school leaders.
- **Status:** ● Free • RSVP required
- **CTA:** Apply → → `#apply`

### Card 4 — Neuro Science Backed Wellness
- **Date:** Oct 08 · **Category:** Wellness · **City:** Peshawar
- **Description:** Practical, neuroscience-backed practices for educator wellbeing, focus and resilience — designed for classroom life.
- **Status:** ● Seats limited
- **CTA:** Apply → → `#apply`

### Card 5 — Find Your Voice — LeaderU Session
- **Date:** Oct 22 · **Category:** LeaderU · **City:** Islamabad
- **Description:** A signature LeaderU experience for college and university students to discover purpose, voice and future-ready leadership skills.
- **Status:** ● Open enrollment
- **CTA:** Apply → → `#apply`

### Card 6 — 7 Habits of Highly Effective Families
- **Date:** Nov 07 · **Category:** Family Session · **City:** Islamabad
- **Description:** A powerful session for parents and caregivers to build trust, communication and a strong family culture rooted in timeless principles.
- **Status:** ● Family passes available
- **CTA:** Apply → → `#apply`

### Card 7 — Teacher Believed in Me
- **Date:** Nov 14 · **Category:** Professional Development · **City:** Islamabad
- **Description:** A heart-centred course that reconnects teachers with their why — and equips them to see, believe in and unleash every student's potential.
- **Status:** ● Open enrollment
- **CTA:** Apply → → `#apply`

### Card 8 — The School Impact Summit  ⭐ (Featured)
- **Date:** Nov 28 · **Category:** Summit · **City:** Islamabad
- **Description:** A one-day summit where school leaders and educators share strategies, stories and tools to amplify their school's impact on every student.
- **Status:** ● Open enrollment
- **CTA:** **Event details →** → `/summit`  *(different from the others)*

### Card 9 — Leadership Camp
- **Date:** Dec 18 · **Category:** Student Camp · **City/Location:** Swat, KPK • Dec 18–20, 2026
- **Description:** A three-day residential adventure in the mountains of Swat — where students build confidence, character and leadership through experience.
- **Status:** ● Applications open
- **CTA:** Apply → → `#apply`

> **Year note:** The live page shows month/day only, except the Leadership Camp (2026) and Summit (28 Nov 2026). All events should be stored with a full ISO date. Several listed dates (Jul 19, Aug 29, Oct 03, Oct 08, Oct 22) have already passed relative to the Summit's 2026 date context, so the new build **must hide/mark past events automatically**.

---

## 3. APPLY ONLINE  `id="apply"`

**Eyebrow:** Apply Online
**H2:** Reserve your seat in a few clicks.
**Text:** Complete the form and our activities team will confirm availability, share the joining details and answer any questions within one working day.

**Assurance bullets**
- ✓ Applications reviewed within 24 hours
- ✓ Group and school bookings are welcomed
- ✓ Early Bird and group discounts available

### Application Form

| Field | Label | Type | Required |
|---|---|---|---|
| name | Full name | text | ✔ |
| email | Email | email | ✔ |
| phone | Phone | tel | ✔ |
| role | Role | text (or select) | ✔ |
| activity | Activity | select | (select-one) |
| notes | Anything we should know? | textarea | optional |

**Activity dropdown (placeholder + 9 options, in this order):**
1. Select an activity… *(placeholder)*
2. 7 Habits of Highly Effective People
3. 4 Disciplines of Execution for Educators
4. LiM Community Event 2026
5. Neuro Science Backed Wellness
6. Find Your Voice — LeaderU Session
7. 7 Habits of Highly Effective Families
8. Teacher Believed in Me
9. The School Impact Summit
10. Leadership Camp

**Consent text:** By submitting you agree to be contacted by our team about this application.

**Submit button:** Submit application

Full validation, API and anti-spam rules: `06-FORMS-SPEC.md`.

## Acceptance Criteria

- [ ] Cards render from data, sorted by date ascending.
- [ ] Clicking "Apply →" scrolls to `#apply` AND preselects that activity in the dropdown.
- [ ] Summit card routes to `/summit`.
- [ ] Success state replaces form with confirmation message; errors are inline and announced to screen readers.
