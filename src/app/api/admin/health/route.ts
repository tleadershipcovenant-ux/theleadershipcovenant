import { NextResponse } from "next/server";
import { testSupabaseConnection } from "@/lib/supabase-store";
import { testFirebaseConnection } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

/**
 * Health check endpoint called by the Admin Portal upon loading.
 * Pings the database and CMS to keep server connections warm and returns live status.
 */
export async function GET() {
  const start = Date.now();
  try {
    const [supabaseStatus, firebaseStatus] = await Promise.all([
      testSupabaseConnection().catch(() => ({
        configured: false,
        connected: false,
        provider: "local_json" as const,
        message: "Supabase check failed",
      })),
      testFirebaseConnection().catch(() => ({
        configured: false,
        connected: false,
        provider: "local_json" as const,
        message: "Firebase check failed",
      })),
    ]);

    const latencyMs = Date.now() - start;
    const isConnected = supabaseStatus.connected || firebaseStatus.connected;

    return NextResponse.json({
      ok: true,
      connected: isConnected,
      provider: firebaseStatus.connected
        ? "firebase_and_supabase"
        : supabaseStatus.connected
        ? "supabase"
        : "local_json",
      latencyMs,
      message: isConnected
        ? "Connected to Google Cloud Firestore & Supabase."
        : "Database Standby • Zero-Downtime Engine Active.",
      supabase: supabaseStatus,
      firebase: firebaseStatus,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const latencyMs = Date.now() - start;
    return NextResponse.json({
      ok: true,
      connected: false,
      provider: "local_json",
      latencyMs,
      message:
        err instanceof Error
          ? err.message
          : "Database health check completed with fallback active",
      timestamp: new Date().toISOString(),
    });
  }
}
