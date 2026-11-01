# Design System & Style Guide

> **Verification status**
> - ✅ **Confirmed from the live site:** theme color `#0B2545` (deep navy), the visual structure (sticky header, hero with students photo, card layouts, alternating service blocks, dark footer with white logo).
> - 🟡 **Recommended (not scraped):** all other color values, fonts, radii, shadows. The page text export does not include CSS. Before final build, open the live site → DevTools → copy the computed colors/fonts and update the tokens below.

---

## 1. Brand Personality

Trustworthy · Warm · Educational · Aspirational · Principle-centered.
Feels like a respected institution that is still human and youthful. Not corporate-cold, not childish.

## 2. Color Tokens

| Token | Hex | Status | Usage |
|---|---|---|---|
| `--navy-900` / `--primary` | `#0B2545` | ✅ confirmed | Header text, hero overlays, footer bg, headings, primary buttons |
| `--navy-700` | `#13315C` | 🟡 | Hover for primary, dark sections |
| `--navy-500` | `#1F4E8C` | 🟡 | Links, icons |
| `--accent` (gold) | `#F2A900` | 🟡 | CTA highlights, badges, active nav underline, stat numbers |
| `--accent-soft` | `#FFF4D6` | 🟡 | Highlight chips, soft backgrounds |
| `--teal` | `#1BA8A0` | 🟡 | Status dots (open enrollment), success accents |
| `--bg` | `#FFFFFF` | 🟡 | Page background |
| `--bg-muted` | `#F5F7FA` | 🟡 | Alternating section background |
| `--text` | `#1B2430` | 🟡 | Body text |
| `--text-muted` | `#5B6776` | 🟡 | Secondary text |
| `--border` | `#E3E8EF` | 🟡 | Card borders, dividers |
| `--danger` | `#C62828` | 🟡 | Form errors |
| `--success` | `#2E7D32` | 🟡 | Form success |

**Contrast rules:** body text on `--bg` ≥ 7:1; white on `--navy-900` ≥ 12:1; gold text on white fails AA — use gold only as **fill/accent**, never as small text on white (use navy text on gold fill).

### Tailwind snippet

```ts
// tailwind.config.ts (extend.colors)
colors: {
  navy: { 900: "#0B2545", 700: "#13315C", 500: "#1F4E8C" },
  gold: { DEFAULT: "#F2A900", soft: "#FFF4D6" },
  teal: { DEFAULT: "#1BA8A0" },
  muted: { DEFAULT: "#F5F7FA", foreground: "#5B6776" },
}
```

## 3. Typography 🟡

| Role | Font (recommended) | Fallback | Weight |
|---|---|---|---|
| Headings | **Poppins** or **Playfair Display** (for quotes/CEO message) | `ui-serif, Georgia, serif` | 600–700 |
| Body / UI | **Inter** | `system-ui, -apple-system, Segoe UI, Roboto, sans-serif` | 400–500 |
| Quote accent | Playfair Display Italic | `Georgia, serif` | 400 italic |

Self-host fonts (WOFF2, `font-display: swap`), subset Latin. Reserve space for Urdu (Noto Nastaliq Urdu) for v2.

| Style | Mobile | Desktop | Line height |
|---|---|---|---|
| H1 | 32px | 56px | 1.1 |
| H2 | 26px | 40px | 1.2 |
| H3 | 20px | 24px | 1.3 |
| Body | 16px | 18px | 1.6 |
| Small / eyebrow | 12–13px, uppercase, letter-spacing 0.12em | 13–14px | 1.4 |

**Eyebrow pattern** (used everywhere on the site): small uppercase label above each H1/H2 — e.g., "Our Story", "Upcoming", "What we do". Build as `<Eyebrow>` component, gold or teal colored.

## 4. Spacing, Radius, Shadow 🟡

- Spacing scale: 4-pt (4, 8, 12, 16, 24, 32, 48, 64, 96).
- Section padding: `py-16 md:py-24`.
- Container: `max-w-7xl`, `px-4 sm:px-6 lg:px-8`.
- Radius: cards `16px`, buttons `9999px` (pill) or `12px`, inputs `12px`, badges `9999px`.
- Shadows: `sm` for cards at rest, `lg` on hover (translateY −2px).

## 5. Components

### Buttons
| Variant | Look | Used for |
|---|---|---|
| Primary | Navy (or gold) fill, white (navy) text, pill | "Explore Our Services", "Talk to our team", "Submit application" |
| Secondary | Outline navy, transparent | "Upcoming Activities", "See upcoming events" |
| CTA (header) | Gold fill, navy text | "Apply Now" |
| Link | Text + arrow → | "Learn more →", "Apply →", "View all …" |

States: hover, focus-visible ring (2px gold/navy offset), disabled, loading (spinner + `aria-busy`).

### Cards
- **EventCard:** date block (month small caps / day large), category chip, city, title, description, status dot + label, CTA.
- **ServiceCard (home):** tag, title, description, "Learn more →".
- **ServiceBlock (services page):** image + badge + H2 + paragraph + check list + outline CTA; alternate left/right on desktop, stacked on mobile.
- **PrincipleCard / ObjectiveCard:** icon (✦), H3, paragraph.
- **StatCard:** big number (gold/navy) + label.
- **TestimonialCard:** large opening quote mark, quote, attribution.
- **SpeakerCard:** circular initials avatar, name, title, bio.
- **AudienceCard:** emoji icon + title.
- **ContactInfoCard:** icon, title, content.

### Form controls
- Label above field, required asterisk `*`, 48px min height, 12px radius, 1px border, focus ring.
- Error: red border + message below with `role="alert"`.
- Select: custom styled native `<select>`.
- Consent text small muted below the submit button.

### Badges / Status
- Status dot `●` colored teal (open), gold (early-bird / limited), blue (free/RSVP). Always include text (not color alone).
- Service badges: "★ FLAGSHIP · EY – 12 PROCESS", "◆ Higher Education Process", etc.

### Header / Footer
- Header: white/blurred bg, sticky, shadow after scroll; logo left, nav center/right, CTA far right.
- Footer: navy bg, white logo, 3 columns (brand / explore / contact), social icons, bottom copyright bar.

## 6. Imagery

| Asset | Treatment |
|---|---|
| `hero-students.png` | Right side of hero on desktop, full-width on mobile; rounded-2xl; priority-loaded |
| Service images (5 + podcast) | 4:3 or 16:10, rounded-2xl, lazy |
| `ceo.jpg` | Square/portrait crop |
| `summit-banner.png` | Full-width banner, preserve text legibility (do not crop banner text) |
| Logos | SVG preferred (convert from PNG if source available) |

All images: explicit `width`/`height`, `loading="lazy"` (except hero), `decoding="async"`, modern formats.

## 7. Iconography

Live site uses simple glyphs (★ ◆ ✦ ▲ ❤ ♪ ✓ ● →) and emoji (🏛️ 🎓 📚 💚 🧭 🌱 📍 ☎ ✉). **Recommendation:** replace with `lucide-react` SVG icons for consistent rendering across Android/iOS/Windows. Keep `aria-hidden="true"` on decorative icons.

## 8. Motion

- Marquee on Home events strip (CSS animation, 40–60 s loop, pause on hover/focus).
- Count-up on stats (once, 1.2 s).
- Card hover lift 150–200 ms.
- Fade/slide-in on scroll (opacity + 12px translate), disabled under `prefers-reduced-motion`.

## 9. Layout Patterns

- Hero: 2-column (copy left, image right) → stacked on mobile.
- Alternating sections: `bg` / `bg-muted`.
- Services: zig-zag 2-col.
- Activities: responsive grid 1 / 2 / 3 columns.
- Contact: 5/7 split (info / form).

## 10. Breakpoints

`sm 640` · `md 768` · `lg 1024` · `xl 1280` · `2xl 1536` (Tailwind defaults). Design mobile-first at 360px.

## 11. Voice & Tone (for any new copy)

- Warm, confident, principle-centered. Short sentences. Active voice.
- Uses "we" / "you". Avoids jargon except FranklinCovey program names.
- Signature rhythm: triads and parallel phrases ("Learn • Develop • Lead • Transform", "Developing Student Leaders. Transforming School Culture.").
- Always preserve ® on program names.

## 12. Dark Mode

Not present on the live site. **Out of scope for v1.**
