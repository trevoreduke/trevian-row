"use client";
import { useState, useEffect, useCallback } from "react";
import AppShell from "@/components/AppShell";
import { useAuth } from "@/lib/useAuth";

interface PendingUser {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

interface Boat {
  id: number;
  name: string;
  description: string | null;
  members: { id: number; name: string; role: string }[];
}

interface TeamMember {
  id: number;
  name: string;
  role: string;
}

export default function AdminPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"approvals" | "boats">("approvals");
  const [pending, setPending] = useState<PendingUser[]>([]);
  const [boats, setBoats] = useState<Boat[]>([]);
  const [allMembers, setAllMembers] = useState<TeamMember[]>([]);
  const [newBoatName, setNewBoatName] = useState("");
  const [editingBoat, setEditingBoat] = useState<number | null>(null);
  const [editMembers, setEditMembers] = useState<number[]>([]);

  const load = useCallback(async () => {
    const [pRes, bRes, uRes] = await Promise.all([
      fetch("/api/users/pending"),
      fetch("/api/boats"),
      fetch("/api/users"),
    ]);
    if (pRes.ok) setPending((await pRes.json()).users);
    if (bRes.ok) setBoats((await bRes.json()).boats);
    if (uRes.ok) setAllMembers((await uRes.json()).users);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function approve(userId: number, role: string) {
    await fetch("/api/users/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, role }),
    });
    load();
  }

  async function deny(userId: number) {
    await fetch("/api/users/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, deny: true }),
    });
    load();
  }

  async function createBoat() {
    if (!newBoatName.trim()) return;
    await fetch("/api/boats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newBoatName }),
    });
    setNewBoatName("");
    load();
  }

  async function saveBoatMembers(boatId: number) {
    await fetch("/api/boats", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: boatId, member_ids: editMembers }),
    });
    setEditingBoat(null);
    load();
  }

  function startEditMembers(boat: Boat) {
    setEditingBoat(boat.id);
    setEditMembers(boat.members.map(m => m.id));
  }

  function toggleMember(id: number) {
    setEditMembers(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
  }

  if (user?.role !== "coach") {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh] text-gray-400">
          Coaches only
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        <h1 className="text-2xl font-black text-gray-900">Admin</h1>

        <div className="flex gap-2">
          <button
            onClick={() => setTab("approvals")}
            className={`flex-1 py-2 rounded-xl text-sm font-bold transition-colors ${
              tab === "approvals" ? "bg-blue-900 text-white" : "bg-gray-100 text-gray-600"
            }`}
          >
            Approvals {pending.length > 0 && `(${pending.length})`}
          </button>
          <button
            onClick={() => setTab("boats")}
            className={`flex-1 py-2 rounded-xl text-sm font-bold transition-colors ${
              tab === "boats" ? "bg-blue-900 text-white" : "bg-gray-100 text-gray-600"
            }`}
          >
            Boats
          </button>
        </div>

        {tab === "approvals" && (
          <div className="space-y-3">
            {pending.length === 0 && (
              <div className="text-center py-8 text-gray-400">No pending approvals</div>
            )}
            {pending.map((u) => (
              <div key={u.id} className="bg-white rounded-xl p-4 border border-gray-100">
                <div className="font-semibold text-gray-900">{u.name}</div>
                <div className="text-sm text-gray-500 mb-3">{u.email}</div>
                <div className="flex gap-2">
                  <button onClick={() => approve(u.id, "rower")} className="flex-1 py-2 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700">
                    Rower
                  </button>
                  <button onClick={() => approve(u.id, "coxswain")} className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700">
                    Coxswain
                  </button>
                  <button onClick={() => approve(u.id, "coach")} className="flex-1 py-2 bg-purple-600 text-white rounded-xl text-sm font-bold hover:bg-purple-700">
                    Coach
                  </button>
                  <button onClick={() => deny(u.id)} className="py-2 px-3 bg-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-300">
                    Deny
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "boats" && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="New boat name (e.g. Varsity 8+)"
                value={newBoatName}
                onChange={(e) => setNewBoatName(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                onKeyDown={(e) => e.key === "Enter" && createBoat()}
              />
              <button onClick={createBoat} className="px-4 py-2 bg-blue-900 text-white rounded-xl text-sm font-bold hover:bg-blue-800">
                Add
              </button>
            </div>

            {boats.map((boat) => (
              <div key={boat.id} className="bg-white rounded-xl p-4 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-gray-900">{boat.name}</h3>
                  <button
                    onClick={() => editingBoat === boat.id ? saveBoatMembers(boat.id) : startEditMembers(boat)}
                    className="text-sm text-blue-600 font-medium"
                  >
                    {editingBoat === boat.id ? "Save" : "Edit Members"}
                  </button>
                </div>

                {editingBoat === boat.id ? (
                  <div className="flex flex-wrap gap-1.5">
                    {allMembers.map(m => {
                      const selected = editMembers.includes(m.id);
                      return (
                        <button
                          key={m.id}
                          onClick={() => toggleMember(m.id)}
                          className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                            selected ? "bg-blue-900 text-white" : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {m.name}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {boat.members.map(m => (
                      <span key={m.id} className="px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-700">
                        {m.name}
                      </span>
                    ))}
                    {boat.members.length === 0 && (
                      <span className="text-xs text-gray-400">No members — tap Edit Members to add</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
