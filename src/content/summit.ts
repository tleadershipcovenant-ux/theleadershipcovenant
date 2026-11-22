/**
 * The School Impact Summit 2026 content & CMS normalization
 */

export interface SummitHeroContent {
  desktopImage: string;
  mobileImage: string;
  imageAlt: string;
  registerCtaLabel: string;
  registerCtaHref: string;
  scrollTarget: string;
}

export interface SummitObjectiveItem {
  id: string;
  title: string;
  text: string;
  takeaway: string;
}

export interface SummitObjectivesContent {
  eyebrow: string;
  heading: string;
  body: string;
  items: SummitObjectiveItem[];
}

export interface SummitAudienceRole {
  role: string;
  icon: "building" | "graduation" | "book" | "heart" | "compass";
  topGradient?: string;
}

export interface SummitAudienceContent {
  eyebrow: string;
  heading: string;
  pullQuote: string;
  items: SummitAudienceRole[];
}

export interface SummitSpeaker {
  id: string;
  name: string;
  role: string;
  title: string;
  bio: string;
  image: string;
  badgeColor?: string;
  topAccent?: string;
}

export interface SummitSpeakersContent {
  eyebrow: string;
  heading: string;
  items: SummitSpeaker[];
}

export interface SummitPanelMember {
  id: string;
  name: string;
  role: string;
  designation: string;
  image: string;
  badgeColor?: string;
  topAccent?: string;
}

export interface SummitPanelDiscussionContent {
  eyebrow: string;
  heading: string;
  subtitle: string;
  items: SummitPanelMember[];
}

export interface SummitParticipatingSchool {
  id: string;
  name: string;
  logo: string;
}

export interface SummitParticipatingSchoolsContent {
  eyebrow: string;
  heading: string;
  subtext: string;
  items: SummitParticipatingSchool[];
}

export interface SummitVideoItem {
  id: string;
  youtubeId: string;
  title: string;
  description: string;
  thumbnail: string;
}

export interface SummitVideosContent {
  eyebrow: string;
  heading: string;
  items: SummitVideoItem[];
}

export interface SummitCtaContent {
  eyebrow: string;
  heading: string;
  subtext: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
}

export interface SummitPageContent {
  meta: {
    title: string;
    description: string;
  };
  hero: SummitHeroContent;
  objectives: SummitObjectivesContent;
  audience: SummitAudienceContent;
  speakers: SummitSpeakersContent;
  panelDiscussion: SummitPanelDiscussionContent;
  participatingSchools: SummitParticipatingSchoolsContent;
  videos: SummitVideosContent;
  registration: SummitCtaContent;
}

export const SUMMIT_DEFAULT_SPEAKERS: SummitSpeaker[] = [
  {
    id: "fazal-niazi",
    name: "Mr. Fazal Niazi",
    role: "Lead Facilitator",
    title:
      "Practice Lead, FranklinCovey Education Pakistan, Türkiye & Azerbaijan",
    bio: "Leads strategic growth across Pakistan, Azerbaijan, and Turkey, driving teacher training, project management, and customer service initiatives. Also serves as Director of ARQAM Public School System and Founder of The Learning Space Official, advancing educational excellence and sustainable institutional growth.",
    image: "/Submit/fazal.jpeg",
    badgeColor: "bg-[#102E4D] text-[#FFC400] border-[#102E4D]/30",
    topAccent: "from-[#102E4D] via-[#001B33] to-[#FFC400]",
  },
  {
    id: "ubaid-ur-rehman",
    name: "Mr. Ubaid ur Rehman",
    role: "Event Facilitator",
    title: "Regional Manager, FranklinCovey Education North Region",
    bio: "An education leader, leadership coach, and organizational development consultant with 10+ years of experience. Leads school transformation and leadership development across Northern Pakistan, while serving as a Visiting Lecturer at NUST and previously teaching at IMSciences, Peshawar.",
    image: "/images/ubaid.jpg",
    badgeColor: "bg-[#FF7900] text-white border-[#FF7900]/30",
    topAccent: "from-[#FF7900] via-[#E56D00] to-[#FFC400]",
  },
];

export const SUMMIT_DEFAULT_PANEL_MEMBERS: SummitPanelMember[] = [
  {
    id: "panel-moderator-1",
    name: "Quratulain Ali Rizvi",
    role: "Moderator",
    designation: "Principal, GSIS School and College",
    image: "/Submit/Panalist/moderator.jpg",
    badgeColor: "bg-[#102E4D] text-[#FFC400] border-[#102E4D]/30",
    topAccent: "from-[#102E4D] via-[#001B33] to-[#FFC400]",
  },
  {
    id: "panel-member-1",
    name: "Sabahat K. Tatari",
    role: "Panelist",
    designation:
      "Head of International Baccalaureate Programmes, Headstart School",
    image: "/Submit/Panalist/panelist1.jpg",
    badgeColor: "bg-[#FF7900] text-white border-[#FF7900]/30",
    topAccent: "from-[#FF7900] via-[#E56D00] to-[#FFC400]",
  },
  {
    id: "panel-member-2",
    name: "Prof. Dr. Muhammad Sajid",
    role: "Panelist",
    designation:
      "Director, Institute of Professional Development IIUI\nDirector IIUI School",
    image: "/Submit/Panalist/panelist2.jpeg",
    badgeColor: "bg-[#FF7900] text-white border-[#FF7900]/30",
    topAccent: "from-[#FF7900] via-[#E56D00] to-[#FFC400]",
  },
  {
    id: "panel-member-3",
    name: "Wg Cdr. Tahira Rasool",
    role: "Panelist",
    designation:
      "Deputy Director FEAD (Fazaia Educational Advisory Department)",
    image: "/anonymous-female.svg",
    badgeColor: "bg-[#FF7900] text-white border-[#FF7900]/30",
    topAccent: "from-[#FF7900] via-[#E56D00] to-[#FFC400]",
  },
];

export const SUMMIT_DEFAULT_PARTICIPATING_SCHOOLS: SummitParticipatingSchool[] = [
  {
    id: "school-1",
    name: "Participating Partner School 1",
    logo: "/Submit/SchoolLogos/S1 (1).png",
  },
  {
    id: "school-2",
    name: "Participating Partner School 2",
    logo: "/Submit/SchoolLogos/S1 (1).jpeg",
  },
  {
    id: "school-3",
    name: "Participating Partner School 3",
    logo: "/Submit/SchoolLogos/S1 (2).jpeg",
  },
  {
    id: "school-4",
    name: "Participating Partner School 4",
    logo: "/Submit/SchoolLogos/S1 (3).jpeg",
  },
  {
    id: "school-5",
    name: "Participating Partner School 5",
    logo: "/Submit/SchoolLogos/S1 (4).jpeg",
  },
  {
    id: "school-6",
    name: "Participating Partner School 6",
    logo: "/Submit/SchoolLogos/S1 (5).jpeg",
  },
  {
    id: "school-7",
    name: "Participating Partner School 7",
    logo: "/Submit/SchoolLogos/S1 (6).jpeg",
  },
  {
    id: "school-8",
    name: "Participating Partner School 8",
    logo: "/Submit/SchoolLogos/S1 (7).jpeg",
  },
  {
    id: "school-9",
    name: "Participating Partner School 9",
    logo: "/Submit/SchoolLogos/S1 (8).jpeg",
  },
  {
    id: "school-10",
    name: "Participating Partner School 10",
    logo: "/Submit/SchoolLogos/S1 (9).jpeg",
  },
];

export const SUMMIT_DEFAULT_VIDEOS: SummitVideoItem[] = [
  {
    id: "v1",
    youtubeId: "e-zgk1VWN1s",
    title: "School Impact Summit — Event Highlights",
    description:
      "A look inside the room: keynote addresses, coaching corners, and leadership teams formulating 90-day whole-school action plans.",
    thumbnail: "https://img.youtube.com/vi/e-zgk1VWN1s/maxresdefault.jpg",
  },
  {
    id: "v2",
    youtubeId: "omlFZklTLV8",
    title: "Leader Voices & Classroom Transformation",
    description:
      "School heads and educators share firsthand how FranklinCovey Education leadership principles transformed student agency and staff culture.",
    thumbnail: "https://img.youtube.com/vi/omlFZklTLV8/maxresdefault.jpg",
  },
  {
    id: "v3",
    youtubeId: "2_9XG_vf5dw",
    title: "School Impact Summit — Event Highlight",
    description:
      "Relive a highlight from the School Impact Summit and the leadership conversations that brought participants together.",
    thumbnail: "https://img.youtube.com/vi/2_9XG_vf5dw/maxresdefault.jpg",
  },
  {
    id: "v4",
    youtubeId: "CZ1HZ5zwUcM",
    title: "School Impact Summit — Participant Highlight",
    description:
      "A look back at the shared learning, practical leadership and community built during the event.",
    thumbnail: "https://img.youtube.com/vi/CZ1HZ5zwUcM/maxresdefault.jpg",
  },
];

export const SUMMIT_CONTENT: SummitPageContent = {
  meta: {
    title: "The School Impact Summit 2026 - The Leadership Covenant",
    description:
      "The School Impact Summit 2026: 28 November 2026, Islamabad. Objectives, who should attend, speakers, past highlights and testimonials. Register online in minutes.",
  },
  hero: {
    desktopImage: "/Submit/Hero.png",
    mobileImage: "/Submit/Mobile%20devices%20hero%20section.png",
    imageAlt: "The School Impact Summit 2026 - Educational Leadership Conference",
    registerCtaLabel: "Register Now",
    registerCtaHref: "/apply?activity=school-impact-summit-2026#apply-form",
    scrollTarget: "#objective",
  },
  objectives: {
    eyebrow: "",
    heading: "What this summit is for ?",
    body: "The School Impact Summit 2026 brings together educational leaders and schools to discover meaningful practices, give voice to their journeys, and showcase the impact they are creating in their school communities. It is a platform to celebrate progress, exchange ideas, learn from shared experiences, and inspire a greater commitment to leadership and continuous improvement in education.",
    items: [
      {
        id: "discover",
        title: "DISCOVER",
        text: "Discover effective practices, fresh perspectives, and new possibilities in education.",
        takeaway: "Practices • Perspectives • Possibilities",
      },
      {
        id: "voice",
        title: "VOICE",
        text: "Give LiM schools and educators a platform to share their journeys, experiences, and learning.",
        takeaway: "LiM Schools • Journeys • Learning",
      },
      {
        id: "impact",
        title: "IMPACT",
        text: "Showcase the meaningful difference that purposeful leadership and intentional action can make in school communities.",
        takeaway: "Purposeful Leadership & Intentional Action",
      },
    ],
  },
  audience: {
    eyebrow: "",
    heading: "Who Should Attend ?",
    pullQuote:
      "This day is built for educational leaders who believe schools can be places where people grow, voices matter, and impact goes beyond academics.",
    items: [
      {
        role: "School Owners and Directors",
        icon: "building",
        topGradient: "from-[#102E4D] to-[#FFC400]",
      },
      {
        role: "Principals and School Heads",
        icon: "graduation",
        topGradient: "from-[#16A34A] to-[#22C55E]",
      },
      {
        role: "Educators and Teacher Leaders",
        icon: "book",
        topGradient: "from-[#FF7900] to-[#FFC400]",
      },
      {
        role: "Well-being and Student support Leaders",
        icon: "heart",
        topGradient: "from-[#E11D48] to-[#FB7185]",
      },
      {
        role: "Curriculum and Academic Leaders",
        icon: "compass",
        topGradient: "from-[#2563EB] to-[#60A5FA]",
      },
    ],
  },
  speakers: {
    eyebrow: "Speakers & Facilitators",
    heading: "Featuring Distinguished Voices from Education",
    items: SUMMIT_DEFAULT_SPEAKERS,
  },
  panelDiscussion: {
    eyebrow: "Panel Discussion",
    heading: "Redefining Success in a Changing World",
    subtitle: "Leadership, Wellbeing and Life Readiness in Education",
    items: SUMMIT_DEFAULT_PANEL_MEMBERS,
  },
  participatingSchools: {
    eyebrow: "Participating Schools",
    heading: "Leading Institutions Joining the Summit",
    subtext:
      "Visionary schools and educational networks uniting to build a culture of leadership and whole-school transformation.",
    items: SUMMIT_DEFAULT_PARTICIPATING_SCHOOLS,
  },
  videos: {
    eyebrow: "Watch & Relive",
    heading: "Highlights from our last event",
    items: SUMMIT_DEFAULT_VIDEOS,
  },
  registration: {
    eyebrow: "The School Impact Summit 2026",
    heading: "Reserve your seat",
    subtext:
      "Join school leaders on 28 November 2026 in Islamabad. Secure your seat today.",
    primaryCtaLabel: "Apply Now",
    primaryCtaHref: "/apply?activity=school-impact-summit-2026#apply-form",
    secondaryCtaLabel: "Contact Us",
    secondaryCtaHref: "/contact#contact",
  },
};

export const SUMMIT_PAGE: SummitPageContent = SUMMIT_CONTENT;

export function normalizeSummitCms(
  raw: Record<string, unknown> | null | undefined
): SummitPageContent {
  const defaults = SUMMIT_CONTENT;
  const src = raw && typeof raw === "object" ? raw : {};

  // Hero
  const heroSrc = (src.hero as Partial<SummitHeroContent> | undefined) || {};
  const hero: SummitHeroContent = {
    desktopImage: String(heroSrc.desktopImage || defaults.hero.desktopImage),
    mobileImage: String(heroSrc.mobileImage || defaults.hero.mobileImage),
    imageAlt: String(heroSrc.imageAlt || defaults.hero.imageAlt),
    registerCtaLabel: String(
      heroSrc.registerCtaLabel || defaults.hero.registerCtaLabel
    ),
    registerCtaHref: String(
      heroSrc.registerCtaHref || defaults.hero.registerCtaHref
    ),
    scrollTarget: String(heroSrc.scrollTarget || defaults.hero.scrollTarget),
  };

  // Objectives
  const objSrc =
    (src.objectives as Partial<SummitObjectivesContent> | undefined) || {};
  const objItemsRaw = Array.isArray(objSrc.items)
    ? objSrc.items
    : defaults.objectives.items;
  const objectives: SummitObjectivesContent = {
    eyebrow: String(objSrc.eyebrow ?? defaults.objectives.eyebrow),
    heading: String(objSrc.heading || defaults.objectives.heading),
    body: String(objSrc.body || defaults.objectives.body),
    items: objItemsRaw.map((it: Partial<SummitObjectiveItem>, i: number) => {
      const def = defaults.objectives.items[i] || defaults.objectives.items[0];
      return {
        id: String(it?.id || def?.id || `obj-${i + 1}`),
        title: String(it?.title || def?.title || "OBJECTIVE"),
        text: String(it?.text || def?.text || ""),
        takeaway: String(it?.takeaway || def?.takeaway || ""),
      };
    }),
  };

  // Audience
  const audSrc =
    (src.audience as Partial<SummitAudienceContent> | undefined) || {};
  const audItemsRaw = Array.isArray(audSrc.items)
    ? audSrc.items
    : defaults.audience.items;
  const validIcons = [
    "building",
    "graduation",
    "book",
    "heart",
    "compass",
  ] as const;
  const audience: SummitAudienceContent = {
    eyebrow: String(audSrc.eyebrow ?? defaults.audience.eyebrow),
    heading: String(audSrc.heading || defaults.audience.heading),
    pullQuote: String(audSrc.pullQuote || defaults.audience.pullQuote),
    items: audItemsRaw.map((it: Partial<SummitAudienceRole>, i: number) => {
      const def = defaults.audience.items[i] || defaults.audience.items[0];
      const iconKey = (it?.icon && validIcons.includes(it.icon as any)
        ? it.icon
        : def?.icon || "building") as SummitAudienceRole["icon"];
      return {
        role: String(it?.role || def?.role || "Leader"),
        icon: iconKey,
        topGradient: String(
          it?.topGradient || def?.topGradient || "from-[#102E4D] to-[#FFC400]"
        ),
      };
    }),
  };

  // Speakers
  const spkSrc =
    (src.speakers as Partial<SummitSpeakersContent> | undefined) || {};
  const spkItemsRaw = Array.isArray(spkSrc.items)
    ? spkSrc.items
    : defaults.speakers.items;
  const speakers: SummitSpeakersContent = {
    eyebrow: String(spkSrc.eyebrow || defaults.speakers.eyebrow),
    heading: String(spkSrc.heading || defaults.speakers.heading),
    items: spkItemsRaw.map((it: Partial<SummitSpeaker>, i: number) => {
      const def = defaults.speakers.items[i] || defaults.speakers.items[0];
      return {
        id: String(it?.id || def?.id || `spk-${i + 1}`),
        name: String(it?.name || def?.name || "Speaker"),
        role: String(it?.role || def?.role || "Facilitator"),
        title: String(it?.title || def?.title || ""),
        bio: String(it?.bio || def?.bio || ""),
        image: String(it?.image || def?.image || "/Submit/fazal.jpeg"),
        badgeColor: String(
          it?.badgeColor || def?.badgeColor || "bg-[#102E4D] text-[#FFC400]"
        ),
        topAccent: String(
          it?.topAccent ||
            def?.topAccent ||
            "from-[#102E4D] via-[#001B33] to-[#FFC400]"
        ),
      };
    }),
  };

  // Panel Discussion
  const panelSrc =
    (src.panelDiscussion as Partial<SummitPanelDiscussionContent> | undefined) ||
    {};
  const rawPanelList = Array.isArray(panelSrc.items) ? panelSrc.items : null;
  // Auto-upgrade legacy 3-item hardcoded list that still has Wajiha Shabbir or old root image paths
  const hasLegacyPanel =
    !rawPanelList ||
    rawPanelList.some(
      (it: Partial<SummitPanelMember>) =>
        it?.name === "Wajiha Shabbir" ||
        it?.image === "/moderator.jpg" ||
        it?.image === "/panelist1.jpg"
    );
  const panelItemsRaw = hasLegacyPanel
    ? defaults.panelDiscussion.items
    : rawPanelList;

  const panelDiscussion: SummitPanelDiscussionContent = {
    eyebrow: String(
      panelSrc.eyebrow || defaults.panelDiscussion.eyebrow
    ),
    heading: String(
      panelSrc.heading || defaults.panelDiscussion.heading
    ),
    subtitle: String(
      panelSrc.subtitle ?? defaults.panelDiscussion.subtitle
    ),
    items: panelItemsRaw.map((it: Partial<SummitPanelMember>, i: number) => {
      const def =
        defaults.panelDiscussion.items[i] || defaults.panelDiscussion.items[0];
      const roleStr = String(it?.role || def?.role || "Panelist");
      const isMod = roleStr.toLowerCase().includes("moderator");
      let imgPath = String(it?.image || def?.image || "/anonymous-female.svg");
      if (imgPath === "/moderator.jpg") imgPath = "/Submit/Panalist/moderator.jpg";
      if (imgPath === "/panelist1.jpg") imgPath = "/Submit/Panalist/panelist1.jpg";
      return {
        id: String(it?.id || def?.id || `panel-${i + 1}`),
        name: String(it?.name || def?.name || "Panel Member"),
        role: roleStr,
        designation: String(it?.designation || def?.designation || ""),
        image: imgPath,
        badgeColor: String(
          it?.badgeColor ||
            (isMod
              ? "bg-[#102E4D] text-[#FFC400] border-[#102E4D]/30"
              : "bg-[#FF7900] text-white border-[#FF7900]/30")
        ),
        topAccent: String(
          it?.topAccent ||
            (isMod
              ? "from-[#102E4D] via-[#001B33] to-[#FFC400]"
              : "from-[#FF7900] via-[#E56D00] to-[#FFC400]")
        ),
      };
    }),
  };

  // Participating Schools
  const schoolsSrc =
    (src.participatingSchools as
      | Partial<SummitParticipatingSchoolsContent>
      | undefined) || {};
  const rawSchoolsList = Array.isArray(schoolsSrc.items)
    ? schoolsSrc.items
    : null;
  // Auto-upgrade legacy "/SchoolLogos/..." paths to "/Submit/SchoolLogos/..."
  const hasLegacySchools =
    !rawSchoolsList ||
    rawSchoolsList.some(
      (it: Partial<SummitParticipatingSchool>) =>
        typeof it?.logo === "string" && it.logo.startsWith("/SchoolLogos/")
    );
  const schoolsItemsRaw = hasLegacySchools
    ? defaults.participatingSchools.items
    : rawSchoolsList;

  const participatingSchools: SummitParticipatingSchoolsContent = {
    eyebrow: String(
      schoolsSrc.eyebrow || defaults.participatingSchools.eyebrow
    ),
    heading: String(
      schoolsSrc.heading ?? defaults.participatingSchools.heading
    ),
    subtext: String(
      schoolsSrc.subtext ?? defaults.participatingSchools.subtext
    ),
    items: schoolsItemsRaw.map(
      (it: Partial<SummitParticipatingSchool>, i: number) => {
        const def =
          defaults.participatingSchools.items[i] ||
          defaults.participatingSchools.items[0];
        return {
          id: String(it?.id || def?.id || `school-${i + 1}`),
          name: String(
            it?.name || def?.name || `Participating School ${i + 1}`
          ),
          logo: String(
            it?.logo || def?.logo || "/Submit/SchoolLogos/S1 (1).png"
          ),
        };
      }
    ),
  };

  // Videos
  const vidSrc =
    (src.videos as Partial<SummitVideosContent> | undefined) || {};
  const vidItemsRaw = Array.isArray(vidSrc.items)
    ? vidSrc.items
    : defaults.videos.items;
  const videos: SummitVideosContent = {
    eyebrow: String(vidSrc.eyebrow || defaults.videos.eyebrow),
    heading: String(vidSrc.heading || defaults.videos.heading),
    items: vidItemsRaw.map((it: Partial<SummitVideoItem>, i: number) => {
      const def = defaults.videos.items[i] || defaults.videos.items[0];
      const youtubeId = String(it?.youtubeId || def?.youtubeId || "").trim();
      const defaultThumb = youtubeId
        ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`
        : "/images/hero-students.jpg";
      return {
        id: String(it?.id || def?.id || `vid-${i + 1}`),
        youtubeId,
        title: String(it?.title || def?.title || "Summit Video"),
        description: String(it?.description || def?.description || ""),
        thumbnail: String(it?.thumbnail || defaultThumb),
      };
    }),
  };

  // Registration CTA
  const regSrc =
    (src.registration as Partial<SummitCtaContent> | undefined) || {};
  const registration: SummitCtaContent = {
    eyebrow: String(regSrc.eyebrow || defaults.registration.eyebrow),
    heading: String(regSrc.heading || defaults.registration.heading),
    subtext: String(regSrc.subtext || defaults.registration.subtext),
    primaryCtaLabel: String(
      regSrc.primaryCtaLabel || defaults.registration.primaryCtaLabel
    ),
    primaryCtaHref: String(
      regSrc.primaryCtaHref || defaults.registration.primaryCtaHref
    ),
    secondaryCtaLabel: String(
      regSrc.secondaryCtaLabel || defaults.registration.secondaryCtaLabel
    ),
    secondaryCtaHref: String(
      regSrc.secondaryCtaHref || defaults.registration.secondaryCtaHref
    ),
  };

  return {
    meta: {
      title: defaults.meta.title,
      description: defaults.meta.description,
    },
    hero,
    objectives: {
      ...objectives,
      items:
        objectives.items.length > 0
          ? objectives.items
          : defaults.objectives.items,
    },
    audience: {
      ...audience,
      items:
        audience.items.length > 0 ? audience.items : defaults.audience.items,
    },
    speakers: {
      ...speakers,
      items: speakers.items.length > 0 ? speakers.items : defaults.speakers.items,
    },
    panelDiscussion: {
      ...panelDiscussion,
      items:
        panelDiscussion.items.length > 0
          ? panelDiscussion.items
          : defaults.panelDiscussion.items,
    },
    participatingSchools: {
      ...participatingSchools,
      items:
        participatingSchools.items.length > 0
          ? participatingSchools.items
          : defaults.participatingSchools.items,
    },
    videos: {
      ...videos,
      items: videos.items.length > 0 ? videos.items : defaults.videos.items,
    },
    registration,
  };
}
