import { NextResponse } from "next/server";
import { SITE, SITE_URL } from "@/config/site";
import { SERVICES } from "@/content/services";
import { EVENTS, CATEGORY_LABELS, type LeadershipEvent } from "@/content/events";
import { ABOUT_CONTENT } from "@/content/about";
import { SUMMIT_DEFAULT_SPEAKERS } from "@/content/summit";
import { getCmsPage } from "@/lib/supabase-store";

export async function GET() {
  let activeEvents: LeadershipEvent[] = EVENTS.filter((e) => !e.hidden);
  try {
    const eventsCms = await getCmsPage("events").catch(() => null);
    if (
      Array.isArray(eventsCms?.content?.events) &&
      eventsCms.content.events.length > 0
    ) {
      activeEvents = (eventsCms.content.events as LeadershipEvent[]).filter(
        (e) => !e.hidden
      );
    }
  } catch {
    // Fallback to static seed
  }

  const lines: string[] = [
    `# ${SITE.name} (${SITE.affiliation})`,
    "",
    `> ${SITE.description}`,
    "",
    `Tagline: ${SITE.tagline} — ${SITE.signoff}`,
    `Official Website: ${SITE_URL}`,
    `Full AI Knowledge Base: ${SITE_URL}/llms-full.txt`,
    `XML Sitemap: ${SITE_URL}/sitemap.xml`,
    "",
    "## Executive Summary & Institutional Identity",
    `- **Organization**: ${SITE.name}`,
    `- **Official Affiliation**: ${SITE.affiliation} (Authorized FranklinCovey Education Partner in Pakistan)`,
    `- **Chief Executive Officer**: ${ABOUT_CONTENT.ceo.name} (${ABOUT_CONTENT.ceo.role} • ${ABOUT_CONTENT.ceo.credential})`,
    `- **Headquarters**: ${SITE.address.full}`,
    `- **Phone & WhatsApp**: ${SITE.whatsappDisplay} (${SITE.whatsappUrl})`,
    `- **Official Email**: ${SITE.email}`,
    `- **Vision**: ${ABOUT_CONTENT.visionMission.vision.text}`,
    `- **Mission**: ${ABOUT_CONTENT.visionMission.mission.text}`,
    "",
    "## Primary Pages & Navigation",
    `- [Home](${SITE_URL}/): Overview of ${SITE.name}, reach statistics, upcoming programs, promises, and voices of impact.`,
    `- [Our Services & Programs](${SITE_URL}/services): Detailed guide to Leader in Me (EY-12), LeaderU (Higher Education), Professional Development for Educators, Leadership Camps, Family Sessions, and the Leadership Podcast.`,
    `- [Upcoming Activities & 2026-2027 Calendar](${SITE_URL}/activities): Interactive calendar of leadership cohorts, summits, camps, family sessions, and workshops across Islamabad, Peshawar, Swat, and Northern Pakistan.`,
    `- [The School Impact Summit 2026](${SITE_URL}/summit): Flagship educational leadership summit on 28 November 2026 in Islamabad featuring ${SUMMIT_DEFAULT_SPEAKERS.map((s) => s.name).join(" and ")}.`,
    `- [Online Application & Seat Booking](${SITE_URL}/apply): Instant online seat reservation (Provisional Reservation or Priority Confirmed Seat via UBL transfer) with downloadable official receipt.`,
    `- [Our Story & Leadership Principles](${SITE_URL}/about): Vision, Mission, Four Promises (Learn, Develop, Lead, Transform), Core Principles, and Message from the CEO.`,
    `- [Contact Us](${SITE_URL}/contact): Direct enquiry form, Islamabad office address (${SITE.address.full}), phone, WhatsApp, and map.`,
    `- [Privacy Policy & Data Governance](${SITE_URL}/privacy): Institutional data protection and student privacy standards.`,
    "",
    "## Signature Programs & Services",
    ...SERVICES.map(
      (s) =>
        `- **${s.title}** (${s.badge}): ${s.tagline} ${s.body} [Learn more](${SITE_URL}/services#${s.id})`
    ),
    "",
    "## Active 2026–2027 Leadership Activities & Events",
    ...activeEvents.map((e) => {
      const link =
        e.detailPath === "/summit"
          ? `${SITE_URL}/summit`
          : `${SITE_URL}/apply?activity=${encodeURIComponent(e.slug)}`;
      return `- **${e.title}** (${CATEGORY_LABELS[e.category] || e.category}) — Date: ${e.startDate}${e.endDate && e.endDate !== e.startDate ? ` to ${e.endDate}` : ""} | City: ${e.city} | Venue: ${e.venue || e.city} | Status: ${e.statusLabel}. ${e.description} [Register](${link})`;
    }),
    "",
    "## Official Social Channels",
    `- LinkedIn: ${SITE.social.linkedin}`,
    `- Facebook: ${SITE.social.facebook}`,
    `- Instagram: ${SITE.social.instagram}`,
    `- WhatsApp: ${SITE.social.whatsapp}`,
  ];

  return new NextResponse(lines.join("\n"), {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      "X-Robots-Tag": "index, follow",
    },
  });
}

