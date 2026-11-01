import { NextRequest, NextResponse } from "next/server";
import { EVENTS, type LeadershipEvent } from "@/content/events";
import { getActivityPricing } from "@/content/pricing";
import { authenticateAdminRequest } from "@/lib/admin-auth";
import { deleteCloudinaryAsset } from "@/lib/cloudinary";
import { formatBookingReference } from "@/lib/receipt";
import {
  createActivityRegistration,
  deleteActivityRegistration,
  getCmsPage,
  listActivityRegistrations,
  updateActivityRegistration,
  type BookingModeType,
  type VerificationStatus,
} from "@/lib/supabase-store";

function generateRefToken(len = 5): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => chars[b % chars.length])
    .join("");
}

export async function GET(req: NextRequest) {
  const session = await authenticateAdminRequest(req);
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const [registrations, eventsPage] = await Promise.all([
    listActivityRegistrations(),
    getCmsPage("events"),
  ]);

  const activities = Array.isArray(eventsPage?.content?.events)
    ? (eventsPage.content.events as LeadershipEvent[])
    : EVENTS;

  return NextResponse.json({
    ok: true,
    registrations,
    activities,
  });
}

export async function POST(req: NextRequest) {
  const session = await authenticateAdminRequest(req);
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const fullName = String(body?.full_name || "").trim();
    const email = String(body?.email || "").trim();
    const phone = String(body?.phone || "").trim();
    const role = String(body?.role || "").trim();
    const activitySlug = String(body?.activity_slug || "").trim();

    if (!fullName || !email || !phone || !role || !activitySlug) {
      return NextResponse.json(
        {
          ok: false,
          error: "Name, email, phone, role, and activity are required.",
        },
        { status: 400 }
      );
    }

    const pricing = getActivityPricing(activitySlug);
    const defaultFee = pricing.hasPricing
      ? pricing.isEarlyBirdActive && pricing.discountPercent
        ? `${pricing.formattedPayablePrice} (Early Bird ${pricing.discountPercent}% Off)`
        : pricing.formattedPayablePrice
      : "";

    const created = await createActivityRegistration({
      reference_code: formatBookingReference(generateRefToken(5)),
      submission_type: "application",
      full_name: fullName,
      email,
      phone,
      role,
      organization: String(body?.organization || ""),
      activity_slug: activitySlug,
      booking_mode:
        body?.booking_mode === "secure_seat" ? "secure_seat" : "reserve_later",
      payment_method: "ubl",
      fee_label: String(body?.fee_label || defaultFee || ""),
      transaction_ref: String(body?.transaction_ref || ""),
      screenshot_url: String(body?.screenshot_url || ""),
      screenshot_public_id: String(body?.screenshot_public_id || ""),
      screenshot_name: String(body?.screenshot_name || ""),
      verification_status: body?.verification_status as
        | VerificationStatus
        | undefined,
      message: String(body?.message || ""),
    });

    return NextResponse.json({ ok: true, registration: created }, { status: 201 });
  } catch (err: unknown) {
    console.error("[ADMIN REGISTRATIONS POST ERROR]", err);
    return NextResponse.json(
      { ok: false, error: "Failed to create registration." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const session = await authenticateAdminRequest(req);
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const id = String(body?.id || "").trim();
    if (!id) {
      return NextResponse.json(
        { ok: false, error: "Registration ID is required." },
        { status: 400 }
      );
    }

    const patch: {
      verification_status?: VerificationStatus;
      booking_mode?: BookingModeType;
      transaction_ref?: string;
      fee_label?: string;
      admin_notes?: string;
      screenshot_url?: string;
      screenshot_public_id?: string;
      screenshot_name?: string;
    } = {};

    if (
      body.verification_status &&
      [
        "pending_callback",
        "awaiting_verification",
        "verified_confirmed",
        "waitlisted",
        "cancelled",
      ].includes(body.verification_status)
    ) {
      patch.verification_status = body.verification_status;
    }

    if (
      body.booking_mode &&
      ["reserve_later", "secure_seat"].includes(body.booking_mode)
    ) {
      patch.booking_mode = body.booking_mode;
    }

    if (typeof body.transaction_ref === "string") {
      patch.transaction_ref = body.transaction_ref;
    }
    if (typeof body.fee_label === "string") {
      patch.fee_label = body.fee_label;
    }
    if (typeof body.admin_notes === "string") {
      patch.admin_notes = body.admin_notes;
    }
    if (typeof body.screenshot_url === "string") {
      patch.screenshot_url = body.screenshot_url;
    }
    if (typeof body.screenshot_public_id === "string") {
      patch.screenshot_public_id = body.screenshot_public_id;
    }
    if (typeof body.screenshot_name === "string") {
      patch.screenshot_name = body.screenshot_name;
    }

    const updated = await updateActivityRegistration(id, patch);
    if (!updated) {
      return NextResponse.json(
        { ok: false, error: "Registration record not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, registration: updated });
  } catch (err: unknown) {
    console.error("[ADMIN REGISTRATIONS PATCH ERROR]", err);
    return NextResponse.json(
      { ok: false, error: "Failed to update registration." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const session = await authenticateAdminRequest(req);
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const id = req.nextUrl.searchParams.get("id")?.trim();
  if (!id) {
    return NextResponse.json(
      { ok: false, error: "Registration ID is required." },
      { status: 400 }
    );
  }

  const deleted = await deleteActivityRegistration(id);
  if (deleted?.screenshot_public_id) {
    await deleteCloudinaryAsset(deleted.screenshot_public_id);
  }

  return NextResponse.json({ ok: Boolean(deleted) });
}

