import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { createToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, code } = await req.json();
  if (!email || !code) {
    return NextResponse.json({ error: "Email and code required" }, { status: 400 });
  }

  const { rows } = await pool.query(
    `SELECT id, name, role, status, auth_code, auth_code_expires FROM users WHERE email = $1`,
    [email.toLowerCase().trim()]
  );

  if (!rows.length) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const user = rows[0];
  if (user.auth_code !== code || new Date(user.auth_code_expires) < new Date()) {
    return NextResponse.json({ error: "Invalid or expired code" }, { status: 401 });
  }

  // Clear the code
  await pool.query("UPDATE users SET auth_code = NULL, auth_code_expires = NULL WHERE id = $1", [user.id]);

  const token = await createToken(user.id);
  const res = NextResponse.json({
    ok: true,
    user: { id: user.id, name: user.name, role: user.role, status: user.status },
  });

  res.cookies.set("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365 * 10, // 10 years — "forever"
  });

  return res;
}
