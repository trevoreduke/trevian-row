import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(req: NextRequest) {
  const { email, name } = await req.json();
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  // Generate 6-digit code
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 min

  // Upsert user
  await pool.query(
    `INSERT INTO users (email, name, auth_code, auth_code_expires)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO UPDATE SET auth_code = $3, auth_code_expires = $4`,
    [email.toLowerCase().trim(), name || email.split("@")[0], code, expires]
  );

  // Send via SendGrid
  const sgRes = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: email.toLowerCase().trim() }] }],
      from: { email: process.env.SENDGRID_FROM, name: "Trevian Oar" },
      subject: `Your login code: ${code}`,
      content: [
        {
          type: "text/html",
          value: `<div style="font-family:sans-serif;max-width:400px;margin:0 auto;text-align:center;padding:40px 20px">
            <h2 style="color:#1a365d">🚣 Trevian Oar</h2>
            <p>Your login code is:</p>
            <div style="font-size:36px;font-weight:bold;letter-spacing:8px;padding:20px;background:#f0f4f8;border-radius:12px;margin:20px 0">${code}</div>
            <p style="color:#666;font-size:14px">This code expires in 10 minutes.</p>
          </div>`,
        },
      ],
    }),
  });

  if (!sgRes.ok) {
    console.error("SendGrid error:", await sgRes.text());
    return NextResponse.json({ error: "Failed to send code" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
