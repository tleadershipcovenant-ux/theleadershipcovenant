import type { MetadataRoute } from "next";
import { SITE_URL } from "@/config/site";
import { EVENTS, type LeadershipEvent } from "@/content/events";
import { SERVICES } from "@/content/services";
import { getCmsPage } from "@/lib/supabase-store";

function toAbsoluteAssetUrl(path: string): string {
  if (!path) return `${SITE_URL}/OG_Image.png`;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${cleanPath.replace(/ /g, "%20")}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Attempt to load live CMS timestamps and events (non-blocking fallback to static seed)
  let activeEvents: LeadershipEvent[] = EVENTS.filter((e) => !e.hidden);
  let homeUpdated = now;
  let servicesUpdated = now;
  let aboutUpdated = now;
  let eventsUpdated = now;
  let summitUpdated = now;
  let formsUpdated = now;
  let contactUpdated = now;

  try {
    const [
      homeCms,
      servicesCms,
      aboutCms,
      eventsCms,
      summitCms,
      formsCms,
      contactCms,
    ] = await Promise.all([
      getCmsPage("home").catch(() => null),
      getCmsPage("services").catch(() => null),
      getCmsPage("about").catch(() => null),
      getCmsPage("events").catch(() => null),
      getCmsPage("summit").catch(() => null),
      getCmsPage("forms").catch(() => null),
      getCmsPage("contact").catch(() => null),
    ]);

    if (homeCms?.updated_at) homeUpdated = new Date(homeCms.updated_at);
    if (servicesCms?.updated_at) servicesUpdated = new Date(servicesCms.updated_at);
    if (aboutCms?.updated_at) aboutUpdated = new Date(aboutCms.updated_at);
    if (eventsCms?.updated_at) eventsUpdated = new Date(eventsCms.updated_at);
    if (summitCms?.updated_at) summitUpdated = new Date(summitCms.updated_at);
    if (formsCms?.updated_at) formsUpdated = new Date(formsCms.updated_at);
    if (contactCms?.updated_at) contactUpdated = new Date(contactCms.updated_at);

    if (Array.isArray(eventsCms?.content?.events) && eventsCms.content.events.length > 0) {
      activeEvents = (eventsCms.content.events as LeadershipEvent[]).filter(
        (e) => !e.hidden
      );
    }
  } catch {
    // Fallback to static seed data
  }

  const serviceImages = SERVICES.map((s) => toAbsoluteAssetUrl(s.image));
  const eventImages = Array.from(
    new Set(activeEvents.map((e) => toAbsoluteAssetUrl(e.image)))
  );

  const corePages: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}`,
      lastModified: homeUpdated,
      changeFrequency: "daily",
      priority: 1.0,
      images: [
        `${SITE_URL}/OG_Image.png`,
        `${SITE_URL}/Hero%20Section/H1.webp`,
        `${SITE_URL}/Logo_For_Navbar_Fotter.png`,
      ],
    },
    {
      url: `${SITE_URL}/services`,
      lastModified: servicesUpdated,
      changeFrequency: "weekly",
      priority: 0.95,
      images: [`${SITE_URL}/OG_Image.png`, ...serviceImages],
    },
    {
      url: `${SITE_URL}/activities`,
      lastModified: eventsUpdated,
      changeFrequency: "daily",
      priority: 0.95,
      images: [
        `${SITE_URL}/Activities/A1.webp`,
        `${SITE_URL}/OG_Image.png`,
        ...eventImages,
      ],
    },
    {
      url: `${SITE_URL}/summit`,
      lastModified: summitUpdated,
      changeFrequency: "daily",
      priority: 0.95,
      images: [
        `${SITE_URL}/Submit/Hero.webp`,
        `${SITE_URL}/Submit/fazal.jpeg`,
        `${SITE_URL}/images/ubaid.jpg`,
        `${SITE_URL}/OG_Image.png`,
      ],
    },
    {
      url: `${SITE_URL}/apply`,
      lastModified: formsUpdated,
      changeFrequency: "weekly",
      priority: 0.9,
      images: [`${SITE_URL}/OG_Image.png`],
    },
    {
      url: `${SITE_URL}/online-booking`,
      lastModified: formsUpdated,
      changeFrequency: "weekly",
      priority: 0.85,
      images: [`${SITE_URL}/OG_Image.png`],
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: aboutUpdated,
      changeFrequency: "monthly",
      priority: 0.85,
      images: [
        `${SITE_URL}/Our%20story/S1.webp`,
        `${SITE_URL}/images/ubaid.jpg`,
        `${SITE_URL}/OG_Image.png`,
      ],
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: contactUpdated,
      changeFrequency: "monthly",
      priority: 0.85,
      images: [`${SITE_URL}/Contact/C1.png`, `${SITE_URL}/OG_Image.png`],
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.5,
      images: [`${SITE_URL}/Privicy%20Policy/privacy-policy.webp`],
    },
    {
      url: `${SITE_URL}/llms.txt`,
      lastModified: eventsUpdated,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/llms-full.txt`,
      lastModified: eventsUpdated,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  // Dynamic Activity Application URLs for every active leadership cohort/workshop/camp
  const activityEntries: MetadataRoute.Sitemap = activeEvents
    .filter((event) => event.slug && event.detailPath !== "/summit")
    .map((event) => ({
      url: `${SITE_URL}/apply?activity=${encodeURIComponent(event.slug)}`,
      lastModified: eventsUpdated,
      changeFrequency: "weekly" as const,
      priority: 0.8,
      images: event.image ? [toAbsoluteAssetUrl(event.image)] : undefined,
    }));

  return [...corePages, ...activityEntries];
}
