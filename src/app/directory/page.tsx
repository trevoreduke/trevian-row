"use client";
import { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";

interface Member {
  id: number;
  name: string;
  email: string;
  role: string;
  photo_url: string | null;
  boats: string[];
}

const roleColors: Record<string, string> = {
  coach: "bg-red-100 text-red-800",
  coxswain: "bg-blue-100 text-blue-800",
  rower: "bg-gray-100 text-gray-700",
};

export default function DirectoryPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/users").then(r => r.json()).then(d => setMembers(d.users || []));
  }, []);

  const filtered = members.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell>
      <div className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black text-gray-900">Team</h1>
          <span className="text-sm text-gray-400">{members.length} members</span>
        </div>

        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
        />

        <div className="space-y-2">
          {filtered.map((member) => (
            <div key={member.id} className="bg-white rounded-xl p-4 border border-gray-100 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-900 flex items-center justify-center text-white font-bold flex-shrink-0">
                {member.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900">{member.name}</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleColors[member.role] || roleColors.rower}`}>
                    {member.role}
                  </span>
                  {member.boats.map(boat => (
                    <span key={boat} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs">
                      {boat}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              {search ? "No matches found" : "No team members yet"}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
