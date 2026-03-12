"use client";
import { useState, useEffect, useCallback } from "react";
import AppShell from "@/components/AppShell";
import { useAuth } from "@/lib/useAuth";

interface Boat {
  id: number;
  name: string;
  description: string | null;
  members: { id: number; name: string; role: string }[];
}

interface CrewCall {
  id: number;
  boat_name: string;
  sender_name: string;
  message: string;
  sent_at: string;
}

export default function CrewPage() {
  const { user } = useAuth();
  const [boats, setBoats] = useState<Boat[]>([]);
  const [calls, setCalls] = useState<CrewCall[]>([]);
  const [sending, setSending] = useState<number | null>(null);
  const [customMsg, setCustomMsg] = useState<Record<number, string>>({});
  const [sent, setSent] = useState<Record<number, { count: number; total: number } | null>>({});

  const canCall = user && (user.role === "coach" || user.role === "coxswain");

  const load = useCallback(async () => {
    const [boatsRes, callsRes] = await Promise.all([
      fetch("/api/boats"),
      fetch("/api/crew-call"),
    ]);
    if (boatsRes.ok) setBoats((await boatsRes.json()).boats);
    if (callsRes.ok) setCalls((await callsRes.json()).calls);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function sendCall(boatId: number, boatName: string) {
    setSending(boatId);
    const res = await fetch("/api/crew-call", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        boat_id: boatId,
        message: customMsg[boatId] || `${boatName} — get to the dock NOW!`,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setSent(prev => ({ ...prev, [boatId]: { count: data.sent, total: data.total } }));
      load();
    }
    setSending(null);
  }

  return (
    <AppShell>
      <div className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black text-gray-900">Crew Call</h1>
          <span className="text-2xl">📢</span>
        </div>

        {canCall && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">Tap a boat to notify its crew</p>
            {boats.map((boat) => (
              <div key={boat.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-900">{boat.name}</h3>
                    <span className="text-xs text-gray-400">{boat.members.length} members</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {boat.members.map(m => (
                      <span key={m.id} className="px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-700">
                        {m.name}
                      </span>
                    ))}
                    {boat.members.length === 0 && (
                      <span className="text-xs text-gray-400">No members assigned</span>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder={`${boat.name} — get to the dock NOW!`}
                    value={customMsg[boat.id] || ""}
                    onChange={(e) => setCustomMsg(prev => ({ ...prev, [boat.id]: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm mb-2 focus:ring-2 focus:ring-red-400 outline-none"
                  />
                  <button
                    onClick={() => sendCall(boat.id, boat.name)}
                    disabled={sending === boat.id || boat.members.length === 0}
                    className="w-full py-3 bg-red-600 text-white font-black rounded-xl text-lg hover:bg-red-700 disabled:opacity-50 transition-colors active:scale-95"
                  >
                    {sending === boat.id ? "SENDING..." : `CALL ${boat.name.toUpperCase()}`}
                  </button>
                  {sent[boat.id] && (
                    <p className="text-xs text-green-600 text-center mt-2 font-medium">
                      Sent to {sent[boat.id]!.count} of {sent[boat.id]!.total} members
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!canCall && (
          <div className="text-center py-8 text-gray-400">
            <div className="text-4xl mb-2">📢</div>
            <p>Only coaches and coxswains can send crew calls</p>
          </div>
        )}

        <div className="space-y-2">
          <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Recent Calls</h2>
          {calls.length === 0 && <p className="text-sm text-gray-400">No calls yet</p>}
          {calls.map((call) => (
            <div key={call.id} className="bg-white rounded-xl p-3 border border-gray-100 flex items-center gap-3">
              <div className="text-2xl">📢</div>
              <div className="flex-1">
                <div className="font-semibold text-sm text-gray-900">{call.boat_name}</div>
                <div className="text-xs text-gray-600">{call.message}</div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {call.sender_name} &middot; {new Date(call.sent_at).toLocaleTimeString("en-US", {
                    hour: "numeric", minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
