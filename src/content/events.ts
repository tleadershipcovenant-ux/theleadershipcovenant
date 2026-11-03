/**
 * Activities / events — single data source for the Home marquee, Activities grid,
 * Event Detail Modal, the application form dropdown and structured data.
 * Source: docs/content/04-activities.md + docs/05-DATA-MODEL-AND-API.md (seed data)
 */

export type EventCategory =
  | "professional_development"
  | "lim_community"
  | "wellness"
  | "leaderu"
  | "family_session"
  | "summit"
  | "student_camp";

export type StatusTone = "open" | "limited" | "free";

export interface LeadershipEvent {
  slug: string;
  title: string;
  category: EventCategory;
  description: string;
  /** Optional single-paragraph modal copy when the card summary is too brief. */
  modalDescription?: string;
  city: string;
  /** Optional richer location line, e.g. "Swat, KPK • Dec 18–20, 2026" */
  locationNote?: string;
  /** ISO dates (YYYY-MM-DD), Pakistan local time */
  startDate: string;
  endDate: string;
  statusLabel: string;
  statusTone: StatusTone;
  /** When set, the card links to a dedicated detail page instead of the apply form */
  detailPath?: string;
  featured?: boolean;
  /** Rich detail fields displayed inside the interactive Event Details Modal */
  image: string;
  duration: string;
  schedule: string;
  venue: string;
  format: string;
  certificate: string;
  facilitator: string;
  overview: string;
  highlights: string[];
  whoShouldAttend: string[];
}

export const CATEGORY_LABELS: Record<EventCategory, string> = {
  professional_development: "Professional Development",
  lim_community: "LiM Community Event",
  wellness: "Wellness",
  leaderu: "LeaderU",
  family_session: "Family Session",
  summit: "Summit",
  student_camp: "Student Camp",
};

export interface MonthTheme {
  gradient: string;
  text: string;
  hoverText: string;
  ring: string;
  borderAccent: string;
}

/**
 * Distinct professional color palette per calendar month (0 = Jan ... 11 = Dec).
 * November (10) uses Royal Blue as specified.
 */
export const MONTH_THEMES: Record<number, MonthTheme> = {
  0: {
    // January — Indigo
    gradient: "from-[#4F46E5] to-[#4338CA]",
    text: "text-[#4338CA]",
    hoverText: "group-hover:text-[#4338CA]",
    ring: "hover:border-[#4F46E5]/60",
    borderAccent: "border-[#4F46E5]/25",
  },
  1: {
    // February — Crimson Rose
    gradient: "from-[#E11D48] to-[#BE123C]",
    text: "text-[#BE123C]",
    hoverText: "group-hover:text-[#BE123C]",
    ring: "hover:border-[#E11D48]/60",
    borderAccent: "border-[#E11D48]/25",
  },
  2: {
    // March — Spring Emerald
    gradient: "from-[#059669] to-[#047857]",
    text: "text-[#047857]",
    hoverText: "group-hover:text-[#047857]",
    ring: "hover:border-[#059669]/60",
    borderAccent: "border-[#059669]/25",
  },
  3: {
    // April — Sky Cyan
    gradient: "from-[#0284C7] to-[#0369A1]",
    text: "text-[#0369A1]",
    hoverText: "group-hover:text-[#0369A1]",
    ring: "hover:border-[#0284C7]/60",
    borderAccent: "border-[#0284C7]/25",
  },
  4: {
    // May — Warm Amber
    gradient: "from-[#D97706] to-[#B45309]",
    text: "text-[#B45309]",
    hoverText: "group-hover:text-[#B45309]",
    ring: "hover:border-[#D97706]/60",
    borderAccent: "border-[#D97706]/25",
  },
  5: {
    // June — Coral Sunset
    gradient: "from-[#EA580C] to-[#C2410C]",
    text: "text-[#C2410C]",
    hoverText: "group-hover:text-[#C2410C]",
    ring: "hover:border-[#EA580C]/60",
    borderAccent: "border-[#EA580C]/25",
  },
  6: {
    // July — Signature Brand Orange
    gradient: "from-[#FF7900] to-[#E56D00]",
    text: "text-[#E56D00]",
    hoverText: "group-hover:text-[#E56D00]",
    ring: "hover:border-[#FF7900]/60",
    borderAccent: "border-[#FF7900]/30",
  },
  7: {
    // August — Vibrant Forest Green
    gradient: "from-[#16A34A] to-[#15803D]",
    text: "text-[#15803D]",
    hoverText: "group-hover:text-[#15803D]",
    ring: "hover:border-[#16A34A]/60",
    borderAccent: "border-[#16A34A]/30",
  },
  8: {
    // September — Institutional Deep Navy
    gradient: "from-[#102E4D] to-[#001B33]",
    text: "text-[#102E4D]",
    hoverText: "group-hover:text-[#102E4D]",
    ring: "hover:border-[#102E4D]/60",
    borderAccent: "border-[#102E4D]/25",
  },
  9: {
    // October — Autumn Gold / Amber
    gradient: "from-[#D97706] to-[#B45309]",
    text: "text-[#B45309]",
    hoverText: "group-hover:text-[#B45309]",
    ring: "hover:border-[#D97706]/60",
    borderAccent: "border-[#D97706]/30",
  },
  10: {
    // November — Royal Blue
    gradient: "from-[#2563EB] to-[#1D4ED8]",
    text: "text-[#1D4ED8]",
    hoverText: "group-hover:text-[#1D4ED8]",
    ring: "hover:border-[#2563EB]/60",
    borderAccent: "border-[#2563EB]/30",
  },
  11: {
    // December — Mountain Teal
    gradient: "from-[#0D9488] to-[#0F766E]",
    text: "text-[#0F766E]",
    hoverText: "group-hover:text-[#0F766E]",
    ring: "hover:border-[#0D9488]/60",
    borderAccent: "border-[#0D9488]/30",
  },
};

export function getMonthTheme(monthIndex: number): MonthTheme {
  return MONTH_THEMES[((monthIndex % 12) + 12) % 12] ?? MONTH_THEMES[6];
}

export function isOpenEnrollmentEvent(event: LeadershipEvent): boolean {
  return event.statusLabel.trim().toLowerCase() === "open enrollment";
}

export const EVENTS: LeadershipEvent[] = [
  {
    slug: "7-habits",
    title: "7 Habits of Highly Effective People",
    category: "professional_development",
    description:
      "A transformational one-day experience of the world's most trusted personal effectiveness framework, designed for educators, leaders, and lifelong learners.",
    city: "Islamabad",
    startDate: "2026-07-19",
    endDate: "2026-07-19",
    statusLabel: "Enrollment not open",
    statusTone: "limited",
    image: "/images/pd-educators.jpg",
    duration: "1 Full Day",
    schedule: "9:00 AM – 5:00 PM PKT",
    venue: "Islamabad (Venue shared upon confirmation)",
    format: "In-Person Interactive Masterclass",
    certificate: "FranklinCovey Participation Certificate",
    facilitator: "Certified FranklinCovey Education Facilitators",
    overview:
      "Built on Dr. Stephen R. Covey's timeless principles of fairness, integrity, honesty, and human dignity, this immersive one-day masterclass equips educators, school leaders, and professionals to lead themselves effectively before leading others. Participants move from dependence to independence (Private Victory) and on to interdependence (Public Victory) with ready-to-apply classroom and leadership tools.",
    highlights: [
      "Master Private Victory®: Be Proactive, Begin with the End in Mind, and Put First Things First",
      "Build high-trust relationships through Think Win-Win, Empathic Listening, and Synergy",
      "Apply paradigm-shifting exercises and personal leadership action planners",
      "Includes participant workbook, guided coaching activities, lunch, and refreshments",
      "Group and institutional school nominations welcomed",
    ],
    whoShouldAttend: [
      "School Principals & Heads",
      "Teachers & Academic Coordinators",
      "Education Administrators",
      "Lifelong Learners & Professionals",
    ],
  },
  {
    slug: "4dx-for-educators",
    title: "4 Disciplines of Execution for Educators",
    category: "professional_development",
    description:
      "Learn the proven 4DX operating system to execute your school's most important goals in the whirlwind of daily demands.",
    city: "Islamabad",
    startDate: "2026-08-29",
    endDate: "2026-08-29",
    statusLabel: "Enrollment not open",
    statusTone: "limited",
    image: "/images/pd-educators.jpg",
    duration: "1 Full Day",
    schedule: "9:30 AM – 4:30 PM PKT",
    venue: "Islamabad (Venue shared upon confirmation)",
    format: "Executive Working Session",
    certificate: "Certificate of Completion",
    facilitator: "Mr. Fazal Niazi & TLC Leadership Team",
    overview:
      "Every school leader faces a daily whirlwind of urgent operational demands that crowd out strategic breakthroughs. In this hands-on working session, school leadership teams learn FranklinCovey's 4 Disciplines of Execution® (4DX®), leaving with a clearly defined Wildly Important Goal (WIG), predictive lead measures, a live team scoreboard, and a weekly cadence of accountability.",
    highlights: [
      "Discipline 1: Narrow focus to 1–2 Wildly Important Goals (WIGs) for your school year",
      "Discipline 2: Identify high-leverage Lead Measures that teachers and students can influence daily",
      "Discipline 3: Design engaging visual scoreboards that drive collective ownership",
      "Discipline 4: Establish a 20-minute weekly WIG session rhythm that sustains momentum",
      "Walk away with a ready-to-launch 90-day school execution plan",
    ],
    whoShouldAttend: [
      "School Owners & Directors",
      "Principals & Vice Principals",
      "Section Heads & Academic Leads",
      "School Improvement Teams",
    ],
  },
  {
    slug: "lim-community-2026",
    title: "LiM Community Coaching 2027",
    category: "lim_community",
    description:
      "A full day of open coaching, peer learning and inspiration with our Leader in Me community of educators, coaches and school leaders.",
    city: "Islamabad",
    startDate: "2027-01-16",
    endDate: "2027-01-16",
    statusLabel: "Free • RSVP required",
    statusTone: "free",
    image: "/images/leader-in-me.jpg",
    duration: "1 Full Day",
    schedule: "9:30 AM – 4:00 PM PKT",
    venue: "Islamabad (Partner Campus / Conference Hall)",
    format: "Community Gathering & Open Coaching",
    certificate: "Community Participation Recognition",
    facilitator: "The Leadership Covenant Coaching Network",
    overview:
      "Our annual Leader in Me Community Event brings together partner schools, Lighthouse coordinators, educators, and prospective school leaders from across the North Region. Experience candid peer stories, live open coaching corners, student leadership showcases, and practical strategies for embedding the 7 Habits deeper into everyday school life.",
    highlights: [
      "Open coaching clinics led by FranklinCovey Education regional coaches",
      "Real implementation stories and best practices shared by partner schools",
      "Student leadership spotlights demonstrating classroom and school-wide roles",
      "Peer networking roundtables for principals, coordinators, and Action Teams",
      "Complimentary community registration with advance RSVP required to secure seating",
    ],
    whoShouldAttend: [
      "Leader in Me Partner Schools",
      "Prospective School Leaders",
      "Lighthouse Team Coordinators",
      "Classroom Educators & Counselors",
    ],
  },
  {
    slug: "neuroscience-wellness",
    title: "Neuro Science Backed Wellness",
    category: "wellness",
    description:
      "Practical, neuroscience-backed practices for educator wellbeing, focus and resilience, designed for classroom life.",
    city: "Peshawar",
    startDate: "2027-01-09",
    endDate: "2027-01-09",
    statusLabel: "Seats limited",
    statusTone: "limited",
    image: "/images/hero-students.jpg",
    duration: "1 Day Workshop",
    schedule: "10:00 AM – 3:00 PM PKT",
    venue: "Peshawar, KPK (Venue shared upon confirmation)",
    format: "Experiential Wellbeing Lab",
    certificate: "Workshop Certificate Included",
    facilitator: "Wellbeing & Educational Leadership Specialists",
    overview:
      "Educator effectiveness begins with cognitive clarity, emotional regulation, and sustainable energy. Designed specifically for the pace and pressures of classroom life, this workshop translates modern neuroscience into simple daily habits that prevent burnout, sharpen focus, and cultivate calm, supportive learning environments.",
    highlights: [
      "Understand the brain science of stress, emotional contagion, and co-regulation in classrooms",
      "Micro-recovery routines for focus and energy renewal between teaching periods",
      "Practical tools to build psychological safety and emotional resilience among staff",
      "Habit-stacking framework aligned with Habit 7: Sharpen the Saw®",
      "Intimate cohort size in Peshawar to ensure personalized practice and reflection",
    ],
    whoShouldAttend: [
      "Classroom Teachers",
      "School Counselors & Wellbeing Leads",
      "Academic Coordinators",
      "Principals & Staff Development Heads",
    ],
  },
  {
    slug: "7-habits-families",
    title: "7 Habits of Highly Effective Families",
    category: "family_session",
    description:
      "A powerful session for parents and caregivers to build trust, communication and a strong family culture rooted in timeless principles.",
    city: "Islamabad",
    startDate: "2026-12-26",
    endDate: "2026-12-26",
    statusLabel: "Family passes available",
    statusTone: "open",
    image: "/images/family-session.jpg",
    duration: "Half-Day Weekend Session",
    schedule: "10:30 AM – 3:00 PM PKT",
    venue: "Islamabad (Venue shared upon confirmation)",
    format: "Interactive Parenting & Family Forum",
    certificate: "Family Leadership Resource Kit",
    facilitator: "Certified Family Leadership Facilitators",
    overview:
      "Based on The 7 Habits of Highly Effective Families®, this warm, practical session equips parents and caregivers with timeless principles to nurture trust, empathy, and shared responsibility at home. Learn how to move from reactive daily friction to an intentional family culture where every child feels heard, valued, and capable of leading.",
    highlights: [
      "Create a shared Family Mission Statement that anchors values and family traditions",
      "Practice empathic listening to bridge generational and digital-age communication gaps",
      "Build emotional bank accounts that strengthen parent-child trust",
      "Practical routines for weekly family check-ins and shared problem-solving",
      "Special couple and family pass options available",
    ],
    whoShouldAttend: [
      "Parents & Guardians",
      "Couples & Caregivers",
      "Parent-Teacher Association Members",
      "Family Counselors & Educators",
    ],
  },
  {
    slug: "teacher-believed-in-me",
    title: "Principal's Academy",
    category: "professional_development",
    description:
      "Grounded in the Whole-Person Paradigm and the 4 Roles of Great Leaders™, this training builds trust, shared vision, strategic alignment, and staff potential.",
    modalDescription:
      "Grounded in the Whole-Person Paradigm and the 4 Roles of Great Leaders™, this training empowers educational leaders to build trust, establish a shared vision, align school systems with strategic priorities, and unlock the full potential of their staff. It promotes effective leadership, stronger collaboration, and a culture of continuous growth and improvement within school communities.",
    city: "Islamabad",
    startDate: "2026-01-30",
    endDate: "2026-01-30",
    statusLabel: "Open enrollment",
    statusTone: "open",
    image: "/images/pd-educators.jpg",
    duration: "1 Full Day",
    schedule: "9:00 AM – 4:30 PM PKT",
    venue: "Islamabad (Venue shared upon confirmation)",
    format: "Reflective Educator Masterclass",
    certificate: "Official Course Certificate",
    facilitator: "The Leadership Covenant Faculty",
    overview:
      "Grounded in the Whole-Person Paradigm and the 4 Roles of Great Leaders™, this training empowers educational leaders to build trust, establish a shared vision, align school systems with strategic priorities, and unlock the full potential of their staff. It promotes effective leadership, stronger collaboration, and a culture of continuous growth and improvement within school communities.",
    highlights: [
      "Shift from deficit-based labels to a leadership-potential paradigm for every learner",
      "Practical language and classroom rituals that communicate belief and high expectations",
      "Strengthen student belonging, intrinsic motivation, and self-efficacy",
      "Reflective storytelling, video case studies, and actionable classroom commitments",
      "Ideal for both individual teachers and whole-school faculty cohorts",
    ],
    whoShouldAttend: [
      "EY–12 Classroom Teachers",
      "Homeroom & Mentor Teachers",
      "Section Heads & Coordinators",
      "School Principals & Leaders",
    ],
  },
  {
    slug: "school-impact-summit-2026",
    title: "The School Impact Summit 2026",
    category: "summit",
    description:
      "A one-day summit where school leaders and educators share strategies, stories and tools to amplify their school's impact on every student.",
    city: "Islamabad",
    startDate: "2026-11-28",
    endDate: "2026-11-28",
    statusLabel: "Open enrollment",
    statusTone: "open",
    detailPath: "/summit",
    featured: true,
    image: "/images/summit-banner.png",
    duration: "1-Day Regional Summit",
    schedule: "1-Day Regional Summit",
    venue: "Islamabad",
    format: "Training Session, Impact Stories, Panel Discussion",
    certificate: "Summit Participant Kit & Certificate",
    facilitator: "Mr. Fazal Niazi, Mr. Ubaid ur Rehman & Guest Speakers",
    overview:
      "Themed Discover | Voice | Impact, the School Impact Summit 2026 brings together school owners, principals, academic leaders, educators, and changemakers to explore the ideas, practices, and possibilities shaping the future of education. It is a platform for discovering fresh perspectives, sharing voices and experiences from across the education landscape, and engaging in meaningful conversations around effective school leadership, student development, and educational transformation. More than a gathering, the Summit aims to inspire collaboration, strengthen connections, and turn shared insights into purposeful action for stronger schools and a greater impact on education.",
    highlights: [
      "Clarify one narrowly-defined Wildly Important Goal (WIG) and scorecard for your school",
      "Candid case stories from schools across Pakistan transforming student leadership culture",
      "Guided working labs led by Mr. Fazal Niazi and Mr. Ubaid ur Rehman",
      "High-level networking with 200+ school directors, principals, and education pioneers",
      "Every participating school team leaves with a written 90-day impact blueprint",
    ],
    whoShouldAttend: [
      "School Owners & Directors",
      "Principals & School Heads",
      "Educators & Teacher Leaders",
      "Curriculum, Academic & Wellbeing Leaders",
    ],
  },
  {
    slug: "leadership-camp-swat-2026",
    title: "Leadership Camp",
    category: "student_camp",
    description:
      "A three-day residential adventure in the mountains of Swat where students build confidence, character and leadership through experience.",
    city: "Swat",
    locationNote: "Swat, KPK • Dec 18–20, 2026",
    startDate: "2026-12-18",
    endDate: "2026-12-20",
    statusLabel: "Applications open",
    statusTone: "open",
    image: "/images/leadership-camp.jpg",
    duration: "3 Days / 2 Nights",
    schedule: "Dec 18 – Dec 20, 2026 (Residential)",
    venue: "Swat Valley, KPK (Supervised Resort & Outdoor Base)",
    format: "Supervised Residential Student Adventure",
    certificate: "Certificate of Leadership Participation",
    facilitator: "TLC Youth Leadership & Outdoor Safety Team",
    overview:
      "Set amidst the scenic mountains of Swat Valley, this supervised three-day residential camp immerses students in experiential outdoor challenges, team problem-solving, and guided reflection rooted in The 7 Habits®. Students step outside comfort zones to build self-reliance, resilience, deep friendships, and authentic character.",
    highlights: [
      "3-day residential mountain retreat with structured outdoor team expeditions",
      "The 7 Habits® applied in real time through leadership quests and group challenges",
      "Evening reflection circles, storytelling, and personal goal-setting journals",
      "Full supervision, transport coordination from Islamabad, accommodation, and meals",
      "Official Certificate of Leadership Participation awarded at closing ceremony",
    ],
    whoShouldAttend: [
      "Middle & High School Students",
      "Student Council & Prefect Teams",
      "School Group Delegations",
      "Young Aspiring Leaders",
    ],
  },
];

const SHORT_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

const LONG_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

const SHORT_WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export type EventTimeSlot = "full_day" | "half_day" | "multi_day";

export interface PrecomputedLeadershipEvent extends LeadershipEvent {
  monthIndex: number;
  monthStr: string;
  monthYearLabel: string;
  dayStr: string;
  yearStr: number;
  weekdayStr: string;
  theme: MonthTheme;
  isOpenEnrollment: boolean;
  timeSlot: EventTimeSlot;
  searchHaystack: string;
}

function computeTimeSlot(evt: LeadershipEvent): EventTimeSlot {
  const dur = evt.duration.toLowerCase();
  if (dur.includes("3 day") || evt.startDate !== evt.endDate) {
    return "multi_day";
  }
  if (dur.includes("half-day")) {
    return "half_day";
  }
  return "full_day";
}

export const PRECOMPUTED_EVENTS: PrecomputedLeadershipEvent[] = EVENTS.map(
  (evt) => {
    const [yStr, mStr, dStr] = evt.startDate.split("-");
    const yearNum = Number(yStr);
    const monthIndex = Number(mStr) - 1;
    const dayNum = Number(dStr);
    const weekdayIdx = new Date(Date.UTC(yearNum, monthIndex, dayNum)).getUTCDay();

    return {
      ...evt,
      monthIndex,
      monthStr: SHORT_MONTHS[monthIndex] ?? "Jul",
      monthYearLabel: `${LONG_MONTHS[monthIndex] ?? "July"} ${yearNum}`,
      dayStr: String(dayNum).padStart(2, "0"),
      yearStr: yearNum,
      weekdayStr: SHORT_WEEKDAYS[weekdayIdx] ?? "Sat",
      theme: getMonthTheme(monthIndex),
      isOpenEnrollment: isOpenEnrollmentEvent(evt),
      timeSlot: computeTimeSlot(evt),
      searchHaystack: `${evt.title} ${evt.description} ${evt.city} ${evt.schedule} ${evt.duration} ${CATEGORY_LABELS[evt.category]}`.toLowerCase(),
    };
  }
);

export const AVAILABLE_EVENT_MONTHS: {
  monthIndex: number;
  label: string;
  shortLabel: string;
  count: number;
}[] = (() => {
  const map = new Map<
    number,
    { monthIndex: number; label: string; shortLabel: string; count: number }
  >();
  for (const evt of PRECOMPUTED_EVENTS) {
    const existing = map.get(evt.monthIndex);
    if (existing) {
      existing.count += 1;
    } else {
      map.set(evt.monthIndex, {
        monthIndex: evt.monthIndex,
        label: evt.monthYearLabel,
        shortLabel: evt.monthStr,
        count: 1,
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => a.monthIndex - b.monthIndex);
})();

export const AVAILABLE_EVENT_CITIES: string[] = Array.from(
  new Set(PRECOMPUTED_EVENTS.map((e) => e.city))
);

export const OPEN_ENROLLMENT_COUNT: number = PRECOMPUTED_EVENTS.filter(
  (e) => e.isOpenEnrollment
).length;
