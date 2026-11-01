import { NextRequest, NextResponse } from "next/server";
import { authenticateAdminRequest } from "@/lib/admin-auth";
import {
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

