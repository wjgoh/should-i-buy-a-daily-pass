import fs from "node:fs";
import path from "node:path";

export interface BackupFare {
  from: string;
  to: string;
  adult: string;
  cash: string;
  cashless: string;
  concession: string;
  fare: string;
  fetched_at?: string;
}

let cache: { key: string; fares: BackupFare[] } | null = null;

function normalizeCode(code: string): string {
  // Backup stores original station codes (SB* for BRT line),
  // but the API/proxy uses BRT* — treat them as identical.
  const c = code.trim().toUpperCase();
  if (c.startsWith("BRT")) return `SB${c.slice(3)}`;
  return c;
}

function loadBackup(): BackupFare[] {
  const jsonPath = path.join(process.cwd(), "data", "fares.json");
  const stat = fs.statSync(jsonPath);
  const key = `${stat.mtimeMs}-${stat.size}`;
  if (cache && cache.key === key) return cache.fares;
  const raw = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  const fares: BackupFare[] = raw.fares || raw || [];
  cache = { key, fares };
  return fares;
}

/** Find a fare in the local backup. Handles both directions (backup is symmetric) and SB/BRT aliases. */
export function findBackupFare(from: string, to: string): BackupFare | null {
  let fares: BackupFare[];
  try {
    fares = loadBackup();
  } catch {
    return null;
  }
  const nFrom = normalizeCode(from);
  const nTo = normalizeCode(to);
  if (nFrom === nTo) {
    return { from, to, adult: "0.00", cash: "0.00", cashless: "0.00", concession: "0.00", fare: "0.00" };
  }
  for (const r of fares) {
    const a = normalizeCode(r.from);
    const b = normalizeCode(r.to);
    if ((a === nFrom && b === nTo) || (a === nTo && b === nFrom)) return r;
  }
  // Fallback: direct (non-normalized) match, e.g. KG18A-style codes
  const uFrom = from.trim().toUpperCase();
  const uTo = to.trim().toUpperCase();
  for (const r of fares) {
    if (
      (r.from.toUpperCase() === uFrom && r.to.toUpperCase() === uTo) ||
      (r.from.toUpperCase() === uTo && r.to.toUpperCase() === uFrom)
    )
      return r;
  }
  return null;
}

export function backupAvailable(): boolean {
  try {
    return fs.existsSync(path.join(process.cwd(), "data", "fares.json"));
  } catch {
    return false;
  }
}
