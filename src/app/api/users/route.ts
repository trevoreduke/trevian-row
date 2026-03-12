import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getUser } from "@/lib/auth";

export async function GET() {
  const user = await getUser();
  if (!user || user.status !== "approved") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { rows } = await pool.query(`
    SELECT u.id, u.name, u.email, u.role, u.photo_url,
      COALESCE(
        json_agg(b.name ORDER BY b.name) FILTER (WHERE b.id IS NOT NULL), '[]'
      ) AS boats
    FROM users u
    LEFT JOIN boat_members bm ON bm.user_id = u.id
    LEFT JOIN boats b ON bm.boat_id = b.id
    WHERE u.status = 'approved'
    GROUP BY u.id
    ORDER BY u.name
  `);

  return NextResponse.json({ users: rows });
}
