import { NextResponse } from "next/server";
import { testSupabaseConnection } from "@/lib/supabase-store";

export const dynamic = "force-dynamic";

/**
 * Health check endpoint called by the Admin Portal upon loading.
 * Pings the database to keep server connections warm and returns live status.
 */
export async function GET() {
  const start = Date.now();
  try {
    const status = await testSupabaseConnection();
    const latencyMs = Date.now() - start;

    return NextResponse.json({
      ok: true,
      connected: status.connected,
      provider: status.provider,
      latencyMs,
      message: status.message,
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
