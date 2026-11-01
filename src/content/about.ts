const ceoPhoto = "/images/ceo.jpg";
const logoImg = "/images/logo.png";

/**
 * Our Story / About Page content
 * Source: docs/content/03-about.md
 */

export const ABOUT_CONTENT = {
  meta: {
    title: "Our Story - The Leadership Covenant",
    description: "The vision, mission, values and CEO message behind The Leadership Covenant.",
  },
  hero: {
    eyebrow: "Our Story",
    h1: "Everyone has the potential to lead. We help them find it.",
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
        text: "High-trust environments unlock speed, creativity, and joy in schools. We build them, deliberately.",
      },
    ],
  },
  ceoMessage: {
    eyebrow: "CEO Message",
    captionLabel: "Message from · The Chief Executive",
    headlineQuote: "“The future will be shaped by those we lead today.”",
    image: ceoPhoto,
    imageAlt: "Portrait of Ubaid ur Rehman, CEO of The Leadership Covenant",
    paragraphs: [
      "When I look at the students walking into our partner schools each morning, I see the doctors, engineers, artists, activists, and parents this community will depend on tomorrow. Our responsibility is not simply to teach them what to think; it is to help them lead how they think, choose, and serve.",
      "The Leadership Covenant stands for one idea: everyone has the potential to lead. We are privileged to partner with courageous principals, teachers, and families who refuse to settle for average, believing that every child deserves the language, habits, and confidence of a leader.",
      "Change is never easy, but it is always possible. Whether you're a school leader considering Leader in Me, an educator seeking new tools, or a parent looking to bring the 7 Habits home, we're honored to walk this journey with you.",
      "Together, we build leaders. Together, change starts here.",
    ],
    signatureName: "Ubaid ur Rehman",
    signatureTitle: "CEO, The Leadership Covenant",
  },
  closingCtas: [
    { label: "Explore our services", href: "/services", variant: "primary" },
    { label: "Get in touch", href: "/contact#enquiry-form", variant: "secondary" },
  ],
} as const;
