import { NextResponse } from "next/server";
import pool from "@/lib/db";

// Lightweight liveness/readiness probe for the container and Cloudflare tunnel.
export async function GET() {
  try {
    await pool.query("SELECT 1");
    return NextResponse.json({ ok: true, db: "up" });
  } catch (err) {
    console.error("health check db error:", err);
    return NextResponse.json({ ok: false, db: "down" }, { status: 503 });
  }
}
