import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getUser } from "@/lib/auth";

export async function GET() {
  const user = await getUser();
  if (!user || user.status !== "approved") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { rows } = await pool.query(`
    SELECT p.*, u.name AS author_name, u.photo_url AS author_photo,
      COALESCE(
        json_agg(json_build_object('emoji', r.emoji, 'user_id', r.user_id, 'user_name', ru.name))
        FILTER (WHERE r.id IS NOT NULL), '[]'
      ) AS reactions
    FROM posts p
    JOIN users u ON p.author_id = u.id
    LEFT JOIN reactions r ON r.post_id = p.id
    LEFT JOIN users ru ON r.user_id = ru.id
    GROUP BY p.id, u.name, u.photo_url
    ORDER BY p.created_at DESC
    LIMIT 50
  `);

  return NextResponse.json({ posts: rows });
}

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user || user.status !== "approved") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (user.role !== "coach" && user.role !== "coxswain") {
    return NextResponse.json({ error: "Only coaches and coxswains can post" }, { status: 403 });
  }

  const { type, title, body, image_url } = await req.json();

  const { rows } = await pool.query(
    `INSERT INTO posts (author_id, type, title, body, image_url)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [user.id, type || "update", title, body, image_url]
  );

  return NextResponse.json({ post: rows[0] }, { status: 201 });
}
