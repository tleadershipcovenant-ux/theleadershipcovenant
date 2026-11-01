# CONTENT — Global Elements (Shared on Every Page)

> Source: https://future-forward-leaders.lovable.app/ (all pages share these elements)
> Rule: Build these ONCE as shared layout components (`<SiteHeader />`, `<SiteFooter />`, `<Seo />`). Never duplicate per page.

---

## 1. Brand

| Field | Value |
|---|---|
| Organization name | The Leadership Covenant |
| Tagline (short) | Learn • Develop • Lead • Transform |
| Footer sign-off | Change starts here. |
| Theme color (confirmed from `<meta name="theme-color">`) | `#0B2545` (deep navy) |
| Logo (light backgrounds) | `tlc-logo.png` (used on About page) |
| Logo (dark backgrounds / footer) | `tlc-logo-white.png` |
| Brand affiliation | FranklinCovey Education — North Region (social handles reference this) |
| Copyright line | © 2026 The Leadership Covenant. All rights reserved. |

> Use a dynamic year in code: `© {new Date().getFullYear()} The Leadership Covenant. All rights reserved.`

---

## 2. Header / Navigation

**Left:** Logo mark + wordmark
- Line 1: **The Leadership Covenant**
- Line 2 (small): **Learn • Develop • Lead • Transform**
- Links to `/`

**Center/Right nav (in order):**

| Order | Label | Route |
|---|---|---|
| 1 | Home | `/` |
| 2 | Services | `/services` |
| 3 | Our Story | `/about` |
| 4 | Activities | `/activities` |
| 5 | Contact | `/contact` |

**Primary CTA button (right):** `Apply Now` → `/activities`

**Behavior requirements**
- Sticky header on scroll.
- Active-route highlighting.
- Mobile: hamburger menu → full-width drawer; `Apply Now` remains visible inside drawer.
- `/summit` is NOT in the main nav; it is reached from Home and Activities cards.

---

## 3. Footer

**Column 1 — Brand**
- Logo (white version)
- **The Leadership Covenant**
- Learn • Develop • Lead • Transform
- Paragraph: "The Leadership Covenant is a commitment to build leadership in every student, educator, and family — one principle, one habit, one school at a time."
- Social icons (open in new tab, `rel="noopener noreferrer"`):

| Platform | URL |
|---|---|
| LinkedIn | https://www.linkedin.com/company/franklincovey-education-north-region/ |
| Facebook | https://web.facebook.com/profile.php?id=61592161942804 |
| Instagram | https://www.instagram.com/franklincoveyeducation_north/ |
| WhatsApp | https://wa.me/923192091249 |

**Column 2 — Explore**
- Home → `/`
- Services → `/services`
- Our Story → `/about`
- Activities → `/activities`
- Contact → `/contact`

**Column 3 — Contact**
- ✉ theleadershipcovenant@gmail.com (`mailto:`)
- ☎ +92 319 2091249 (WhatsApp) → https://wa.me/923192091249
- 📍 171, St. 68, F-10/3, Islamabad, Pakistan

**Bottom bar**
- © 2026 The Leadership Covenant. All rights reserved.
- "Change starts here."

> The live site shows an "Edit with Lovable" badge. **Do NOT reproduce this badge.**

---

## 4. Contact Constants (single source of truth)

Create `src/config/site.ts`:

```ts
export const SITE = {
  name: "The Leadership Covenant",
  tagline: "Learn • Develop • Lead • Transform",
  signoff: "Change starts here.",
  email: "theleadershipcovenant@gmail.com",
  whatsappDisplay: "+92 319 2091249",
  whatsappUrl: "https://wa.me/923192091249",
  address: {
    line1: "171, St. 68, F-10/3",
    city: "Islamabad",
    country: "Pakistan",
  },
  social: {
    linkedin: "https://www.linkedin.com/company/franklincovey-education-north-region/",
    facebook: "https://web.facebook.com/profile.php?id=61592161942804",
    instagram: "https://www.instagram.com/franklincoveyeducation_north/",
    whatsapp: "https://wa.me/923192091249",
  },
  themeColor: "#0B2545",
} as const;
```

---

## 5. Default SEO / Social Meta

| Tag | Value |
|---|---|
| `meta author` | The Leadership Covenant |
| `og:type` | website |
| `twitter:card` | summary_large_image |
| `theme-color` | #0B2545 |
| `viewport` | width=device-width, initial-scale=1 |
| `og:image` / `twitter:image` | Shared OG image (1200×630 recommended). Original is hosted on a Lovable R2 bucket — **download and self-host it** |

Per-page title/description: see `docs/08-SEO-AND-METADATA.md`.

---

## 6. Images Used Globally

| Asset | Usage |
|---|---|
| `tlc-logo.png` | Logo on light bg (About page) |
| `tlc-logo-white.png` | Footer + dark bg |
| OG image | Social share card |
