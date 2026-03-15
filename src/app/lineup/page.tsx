"use client";
import { useState } from "react";
import AppShell from "@/components/AppShell";
import { useAuth } from "@/lib/useAuth";
import {
  ERG_ATHLETES_2026,
  ErgAthlete,
  OptimizeMode,
  avgSplit,
  athleteProfile,
  fadeScore,
  suggestLineup,
  splitToSecs,
} from "@/lib/erg-data";

// ── Sparkline: 4-split pace curve ────────────────────────────────────────────
// Y-axis: faster (lower seconds) = higher on screen
const SPARK_Y_MIN = 94;  // 1:34.0 — slightly below fastest split seen
const SPARK_Y_MAX = 113; // 1:53.0 — slightly above slowest split seen
const SPARK_W = 52;
const SPARK_H = 16;

const SPARK_COLOR: Record<string, string> = {
  sprint:    "#eab308", // yellow
  endurance: "#8b5cf6", // purple
  balanced:  "#9ca3af", // gray
};

function SparkLine({ athlete }: { athlete: ErgAthlete }) {
  const profile = athleteProfile(athlete);
  const color = SPARK_COLOR[profile];

  const pts = athlete.splits.map((s, i) => {
    const secs = Math.max(SPARK_Y_MIN, Math.min(SPARK_Y_MAX, splitToSecs(s)));
    const x = (i / 3) * SPARK_W;
    // invert y: faster = lower secs = higher position
    const y = SPARK_H - ((SPARK_Y_MAX - secs) / (SPARK_Y_MAX - SPARK_Y_MIN)) * SPARK_H;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  return (
    <svg width={SPARK_W} height={SPARK_H} viewBox={`0 0 ${SPARK_W} ${SPARK_H}`} className="flex-shrink-0">
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ── Speed bar ─────────────────────────────────────────────────────────────────
const MIN_SPLIT_SECS = splitToSecs(ERG_ATHLETES_2026[0].splitAvg);
const MAX_SPLIT_SECS = splitToSecs(ERG_ATHLETES_2026[ERG_ATHLETES_2026.length - 1].splitAvg);

function speedBarPct(athlete: ErgAthlete): number {
  const secs = splitToSecs(athlete.splitAvg);
  return ((MAX_SPLIT_SECS - secs) / (MAX_SPLIT_SECS - MIN_SPLIT_SECS)) * 100;
}

const BAR_COLOR = (rank: number) =>
  rank <= 8  ? "bg-amber-400" :
  rank <= 16 ? "bg-blue-400"  : "bg-slate-300";

type BoatSize = 8 | 4;

interface Boat {
  id: string;
  name: string;
  size: BoatSize;
  members: string[];
}

const BOAT_STYLES = [
  {
    active: "border-blue-500 bg-blue-50",
    inactive: "border-gray-200 bg-white",
    sizeSel: "bg-blue-900 text-white",
    tag: "bg-blue-100 text-blue-800",
    rowBorder: "border-blue-400 bg-blue-50",
    banner: "bg-blue-900 text-white",
  },
  {
    active: "border-red-500 bg-red-50",
    inactive: "border-gray-200 bg-white",
    sizeSel: "bg-red-700 text-white",
    tag: "bg-red-100 text-red-800",
    rowBorder: "border-red-400 bg-red-50",
    banner: "bg-red-700 text-white",
  },
  {
    active: "border-emerald-500 bg-emerald-50",
    inactive: "border-gray-200 bg-white",
    sizeSel: "bg-emerald-700 text-white",
    tag: "bg-emerald-100 text-emerald-800",
    rowBorder: "border-emerald-400 bg-emerald-50",
    banner: "bg-emerald-700 text-white",
  },
];

const MODES: { id: OptimizeMode; icon: string; label: string; desc: string }[] = [
  {
    id: "overall",
    icon: "⚡",
    label: "Best Overall",
    desc: "Top rowers by 2k avg split — pure speed ranking",
  },
  {
    id: "sprint",
    icon: "🚀",
    label: "Sprint",
    desc: "Favors fast 500m starters — best for short races & sprints",
  },
  {
    id: "endurance",
    icon: "💪",
    label: "Endurance",
    desc: "Favors consistent/negative splits — best for long pieces",
  },
];

const PROFILE_BADGE: Record<string, string> = {
  sprint: "🚀",
  endurance: "💪",
  balanced: "",
};

export default function LineupPage() {
  const { user } = useAuth();
  const [boats, setBoats] = useState<Boat[]>([
    { id: "1", name: "Varsity 8+", size: 8, members: [] },
    { id: "2", name: "JV 8+", size: 8, members: [] },
  ]);
  const [activeId, setActiveId] = useState("1");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showOptimizer, setShowOptimizer] = useState(false);
  const [selectedMode, setSelectedMode] = useState<OptimizeMode>("overall");

  if (!user || (user.role !== "coach" && user.role !== "coxswain")) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh] text-gray-400">
          Coaches and coxswains only
        </div>
      </AppShell>
    );
  }

  const activeBoat = boats.find((b) => b.id === activeId)!;
  const activeIdx = boats.findIndex((b) => b.id === activeId);
  const activePalette = BOAT_STYLES[activeIdx % BOAT_STYLES.length];

  function whichBoat(name: string): Boat | null {
    return boats.find((b) => b.members.includes(name)) ?? null;
  }

  function toggleAthlete(name: string) {
    const existing = whichBoat(name);
    if (existing) {
      setBoats((prev) =>
        prev.map((b) =>
          b.id === existing.id ? { ...b, members: b.members.filter((m) => m !== name) } : b
        )
      );
    } else {
      if (activeBoat.members.length >= activeBoat.size) return;
      setBoats((prev) =>
        prev.map((b) =>
          b.id === activeId ? { ...b, members: [...b.members, name] } : b
        )
      );
    }
  }

  function clearBoat(id: string) {
    setBoats((prev) => prev.map((b) => (b.id === id ? { ...b, members: [] } : b)));
  }

  function updateBoat(id: string, changes: Partial<Boat>) {
    setBoats((prev) => prev.map((b) => (b.id === id ? { ...b, ...changes } : b)));
  }

  function addBoat() {
    const id = String(Date.now());
    setBoats((prev) => [...prev, { id, name: `Boat ${prev.length + 1}`, size: 8, members: [] }]);
    setActiveId(id);
  }

  // Apply suggested lineup to the active boat
  function applyOptimizer() {
    const otherBoatMembers = boats
      .filter((b) => b.id !== activeId)
      .flatMap((b) => b.members);
    const suggested = suggestLineup(selectedMode, activeBoat.size, otherBoatMembers);
    setBoats((prev) =>
      prev.map((b) =>
        b.id === activeId ? { ...b, members: suggested.map((a) => a.name) } : b
      )
    );
    setShowOptimizer(false);
  }

  // Preview for selected mode (excludes other boats' members)
  const otherBoatMembers = boats.filter((b) => b.id !== activeId).flatMap((b) => b.members);
  const preview = suggestLineup(selectedMode, activeBoat.size, otherBoatMembers);

  const assignedCount = boats.reduce((s, b) => s + b.members.length, 0);

  return (
    <AppShell>
      <div className="max-w-lg mx-auto px-4 pt-4 pb-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Lineup Builder</h1>
            <p className="text-xs text-gray-400 mt-0.5">Spring 2026 · 2k Erg Rankings</p>
          </div>
          <button
            onClick={() => setShowOptimizer(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-700 transition-colors"
          >
            <span>✨</span> Suggest
          </button>
        </div>

        {/* Boat cards */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
          {boats.map((boat, idx) => {
            const palette = BOAT_STYLES[idx % BOAT_STYLES.length];
            const isActive = boat.id === activeId;
            const boatAvg = avgSplit(boat.members);
            const slots = Array.from({ length: boat.size });

            return (
              <div
                key={boat.id}
                onClick={() => setActiveId(boat.id)}
                className={`flex-shrink-0 w-48 rounded-2xl border-2 p-3 cursor-pointer transition-all select-none ${
                  isActive ? palette.active + " shadow-sm" : palette.inactive
                }`}
              >
                {/* Name */}
                <div className="flex items-center gap-1 mb-2">
                  {editingId === boat.id ? (
                    <input
                      autoFocus
                      value={boat.name}
                      onChange={(e) => updateBoat(boat.id, { name: e.target.value })}
                      onBlur={() => setEditingId(null)}
                      onKeyDown={(e) => e.key === "Enter" && setEditingId(null)}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 text-sm font-bold border-b border-gray-400 outline-none bg-transparent"
                    />
                  ) : (
                    <>
                      <span className="flex-1 font-bold text-sm text-gray-900 truncate">
                        {boat.name}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingId(boat.id); }}
                        className="text-gray-300 hover:text-gray-500 text-xs"
                      >
                        ✏️
                      </button>
                    </>
                  )}
                </div>

                {/* Size toggle */}
                <div className="flex gap-1 mb-3" onClick={(e) => e.stopPropagation()}>
                  {([8, 4] as BoatSize[]).map((sz) => (
                    <button
                      key={sz}
                      onClick={() => updateBoat(boat.id, { size: sz, members: boat.members.slice(0, sz) })}
                      className={`flex-1 text-xs py-0.5 rounded-lg font-bold transition-colors ${
                        boat.size === sz ? palette.sizeSel : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {sz}+
                    </button>
                  ))}
                </div>

                {/* Avg split */}
                <div className="text-center mb-3">
                  <div className="text-2xl font-black text-gray-900">{boatAvg ?? "—"}</div>
                  <div className="text-xs text-gray-400">{boat.members.length}/{boat.size} · avg split</div>
                </div>

                {/* Seat list */}
                <div className="space-y-0.5">
                  {slots.map((_, i) => {
                    const name = boat.members[i];
                    const athlete = name ? ERG_ATHLETES_2026.find((a) => a.name === name) : null;
                    return (
                      <div
                        key={i}
                        className={`flex items-center gap-1.5 rounded-lg px-1.5 py-0.5 ${
                          athlete ? "bg-white bg-opacity-60" : ""
                        }`}
                      >
                        <span className="text-xs text-gray-400 w-3 text-right font-mono">{i + 1}</span>
                        {athlete ? (
                          <>
                            <span className="flex-1 text-xs font-semibold text-gray-800 truncate">
                              {athlete.last}
                            </span>
                            <span className="text-xs font-mono text-gray-500">{athlete.splitAvg}</span>
                          </>
                        ) : (
                          <span className="text-xs text-gray-300 italic">empty</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {boat.members.length > 0 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); clearBoat(boat.id); }}
                    className="mt-2 w-full text-xs text-gray-400 hover:text-red-500 transition-colors py-0.5"
                  >
                    Clear all
                  </button>
                )}
              </div>
            );
          })}

          {boats.length < BOAT_STYLES.length && (
            <button
              onClick={addBoat}
              className="flex-shrink-0 w-14 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center text-2xl text-gray-300 hover:border-blue-300 hover:text-blue-400 transition-colors"
            >
              +
            </button>
          )}
        </div>

        {/* Active boat banner */}
        <div className={`text-sm text-center py-2 rounded-xl font-medium ${activePalette.banner}`}>
          Tap a rower to add to <span className="font-black">{activeBoat.name}</span>
          {activeBoat.members.length >= activeBoat.size && (
            <span className="ml-1 opacity-75">(full — tap to remove)</span>
          )}
        </div>

        {/* Roster */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Erg Rankings
            </h2>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              {/* Mini legend for sparkline */}
              <span className="flex items-center gap-1">
                <svg width="22" height="10" viewBox="0 0 22 10">
                  <polyline points="0,8 7,4 14,2 21,1" fill="none" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                endurance
              </span>
              <span className="flex items-center gap-1">
                <svg width="22" height="10" viewBox="0 0 22 10">
                  <polyline points="0,1 7,2 14,5 21,9" fill="none" stroke="#eab308" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                sprint
              </span>
              <span>{assignedCount} assigned</span>
            </div>
          </div>

          {ERG_ATHLETES_2026.map((athlete) => {
            const inBoat = whichBoat(athlete.name);
            const inBoatIdx = inBoat ? boats.findIndex((b) => b.id === inBoat.id) : -1;
            const inBoatPalette = inBoatIdx >= 0 ? BOAT_STYLES[inBoatIdx % BOAT_STYLES.length] : null;
            const activeFull = !inBoat && activeBoat.members.length >= activeBoat.size;
            const profile = athleteProfile(athlete);
            const fade = fadeScore(athlete);
            const barPct = speedBarPct(athlete);

            const tierStyle =
              athlete.rank <= 8
                ? "bg-amber-50 border-amber-200"
                : athlete.rank <= 16
                ? "bg-gray-50 border-gray-200"
                : "bg-white border-gray-100";

            return (
              <button
                key={athlete.name}
                onClick={() => toggleAthlete(athlete.name)}
                disabled={activeFull && !inBoat}
                className={`w-full flex flex-col gap-1.5 px-3 pt-2.5 pb-2 rounded-xl border-2 transition-all text-left ${
                  activeFull && !inBoat
                    ? tierStyle + " opacity-35 cursor-not-allowed"
                    : inBoatPalette
                    ? inBoatPalette.rowBorder
                    : tierStyle + " hover:border-blue-300 active:scale-[0.98]"
                }`}
              >
                {/* Top row: rank | name | sparkline | split | boat tag */}
                <div className="flex items-center gap-2">
                  {/* Rank */}
                  <span
                    className={`text-xs font-black w-5 text-center flex-shrink-0 ${
                      athlete.rank <= 8
                        ? "text-amber-500"
                        : athlete.rank <= 16
                        ? "text-gray-500"
                        : "text-gray-300"
                    }`}
                  >
                    {athlete.rank}
                  </span>

                  {/* Name */}
                  <span className="flex-1 font-semibold text-gray-900 text-sm min-w-0 truncate">
                    {athlete.last}
                    <span className="font-normal text-gray-500">, {athlete.first[0]}.</span>
                  </span>

                  {/* Sparkline — pace curve across 4 splits */}
                  <span title={`${athlete.splits.join(" → ")}  (${profile}: fade ${fade > 0 ? "+" : ""}${fade.toFixed(1)}s)`}>
                    <SparkLine athlete={athlete} />
                  </span>

                  {/* Split avg */}
                  <span className="font-mono text-sm text-gray-700 tabular-nums flex-shrink-0">
                    {athlete.splitAvg}
                  </span>

                  {/* Boat tag or spacer */}
                  {inBoatPalette ? (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0 ${inBoatPalette.tag}`}>
                      {inBoat!.name.split(" ")[0]}
                    </span>
                  ) : (
                    <span className="w-12 flex-shrink-0" />
                  )}
                </div>

                {/* Speed bar */}
                <div className="h-1 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${BAR_COLOR(athlete.rank)}`}
                    style={{ width: `${barPct}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Optimizer Modal */}
      {showOptimizer && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-t-3xl w-full max-w-lg p-5 space-y-4 pb-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-gray-900">Suggest Lineup</h2>
              <button
                onClick={() => setShowOptimizer(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <p className="text-sm text-gray-500">
              Auto-fill <span className="font-bold text-gray-700">{activeBoat.name}</span> based on erg data.
              Rowers already in other boats are excluded.
            </p>

            {/* Mode selection */}
            <div className="space-y-2">
              {MODES.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setSelectedMode(mode.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-colors ${
                    selectedMode === mode.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <span className="text-2xl">{mode.icon}</span>
                  <div className="flex-1">
                    <div className="font-bold text-gray-900 text-sm">{mode.label}</div>
                    <div className="text-xs text-gray-500">{mode.desc}</div>
                  </div>
                  {selectedMode === mode.id && (
                    <span className="text-blue-500 text-lg">✓</span>
                  )}
                </button>
              ))}
            </div>

            {/* Preview */}
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                Preview — Top {activeBoat.size}
              </div>
              <div className="space-y-1">
                {preview.map((a, i) => {
                  const fade = fadeScore(a);
                  return (
                    <div key={a.name} className="flex items-center gap-2 text-sm">
                      <span className="text-xs text-gray-400 w-4 text-right">{i + 1}</span>
                      <span className="flex-1 font-semibold text-gray-800">
                        {a.last}
                        <span className="font-normal text-gray-500">, {a.first[0]}.</span>
                      </span>
                      <SparkLine athlete={a} />
                      <span className="font-mono text-xs text-gray-500 tabular-nums w-14 text-right">
                        {a.splitAvg}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-2 pt-2 border-t border-gray-200 text-center text-xs text-gray-500">
                Projected avg:{" "}
                <span className="font-black text-gray-800">
                  {avgSplit(preview.map((a) => a.name)) ?? "—"}
                </span>
              </div>
            </div>

            {/* Apply button */}
            <button
              onClick={applyOptimizer}
              className="w-full py-3 bg-gray-900 text-white font-black rounded-xl text-base hover:bg-gray-700 transition-colors"
            >
              Fill {activeBoat.name} with {MODES.find((m) => m.id === selectedMode)?.label}
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
