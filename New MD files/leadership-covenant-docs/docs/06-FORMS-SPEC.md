# Forms Specification

Three forms exist on the live site. All post to the same `submit-form` endpoint (see `05-DATA-MODEL-AND-API.md`).

## 1. Shared Rules

| Rule | Detail |
|---|---|
| Validation | Zod schema shared client + server; inline errors under each field |
| Required marker | Asterisk `*` after label; `aria-required="true"` |
| Labels | Always visible `<label for>`; no placeholder-only labels |
| Spam | Hidden honeypot field `website` (CSS-hidden, `tabindex=-1`, `autocomplete=off`) + Cloudflare Turnstile |
| Submit state | Button disabled + spinner + `aria-busy="true"`; prevent double submit |
| Success | Replace form with confirmation card (focus moved to heading, `aria-live="polite"`) |
| Error | Field errors with `role="alert"`; network error keeps input and shows retry |
| Data hygiene | Trim, collapse whitespace, max lengths, reject control characters |
| Consent | Text below submit button (application + summit) |
| Privacy | Link to `/privacy` near consent text |

## 2. Form A — Activity Application (`/activities#apply`)

| Field | Label | Type | Required | Rules |
|---|---|---|---|---|
| `full_name` | Full name | text | ✔ | 2–120 chars |
| `email` | Email | email | ✔ | valid, ≤254 |
| `phone` | Phone | tel | ✔ | 7–20, digits/space/+/-/() |
| `role` | Role | text | ✔ | 2–80 (e.g., Principal, Teacher, Parent) |
| `activity_slug` | Activity | select | ✔ | must match a published event |
| `message` | Anything we should know? | textarea | — | ≤ 2000 |

- Placeholder option: "Select an activity…" (invalid value).
- Options generated from events (same order as the live site; see `content/04-activities.md`).
- Preselect from `?activity=<slug>` or when an event card's "Apply →" is clicked.
- Consent text: "By submitting you agree to be contacted by our team about this application."
- Submit: **Submit application**
- Success copy (suggested): "Thank you, {first name}! We've received your application and will confirm availability within one working day."

## 3. Form B — Summit Registration (`/summit#register`)

| Field | Label | Type | Required | Rules |
|---|---|---|---|---|
| `full_name` | Full name | text | ✔ | 2–120 |
| `email` | Email | email | ✔ | valid |
| `phone` | Phone | tel | ✔ | 7–20 |
| `role` | Role | text | ✔ | 2–80 |
| `organization` | Organization / School | text | ✔ | 2–160 |
| `message` | Anything we should know? | textarea | — | ≤ 2000 |

- Hidden fixed value: `activity_slug = school-impact-summit-2026`.
- Consent text: "By submitting you agree to be contacted by our team about this registration."
- Submit: **Register now**
- Success copy (suggested): "You're registered interest for The School Impact Summit 2026 (28 November, Islamabad). We'll confirm your seat and share joining details within one working day."

## 4. Form C — Contact Enquiry (`/contact`)

| Field | Label | Type | Required | Rules |
|---|---|---|---|---|
| `full_name` | Your name | text | ✔ | 2–120 |
| `email` | Email | email | ✔ | valid |
| `organization` | Organization | text | ✔ | 2–160 |
| `interest` | I'm interested in | select | — (default General enquiry) | enum |
| `message` | Message | textarea | ✔ | 10–2000 |

- Helper text: "We reply within one working day."
- Submit: **Send message**
- Preselect `interest` from `?interest=<slug>` (mapping in `02-SITEMAP-AND-ROUTES.md`).
- Success copy (suggested): "Thanks for reaching out. We reply within one working day."

## 5. Zod Schemas (reference)

```ts
import { z } from "zod";

const clean = (s: string) => s.replace(/\s+/g, " ").trim();
const text = (min: number, max: number) =>
  z.string().transform(clean).pipe(z.string().min(min).max(max))
   .refine(v => !/[\u0000-\u001F\u007F]/.test(v), "Invalid characters");

const base = z.object({
  full_name: text(2, 120),
  email: z.string().trim().toLowerCase().email().max(254),
  turnstileToken: z.string().min(10),
  website: z.string().max(0).optional(),            // honeypot
});

export const applicationSchema = base.extend({
  type: z.literal("application"),
  phone: z.string().regex(/^[0-9+\-\s()]{7,20}$/),
  role: text(2, 80),
  activity_slug: z.string().min(3).max(80),
  message: z.string().max(2000).optional(),
  consent: z.literal(true),
});

export const summitSchema = base.extend({
  type: z.literal("summit"),
  phone: z.string().regex(/^[0-9+\-\s()]{7,20}$/),
  role: text(2, 80),
  organization: text(2, 160),
  message: z.string().max(2000).optional(),
  consent: z.literal(true),
});

export const contactSchema = base.extend({
  type: z.literal("contact"),
  organization: text(2, 160),
  interest: z.enum([
    "general","leader-in-me","leaderu","professional-development",
    "leadership-camps","family-sessions","open-sessions","podcast","partnership",
  ]),
  message: text(10, 2000),
});

export const submissionSchema = z.discriminatedUnion("type",
  [applicationSchema, summitSchema, contactSchema]);
```

## 6. Accessibility Checklist (forms)

- [ ] Every input has a programmatic label.
- [ ] Errors tied via `aria-describedby`; first invalid field receives focus on submit.
- [ ] Color is not the only error indicator.
- [ ] 48px touch targets; `inputMode="tel"` / `type="email"` for mobile keyboards.
- [ ] `autocomplete` attributes: `name`, `email`, `tel`, `organization`.

## 7. Analytics Events

`form_start` (first focus), `form_submit_attempt`, `form_submit_success`, `form_submit_error` — include `form_name` only; **never log field values**.
