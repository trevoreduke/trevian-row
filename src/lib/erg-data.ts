export interface ErgAthlete {
  rank: number;
  first: string;
  last: string;
  name: string;
  splitAvg: string;  // "01:37.4"
  totalTime: string; // "06:29.6"
  // Individual 500m splits: [at 500m, at 1000m, at 1500m, at 2000m]
  splits: [string, string, string, string];
}

// Spring 2026 — 2k erg test (3/10/26), ranked by avg 500m split
export const ERG_ATHLETES_2026: ErgAthlete[] = [
  { rank: 1,  first: "Mathias",   last: "Rincon",       name: "Mathias Rincon",       splitAvg: "01:37.4", totalTime: "06:29.6", splits: ["01:35.6","01:37.5","01:37.3","01:39.2"] },
  { rank: 2,  first: "Nicholas",  last: "Zettelmeyer",  name: "Nicholas Zettelmeyer", splitAvg: "01:37.4", totalTime: "06:29.8", splits: ["01:36.4","01:37.7","01:38.5","01:37.2"] },
  { rank: 3,  first: "Aidan",     last: "O'Brien",      name: "Aidan O'Brien",        splitAvg: "01:38.1", totalTime: "06:32.3", splits: ["01:37.2","01:39.5","01:39.3","01:36.5"] },
  { rank: 4,  first: "Michael",   last: "Hayek",        name: "Michael Hayek",        splitAvg: "01:38.1", totalTime: "06:32.4", splits: ["01:37.2","01:37.7","01:38.3","01:39.3"] },
  { rank: 5,  first: "Henry",     last: "Etten",        name: "Henry Etten",          splitAvg: "01:38.5", totalTime: "06:34.2", splits: ["01:40.7","01:39.3","01:37.9","01:36.4"] },
  { rank: 6,  first: "Bennett",   last: "Schulenburg",  name: "Bennett Schulenburg",  splitAvg: "01:38.7", totalTime: "06:34.8", splits: ["01:38.6","01:39.0","01:39.4","01:37.8"] },
  { rank: 7,  first: "Kevin",     last: "Lin",          name: "Kevin Lin",            splitAvg: "01:39.2", totalTime: "06:36.9", splits: ["01:39.6","01:39.8","01:39.1","01:38.4"] },
  { rank: 8,  first: "Graham",    last: "Callahan",     name: "Graham Callahan",      splitAvg: "01:39.7", totalTime: "06:39.0", splits: ["01:38.5","01:40.6","01:40.3","01:39.6"] },
  { rank: 9,  first: "Nathaniel", last: "Feeley",       name: "Nathaniel Feeley",     splitAvg: "01:39.8", totalTime: "06:39.3", splits: ["01:39.4","01:39.9","01:40.1","01:39.9"] },
  { rank: 10, first: "Henry",     last: "Sims",         name: "Henry Sims",           splitAvg: "01:40.0", totalTime: "06:40.3", splits: ["01:38.8","01:40.1","01:41.2","01:40.2"] },
  { rank: 11, first: "Adam",      last: "Dajani",       name: "Adam Dajani",          splitAvg: "01:40.4", totalTime: "06:41.6", splits: ["01:40.4","01:41.2","01:41.4","01:38.6"] },
  { rank: 12, first: "John",      last: "O'Keef",       name: "John O'Keef",          splitAvg: "01:40.4", totalTime: "06:41.7", splits: ["01:40.1","01:41.5","01:41.0","01:39.1"] },
  { rank: 13, first: "Finnegan",  last: "Babb",         name: "Finnegan Babb",        splitAvg: "01:41.7", totalTime: "06:47.0", splits: ["01:38.6","01:44.2","01:45.1","01:39.2"] },
  { rank: 14, first: "Henry",     last: "Rogers",       name: "Henry Rogers",         splitAvg: "01:41.9", totalTime: "06:47.9", splits: ["01:42.2","01:43.9","01:42.5","01:40.4"] },
  { rank: 15, first: "Nicholas",  last: "Vaez",         name: "Nicholas Vaez",        splitAvg: "01:42.2", totalTime: "06:49.1", splits: ["01:42.2","01:43.4","01:42.4","01:41.0"] },
  { rank: 16, first: "Riley",     last: "McSpedon",     name: "Riley McSpedon",       splitAvg: "01:43.1", totalTime: "06:52.5", splits: ["01:38.8","01:42.6","01:44.7","01:46.4"] },
  { rank: 17, first: "Surya",     last: "Ubaka",        name: "Surya Ubaka",          splitAvg: "01:43.3", totalTime: "06:53.3", splits: ["01:42.6","01:42.8","01:45.6","01:42.3"] },
  { rank: 18, first: "Maxwell",   last: "Zhao",         name: "Maxwell Zhao",         splitAvg: "01:43.5", totalTime: "06:54.1", splits: ["01:42.8","01:44.3","01:44.4","01:42.6"] },
  { rank: 19, first: "Eli",       last: "Ho",           name: "Eli Ho",               splitAvg: "01:44.2", totalTime: "06:56.8", splits: ["01:42.4","01:45.5","01:46.7","01:42.2"] },
  { rank: 20, first: "Dominic",   last: "Kadlec",       name: "Dominic Kadlec",       splitAvg: "01:44.5", totalTime: "06:58.2", splits: ["01:44.6","01:45.9","01:45.2","01:42.6"] },
  { rank: 21, first: "Nathan",    last: "Norris",       name: "Nathan Norris",        splitAvg: "01:44.8", totalTime: "06:59.3", splits: ["01:45.1","01:45.7","01:45.2","01:43.3"] },
  { rank: 22, first: "Elijah",    last: "Domb",         name: "Elijah Domb",          splitAvg: "01:44.9", totalTime: "06:59.9", splits: ["01:44.2","01:44.9","01:46.0","01:44.7"] },
  { rank: 23, first: "Arjun",     last: "Thakrar",      name: "Arjun Thakrar",        splitAvg: "01:44.9", totalTime: "06:59.9", splits: ["01:45.1","01:45.7","01:45.1","01:43.9"] },
  { rank: 24, first: "Ari",       last: "Staffilino",   name: "Ari Staffilino",       splitAvg: "01:45.5", totalTime: "07:02.3", splits: ["01:44.0","01:45.6","01:45.5","01:47.2"] },
  { rank: 25, first: "Sam",       last: "Knudson",      name: "Sam Knudson",          splitAvg: "01:46.1", totalTime: "07:04.6", splits: ["01:45.4","01:46.1","01:46.3","01:46.8"] },
  { rank: 26, first: "Jaymin",    last: "Knigge",       name: "Jaymin Knigge",        splitAvg: "01:46.3", totalTime: "07:05.3", splits: ["01:43.9","01:45.2","01:47.1","01:49.1"] },
  { rank: 27, first: "William",   last: "Fowler",       name: "William Fowler",       splitAvg: "01:46.6", totalTime: "07:06.4", splits: ["01:46.3","01:47.1","01:47.0","01:46.0"] },
  { rank: 28, first: "Ariyel",    last: "Rosen",        name: "Ariyel Rosen",         splitAvg: "01:47.3", totalTime: "07:09.3", splits: ["01:43.2","01:46.9","01:51.6","01:47.6"] },
  { rank: 29, first: "Jason",     last: "Paris",        name: "Jason Paris",          splitAvg: "01:48.1", totalTime: "07:12.4", splits: ["01:47.0","01:47.8","01:48.5","01:49.1"] },
  { rank: 30, first: "Liam",      last: "Dizon",        name: "Liam Dizon",           splitAvg: "01:49.7", totalTime: "07:19.1", splits: ["01:47.6","01:50.2","01:50.8","01:50.4"] },
];

export type OptimizeMode = "overall" | "sprint" | "endurance";

// fade = (2000m split) - (500m split) in seconds
// positive = sprinter (starts fast, fades), negative = endurance (gets stronger)
export function fadeScore(athlete: ErgAthlete): number {
  return splitToSecs(athlete.splits[3]) - splitToSecs(athlete.splits[0]);
}

export type AthleteProfile = "sprint" | "endurance" | "balanced";

export function athleteProfile(athlete: ErgAthlete): AthleteProfile {
  const fade = fadeScore(athlete);
  if (fade > 2.5) return "sprint";
  if (fade < -1.5) return "endurance";
  return "balanced";
}

// Returns top `boatSize` athletes ranked by the chosen optimization mode.
// `excludeNames` = athletes already assigned to other boats (skip them).
export function suggestLineup(
  mode: OptimizeMode,
  boatSize: number,
  excludeNames: string[] = []
): ErgAthlete[] {
  const pool = ERG_ATHLETES_2026.filter((a) => !excludeNames.includes(a.name));

  const scored = pool.map((a) => {
    const avg = splitToSecs(a.splitAvg);
    const s500 = splitToSecs(a.splits[0]);
    const fade = fadeScore(a);

    let score: number;
    switch (mode) {
      case "sprint":
        // Weight 500m split heavily — pick athletes who go out hardest
        score = s500 * 0.60 + avg * 0.40;
        break;
      case "endurance":
        // Penalize fading — athletes who hold pace or go faster are preferred
        score = avg + Math.max(0, fade) * 0.45;
        break;
      default:
        score = avg;
    }
    return { athlete: a, score };
  });

  scored.sort((a, b) => a.score - b.score);
  return scored.slice(0, boatSize).map((s) => s.athlete);
}

export function splitToSecs(split: string): number {
  const [m, s] = split.split(":");
  return parseInt(m) * 60 + parseFloat(s);
}

export function secsToSplit(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, "0")}:${s.toFixed(1).padStart(4, "0")}`;
}

export function avgSplit(names: string[]): string | null {
  const athletes = names
    .map((n) => ERG_ATHLETES_2026.find((a) => a.name === n))
    .filter((a): a is ErgAthlete => !!a && a.splitAvg.includes(":"));
  if (!athletes.length) return null;
  const avg = athletes.reduce((s, a) => s + splitToSecs(a.splitAvg), 0) / athletes.length;
  return secsToSplit(avg);
}
