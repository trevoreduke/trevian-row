import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getUser } from "@/lib/auth";

export async function GET() {
  const user = await getUser();
  if (!user || user.role !== "coach") {
    return NextResponse.json({ error: "Coaches only" }, { status: 403 });
  }

  const { rows } = await pool.query(
    "SELECT id, name, email, created_at FROM users WHERE status = 'pending' ORDER BY created_at DESC"
  );

  return NextResponse.json({ users: rows });
}
