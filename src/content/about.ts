const logoImg = "/images/logo.png";

/**
 * Our Story / About Page content
 * Source: docs/content/03-about.md
 */

export const ABOUT_CONTENT = {
  meta: {
    title: "Our Story - The Leadership Covenant",
    description: "The vision, mission, values and leadership principles behind The Leadership Covenant.",
  },
  hero: {
    eyebrow: "Our Story",
    h1: "Everyone has the potential to lead. We help them discover and develop it.",
    logo: logoImg,
  },
  visionMission: {
    vision: {
      badge: "V",
      title: "Our Vision",
      text: "To be the most trusted catalyst for leadership, raising a generation that leads with character, contributes with purpose, and transforms the communities it belongs to.",
    },
    mission: {
      badge: "M",
      title: "Our Mission",
      text: "The Leadership Covenant exists to prepare individuals for life, organizations for meaningful contribution, and education for awareness and wisdom.",
    },
  },
  covenant: {
    eyebrow: "The Covenant",
    heading: "Four promises. One covenant.",
    promises: [
      {
        word: "Learn",
        promise: "We commit to lifelong learning as the foundation of leadership.",
        accent: "brand-crimson",
        number: "01",
      },
      {
        word: "Develop",
        promise: "We grow habits, character, and skill, patiently and deliberately.",
        accent: "brand-green",
        number: "02",
      },
      {
        word: "Lead",
        promise: "We lead ourselves first, then serve those around us.",
        accent: "brand-yellow",
        number: "03",
      },
      {
        word: "Transform",
        promise: "We build cultures where change is chosen, not feared.",
        accent: "brand-blue",
        number: "04",
      },
    ],
  },
  principles: {
    eyebrow: "What we believe",
    heading: "Principles we lead by.",
    items: [
      {
        title: "Every voice matters",
        text: "Leadership is a habit, not a title. We design experiences where every student, teacher, and parent can lead.",
      },
      {
        title: "Change from the inside out",
        text: "Sustainable transformation starts with people, not programs. Character shapes culture; culture shapes results.",
      },
      {
        title: "Trust is the multiplier",
        text: "High-trust environments unlock speed, creativity, and potential. We help you build it deliberately.",
      },
    ],
  },
  closingCtas: [
    { label: "Explore our services", href: "/services", variant: "primary" },
    { label: "Get in touch", href: "/contact#enquiry-form", variant: "secondary" },
  ],
} as const;
