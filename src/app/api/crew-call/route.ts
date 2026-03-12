import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getUser } from "@/lib/auth";
import { sendPush } from "@/lib/push";

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user || user.status !== "approved") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (user.role !== "coach" && user.role !== "coxswain") {
    return NextResponse.json({ error: "Only coaches and coxswains can send crew calls" }, { status: 403 });
  }

  const { boat_id, message } = await req.json();
  if (!boat_id) {
    return NextResponse.json({ error: "Boat required" }, { status: 400 });
  }

  // Get boat name
  const boatRes = await pool.query("SELECT name FROM boats WHERE id = $1", [boat_id]);
  if (!boatRes.rows.length) {
    return NextResponse.json({ error: "Boat not found" }, { status: 404 });
  }
  const boatName = boatRes.rows[0].name;

  // Save the crew call
  await pool.query(
    "INSERT INTO crew_calls (boat_id, sender_id, message) VALUES ($1, $2, $3)",
    [boat_id, user.id, message || `${boatName} — get to the dock!`]
  );

  // Get all members of this boat with push subscriptions
  const { rows: members } = await pool.query(`
    SELECT u.id, u.push_subscription FROM users u
    JOIN boat_members bm ON bm.user_id = u.id
    WHERE bm.boat_id = $1 AND u.push_subscription IS NOT NULL
  `, [boat_id]);

  // Send push to each member
  let sent = 0;
  for (const member of members) {
    const result = await sendPush(member.push_subscription, {
      title: `🚣 ${boatName}`,
      body: message || `${boatName} — get to the dock NOW!`,
      tag: `crew-call-${boat_id}`,
    });
    if (result.expired) {
      await pool.query("UPDATE users SET push_subscription = NULL WHERE id = $1", [member.id]);
    } else {
      sent++;
    }
  }

  return NextResponse.json({ ok: true, sent, total: members.length });
}

export async function GET() {
  const user = await getUser();
  if (!user || user.status !== "approved") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { rows } = await pool.query(`
    SELECT cc.*, b.name AS boat_name, u.name AS sender_name
    FROM crew_calls cc
    JOIN boats b ON cc.boat_id = b.id
    JOIN users u ON cc.sender_id = u.id
    ORDER BY cc.sent_at DESC
    LIMIT 20
  `);

  return NextResponse.json({ calls: rows });
}
