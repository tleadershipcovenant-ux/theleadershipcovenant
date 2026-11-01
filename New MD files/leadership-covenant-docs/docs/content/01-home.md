# CONTENT — Home Page (`/`)

> Source: https://future-forward-leaders.lovable.app/
> All text below is verbatim from the live site. Shared header/footer: see `00-global.md`.

## Page Meta

- **Title:** The Leadership Covenant — Learn. Develop. Lead. Transform.
- **Description:** The Leadership Covenant helps schools, students, educators and families unlock their leadership potential through Leader in Me, LeaderU, camps and transformational processes.
- **OG/Twitter description:** Learn. Develop. Lead. Transform. Building leaders at every level.

## Section Order (top → bottom)

1. Hero
2. Upcoming Activities (auto-scrolling strip)
3. Impact Stats
4. What We Do (3 service cards)
5. Principle Quote + Testimonials
6. Final CTA band
7. Footer

---

## 1. HERO  `id="hero"`

**Eyebrow:** A Covenant to Build Leaders

**Body paragraph:**
> The Leadership Covenant is our promise to every school, family and student — that leadership is not for the few, but the birthright of all. We help you build it, deliberately.

**Buttons**
| Label | Style | Route |
|---|---|---|
| Explore Our Services | Primary | `/services` |
| Upcoming Activities | Secondary / outline | `/activities` |

**Trust line:** Trusted by school leaders across the region.

**Hero image:** `hero-students.png`
- Alt: "Diverse students raising hands in a bright classroom"

> Note: The live site shows the eyebrow as the hero headline. Treat it as an `<h1>`.

---

## 2. UPCOMING ACTIVITIES STRIP  `id="upcoming"`

**Eyebrow:** Upcoming
**Heading (h2):** Activities on the horizon
**Link:** View all activities → `/activities`

Horizontal infinite marquee/carousel (the live site duplicates the list to loop). Each card: date badge, category tag, title, city, "Apply now →".

| Date | Category | Title | City | Link |
|---|---|---|---|---|
| Jul 19 | Professional Development | 7 Habits of Highly Effective People | Islamabad | `/activities` |
| Aug 29 | Professional Development | 4 Disciplines of Execution for Educators | Islamabad | `/activities` |
| Oct 03 | LiM Community Event | LiM Community Event 2026 | Islamabad | `/activities` |
| Oct 08 | Wellness | Neuro Science Backed Wellness | Peshawar | `/activities` |
| Oct 22 | LeaderU | Find Your Voice — LeaderU Session | Islamabad | `/activities` |
| Nov 07 | Family Session | 7 Habits of Highly Effective Families | Islamabad | `/activities` |
| Nov 14 | Professional Development | Teacher Believed in Me | Islamabad | `/activities` |
| Nov 28 | Summit | The School Impact Summit | Islamabad | **`/summit`** |
| Dec 18 | Student Camp | Leadership Camp | Swat, KPK (Dec 18–20) | `/activities` |

**Implementation rules**
- Render from the shared `events` data source (see `05-DATA-MODEL-AND-API.md`) — do not hardcode.
- Hide events whose end date has passed.
- Only the Summit card links to `/summit`; all others link to `/activities` (ideally with `#apply` + preselected activity).
- Pause animation on hover/focus; respect `prefers-reduced-motion` (static scrollable row).

---

## 3. IMPACT STATS  `id="stats"`

**Labels above stats:** International Footprint · Pakistan Reach · North Region Spread

| Value | Label |
|---|---|
| 8,000+ | Schools worldwide |
| 50+ | Countries served |
| 3M+ | Students impacted |
| 25+ | Years of research |

Animate count-up on first scroll into view (once only).

---

## 4. WHAT WE DO  `id="what-we-do"`

**Eyebrow:** What we do
**Heading (h2):** Processes that transform schools & lives.
**Link:** View all services → `/services`

| # | Tag | Title | Description | CTA |
|---|---|---|---|---|
| 1 | Leader in Me | **Process** — Leader in Me | Our flagship EY–12 whole-school transformation process that develops student leaders and transforms school culture through The 7 Habits. | Learn more → `/services` |
| 2 | Professional Development | **Courses** — Professional Development | Internationally trusted courses that equip teachers and school leaders with the mindset, skillset and toolset to drive transformation. | Learn more → `/services` |
| 3 | Leadership Camps | **Program** — Leadership Camps | Immersive residential and day camps where students build confidence, character and leadership through adventure and reflection. | Learn more → `/services` |

Deep-link suggestion: `/services#leader-in-me`, `/services#professional-development`, `/services#leadership-camps`.

---

## 5. PRINCIPLE QUOTE + TESTIMONIALS  `id="voices"`

**Eyebrow:** The principle we live by

**Quote (large):**
> "The main thing is to keep the main thing the main thing."

— Dr. Stephen R. Covey

**Testimonials**

| Quote | Attribution |
|---|---|
| "Our school culture has completely transformed. Students genuinely lead themselves and each other." | Elementary Principal |
| "The 7 Habits training was the most impactful PD our staff has ever experienced." | District Superintendent |

---

## 6. FINAL CTA BAND  `id="cta"`

**Heading (h2):** Ready to lead the change in your school?

**Sub-text:** Let's design a leadership journey for your students, educators, and families.

| Label | Style | Route |
|---|---|---|
| Talk to our team | Primary | `/contact` |
| See upcoming events | Secondary | `/activities` |

---

## Assets

| File | Alt text |
|---|---|
| `hero-students.png` | Diverse students raising hands in a bright classroom |

## Acceptance Criteria

- [ ] All text matches verbatim.
- [ ] 9 activity cards render from data; past events hidden.
- [ ] Summit card routes to `/summit`.
- [ ] Stats animate once; reduced-motion respected.
- [ ] Lighthouse: Performance ≥ 90, Accessibility ≥ 95, SEO ≥ 95.
