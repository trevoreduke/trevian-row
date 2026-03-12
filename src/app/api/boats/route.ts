import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getUser } from "@/lib/auth";

export async function GET() {
  const user = await getUser();
  if (!user || user.status !== "approved") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { rows } = await pool.query(`
    SELECT b.*,
      COALESCE(
        json_agg(json_build_object('id', u.id, 'name', u.name, 'role', u.role, 'photo_url', u.photo_url))
        FILTER (WHERE u.id IS NOT NULL), '[]'
      ) AS members
    FROM boats b
    LEFT JOIN boat_members bm ON bm.boat_id = b.id
    LEFT JOIN users u ON bm.user_id = u.id
    GROUP BY b.id
    ORDER BY b.name
  `);

  return NextResponse.json({ boats: rows });
}

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user || user.role !== "coach") {
    return NextResponse.json({ error: "Coaches only" }, { status: 403 });
  }

  const { name, description, member_ids } = await req.json();
  const { rows } = await pool.query(
    "INSERT INTO boats (name, description) VALUES ($1, $2) RETURNING *",
    [name, description]
  );

  const boat = rows[0];
  if (member_ids?.length) {
    const values = member_ids.map((_: number, i: number) => `($1, $${i + 2})`).join(",");
    await pool.query(
      `INSERT INTO boat_members (boat_id, user_id) VALUES ${values} ON CONFLICT DO NOTHING`,
      [boat.id, ...member_ids]
    );
  }

  return NextResponse.json({ boat }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const user = await getUser();
  if (!user || user.role !== "coach") {
    return NextResponse.json({ error: "Coaches only" }, { status: 403 });
  }

  const { id, name, description, member_ids } = await req.json();

  await pool.query("UPDATE boats SET name = COALESCE($2, name), description = COALESCE($3, description) WHERE id = $1", [id, name, description]);

  if (member_ids !== undefined) {
    await pool.query("DELETE FROM boat_members WHERE boat_id = $1", [id]);
    if (member_ids.length) {
      const values = member_ids.map((_: number, i: number) => `($1, $${i + 2})`).join(",");
      await pool.query(
        `INSERT INTO boat_members (boat_id, user_id) VALUES ${values}`,
        [id, ...member_ids]
      );
    }
  }

  return NextResponse.json({ ok: true });
}
