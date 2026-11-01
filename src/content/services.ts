export type ServiceIcon = "star" | "diamond" | "sparkles" | "mountain" | "heart" | "mic";

export interface Service {
  /** Anchor id on /services */
  id: string;
  /** Value passed to /contact?interest= */
  interest: string;
  chipLabel: string;
  icon: ServiceIcon;
  badge: string;
  title: string;
  /** Opening sentence(s) of the paragraph, shown as a highlighted lead */
  tagline: string;
  body: string;
  bullets: string[];
  image: string;
  imageAlt: string;
  ctaLabel: string;
  accent: "blue" | "crimson" | "green" | "orange" | "teal" | "yellow";
}

export const SERVICES: Service[] = [
  {
    id: "leader-in-me",
    interest: "leader-in-me",
    chipLabel: "Leader in Me",
    icon: "star",
    badge: "Flagship · EY – 12 Process",
    title: "Leader in Me",
    tagline: "Developing Student Leaders. Transforming School Culture.",
    body: "Leader in Me is our flagship EY–12 whole-school transformation process that empowers students, educators, and families to build leadership, responsibility, and strong character. Built on The 7 Habits of Highly Effective People® and a proven framework of effective educational practices, it helps schools create a culture where every student discovers and develops their leadership potential.",
    bullets: [
      "Whole-school transformation that embeds leadership into everyday learning",
      "Builds a high-trust, leadership-focused school culture",
      "Develops leadership, character, and life skills for every student",
      "Strengthens partnerships between schools, students, and families",
      "Trusted by thousands of schools worldwide",
    ],
    image: "/images/leader-in-me.jpg",
    imageAlt: "Leader in Me",
    ctaLabel: "Enquire about Leader in Me",
    accent: "yellow",
  },
  {
    id: "leader-u",
    interest: "leaderu",
    chipLabel: "LeaderU",
    icon: "diamond",
    badge: "Higher Education Process",
    title: "LeaderU",
    tagline: "Developing Future-Ready Leaders for College, University, and Beyond.",
    body: "LeaderU is our flagship higher education leadership development process designed for colleges and universities. Built on FranklinCovey's globally trusted leadership frameworks, it equips students with the leadership, career readiness, and life skills needed to succeed in education, the workplace, and life. Through practical learning experiences, including Project-Based Learning (PBL) resources, LeaderU develops confident, capable, and purpose-driven leaders.",
    bullets: [
      "Develops leadership, employability, and life skills",
      "Builds self-leadership, communication, trust, and collaboration",
      "Flexible implementation through workshops, project-based learning, and student leadership initiatives",
      "Powered by FranklinCovey's world-renowned leadership content",
    ],
    image: "/images/leader-u.jpg",
    imageAlt: "LeaderU",
    ctaLabel: "Enquire about LeaderU",
    accent: "blue",
  },
  {
    id: "professional-development",
    interest: "professional-development",
    chipLabel: "Professional Development for Educators",
    icon: "sparkles",
    badge: "Courses for Teachers & Administrators",
    title: "Professional Development for Educators",
    tagline: "Empowering Educators. Transforming Educational Institutes.",
    body: "Professional learning is more than a one-time training; it is a journey of growth. Our internationally trusted professional development solutions equip teachers, school leaders, and administrators with the leadership mindset, practical skillset, and ready-to-apply toolset needed to strengthen teaching, build high-performing teams, and drive whole-school transformation. Because lasting change begins from the inside out.",
    bullets: [
      "The 7 Habits of Highly Effective People®",
      "The 4 Disciplines of Execution® (4DX®)",
      "Leading at the Speed of Trust®",
      "Principal's Academy",
      "Teacher Believed in Me®",
    ],
    image: "/images/pd-educators.jpg",
    imageAlt: "Professional Development for Educators",
    ctaLabel: "Enquire about Professional Development for Educators",
    accent: "teal",
  },
  {
    id: "leadership-camps",
    interest: "leadership-camps",
    chipLabel: "Leadership Camps",
    icon: "mountain",
    badge: "For Students",
    title: "Leadership Camps",
    tagline: "Inspiring Young Leaders Through Experience.",
    body: "Our residential and day leadership camps provide immersive learning experiences where students build confidence, character, and leadership through adventure, collaboration, and purposeful reflection. Guided by FranklinCovey's proven leadership principles, every camp empowers participants to discover their potential, develop meaningful relationships, and apply leadership in real-life situations.",
    bullets: [
      "Residential and day camp experiences for schools and organizations",
      "Leadership learning through adventure, teamwork, and experiential activities",
      "The 7 Habits® applied through real-world challenges and reflection",
      "Builds confidence, resilience, communication, and collaboration",
      "Certificate of Leadership Participation",
    ],
    image: "/images/leadership-camp.jpg",
    imageAlt: "Leadership Camps",
    ctaLabel: "Enquire about Leadership Camps",
    accent: "green",
  },
  {
    id: "family-sessions",
    interest: "family-sessions",
    chipLabel: "Family Sessions",
    icon: "heart",
    badge: "For Parents & Guardians",
    title: "Family Sessions",
    tagline: "Strengthening Families. Building Lasting Habits.",
    body: "Our Family Sessions, based on The 7 Habits of Highly Effective Families®, empower parents and caregivers with practical principles to strengthen relationships, improve communication, and create a positive family culture. Through timeless, principle-centered practices, families learn to build trust, nurture responsibility, and support every family member in reaching their full potential.",
    bullets: [
      "Based on The 7 Habits of Highly Effective Families®",
      "Strengthens communication, trust, and healthy family relationships",
      "Builds shared family values, vision, and positive habits",
    ],
    image: "/images/family-session.jpg",
    imageAlt: "Family Sessions",
    ctaLabel: "Enquire about Family Sessions",
    accent: "crimson",
  },
  {
    id: "podcast",
    interest: "podcast",
    chipLabel: "Leadership Podcast",
    icon: "mic",
    badge: "Listen Anywhere",
    title: "Leadership Podcast",
    tagline: "Conversations That Inspire Leaders.",
    body: "Our Leadership Podcast brings together respected voices from the fields of education, leadership, psychology, personal effectiveness, parenting, and holistic development to share practical insights, real-world experiences, and timeless principles that inspire growth. Each episode is designed to equip educators, parents, students, and leaders with ideas they can apply to create meaningful impact in their schools, organizations, and communities.",
    bullets: [
      "Conversations with leading educators, practitioners, and thought leaders",
      "Insights on leadership, education, psychology, and personal growth",
      "Practical strategies for schools, families, and lifelong learning",
      "Inspiring conversations grounded in timeless principles",
    ],
    image: "/images/podcast.jpg",
    imageAlt: "Leadership Podcast",
    ctaLabel: "Enquire about Leadership Podcast",
    accent: "orange",
  },
];

/** Home page "What we do" cards. Source: docs/content/01-home.md §4 */
export const HOME_SERVICES = [
  {
    tag: "Leader in Me",
    kicker: "Process",
    title: "Leader in Me",
    description:
      "Our flagship EY–12 whole-school transformation process that develops student leaders and transforms school culture through The 7 Habits.",
    href: "/services#leader-in-me",
    image: "/images/leader-in-me.jpg",
    accent: "yellow",
  },
  {
    tag: "Professional Development",
    kicker: "Courses",
    title: "Professional Development",
    description:
      "Internationally trusted courses that equip teachers and school leaders with the mindset, skillset and toolset to drive transformation.",
    href: "/services#professional-development",
    image: "/images/pd-educators.jpg",
    accent: "teal",
  },
  {
    tag: "Leadership Camps",
    kicker: "Program",
    title: "Leadership Camps",
    description:
      "Immersive residential and day camps where students build confidence, character and leadership through adventure and reflection.",
    href: "/services#leadership-camps",
    image: "/images/leadership-camp.jpg",
    accent: "green",
  },
] as const;
