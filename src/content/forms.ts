/**
 * Client-safe form constants (no images / heavy content) shared by the
 * browser forms and the /api/submit route handler.
 * Source: docs/06-FORMS-SPEC.md, docs/content/05-contact.md
 */

export const INTEREST_OPTIONS = [
  { value: "general", label: "General enquiry" },
  { value: "leader-in-me", label: "Leader in Me" },
  { value: "leaderu", label: "LeaderU" },
  { value: "professional-development", label: "Professional Development" },
  { value: "leadership-camps", label: "Leadership Camps" },
  { value: "family-sessions", label: "Family Sessions" },
  { value: "open-sessions", label: "Open Sessions" },
  { value: "podcast", label: "Podcast" },
  { value: "partnership", label: "Partnership" },
] as const;

export type InterestValue = (typeof INTEREST_OPTIONS)[number]["value"];

export const SUMMIT_SLUG = "school-impact-summit-2026";

export type ActivityOption = { value: string; label: string };

export const FORM_COPY = {
  application: {
    consent: "By submitting you agree to be contacted by our team about this application.",
    submit: "Submit application",
  },
  summit: {
    consent: "By submitting you agree to be contacted by our team about this registration.",
    submit: "Register now",
    success:
      "You're registered interest for The School Impact Summit 2026 (28 November, Islamabad). We'll confirm your seat and share joining details within one working day.",
  },
  contact: {
    helper: "We reply within one working day.",
    submit: "Send message",
    success: "Thanks for reaching out. We reply within one working day.",
  },
} as const;
