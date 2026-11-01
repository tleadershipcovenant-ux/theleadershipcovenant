# Accessibility & Performance

Target: **WCAG 2.2 AA**. Lighthouse mobile: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95.

## 1. Accessibility Requirements

### Structure
- One `<h1>` per page; heading levels never skip.
- Landmarks: `<header>`, `<nav aria-label="Primary">`, `<main id="main">`, `<footer>`.
- "Skip to main content" link as the first focusable element.
- `lang="en"` on `<html>`.

### Keyboard
- All interactive elements reachable and operable by keyboard in logical order.
- Visible focus ring (min 2px, 3:1 contrast) on every control.
- Mobile menu: focus trap while open, `Esc` closes, focus returns to the toggle button.
- Anchor chips and in-page links move focus to the target section heading.

### Screen readers
- Decorative glyphs/emoji/icons: `aria-hidden="true"`; meaningful ones get text alternatives.
- Status dots (●) must be accompanied by text (already present: "Open enrollment" etc.).
- Marquee on Home: provide an accessible static list alternative (`aria-label="Upcoming activities"`) and a pause control; duplicated loop items get `aria-hidden="true"`.
- Stat count-up: final value in the DOM from the start (animate visually only), so screen readers read "8,000+".
- Form errors: `role="alert"`; success message `aria-live="polite"`.
- Images: alt text per content files; decorative images `alt=""`.
- External links opening new tabs: add visually hidden "(opens in a new tab)".

### Color & Visual
- Text contrast ≥ 4.5:1 (large text ≥ 3:1); UI components ≥ 3:1.
- Do **not** place gold text on white (see design system).
- Don't convey state by color alone.
- Support 200% zoom and 400% reflow without horizontal scroll.
- Respect `prefers-reduced-motion` (no marquee/count-up/parallax; show final state).

### Touch
- Targets ≥ 44×44 px (WCAG 2.2 min 24 px; use 44+).

## 2. Performance Budget

| Metric | Budget |
|---|---|
| LCP | < 2.5 s (4G mid-tier Android) |
| INP | < 200 ms |
| CLS | < 0.1 |
| JS (home route, gzip) | < 200 KB |
| CSS (gzip) | < 40 KB |
| Hero image | < 150 KB (AVIF/WebP) |
| Any other image | < 120 KB |
| Fonts | ≤ 2 families, WOFF2, ≤ 100 KB total |
| Third-party scripts | Turnstile + analytics only; both deferred |

## 3. Optimization Tactics

1. **Images:** convert PNGs (`hero-students.png`, service images, `summit-banner.png`, logos) to AVIF/WebP with fallbacks; generate 480/768/1280 widths with `srcset`/`sizes`; set `width`/`height`; hero `fetchpriority="high"`; everything else `loading="lazy"`.
2. **Fonts:** self-host, subset, `font-display: swap`, preload the primary body weight.
3. **Code splitting:** lazy-load Summit, Admin, and Contact routes; defer Turnstile until a form field is focused.
4. **CSS:** Tailwind purge; avoid large unused component libs.
5. **Marquee:** pure CSS `transform: translateX`; `will-change: transform`; pause when off-screen (IntersectionObserver).
6. **Caching:** immutable cache on hashed assets (`max-age=31536000, immutable`); HTML `no-cache`/short TTL.
7. **Compression:** Brotli on host.
8. **Network:** target Pakistani mobile networks — test with Lighthouse "Slow 4G" + 4× CPU throttle.
9. **Prerender** public routes so first paint doesn't wait on JS.

## 4. Testing Tools

- axe-core (Playwright `@axe-core/playwright`) on all routes — zero serious/critical violations.
- Lighthouse CI in pipeline with the budgets above.
- Manual: keyboard-only run-through; NVDA/VoiceOver pass on forms; TalkBack on Android.
- WebPageTest from a nearby region (e.g., Mumbai/Dubai) on throttled mobile.

## 5. Component-Level A11y Notes

| Component | Note |
|---|---|
| EventCard | Whole card not a single giant link; CTA link text includes event name via `aria-label="Apply for {title}"` |
| ServiceChips | `<nav aria-label="Services">`; `aria-current="true"` on active |
| StatCounter | `<dl>` semantics (value = `<dd>`, label = `<dt>`) |
| Testimonials | `<figure><blockquote>…</blockquote><figcaption>…</figcaption></figure>` |
| SpeakerCard | Initials avatar `aria-hidden`; name is the heading |
| Select (Activity/Interest) | Native `<select>` for reliability on low-end Android |
| Videos (Summit) | Links, not iframes; describe destination ("opens LinkedIn") |
