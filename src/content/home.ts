/**
 * Home page content — matches the live public homepage sections.
 */

export type StatIconKey =
  | "school"
  | "public"
  | "city"
  | "place"
  | "groups"
  | "history"
  | "premium";

export type StatTone = "gold" | "orange" | "mint" | "cyan";

export interface HomeHeroSlide {
  src: string;
  alt: string;
}

export interface HomeCtaButton {
  label: string;
  href: string;
  variant?: "primary" | "secondary";
}

export interface HomeStatItem {
  value: number;
  suffix: string;
  label: string;
  icon: StatIconKey;
  tone: StatTone;
}

export interface HomeStatTab {
  id: string;
  label: string;
  stats: HomeStatItem[];
}

export interface HomePromise {
  title: string;
  body: string;
}

export interface HomeServiceSlide {
  id: string;
  image: string;
  title: string;
  category: string;
  description: string;
  href: string;
}

export interface HomeTestimonial {
  quote: string;
  author: string;
}

export interface HomePageContent {
  meta: {
    title: string;
    description: string;
    socialDescription: string;
  };
  hero: {
    headingStart: string;
    headingHighlight: string;
    paragraphs: string[];
    closingLine: string;
    primaryCta: HomeCtaButton;
    secondaryCta: HomeCtaButton;
    backgrounds: HomeHeroSlide[];
  };
  stats: {
    tabs: HomeStatTab[];
  };
  upcoming: {
    eyebrow: string;
    heading: string;
  };
  story: {
    eyebrow: string;
    heading: string;
    subtitle: string;
    image: string;
    imageAlt: string;
    promisesEyebrow: string;
    promisesHeading: string;
    promisesBody: string;
    promises: HomePromise[];
    primaryCta: HomeCtaButton;
    secondaryCta: HomeCtaButton;
  };
  services: {
    eyebrow: string;
    heading: string;
    subtitle: string;
    ctaLabel: string;
    slides: HomeServiceSlide[];
  };
  voices: {
    principle: {
      eyebrow: string;
      quote: string;
      author: string;
      authorSubtitle: string;
    };
    testimonials: {
      items: HomeTestimonial[];
    };
  };
  cta: {
    eyebrow: string;
    heading: string;
    subtext: string;
    buttons: HomeCtaButton[];
  };
  /** Legacy 3-card block kept for unused HomeWhatWeDoSection */
  whatWeDo: {
    eyebrow: string;
    heading: string;
    viewAllLink: HomeCtaButton;
    items: Array<{
      title: string;
      badge: string;
      description: string;
      ctaLabel: string;
      href: string;
      image: string;
    }>;
  };
}

export const HOME_PAGE: HomePageContent = {
  meta: {
    title: "The Leadership Covenant - Learn. Develop. Lead. Transform.",
    description:
      "The Leadership Covenant helps schools, students, educators and families unlock their leadership potential through Leader in Me, LeaderU, camps and transformational processes.",
    socialDescription:
      "Learn. Develop. Lead. Transform. Building leaders at every level.",
  },
  hero: {
    headingStart: "A Covenant to",
    headingHighlight: "Build Leaders",
    paragraphs: [
      "The Leadership Covenant is our promise to every school, family and learner.",
      "Leadership is not reserved for a few; it is a potential within us all.",
    ],
    closingLine: "We help you develop it, deliberately.",
    primaryCta: { label: "Explore Our Services", href: "/services" },
    secondaryCta: { label: "Upcoming Activities", href: "/activities" },
    backgrounds: [
      {
        src: "/Hero%20Section/H1.png",
        alt: "A Covenant to Build Leaders - The Leadership Covenant",
      },
      {
        src: "/images/pd-educators.jpg",
        alt: "Professional development for educators",
      },
      {
        src: "/images/leadership-camp.jpg",
        alt: "Leadership camp experience",
      },
    ],
  },
  stats: {
    tabs: [
      {
        id: "international",
        label: "International Footprint",
        stats: [
          { value: 8000, suffix: "+", label: "Schools worldwide", icon: "school", tone: "gold" },
          { value: 70, suffix: "+", label: "Countries served", icon: "public", tone: "cyan" },
          { value: 3000000, suffix: "+", label: "Students impacted", icon: "groups", tone: "mint" },
          { value: 25, suffix: "+", label: "Years of research", icon: "history", tone: "orange" },
        ],
      },
      {
        id: "pakistan",
        label: "Pakistan Reach",
        stats: [
          { value: 500, suffix: "+", label: "Schools engaged", icon: "school", tone: "gold" },
          { value: 40, suffix: "+", label: "Cities covered", icon: "city", tone: "cyan" },
          { value: 90000, suffix: "+", label: "Students impacted", icon: "groups", tone: "mint" },
          { value: 10, suffix: "+", label: "Years of implementation", icon: "premium", tone: "orange" },
        ],
      },
      {
        id: "north",
        label: "North Region Spread",
        stats: [
          { value: 100, suffix: "+", label: "Schools engaged", icon: "school", tone: "gold" },
          { value: 18, suffix: "+", label: "Districts", icon: "place", tone: "cyan" },
          { value: 19000, suffix: "+", label: "Students impacted", icon: "groups", tone: "mint" },
          { value: 10, suffix: "+", label: "Years of implementation", icon: "premium", tone: "orange" },
        ],
      },
    ],
  },
  upcoming: {
    eyebrow: "WHAT'S COMING UP",
    heading: "Programs, Events & Learning Experiences",
  },
  story: {
    eyebrow: "Our Story",
    heading:
      "Everyone has a leader within. We help them discover and develop it.",
    subtitle:
      "The Leadership Covenant exists to prepare individuals for life, organizations for meaningful contribution, and education for awareness and wisdom.",
    image: "/images/hero-students.jpg",
    imageAlt:
      "Students in collaborative leadership session at The Leadership Covenant",
    promisesEyebrow: "Four promises. One covenant.",
    promisesHeading: "To be the most trusted catalyst for leadership.",
    promisesBody:
      "Raising a generation that leads with character, contributes with purpose, and transforms the communities it belongs to. Sustainable transformation starts with people, not programs. Character shapes culture; culture shapes results.",
    promises: [
      {
        title: "Learn",
        body: "We commit to lifelong learning as the foundation of leadership.",
      },
      {
        title: "Develop",
        body: "We grow habits, character, and skill, patiently and deliberately.",
      },
      {
        title: "Lead",
        body: "We lead ourselves first, then serve those around us.",
      },
      {
        title: "Transform",
        body: "We build cultures where change is chosen, not feared.",
      },
    ],
    primaryCta: { label: "Explore Our Services", href: "/services" },
    secondaryCta: { label: "Read Our Full Story", href: "/about" },
  },
  services: {
    eyebrow: "What We Do",
    heading: "Our Services",
    subtitle:
      "From personal leadership development to whole-school and organizational transformation, explore our six pathways to building leadership at every level.",
    ctaLabel: "Explore Service",
    slides: [
      {
        id: "leader-in-me",
        image: "/images/leader-in-me.jpg",
        title: "Leader in Me",
        category: "Whole-School Transformation",
        description:
          "EY–12 whole-school transformation process empowering students, educators, and families with The 7 Habits and leadership character for life.",
        href: "/services#leader-in-me",
      },
      {
        id: "leader-u",
        image: "/images/leader-u.jpg",
        title: "LeaderU",
        category: "Higher Education",
        description:
          "Developing future-ready leaders for college, university, and beyond with FranklinCovey's globally trusted frameworks, self-mastery, and career readiness.",
        href: "/services#leader-u",
      },
      {
        id: "professional-development",
        image: "/images/pd-educators.jpg",
        title: "Professional Development for Educators",
        category: "Faculty & Institutional Leadership",
        description:
          "Transformative professional learning in The 7 Habits®, 4 Disciplines of Execution®, and the principles of high-trust leadership, equipping educators to lead themselves, empower others, and create lasting school-wide impact.",
        href: "/services#professional-development",
      },
      {
        id: "leadership-camps",
        image: "/images/leadership-camp.jpg",
        title: "Leadership Camps",
        category: "Experiential Youth Expeditions",
        description:
          "Immersive residential and day camps empowering young minds through outdoor adventure, teamwork, resilience, and real-world leadership challenges.",
        href: "/services#leadership-camps",
      },
      {
        id: "family-sessions",
        image: "/images/family-session.jpg",
        title: "Family Sessions",
        category: "Parenting & Family Culture",
        description:
          "Strengthening family communication, trust, and shared values rooted in The 7 Habits of Highly Effective Families for a thriving home.",
        href: "/services#family-sessions",
      },
      {
        id: "podcast",
        image: "/images/podcast.jpg",
        title: "The Leadership Podcast",
        category: "National Thought Leadership",
        description:
          "In-depth conversations with visionary educationists, academics, and youth pioneers addressing future educational paradigms and character.",
        href: "/services#podcast",
      },
    ],
  },
  voices: {
    principle: {
      eyebrow: "The Principle We Live By",
      quote:
        "The main thing is to keep the main thing the main thing.",
      author: "Dr. Stephen R. Covey",
      authorSubtitle: "Author, The 7 Habits of Highly Effective People",
    },
    testimonials: {
      items: [
        {
          quote:
            "Our school culture has completely transformed. Students genuinely lead themselves and each other.",
          author: "Elementary Principal",
        },
        {
          quote:
            "The 7 Habits training was the most impactful PD our staff has ever experienced.",
          author: "Head of Professional Development",
        },
      ],
    },
  },
  cta: {
    eyebrow: "Start Your Transformation",
    heading: "Ready to lead the change in your school?",
    subtext:
      "Let's design a leadership journey for your students, educators, and families.",
    buttons: [
      { label: "Talk to our team", href: "/contact#enquiry-form", variant: "primary" },
      { label: "See upcoming events", href: "/activities", variant: "secondary" },
    ],
  },
  whatWeDo: {
    eyebrow: "What We Do",
    heading: "Processes that transform schools & lives.",
    viewAllLink: { label: "View all services", href: "/services" },
    items: [
      {
        title: "Leader in Me",
        badge: "Process",
        description:
          "Our flagship EY–12 whole-school transformation process that develops student leaders and transforms school culture through The 7 Habits.",
        ctaLabel: "Learn more →",
        href: "/services#leader-in-me",
        image: "/images/leader-in-me.jpg",
      },
      {
        title: "Professional Development",
        badge: "Courses",
        description:
          "Internationally trusted courses that equip teachers and school leaders with the mindset, skillset and toolset to drive transformation.",
        ctaLabel: "Learn more →",
        href: "/services#professional-development",
        image: "/images/pd-educators.jpg",
      },
      {
        title: "Leadership Camps",
        badge: "Program",
        description:
          "Immersive residential and day camps where students build confidence, character and leadership through adventure and reflection.",
        ctaLabel: "Learn more →",
        href: "/services#leadership-camps",
        image: "/images/leadership-camp.jpg",
      },
    ],
  },
};

/** @deprecated Use HOME_PAGE — kept so existing imports keep working. */
export const HOME_CONTENT = HOME_PAGE;

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

const normalizedHomeCache = new WeakMap<Record<string, unknown>, HomePageContent>();

export function normalizeHomeCms(
  raw: Record<string, unknown> | null | undefined
): HomePageContent {
  const d = HOME_PAGE;
  const source = asRecord(raw);
  if (source && normalizedHomeCache.has(source)) {
    return normalizedHomeCache.get(source)!;
  }
  const heroRaw = asRecord(source.hero);
  const statsRaw = asRecord(source.stats);
  const upcomingRaw = asRecord(source.upcoming);
  const storyRaw = asRecord(source.story);
  const servicesRaw = asRecord(source.services);
  const voicesRaw = asRecord(source.voices);
  const principleRaw = asRecord(voicesRaw.principle);
  const testimonialsRaw = asRecord(voicesRaw.testimonials);
  const ctaRaw = asRecord(source.cta);
  const whatWeDoRaw = asRecord(source.whatWeDo);

  let paragraphs = Array.isArray(heroRaw.paragraphs)
    ? (heroRaw.paragraphs as string[]).filter((p) => typeof p === "string")
    : [];
  if (paragraphs.length === 0 && typeof heroRaw.body === "string") {
    paragraphs = String(heroRaw.body)
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  }
  if (paragraphs.length === 0) paragraphs = d.hero.paragraphs;

  const backgrounds = Array.isArray(heroRaw.backgrounds)
    ? (heroRaw.backgrounds as HomeHeroSlide[])
    : d.hero.backgrounds;

  const tabs = Array.isArray(statsRaw.tabs)
    ? (statsRaw.tabs as HomeStatTab[])
    : d.stats.tabs;

  const slides = Array.isArray(servicesRaw.slides)
    ? (servicesRaw.slides as HomeServiceSlide[])
    : d.services.slides;

  const promises = Array.isArray(storyRaw.promises)
    ? (storyRaw.promises as HomePromise[])
    : d.story.promises;

  const testimonialItems =
    Array.isArray(testimonialsRaw.items) && testimonialsRaw.items.length >= 2
      ? (testimonialsRaw.items as HomeTestimonial[])
      : d.voices.testimonials.items;

  const ctaButtons = Array.isArray(ctaRaw.buttons)
    ? (ctaRaw.buttons as HomeCtaButton[])
    : d.cta.buttons;

  const primaryCta = asRecord(heroRaw.primaryCta);
  const secondaryCta = asRecord(heroRaw.secondaryCta);
  const storyPrimary = asRecord(storyRaw.primaryCta);
  const storySecondary = asRecord(storyRaw.secondaryCta);

  const result: HomePageContent = {
    meta: {
      ...d.meta,
      ...asRecord(source.meta),
    },
    hero: {
      headingStart: String(
        heroRaw.headingStart ||
          (typeof heroRaw.heading === "string"
            ? String(heroRaw.heading).replace(/\s+Build Leaders$/, "")
            : d.hero.headingStart)
      ),
      headingHighlight: String(
        heroRaw.headingHighlight || d.hero.headingHighlight
      ),
      paragraphs,
      closingLine: String(heroRaw.closingLine || d.hero.closingLine),
      primaryCta: {
        label: String(primaryCta.label || d.hero.primaryCta.label),
        href: String(primaryCta.href || d.hero.primaryCta.href),
      },
      secondaryCta: {
        label: String(secondaryCta.label || d.hero.secondaryCta.label),
        href: String(secondaryCta.href || d.hero.secondaryCta.href),
      },
      backgrounds: backgrounds.length > 0 ? backgrounds : d.hero.backgrounds,
    },
    stats: {
      tabs: tabs.length > 0 ? tabs : d.stats.tabs,
    },
    upcoming: {
      eyebrow: String(upcomingRaw.eyebrow || d.upcoming.eyebrow),
      heading: String(upcomingRaw.heading || d.upcoming.heading),
    },
    story: {
      ...d.story,
      ...storyRaw,
      promises: promises.length > 0 ? promises : d.story.promises,
      primaryCta: {
        label: String(storyPrimary.label || d.story.primaryCta.label),
        href: String(storyPrimary.href || d.story.primaryCta.href),
      },
      secondaryCta: {
        label: String(storySecondary.label || d.story.secondaryCta.label),
        href: String(storySecondary.href || d.story.secondaryCta.href),
      },
    },
    services: {
      eyebrow: String(servicesRaw.eyebrow || d.services.eyebrow),
      heading: String(servicesRaw.heading || d.services.heading),
      subtitle: String(servicesRaw.subtitle || d.services.subtitle),
      ctaLabel: String(servicesRaw.ctaLabel || d.services.ctaLabel),
      slides: slides.length > 0 ? slides : d.services.slides,
    },
    voices: {
      principle: {
        eyebrow: String(principleRaw.eyebrow || d.voices.principle.eyebrow),
        quote: String(principleRaw.quote || d.voices.principle.quote),
        author: String(principleRaw.author || d.voices.principle.author),
        authorSubtitle: String(
          principleRaw.authorSubtitle || d.voices.principle.authorSubtitle
        ),
      },
      testimonials: {
        items:
          testimonialItems.length > 0
            ? testimonialItems
            : d.voices.testimonials.items,
      },
    },
    cta: {
      eyebrow: String(ctaRaw.eyebrow || d.cta.eyebrow),
      heading: String(ctaRaw.heading || d.cta.heading),
      subtext: String(ctaRaw.subtext || d.cta.subtext),
      buttons: ctaButtons.length > 0 ? ctaButtons : d.cta.buttons,
    },
    whatWeDo: {
      ...d.whatWeDo,
      ...whatWeDoRaw,
      items: Array.isArray(whatWeDoRaw.items)
        ? (whatWeDoRaw.items as HomePageContent["whatWeDo"]["items"])
        : d.whatWeDo.items,
      viewAllLink: {
        ...d.whatWeDo.viewAllLink,
        ...asRecord(whatWeDoRaw.viewAllLink),
      },
    },
  };

  if (source) {
    normalizedHomeCache.set(source, result);
  }
  return result;
}
