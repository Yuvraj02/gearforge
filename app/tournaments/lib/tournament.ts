import fs from "fs";
import path from "path";
import { Tournament } from "@/app/models/tournament_model";

const DATA_PATH = path.join(process.cwd(), "app", "tournaments", "tournament.json");
let tournaments: Tournament[] | null = null;

// Describe the shape of the incoming JSON
type RawTournament = {
  tournament_id?: unknown;
  name?: unknown;
  start_date?: unknown;
  end_date?: unknown;
  cover?: unknown;
  // team_size?: unknown;
  max_team_size:unknown
  min_team_size:unknown
  total_slots?: unknown;
  registered_slots?: unknown;
  registerd_id?: unknown; // keeping the original key
  winner_id?: unknown;
  runnerup_id?: unknown;
  tournament_division?: unknown;
  pool_price?: unknown;
  entry_fee?: unknown;
  game_type?: unknown;
  status?:unknown
};

// tiny helpers for safe coercion
const toString = (v: unknown, def = "") => (v == null ? def : String(v));
const toNumber = (v: unknown, def = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
};
const toDate = (v: unknown, fallback: Date) => {
  if (v == null) return fallback;
  const d = new Date(String(v));
  return Number.isNaN(d.getTime()) ? fallback : d;
};

export function parseRaw(raw: unknown): Tournament {
  const r = (raw ?? {}) as RawTournament;

  const start = toDate(r.start_date, new Date());
  const end = toDate(r.end_date, start); // default to start if end invalid/missing

  return {
    tournament_id: toString(r.tournament_id),
    name: toString(r.name),
    start_date: start,
    end_date: end,
    cover: toString(r.cover),
    // team_size: toNumber(r.team_size, 1),
    max_team_size:toNumber(r.max_team_size),
    min_team_size:toNumber(r.min_team_size),
    total_slots: toNumber(r.total_slots),
    registered_slots: toNumber(r.registered_slots),
    registered_id: Array.isArray(r.registerd_id) ? r.registerd_id.map(String) : [],
    winner_id: toString(r.winner_id),
    runnerup_id: toString(r.runnerup_id),
    tournament_division: toNumber(r.tournament_division),
    pool_price: toNumber(r.pool_price),
    entry_fee: toNumber(r.entry_fee),
    game_category: toString(r.game_type),
    status:'live'
  };
}

export function loadTournaments(): Tournament[] {
  if (tournaments) return tournaments;
  try {
    const raw = fs.readFileSync(DATA_PATH, "utf8");
    const arr = JSON.parse(raw);
    tournaments = Array.isArray(arr) ? arr.map(parseRaw) : [];
    return tournaments;
  } catch {
    tournaments = [];
    return tournaments;
  }
}

export function getLiveAndUpcoming(): { live: Tournament[]; upcoming: Tournament[] } {
  const list = loadTournaments();
  const now = Date.now();

  const live: Tournament[] = [];
  const upcoming: Tournament[] = [];

  for (const t of list) {
    const start = t.start_date.getTime();
    const end = t.end_date.getTime();
    if (start <= now && now <= end) {
      live.push(t);
    } else if (start > now) {
      upcoming.push(t);
    }
  }

  live.sort((a, b) => a.start_date.getTime() - b.start_date.getTime());
  upcoming.sort((a, b) => a.start_date.getTime() - b.start_date.getTime());

  return { live, upcoming };
}
