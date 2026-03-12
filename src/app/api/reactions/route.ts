import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user || user.status !== "approved") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { post_id, emoji } = await req.json();

  // Toggle: insert or delete
  const existing = await pool.query(
    "SELECT id FROM reactions WHERE post_id = $1 AND user_id = $2 AND emoji = $3",
    [post_id, user.id, emoji || "🔥"]
  );

  if (existing.rows.length) {
    await pool.query("DELETE FROM reactions WHERE id = $1", [existing.rows[0].id]);
    return NextResponse.json({ action: "removed" });
  }

  await pool.query(
    "INSERT INTO reactions (post_id, user_id, emoji) VALUES ($1, $2, $3)",
    [post_id, user.id, emoji || "🔥"]
  );

  return NextResponse.json({ action: "added" });
}
