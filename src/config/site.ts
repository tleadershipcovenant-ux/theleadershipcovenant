/**
 * Global site constants — single source of truth for brand, contact and social data.
 * Source: New MD files/leadership-covenant-docs/docs/content/00-global.md
 */

export const CANONICAL_DOMAIN = "https://leadershipcovenant.com.pk";

function resolveSiteUrl(): string {
  const explicit = (process.env.NEXT_PUBLIC_SITE_URL || "").trim().replace(/\/+$/, "");
  if (explicit && !explicit.includes("localhost") && !explicit.includes("127.0.0.1")) {
    return explicit;
  }
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  return CANONICAL_DOMAIN;
}

export const SITE_URL = resolveSiteUrl();
export const PUBLIC_SITE_URL = SITE_URL;

export const SITE = {
  name: "The Leadership Covenant",
  tagline: "Learn • Develop • Lead • Transform",
  signoff: "Change starts here.",
  description:
    "The Leadership Covenant helps schools, students, educators and families unlock their leadership potential through Leader in Me, LeaderU, camps and transformational processes.",
  footerBlurb:
    "The Leadership Covenant is a commitment to build leadership in every student, educator, and family, one principle, one habit, one school at a time.",
  affiliation: "FranklinCovey Education - North Region",
  email: "theleadershipcovenant@gmail.com",
  whatsappDisplay: "+92 319 2091249",
  whatsappUrl: "https://wa.me/923192091249",
  telephone: "+923192091249",
  address: {
    line1: "F-10/3",
    city: "Islamabad",
    country: "Pakistan",
    countryCode: "PK",
    full: "F-10/3, Islamabad, Pakistan",
  },
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=F-10%2F3%2C+Islamabad%2C+Pakistan",
  mapsEmbedUrl: "https://www.google.com/maps?q=F-10/3,+Islamabad,+Pakistan&output=embed",
  social: {
    linkedin: "https://www.linkedin.com/company/franklincovey-education-north-region/",
    facebook: "https://web.facebook.com/profile.php?id=61592161942804",
    instagram: "https://www.instagram.com/franklincoveyeducation_north/",
    whatsapp: "https://wa.me/923192091249",
  },
  themeColor: "#0B2545",
} as const;

export type NavItem = { label: string; href: string };

export const MAIN_NAV: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Our Story", href: "/about" },
  { label: "Activities", href: "/activities" },
  { label: "Contact", href: "/contact" },
];

export const HEADER_CTA: NavItem = { label: "Apply Now", href: "/apply" };

/** Rolling announcements shown in the header ticker (verbatim from the live site). */
export const ANNOUNCEMENTS: { text: string; href?: string }[] = [
  { text: "Upcoming: The School Impact Summit 2026 · 28th November 2026 · Islamabad", href: "/summit" },
  { text: "Leader in Me Community Coaching: date to be announced soon" },
  { text: "Principal's Academy: January 2027" },
];
