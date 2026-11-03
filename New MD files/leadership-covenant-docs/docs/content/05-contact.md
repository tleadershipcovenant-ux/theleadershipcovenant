# CONTENT — Contact Page (`/contact`)

> Source: https://future-forward-leaders.lovable.app/contact
> All text is verbatim from the live site.

## Page Meta

- **Title:** Contact Us — The Leadership Covenant
- **Description:** Get in touch with The Leadership Covenant. Address, phone, email and enquiry form.
- **OG/Twitter description:** Reach our team for programs, partnerships and enquiries.

## Section Order

1. Hero (H1 + intro)
2. Two-column: contact info cards (left) + enquiry form (right)
3. Location / map block

---

## 1. HERO

**Eyebrow:** Contact
**H1:** Let's start a conversation.
**Intro:** Whether you are exploring a program for your school, joining a camp, or just curious — we would love to hear from you.

---

## 2A. CONTACT INFO CARDS

| Icon | Title | Content | Link |
|---|---|---|---|
| 📍 | Visit us | The Leadership Covenant<br>F-10/3<br>Islamabad, Pakistan | — |
| ☎ | WhatsApp us | +92 319 2091249 | — |
| ✉ | Email us | theleadershipcovenant@gmail.com | `mailto:theleadershipcovenant@gmail.com` |
| in | Follow us | LinkedIn · Facebook · Instagram | See `00-global.md` for URLs |

---

## 2B. ENQUIRY FORM

| Field | Label | Type | Required |
|---|---|---|---|
| name | Your name | text | ✔ |
| email | Email | email | ✔ |
| organization | Organization | text | ✔ |
| interest | I'm interested in | select | — |
| message | Message | textarea | ✔ |

**"I'm interested in" options (in order):**
1. General enquiry
2. Leader in Me
3. LeaderU
4. Professional Development
5. Leadership Camps
6. Family Sessions
7. Open Sessions
8. Podcast
9. Partnership

**Helper text:** We reply within one working day.
**Submit button:** Send message

Preselect via query: `?interest=leader-in-me` etc. (see mapping in `06-FORMS-SPEC.md`).

---

## 3. LOCATION BLOCK

**Heading:** Find us in Islamabad
**Text:** F-10/3, Islamabad, Pakistan. Detailed directions provided upon booking or enquiry.

Implementation: a styled card with an embedded map or a "Open in Google Maps" link to the address. Prefer a click-to-load map (privacy + performance) rather than an always-loaded iframe.

---

## Acceptance Criteria

- [ ] `mailto:` and `wa.me` links work on mobile and desktop.
- [ ] Interest dropdown preselects from the query string.
- [ ] Success + error states implemented, accessible (`aria-live="polite"`).
- [ ] Honeypot + rate limiting active (see `SECURITY.md`).
