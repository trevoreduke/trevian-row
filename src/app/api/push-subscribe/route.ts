import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const subscription = await req.json();
  await pool.query("UPDATE users SET push_subscription = $1 WHERE id = $2", [
    JSON.stringify(subscription),
    user.id,
  ]);

  return NextResponse.json({ ok: true });
}
