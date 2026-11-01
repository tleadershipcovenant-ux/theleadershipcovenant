import { NextRequest, NextResponse } from "next/server";
import { getActivityPricing } from "@/content/pricing";
import { formatBookingReference } from "@/lib/receipt";
import {
  createActivityRegistration,
  createContactSubmission,
} from "@/lib/supabase-store";

function generateRandomToken(len = 5): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => chars[b % chars.length])
    .join("");
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // 1. Honeypot check: `website` field should never be filled by genuine users
    if (data.website && String(data.website).trim().length > 0) {
      return NextResponse.json(
        { ok: true, id: "TLC-26-BOT00" },
        { status: 201 }
      );
    }

    const {
      type,
      full_name,
      email,
      phone,
      role,
      organization,
      activity_slug,
      interest,
      message,
      booking_mode,
      payment_method,
      transaction_ref,
      screenshot_name,
      screenshot_url,
      screenshot_public_id,
      fee_label,
    } = data;

    if (!type || !["application", "summit", "contact"].includes(type)) {
      return NextResponse.json(
        { ok: false, error: "Invalid submission type" },
        { status: 400 }
      );
    }

    if (
      !full_name ||
      typeof full_name !== "string" ||
      full_name.trim().length < 2
    ) {
      return NextResponse.json(
        { ok: false, error: "Full name is required (min 2 characters)" },
        { status: 400 }
      );
    }

    if (
      !email ||
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      return NextResponse.json(
        { ok: false, error: "Valid email address is required" },
        { status: 400 }
      );
    }

    // 2. Contact Us Submission -> Save into `contact_submissions` CRM table
    if (type === "contact") {
      if (!organization || String(organization).trim().length < 2) {
        return NextResponse.json(
          { ok: false, error: "Organization is required" },
          { status: 400 }
        );
      }
      if (!phone || String(phone).trim().length < 7) {
        return NextResponse.json(
          { ok: false, error: "Valid phone number is required" },
          { status: 400 }
        );
      }
      if (!message || String(message).trim().length < 5) {
        return NextResponse.json(
          { ok: false, error: "Message is required (min 5 characters)" },
          { status: 400 }
        );
      }

      const refCode = `TLC-INQ-${generateRandomToken(5)}`;
      const saved = await createContactSubmission({
        reference_code: refCode,
        full_name,
        email,
        phone: phone ? String(phone) : "",
        organization: String(organization),
        interest: interest ? String(interest) : "general",
        message: String(message),
      });

      return NextResponse.json(
        {
          ok: true,
          id: saved.reference_code,
          recordId: saved.id,
          message:
            "Submission received successfully. Our team will contact you within one working day.",
        },
        { status: 201 }
      );
    }

    // 3. Activity Application / Summit Registration -> Save into `activity_registrations` CRM table
    if (!phone || String(phone).trim().length < 7) {
      return NextResponse.json(
        { ok: false, error: "Valid phone number is required" },
        { status: 400 }
      );
    }
    if (!role || String(role).trim().length < 2) {
      return NextResponse.json(
        { ok: false, error: "Role is required" },
        { status: 400 }
      );
    }

    const resolvedSlug =
      type === "summit"
        ? String(activity_slug || "school-impact-summit-2026")
        : String(activity_slug || "");

    if (!resolvedSlug || resolvedSlug.trim().length < 2) {
      return NextResponse.json(
        { ok: false, error: "Please select an activity" },
        { status: 400 }
      );
    }

    if (
      type === "summit" &&
      (!organization || String(organization).trim().length < 2)
    ) {
      return NextResponse.json(
        { ok: false, error: "Organization / School is required" },
        { status: 400 }
      );
    }

    const pricing = getActivityPricing(resolvedSlug);
    const computedFeeLabel =
      fee_label ||
      (pricing.hasPricing
        ? pricing.isEarlyBirdActive && pricing.discountPercent
          ? `${pricing.formattedPayablePrice} (Early Bird ${pricing.discountPercent}% Off)`
          : pricing.formattedPayablePrice
        : "");

    const refCode = formatBookingReference(generateRandomToken(5));
    const saved = await createActivityRegistration({
      reference_code: refCode,
      submission_type: type as "application" | "summit",
      full_name,
      email,
      phone: String(phone),
      role: String(role),
      organization: organization ? String(organization) : "",
      activity_slug: resolvedSlug,
      booking_mode:
        booking_mode === "secure_seat" ? "secure_seat" : "reserve_later",
      payment_method: payment_method ? String(payment_method) : "ubl",
      fee_label: computedFeeLabel,
      transaction_ref: transaction_ref ? String(transaction_ref) : "",
      screenshot_url: screenshot_url ? String(screenshot_url) : "",
      screenshot_public_id: screenshot_public_id
        ? String(screenshot_public_id)
        : "",
      screenshot_name: screenshot_name ? String(screenshot_name) : "",
      message: message ? String(message) : "",
    });

    return NextResponse.json(
      {
        ok: true,
        id: saved.reference_code,
        recordId: saved.id,
        message:
          "Registration recorded successfully. Our team will contact you within one working day.",
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error("[TLC SUBMISSION ERROR]", err);
    return NextResponse.json(
      {
        ok: false,
        error:
          "An error occurred while processing your request. Please try again.",
      },
      { status: 500 }
    );
  }
}
