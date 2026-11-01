# Sitemap & Routes

## Route Table

| Route | Page | In main nav | In footer | In sitemap.xml | Priority |
|---|---|---|---|---|---|
| `/` | Home | ✔ | ✔ | ✔ | 1.0 |
| `/services` | Services | ✔ | ✔ | ✔ | 0.9 |
| `/about` | Our Story | ✔ | ✔ | ✔ | 0.7 |
| `/activities` | Activities + Apply | ✔ (+ "Apply Now" CTA) | ✔ | ✔ | 0.9 |
| `/summit` | School Impact Summit 2026 | ✘ | ✘ | ✔ | 0.8 |
| `/contact` | Contact | ✔ | ✔ | ✔ | 0.8 |
| `/privacy` | Privacy Policy (new) | ✘ | ✔ (add) | ✔ | 0.3 |
| `/terms` | Terms (new, optional) | ✘ | ✔ (add) | ✔ | 0.2 |
| `/admin/*` | Admin (new) | ✘ | ✘ | ✘ (`noindex`) | — |
| `*` | 404 | ✘ | ✘ | ✘ | — |

## Navigation Map

```
Header:  Home | Services | Our Story | Activities | Contact | [Apply Now → /activities]

Home ──┬─ Explore Our Services ───────► /services
       ├─ Upcoming Activities ────────► /activities
       ├─ Activity strip cards ───────► /activities  (Summit → /summit)
       ├─ What we do cards ───────────► /services
       ├─ Talk to our team ───────────► /contact
       └─ See upcoming events ────────► /activities

Services ── Enquire about … ──────────► /contact?interest=<slug>
         └─ Book a discovery call ────► /contact

About ──┬─ Explore our services ──────► /services
        └─ Get in touch ──────────────► /contact

Activities ─┬─ Apply → ───────────────► #apply (preselect activity)
            └─ Summit "Event details" ► /summit

Summit ─┬─ Register now ──────────────► #register
        ├─ Who should attend? ────────► #audience
        ├─ LinkedIn videos ───────────► external
        └─ See all upcoming activities ► /activities
```

## Query Parameters & Anchors

| Pattern | Used on | Meaning |
|---|---|---|
| `/contact?interest=leader-in-me` | Contact | Preselects "I'm interested in" |
| `/activities?activity=4dx-for-educators#apply` | Activities | Preselects activity in form |
| `/services#leader-in-me` etc. | Services | Scroll to block |
| `/summit#register`, `#audience` | Summit | Scroll targets |

### Interest slug mapping

| Dropdown label | Slug |
|---|---|
| General enquiry | `general` |
| Leader in Me | `leader-in-me` |
| LeaderU | `leaderu` |
| Professional Development | `professional-development` |
| Leadership Camps | `leadership-camps` |
| Family Sessions | `family-sessions` |
| Open Sessions | `open-sessions` |
| Podcast | `podcast` |
| Partnership | `partnership` |

### Activity slug mapping

| Activity | Slug |
|---|---|
| 7 Habits of Highly Effective People | `7-habits` |
| 4 Disciplines of Execution for Educators | `4dx-for-educators` |
| LiM Community Event 2026 | `lim-community-2026` |
| Neuro Science Backed Wellness | `neuroscience-wellness` |
| Find Your Voice — LeaderU Session | `leaderu-find-your-voice` |
| 7 Habits of Highly Effective Families | `7-habits-families` |
| Teacher Believed in Me | `teacher-believed-in-me` |
| The School Impact Summit | `school-impact-summit-2026` |
| Leadership Camp | `leadership-camp-swat-2026` |

## External Links

| Target | URL |
|---|---|
| LinkedIn | https://www.linkedin.com/company/franklincovey-education-north-region/ |
| Facebook | https://web.facebook.com/profile.php?id=61592161942804 |
| Instagram | https://www.instagram.com/franklincoveyeducation_north/ |
| WhatsApp | https://wa.me/923192091249 |
| Summit video 1 | https://www.linkedin.com/posts/franklincoveyeducationpakistan_schoolimpactsummit2026-franklincoveyeducation-activity-7518212599885418498-2uMA |
| Summit video 2 | https://www.linkedin.com/posts/franklincoveyeducationpakistan_schoolimpactsummit2026-franklincoveyeducation-activity-7515647405401284609-35m0 |

All external links: `target="_blank" rel="noopener noreferrer"`.

## Redirects / Housekeeping

- Trailing slash normalization (no trailing slash).
- `www` → apex (or vice versa) once the custom domain is chosen.
- SPA fallback to `index.html` on static hosting, or use SSR/prerender for SEO (see architecture doc).
