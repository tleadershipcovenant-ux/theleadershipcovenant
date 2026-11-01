# SEO & Metadata

## 1. Per-Page Metadata (verbatim from the live site)

| Route | `<title>` | Meta description | OG title | OG/Twitter description |
|---|---|---|---|---|
| `/` | The Leadership Covenant — Learn. Develop. Lead. Transform. | The Leadership Covenant helps schools, students, educators and families unlock their leadership potential through Leader in Me, LeaderU, camps and transformational processes. | The Leadership Covenant | Learn. Develop. Lead. Transform. Building leaders at every level. |
| `/services` | Our Services — The Leadership Covenant | Leader in Me, LeaderU, Professional Development for educators, Leadership Camps, Family Sessions, Open Sessions and our podcast Change Starts Here. | Our Services — The Leadership Covenant | Explore our full range of leadership programs for schools, students, educators and families. |
| `/about` | Our Story — The Leadership Covenant | The vision, mission, values and CEO message behind The Leadership Covenant. | Our Story — The Leadership Covenant | Vision, mission and CEO message. |
| `/activities` | Upcoming Activities & Apply Online — The Leadership Covenant | See upcoming leadership camps, workshops and open sessions from The Leadership Covenant. Apply online in minutes. | Upcoming Activities — The Leadership Covenant | Camps, workshops, family sessions and open events — apply online. |
| `/summit` | The School Impact Summit 2026 — The Leadership Covenant | The School Impact Summit 2026 — 28 November 2026, Islamabad. Objectives, who should attend, speakers, past highlights and testimonials. Register online in minutes. | The School Impact Summit 2026 | 28 November 2026 • Islamabad. A one-day summit to amplify your school's impact on every student. |
| `/contact` | Contact Us — The Leadership Covenant | Get in touch with The Leadership Covenant. Address, phone, email and enquiry form. | Contact Us — The Leadership Covenant | Reach our team for programs, partnerships and enquiries. |

Shared on all pages: `author = The Leadership Covenant`, `og:type = website`, `twitter:card = summary_large_image`, `theme-color = #0B2545`, shared OG/Twitter image.

Add per page: `<link rel="canonical">`, `og:url`, `og:site_name = The Leadership Covenant`, `og:locale = en_PK`.

**Title length:** the Activities title (58 chars) is fine; keep all ≤ 60.

## 2. `<Seo />` Component

```tsx
<Seo
  title="Our Services — The Leadership Covenant"
  description="Leader in Me, LeaderU, ..."
  path="/services"
  image="/og-image.png"
  jsonLd={[...]}
/>
```

Builds: title, description, canonical (`VITE_SITE_URL + path`), OG, Twitter, JSON-LD.

## 3. Structured Data (JSON-LD)

### Organization (all pages, once in layout)

```json
{
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  "name": "The Leadership Covenant",
  "slogan": "Learn • Develop • Lead • Transform",
  "url": "https://YOUR-DOMAIN",
  "logo": "https://YOUR-DOMAIN/logo.png",
  "email": "theleadershipcovenant@gmail.com",
  "telephone": "+923192091249",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "171, St. 68, F-10/3",
    "addressLocality": "Islamabad",
    "addressCountry": "PK"
  },
  "sameAs": [
    "https://www.linkedin.com/company/franklincovey-education-north-region/",
    "https://web.facebook.com/profile.php?id=61592161942804",
    "https://www.instagram.com/franklincoveyeducation_north/"
  ]
}
```

### Event (`/summit`; also one per event on `/activities`)

```json
{
  "@context": "https://schema.org",
  "@type": "Event",
  "name": "The School Impact Summit 2026",
  "startDate": "2026-11-28",
  "endDate": "2026-11-28",
  "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
  "eventStatus": "https://schema.org/EventScheduled",
  "location": {
    "@type": "Place",
    "name": "Islamabad",
    "address": { "@type": "PostalAddress", "addressLocality": "Islamabad", "addressCountry": "PK" }
  },
  "description": "A one-day summit where school leaders and educators share strategies, stories and tools to amplify their school's impact on every student.",
  "organizer": { "@type": "Organization", "name": "The Leadership Covenant", "url": "https://YOUR-DOMAIN" },
  "image": "https://YOUR-DOMAIN/images/summit-banner.png"
}
```

> Venue name is not published on the live site — keep `location.name` as "Islamabad" until the client provides the venue.

### BreadcrumbList on inner pages; `FAQPage` only if an FAQ is added later.

## 4. `robots.txt`

```
User-agent: *
Allow: /
Disallow: /admin
Sitemap: https://YOUR-DOMAIN/sitemap.xml
```

## 5. `sitemap.xml`

Include `/`, `/services`, `/about`, `/activities`, `/summit`, `/contact`, `/privacy` with `lastmod`. Generate at build time. Exclude `/admin`.

## 6. Technical SEO Checklist

- [ ] Exactly one H1 per page (see content files).
- [ ] Prerendered HTML contains full content + meta (view-source check).
- [ ] OG image 1200×630, < 300 KB, self-hosted; test with WhatsApp, LinkedIn, Facebook debuggers (WhatsApp is the main sharing channel in Pakistan).
- [ ] All images have descriptive alt (provided).
- [ ] Internal links use descriptive anchors; no "click here".
- [ ] Core Web Vitals pass (LCP < 2.5 s, CLS < 0.1, INP < 200 ms).
- [ ] `lang="en"` on `<html>`; favicon set (SVG + 180px Apple touch + 192/512 PNG).
- [ ] Google Search Console + Bing Webmaster verified; sitemap submitted.
- [ ] Create/claim Google Business Profile for the F-10/3 Islamabad address.

## 7. Target Keywords (suggested, validate with tools)

Leader in Me Pakistan · Leader in Me Islamabad · FranklinCovey Education Pakistan · 7 Habits workshop Islamabad · 4DX for educators · school leadership training Pakistan · leadership camp Swat · LeaderU Pakistan · 7 Habits of Highly Effective Families · School Impact Summit 2026.
