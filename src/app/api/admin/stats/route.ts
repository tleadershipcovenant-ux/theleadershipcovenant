import { NextRequest, NextResponse } from "next/server";
import { EVENTS, type LeadershipEvent } from "@/content/events";
import { authenticateAdminRequest } from "@/lib/admin-auth";
import { getCloudinaryConfig } from "@/lib/cloudinary";
import {
  getCmsPage,
  listActivityRegistrations,
  listContactSubmissions,
  testSupabaseConnection,
} from "@/lib/supabase-store";

// In-memory deduplication cache so simultaneous dashboard + shell calls don't double-query DB
let cachedStats: {
  payload: Record<string, unknown>;
  timestamp: number;
} | null = null;
const CACHE_TTL_MS = 2500; // 2.5 seconds cache window for instant multi-component response

export async function GET(req: NextRequest) {
  const session = await authenticateAdminRequest(req);
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const forceFresh = url.searchParams.get("fresh") === "1";
  const now = Date.now();

  if (!forceFresh && cachedStats && now - cachedStats.timestamp < CACHE_TTL_MS) {
    return NextResponse.json({
      ...cachedStats.payload,
      systemHealth: {
        ...(cachedStats.payload.systemHealth as Record<string, unknown>),
        jwt: {
          email: session.email,
          expiresAt: new Date(session.exp * 1000).toISOString(),
        },
      },
    });
  }

  const [contacts, registrations, eventsCms, supabaseHealth] = await Promise.all([
    listContactSubmissions(),
    listActivityRegistrations(),
    getCmsPage("events"),
    testSupabaseConnection(),
  ]);

  const cloudinaryCfg = getCloudinaryConfig();

  const cmsEvents = Array.isArray(eventsCms?.content?.events)
    ? (eventsCms.content.events as LeadershipEvent[])
    : EVENTS;

  const contactStats = {
    total: contacts.length,
    newCount: contacts.filter((c) => c.crm_status === "new").length,
    inProgressCount: contacts.filter((c) => c.crm_status === "in_progress").length,
    respondedCount: contacts.filter((c) => c.crm_status === "responded").length,
    archivedCount: contacts.filter((c) => c.crm_status === "archived").length,
    urgentCount: contacts.filter(
      (c) => c.priority === "urgent" || c.priority === "high"
    ).length,
  };

  const registrationStats = {
    total: registrations.length,
    securedSeats: registrations.filter((r) => r.booking_mode === "secure_seat")
      .length,
    provisionalReservations: registrations.filter(
      (r) => r.booking_mode === "reserve_later"
    ).length,
    verifiedConfirmed: registrations.filter(
      (r) => r.verification_status === "verified_confirmed"
    ).length,
    awaitingVerification: registrations.filter(
      (r) => r.verification_status === "awaiting_verification"
    ).length,
    pendingCallback: registrations.filter(
      (r) => r.verification_status === "pending_callback"
    ).length,
    withScreenshots: registrations.filter((r) => Boolean(r.screenshot_url))
      .length,
  };

  // Activity-by-Activity CRM Breakdown
  const activityMap = new Map<
    string,
    {
      slug: string;
      title: string;
      city: string;
      startDate: string;
      total: number;
      reserved: number;
      secured: number;
      verified: number;
    }
  >();

  for (const ev of cmsEvents) {
    activityMap.set(ev.slug, {
      slug: ev.slug,
      title: ev.title,
      city: ev.city,
      startDate: ev.startDate,
      total: 0,
      reserved: 0,
      secured: 0,
      verified: 0,
    });
  }

  for (const reg of registrations) {
    const existing = activityMap.get(reg.activity_slug) || {
      slug: reg.activity_slug,
      title: reg.activity_title,
      city: reg.activity_city || "Islamabad",
      startDate: "",
      total: 0,
      reserved: 0,
      secured: 0,
      verified: 0,
    };
    existing.total += 1;
    if (reg.booking_mode === "secure_seat") {
      existing.secured += 1;
    } else {
      existing.reserved += 1;
    }
    if (reg.verification_status === "verified_confirmed") {
      existing.verified += 1;
    }
    activityMap.set(reg.activity_slug, existing);
  }

  const activityBreakdown = Array.from(activityMap.values()).sort(
    (a, b) => b.total - a.total
  );

  const payload = {
    ok: true,
    contactStats,
    registrationStats,
    activityBreakdown,
    recentContacts: contacts.slice(0, 6),
    recentRegistrations: registrations.slice(0, 6),
    systemHealth: {
      supabase: supabaseHealth,
      cloudinary: {
        configured: cloudinaryCfg.isConfigured,
        cloudName: cloudinaryCfg.isConfigured ? cloudinaryCfg.cloudName : null,
        folder: cloudinaryCfg.folder,
        provider: cloudinaryCfg.isConfigured ? "cloudinary" : "local_fallback",
      },
      jwt: {
        email: session.email,
        expiresAt: new Date(session.exp * 1000).toISOString(),
      },
    },
  };

  // Save in micro-cache
  cachedStats = {
    payload,
    timestamp: now,
  };

  return NextResponse.json(payload);
}
