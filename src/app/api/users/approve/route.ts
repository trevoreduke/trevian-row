import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user || user.role !== "coach") {
    return NextResponse.json({ error: "Coaches only" }, { status: 403 });
  }

  const { user_id, role, deny } = await req.json();
  if (!user_id) {
    return NextResponse.json({ error: "user_id required" }, { status: 400 });
  }

  if (deny) {
    await pool.query("UPDATE users SET status = 'denied' WHERE id = $1", [user_id]);
  } else {
    await pool.query(
      "UPDATE users SET status = 'approved', role = COALESCE($2, role) WHERE id = $1",
      [user_id, role]
    );
  }

  return NextResponse.json({ ok: true });
}
