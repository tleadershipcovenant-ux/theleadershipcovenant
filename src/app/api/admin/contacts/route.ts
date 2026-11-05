import { NextRequest, NextResponse } from "next/server";
import { authenticateAdminRequest } from "@/lib/admin-auth";
import {
  createContactSubmission,
  deleteContactSubmission,
  listContactSubmissions,
  updateContactSubmission,
  type ContactCrmStatus,
  type ContactPriority,
} from "@/lib/supabase-store";

export async function GET(req: NextRequest) {
  const session = await authenticateAdminRequest(req);
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const contacts = await listContactSubmissions();
  return NextResponse.json({ ok: true, contacts });
}

export async function POST(req: NextRequest) {
  const session = await authenticateAdminRequest(req);
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const full_name = String(body?.full_name || "").trim();
    const email = String(body?.email || "").trim();
    const organization = String(body?.organization || "").trim();
    const address_with_city = String(body?.address_with_city || "").trim();
    const message = String(body?.message || "").trim();
    const phone = String(body?.phone || "").trim();
    const interest = String(body?.interest || "general").trim();
    const priority = (body?.priority || "normal") as ContactPriority;
    const crm_status = (body?.crm_status || "new") as ContactCrmStatus;
    const admin_notes = String(body?.admin_notes || "").trim();

    if (!full_name || !email) {
      return NextResponse.json(
        { ok: false, error: "Full Name and Email are required." },
        { status: 400 }
      );
    }

    const ref = `TLC-INQ-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const newContact = await createContactSubmission({
      reference_code: ref,
      full_name,
      email,
      phone,
      organization: organization || "Independent",
      address_with_city,
      interest,
      message: message || "Direct inbound contact inquiry",
    });

    if (priority !== "normal" || crm_status !== "new" || admin_notes) {
      const updated = await updateContactSubmission(newContact.id, {
        priority,
        crm_status,
        admin_notes,
      });
      return NextResponse.json({ ok: true, contact: updated || newContact });
    }

    return NextResponse.json({ ok: true, contact: newContact });
  } catch (err: unknown) {
    console.error("[ADMIN CONTACTS POST ERROR]", err);
    return NextResponse.json(
      { ok: false, error: "Failed to create contact record." },
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
        { ok: false, error: "Record ID is required." },
        { status: 400 }
      );
    }

    const patch: {
      crm_status?: ContactCrmStatus;
      priority?: ContactPriority;
      admin_notes?: string;
    } = {};

    if (
      body.crm_status &&
      ["new", "in_progress", "responded", "archived"].includes(body.crm_status)
    ) {
      patch.crm_status = body.crm_status;
    }
    if (
      body.priority &&
      ["low", "normal", "high", "urgent"].includes(body.priority)
    ) {
      patch.priority = body.priority;
    }
    if (typeof body.admin_notes === "string") {
      patch.admin_notes = body.admin_notes;
    }

    const updated = await updateContactSubmission(id, patch);
    if (!updated) {
      return NextResponse.json(
        { ok: false, error: "Contact record not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, contact: updated });
  } catch (err: unknown) {
    console.error("[ADMIN CONTACTS PATCH ERROR]", err);
    return NextResponse.json(
      { ok: false, error: "Failed to update contact record." },
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
      { ok: false, error: "Record ID is required." },
      { status: 400 }
    );
  }

  const deleted = await deleteContactSubmission(id);
  return NextResponse.json({ ok: deleted });
}

