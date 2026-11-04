const logoImg = "/images/logo.png";

/**
 * Our Story / About Page content
 * Source: docs/content/03-about.md & Live Site https://leadershipcovenant.com.pk/about
 */

export interface AboutPromise {
  number: string;
  word: string;
  promise: string;
  accent: string;
}

export interface AboutPrincipleItem {
  title: string;
  text: string;
}

export interface AboutCeoMessage {
  eyebrow: string;
  quote: string;
  paragraphs: string[];
  name: string;
  role: string;
  credential: string;
  photo: string;
}

export interface AboutClosingBanner {
  eyebrow: string;
  heading: string;
  subtext: string;
  primaryButton: {
    label: string;
    href: string;
  };
  secondaryButton: {
    label: string;
    href: string;
  };
}

export interface AboutPageContent {
  _visible?: boolean;
  meta: {
    title: string;
    description: string;
  };
  hero: {
    eyebrow: string;
    h1: string;
    subtext: string;
    bgImage: string;
    logo: string;
  };
  visionMission: {
    vision: {
      badge: string;
      eyebrow: string;
      subtitle: string;
      title: string;
      text: string;
    };
    mission: {
      badge: string;
      eyebrow: string;
      subtitle: string;
      title: string;
      text: string;
    };
  };
  covenant: {
    eyebrow: string;
    heading: string;
    subtext: string;
    promises: AboutPromise[];
  };
  principles: {
    eyebrow: string;
    heading: string;
    subtext: string;
    items: AboutPrincipleItem[];
  };
  ceo: AboutCeoMessage;
  closingBanner: AboutClosingBanner;
  closingCtas: Array<{
    label: string;
    href: string;
    variant: "primary" | "secondary";
  }>;
}

export const ABOUT_CONTENT: AboutPageContent = {
  meta: {
    title: "Our Story - The Leadership Covenant",
    description: "The vision, mission, values and leadership principles behind The Leadership Covenant.",
  },
  hero: {
    eyebrow: "Our Story",
    h1: "Everyone has the potential to lead. We help them discover and develop it.",
    subtext:
      "The Leadership Covenant exists to prepare individuals for life, organizations for meaningful contribution, and education for awareness and wisdom.",
    bgImage: "/Our%20story/S1.png",
    logo: logoImg,
  },
  visionMission: {
    vision: {
      badge: "V",
      eyebrow: "Purpose & Direction",
      subtitle: "Our Aspiration",
      title: "Our Vision",
      text: "To be the most trusted catalyst for leadership, raising a generation that leads with character, contributes with purpose, and transforms the communities it belongs to.",
    },
    mission: {
      badge: "M",
      eyebrow: "Institutional Mandate",
      subtitle: "Our Action",
      title: "Our Mission",
      text: "The Leadership Covenant exists to prepare individuals for life, organizations for meaningful contribution, and education for awareness and wisdom.",
    },
  },
  covenant: {
    eyebrow: "The Covenant",
    heading: "Four promises. One covenant.",
    subtext:
      "Our solemn pledge to students, educators, and communities is reflected in four enduring commitments that guide everything we do.",
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
    subtext:
      "Timeless principles grounded in frameworks that shape character and institutional culture.",
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
  ceo: {
    eyebrow: "Message from The Chief Executive",
    quote: "“The future will be shaped by those we lead today.”",
    paragraphs: [
      "When I look at the students walking into our partner schools each morning, I see the doctors, engineers, artists, activists, and parents this community will depend on tomorrow. Our responsibility is not simply to teach them what to think; it is to help them lead how they think, choose, and serve.",
      "The Leadership Covenant stands for one idea: everyone has the potential to lead. We are privileged to partner with courageous principals, teachers, and families who refuse to settle for average, believing that every child deserves the language, habits, and confidence of a leader.",
      "Together, we build leaders. Together, change starts here.",
    ],
    name: "Ubaid ur Rehman",
    role: "CEO, The Leadership Covenant",
    credential: "Regional Manager, FranklinCovey Education",
    photo: "/images/ubaid.jpg",
  },
  closingBanner: {
    eyebrow: "Start Your Transformation",
    heading: "Ready to Begin the Journey?",
    subtext:
      "Join hundreds of visionary educators and institutions transforming lives through the power of principled leadership.",
    primaryButton: {
      label: "Explore our services",
      href: "/services",
    },
    secondaryButton: {
      label: "Get in touch",
      href: "/contact#enquiry-form",
    },
  },
  closingCtas: [
    { label: "Explore our services", href: "/services", variant: "primary" },
    { label: "Get in touch", href: "/contact#enquiry-form", variant: "secondary" },
  ],
};

/**
 * Normalizes raw CMS data for the About / Our Story page with guaranteed complete fallbacks.
 */
export function normalizeAboutCms(raw: unknown): AboutPageContent {
  if (!raw || typeof raw !== "object") return ABOUT_CONTENT;
  const d = raw as Partial<AboutPageContent> & Record<string, unknown>;

  const rawPromises = Array.isArray(d.covenant?.promises)
    ? (d.covenant?.promises as unknown[])
    : ABOUT_CONTENT.covenant.promises;

  const promises: AboutPromise[] = rawPromises.map((p, idx) => {
    const item = (p && typeof p === "object" ? p : {}) as Partial<AboutPromise>;
    return {
      number: String(item.number || `0${idx + 1}`),
      word: String(item.word || ABOUT_CONTENT.covenant.promises[idx]?.word || `Promise 0${idx + 1}`),
      promise: String(item.promise || ABOUT_CONTENT.covenant.promises[idx]?.promise || ""),
      accent: String(item.accent || ABOUT_CONTENT.covenant.promises[idx]?.accent || "brand-crimson"),
    };
  });

  const rawPrinciples = Array.isArray(d.principles?.items)
    ? (d.principles?.items as unknown[])
    : ABOUT_CONTENT.principles.items;

  const principleItems: AboutPrincipleItem[] = rawPrinciples.map((pr, idx) => {
    const item = (pr && typeof pr === "object" ? pr : {}) as Partial<AboutPrincipleItem>;
    return {
      title: String(item.title || ABOUT_CONTENT.principles.items[idx]?.title || `Principle 0${idx + 1}`),
      text: String(item.text || ABOUT_CONTENT.principles.items[idx]?.text || ""),
    };
  });

  const rawParagraphs = Array.isArray(d.ceo?.paragraphs)
    ? (d.ceo?.paragraphs as unknown[]).map(String).filter((p) => p.trim().length > 0)
    : ABOUT_CONTENT.ceo.paragraphs;

  return {
    _visible: d._visible !== false,
    meta: {
      title: String(d.meta?.title || ABOUT_CONTENT.meta.title),
      description: String(d.meta?.description || ABOUT_CONTENT.meta.description),
    },
    hero: {
      eyebrow: String(d.hero?.eyebrow || ABOUT_CONTENT.hero.eyebrow),
      h1: String(d.hero?.h1 || ABOUT_CONTENT.hero.h1),
      subtext: String(d.hero?.subtext || ABOUT_CONTENT.hero.subtext),
      bgImage: String(d.hero?.bgImage || ABOUT_CONTENT.hero.bgImage),
      logo: String(d.hero?.logo || ABOUT_CONTENT.hero.logo),
    },
    visionMission: {
      vision: {
        badge: String(d.visionMission?.vision?.badge || ABOUT_CONTENT.visionMission.vision.badge),
        eyebrow: String(d.visionMission?.vision?.eyebrow || ABOUT_CONTENT.visionMission.vision.eyebrow),
        subtitle: String(d.visionMission?.vision?.subtitle || ABOUT_CONTENT.visionMission.vision.subtitle),
        title: String(d.visionMission?.vision?.title || ABOUT_CONTENT.visionMission.vision.title),
        text: String(d.visionMission?.vision?.text || ABOUT_CONTENT.visionMission.vision.text),
      },
      mission: {
        badge: String(d.visionMission?.mission?.badge || ABOUT_CONTENT.visionMission.mission.badge),
        eyebrow: String(d.visionMission?.mission?.eyebrow || ABOUT_CONTENT.visionMission.mission.eyebrow),
        subtitle: String(d.visionMission?.mission?.subtitle || ABOUT_CONTENT.visionMission.mission.subtitle),
        title: String(d.visionMission?.mission?.title || ABOUT_CONTENT.visionMission.mission.title),
        text: String(d.visionMission?.mission?.text || ABOUT_CONTENT.visionMission.mission.text),
      },
    },
    covenant: {
      eyebrow: String(d.covenant?.eyebrow || ABOUT_CONTENT.covenant.eyebrow),
      heading: String(d.covenant?.heading || ABOUT_CONTENT.covenant.heading),
      subtext: String(d.covenant?.subtext || ABOUT_CONTENT.covenant.subtext),
      promises: promises.length > 0 ? promises : ABOUT_CONTENT.covenant.promises,
    },
    principles: {
      eyebrow: String(d.principles?.eyebrow || ABOUT_CONTENT.principles.eyebrow),
      heading: String(d.principles?.heading || ABOUT_CONTENT.principles.heading),
      subtext: String(d.principles?.subtext || ABOUT_CONTENT.principles.subtext),
      items: principleItems.length > 0 ? principleItems : ABOUT_CONTENT.principles.items,
    },
    ceo: {
      eyebrow: String(d.ceo?.eyebrow || ABOUT_CONTENT.ceo.eyebrow),
      quote: String(d.ceo?.quote || ABOUT_CONTENT.ceo.quote),
      paragraphs: rawParagraphs.length > 0 ? rawParagraphs : ABOUT_CONTENT.ceo.paragraphs,
      name: String(d.ceo?.name || ABOUT_CONTENT.ceo.name),
      role: String(d.ceo?.role || ABOUT_CONTENT.ceo.role),
      credential: String(d.ceo?.credential || ABOUT_CONTENT.ceo.credential),
      photo: String(d.ceo?.photo || ABOUT_CONTENT.ceo.photo),
    },
    closingBanner: {
      eyebrow: String(d.closingBanner?.eyebrow || ABOUT_CONTENT.closingBanner.eyebrow),
      heading: String(d.closingBanner?.heading || ABOUT_CONTENT.closingBanner.heading),
      subtext: String(d.closingBanner?.subtext || ABOUT_CONTENT.closingBanner.subtext),
      primaryButton: {
        label: String(d.closingBanner?.primaryButton?.label || ABOUT_CONTENT.closingBanner.primaryButton.label),
        href: String(d.closingBanner?.primaryButton?.href || ABOUT_CONTENT.closingBanner.primaryButton.href),
      },
      secondaryButton: {
        label: String(d.closingBanner?.secondaryButton?.label || ABOUT_CONTENT.closingBanner.secondaryButton.label),
        href: String(d.closingBanner?.secondaryButton?.href || ABOUT_CONTENT.closingBanner.secondaryButton.href),
      },
    },
    closingCtas: [
      {
        label: String(d.closingBanner?.primaryButton?.label || ABOUT_CONTENT.closingBanner.primaryButton.label),
        href: String(d.closingBanner?.primaryButton?.href || ABOUT_CONTENT.closingBanner.primaryButton.href),
        variant: "primary",
      },
      {
        label: String(d.closingBanner?.secondaryButton?.label || ABOUT_CONTENT.closingBanner.secondaryButton.label),
        href: String(d.closingBanner?.secondaryButton?.href || ABOUT_CONTENT.closingBanner.secondaryButton.href),
        variant: "secondary",
      },
    ],
  };
}
