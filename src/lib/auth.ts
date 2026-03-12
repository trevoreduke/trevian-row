import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import pool from "./db";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret");

export async function createToken(userId: number) {
  return new SignJWT({ sub: String(userId) })
    .setProtectedHeader({ alg: "HS256" })
    .sign(secret);
}

export async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret);
    const userId = Number(payload.sub);
    const { rows } = await pool.query(
      "SELECT id, name, email, role, status, photo_url FROM users WHERE id = $1",
      [userId]
    );
    return rows[0] || null;
  } catch {
    return null;
  }
}
