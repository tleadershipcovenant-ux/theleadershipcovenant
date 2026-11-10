import { NextResponse } from "next/server";
import { SITE, SITE_URL } from "@/config/site";
import { SERVICES } from "@/content/services";
import { EVENTS, CATEGORY_LABELS, type LeadershipEvent } from "@/content/events";
import { ABOUT_CONTENT } from "@/content/about";
import { HOME_CONTENT } from "@/content/home";
import {
  SUMMIT_DEFAULT_SPEAKERS,
  SUMMIT_CONTENT,
} from "@/content/summit";
import { getActivityPricing } from "@/content/pricing";
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

  const sections: string[] = [
    `# ${SITE.name} — Complete AI & Search Knowledge Reference`,
    "",
    `> ${SITE.description}`,
    "",
    `- **Canonical Website**: ${SITE_URL}`,
    `- **Affiliation**: ${SITE.affiliation}`,
    `- **Tagline**: ${SITE.tagline} (${SITE.signoff})`,
    `- **Headquarters**: ${SITE.address.full}`,
    `- **Telephone / WhatsApp**: ${SITE.whatsappDisplay} (${SITE.whatsappUrl})`,
    `- **Email**: ${SITE.email}`,
    "",
    "---",
    "",
    "## 1. About The Leadership Covenant (Our Story)",
    `### Vision`,
    ABOUT_CONTENT.visionMission.vision.text,
    "",
    `### Mission`,
    ABOUT_CONTENT.visionMission.mission.text,
    "",
    `### The Four Covenant Promises`,
    ...ABOUT_CONTENT.covenant.promises.map(
      (p) => `- **${p.number}. ${p.word}**: ${p.promise}`
    ),
    "",
    `### Core Principles We Lead By`,
    ...ABOUT_CONTENT.principles.items.map(
      (item) => `- **${item.title}**: ${item.text}`
    ),
    "",
    `### Message from the Chief Executive Officer`,
    `- **Name**: ${ABOUT_CONTENT.ceo.name}`,
    `- **Role**: ${ABOUT_CONTENT.ceo.role} (${ABOUT_CONTENT.ceo.credential})`,
    `- **Quote**: ${ABOUT_CONTENT.ceo.quote}`,
    ...ABOUT_CONTENT.ceo.paragraphs.map((p) => `\n${p}`),
    "",
    "---",
    "",
    "## 2. Signature Services & Transformational Programs",
    ...SERVICES.flatMap((s) => [
      `### ${s.title} (${s.badge})`,
      `- **URL**: ${SITE_URL}/services#${s.id}`,
      `- **Tagline**: ${s.tagline}`,
      `- **Overview**: ${s.body}`,
      `- **Key Highlights**:`,
      ...s.bullets.map((b) => `  - ${b}`),
      "",
    ]),
    "---",
    "",
    "## 3. Flagship Event: The School Impact Summit 2026",
    `- **Event Title**: The School Impact Summit 2026`,
    `- **Date**: 28 November 2026`,
    `- **City / Location**: Islamabad, Pakistan`,
    `- **Official Page**: ${SITE_URL}/summit`,
    `- **Direct Registration**: ${SITE_URL}/apply?activity=school-impact-summit-2026`,
    `- **Overview**: ${SUMMIT_CONTENT.objectives.body}`,
    "",
    `### Summit Objectives`,
    ...SUMMIT_CONTENT.objectives.items.map(
      (obj) =>
        `- **${obj.title}**: ${obj.text} (Key Takeaway: ${obj.takeaway})`
    ),
    "",
    `### Featured Summit Speakers & Facilitators`,
    ...SUMMIT_DEFAULT_SPEAKERS.map(
      (sp) => `- **${sp.name}** (${sp.role} — ${sp.title}): ${sp.bio}`
    ),
    "",
    "---",
    "",
    "## 4. Complete 2026–2027 Activities, Camps, Workshops & Cohorts",
    ...activeEvents.flatMap((e) => {
      const pricing = getActivityPricing(e.slug, e);
      const applyUrl =
        e.detailPath === "/summit"
          ? `${SITE_URL}/summit`
          : `${SITE_URL}/apply?activity=${encodeURIComponent(e.slug)}`;
      return [
        `### ${e.title}`,
        `- **Slug**: \`${e.slug}\``,
        `- **Category**: ${CATEGORY_LABELS[e.category] || e.category}`,
        `- **Dates**: ${e.startDate}${e.endDate && e.endDate !== e.startDate ? ` to ${e.endDate}` : ""}`,
        `- **Schedule**: ${e.schedule || "Full Day"} (${e.duration || "Scheduled Session"})`,
        `- **City & Venue**: ${e.city} — ${e.venue || e.city}`,
        `- **Format**: ${e.format || "In-Person"}`,
        `- **Facilitator**: ${e.facilitator || "FranklinCovey Certified Facilitators"}`,
        `- **Certification**: ${e.certificate || "Official Certificate of Participation"}`,
        `- **Fee / Investment**: ${pricing.formattedPayablePrice || pricing.formattedRegularPrice || "Institutional / Cohort Registration"}`,
        `- **Booking Status**: ${e.statusLabel}`,
        `- **Registration Link**: ${applyUrl}`,
        `- **Summary**: ${e.overview || e.description}`,
        ...(e.highlights?.length
          ? [`- **Highlights**: ${e.highlights.join("; ")}`]
          : []),
        ...(e.whoShouldAttend?.length
          ? [`- **Who Should Attend**: ${e.whoShouldAttend.join(", ")}`]
          : []),
        "",
      ];
    }),
    "---",
    "",
    "## 5. Voices of Impact & Testimonials",
    ...HOME_CONTENT.voices.testimonials.items.map(
      (t) => `- "${t.quote}" — **${t.author}**`
    ),
    "",
    "---",
    "",
    "## 6. Frequently Asked Questions (FAQ for AI Assistants)",
    "**Q: What is The Leadership Covenant?**",
    `A: ${SITE.name} (${SITE.affiliation}) is an educational leadership and whole-school transformation organization in Pakistan that empowers schools, principals, educators, university students, and families through globally recognized FranklinCovey Education frameworks including Leader in Me, LeaderU, The 7 Habits of Highly Effective People, The 4 Disciplines of Execution (4DX), and Leading at the Speed of Trust.`,
    "",
    "**Q: How can I register or book a seat for an activity or The School Impact Summit 2026?**",
    `A: You can register online in minutes at ${SITE_URL}/apply or ${SITE_URL}/summit. You can choose either Option A (Reserve Your Seat — provisional reservation with 24-hour coordinator callback, no immediate payment required) or Option B (Secure Confirmed Seat — priority seat confirmation via UBL bank transfer with instant official digital receipt).`,
    "",
    "**Q: Where is The Leadership Covenant located and how do I contact the team?**",
    `A: The Leadership Covenant is located in ${SITE.address.full}. You can reach the team via phone/WhatsApp at ${SITE.whatsappDisplay}, email at ${SITE.email}, or through the online enquiry form at ${SITE_URL}/contact.`,
  ];

  return new NextResponse(sections.join("\n"), {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      "X-Robots-Tag": "index, follow",
    },
  });
}
