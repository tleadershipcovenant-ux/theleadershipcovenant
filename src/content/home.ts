/**
 * Home Page content
 * Source: leadership-covenant-website-content.md
 */

export const HOME_CONTENT = {
  meta: {
    title: "The Leadership Covenant - Learn. Develop. Lead. Transform.",
    description:
      "The Leadership Covenant helps schools, students, educators and families unlock their leadership potential through Leader in Me, LeaderU, camps and transformational processes.",
    socialDescription: "Learn. Develop. Lead. Transform. Building leaders at every level.",
  },
  hero: {
    heading: "A Covenant to Build Leaders",
    body: "The Leadership Covenant is our promise to every school, family and learner.\nLeadership is not reserved for a few; it is a potential within us all.\nWe help you develop it, deliberately.",
    primaryCta: { label: "Explore Our Services", href: "/services" },
    secondaryCta: { label: "Upcoming Activities", href: "/activities" },
    trustLine: "Trusted by school leaders across the region.",
    image: "/images/hero-students.jpg",
    imageAlt: "Diverse students raising hands in a bright classroom",
  },
  upcoming: {
    eyebrow: "WHAT'S COMING UP",
    heading: "Programs, Events & Learning Experiences",
    viewAllLink: { label: "View all activities", href: "/activities" },
  },
  reach: {
    eyebrow: "Reach",
    subtitle: "International Footprint | Pakistan Reach | North Region Spread",
    stats: [
      { value: 8000, suffix: "+", label: "Schools worldwide" },
      { value: 70, suffix: "+", label: "Countries served" },
      { value: 3, suffix: "M+", label: "Students impacted" },
      { value: 25, suffix: "+", label: "Years of research" },
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
  principle: {
    eyebrow: "The Principle We Live By",
    quote: "“The main thing is to keep the main thing the main thing.”",
    author: "Dr. Stephen R. Covey",
  },
  testimonials: {
    eyebrow: "Testimonials",
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
  cta: {
    heading: "Ready to lead the change in your school?",
    subtext:
      "Let's design a leadership journey for your students, educators, and families.",
    buttons: [
      { label: "Talk to our team", href: "/contact#enquiry-form", variant: "primary" as const },
      { label: "See upcoming events", href: "/activities", variant: "secondary" as const },
    ],
  },
};
