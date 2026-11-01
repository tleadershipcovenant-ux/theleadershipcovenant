# The Leadership Covenant — Design System & Guidelines

## 1. Brand Philosophy
The Leadership Covenant is the North Region Partner of **FranklinCovey Education**. The brand identity represents prestige, wisdom, transformative leadership, moral distinction, and trust.

---

## 2. Recommended Color Palette

| Element | Color Role | Hex Code | Tailwind Usage |
| :--- | :--- | :--- | :--- |
| **Main background** | Mint green | `#D7F5EF` | `bg-[#D7F5EF]` / `border-[#D7F5EF]` |
| **Background highlight** | Light mint | `#EFFBF8` | `bg-[#EFFBF8]` / `bg-background` |
| **Cool gradient edge** | Icy blue | `#DDEFF7` | `bg-[#DDEFF7]` / ambient orbs |
| **Headings & Body Title** | Deep navy | `#102E4D` | `text-[#102E4D]` |
| **Announcement bar & Hero** | Midnight navy | `#001B33` | `bg-[#001B33]` |
| **Primary CTA & Eyebrows** | Orange | `#FF7900` | `bg-[#FF7900]` / `text-[#FF7900]` |
| **Secondary accent & Dividers**| Golden yellow | `#FFC400` | `bg-[#FFC400]` / `text-[#FFC400]` |

### Supporting Neutral Colors
- **Card Background:** `bg-white` (with `border border-[#D7F5EF]`)
- **Card Hover Background:** `hover:bg-[#EFFBF8]` or `hover:border-[#FFC400]`
- **Body Text:** `text-slate-600` / `text-slate-700`
- **Muted Subtext:** `text-slate-500`
- **Border Lines:** `border-[#D7F5EF]` or `border-white/10` (on dark sections)

---

## 3. Typography
- **Headings & Titles:** `font-serif` (Playfair Display, Georgia, serif — with `lining-nums` enabled globally so inline digits never hang below the baseline)
  - Color: `#102E4D` (Deep navy)
  - Tracking: `tracking-tight`
- **Numbers, Counters, Dates & Indices:** `font-num` (`Inter` geometric sans with `lining-nums tabular-nums`)
  - Used across all running stats, calendar date boxes, slide counters, step numbers, phone numbers, and years for crisp, aligned legibility.
- **Body & Controls:** `font-sans` (Plus Jakarta Sans, sans-serif)
  - Weight: Medium / Semibold
- **Eyebrows / Overlines:** `text-xs sm:text-sm font-bold uppercase tracking-widest text-[#FF7900]` (clean typographic overlines — no cluttered pill badges inside cards)
- **Section Accent Line:** `w-20 h-1 bg-[#FFC400] mx-auto mt-3.5 rounded-full`

### Month-Based Activity Card Accents (`MONTH_THEMES`)
Activity cards on Home and `/activities` derive their top accent band, calendar month header, overline text, and CTA button color from the event's calendar month:
- **July:** Brand Orange (`#FF7900` → `#E56D00`)
- **August:** Forest Green (`#16A34A` → `#15803D`)
- **October:** Autumn Amber (`#D97706` → `#B45309`)
- **November:** Royal Blue (`#2563EB` → `#1D4ED8`)
- **December:** Mountain Teal (`#0D9488` → `#0F766E`)
- *(Full 12-month mapping defined in `src/content/events.ts`)*

---

## 4. Section Structure & Atmosphere
- **Global Page Background:** `bg-background` (`#EFFBF8` / Light mint)
- **Ambient Glowing Orbs:**
  ```tsx
  <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#D7F5EF]/60 blur-3xl pointer-events-none" />
  <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[#DDEFF7]/60 blur-3xl pointer-events-none" />
  ```
- **Section Dividers:**
  ```tsx
  <div className="absolute top-0 left-0 right-0 h-[1px] bg-[#D7F5EF]" />
  ```
- **Interactive Cards:**
  ```tsx
  className="p-6 rounded-2xl bg-white border border-[#D7F5EF] shadow-xs hover:border-[#FFC400] hover:shadow-md transition-all"
  ```
- **Primary Action Buttons:**
  ```tsx
  className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#FF7900] to-[#E56D00] hover:from-[#E56D00] hover:to-[#CC5F00] text-white font-bold text-sm tracking-wide shadow-md hover:shadow-lg transition-all"
  ```

---

## 5. Integrity Rules
1. **Verbatim Content:** Never modify copy or text from `leadership-covenant-website-content.md`.
2. **Color Strictness:** Always maintain the mint green `#D7F5EF` and light mint `#EFFBF8` backdrop with deep navy `#102E4D` headings, never replacing with generic stark white or dark background unless explicitly an institutional dark banner (e.g. announcement bar, hero slider, summit featured badge).

