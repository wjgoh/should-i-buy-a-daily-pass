#!/usr/bin/env node
/**
 * Backup RapidKL fares to CSV + JSON.
 *
 * Usage:
 *   node scripts/fetch-fares-backup.mjs                 # full undirected backup (~13.8k pairs)
 *   node scripts/fetch-fares-backup.mjs --limit 20      # sample run for testing
 *   node scripts/fetch-fares-backup.mjs --directed      # full directed matrix (~27.7k pairs)
 *   node scripts/fetch-fares-backup.mjs --concurrency 10 --out-dir data
 *
 * Resume: re-running picks up where it left off (reads existing data/fares.json).
 * Output:
 *   data/fares.csv  - human / spreadsheet backup
 *   data/fares.json - machine backup used as API fallback (see app/api/fare-proxy/route.ts)
 */
import fs from "node:fs";
import path from "node:path";

const API_URL = process.env.RAPIDKL_API_URL || "https://jp-web.myrapid.com.my/endpoint/geoservice/fares";

function parseArgs(argv) {
  const out = { limit: 0, concurrency: 8, outDir: "data", directed: false, delayMs: 100 };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--limit") out.limit = Number(argv[++i] || 0);
    else if (a === "--concurrency") out.concurrency = Number(argv[++i] || 8);
    else if (a === "--out-dir") out.outDir = argv[++i] || "data";
    else if (a === "--directed") out.directed = true;
    else if (a === "--delay-ms") out.delayMs = Number(argv[++i] || 0);
    else if (a === "--help" || a === "-h") {
      console.log("Usage: node scripts/fetch-fares-backup.mjs [--limit N] [--concurrency N] [--out-dir data] [--directed] [--delay-ms N]");
      process.exit(0);
    }
  }
  return out;
}

function toApiCode(code) {
  // Frontend uses the same conversion (see convertToBRTCode in train-fare-calculator.tsx)
  return code.startsWith("SB") ? `BRT${code.slice(2)}` : code;
}

function loadStationCodes() {
  const file = path.join(process.cwd(), "components", "listrapidklrail", "allstation.ts");
  const txt = fs.readFileSync(file, "utf8");
  const start = txt.indexOf("`");
  const end = txt.lastIndexOf("`");
  if (start === -1 || end === -1 || end <= start) throw new Error("Could not parse allstation.ts csvData");
  const inner = txt.slice(start + 1, end);
  const lines = inner.trim().split("\n").slice(1);
  const set = new Set();
  for (const row of lines) {
    const cols = row.split(",");
    const code = (cols[1] || "").trim();
    if (code) set.add(code);
  }
  return [...set].sort();
}

function pairKey(from, to) {
  return `${from}|${to}`;
}

async function fetchFare(from, to, attempt = 0) {
  const url = `${API_URL}?agency=rapidkl&from=${toApiCode(from)}&to=${toApiCode(to)}`;
  let res;
  try {
    res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
    });
  } catch (e) {
    if (attempt < 3) {
      await sleep(1000 * (attempt + 1));
      return fetchFare(from, to, attempt + 1);
    }
    throw e;
  }
  if (res.status === 429 || res.status >= 500) {
    if (attempt < 5) {
      await sleep(1500 * (attempt + 1));
      return fetchFare(from, to, attempt + 1);
    }
  }
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${from}->${to}`);
  const data = await res.json();
  const f = data?.fares;
  if (!f) throw new Error(`No fares field for ${from}->${to}: ${JSON.stringify(data).slice(0, 200)}`);
  return {
    from,
    to,
    adult: f.adult ?? "",
    cash: f.cash ?? "",
    cashless: f.cashless ?? "",
    // API spells it "consession" (single s) — normalize to "concession"
    concession: f.consession ?? f.concession ?? "",
    fare: f.fare ?? "",
  };
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const opts = parseArgs(process.argv);
  const codes = loadStationCodes();
  console.log(`Stations: ${codes.length}, mode: ${opts.directed ? "directed" : "undirected (symmetric)"}`);

  let pairs = [];
  if (opts.directed) {
    for (const a of codes) for (const b of codes) if (a !== b) pairs.push([a, b]);
  } else {
    for (let i = 0; i < codes.length; i++)
      for (let j = i + 1; j < codes.length; j++) pairs.push([codes[i], codes[j]]);
  }
  console.log(`Total pairs: ${pairs.length}`);
  if (opts.limit > 0) {
    pairs = pairs.slice(0, opts.limit);
    console.log(`Limited to first ${pairs.length} pairs (for testing)`);
  }

  const outDir = path.join(process.cwd(), opts.outDir);
  fs.mkdirSync(outDir, { recursive: true });
  const jsonPath = path.join(outDir, "fares.json");
  const csvPath = path.join(outDir, "fares.csv");

  // Resume from existing backup
  const done = new Map();
  if (fs.existsSync(jsonPath)) {
    try {
      const prev = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
      for (const r of prev.fares || []) done.set(pairKey(r.from, r.to), r);
      console.log(`Resuming: ${done.size} pairs already saved, skipping`);
    } catch (e) {
      console.warn(`Could not read existing ${jsonPath}, starting fresh: ${e.message}`);
    }
  }

  const todo = pairs.filter(([a, b]) => !done.has(pairKey(a, b)));
  console.log(`To fetch: ${todo.length}`);

  const results = [...done.values()];
  let completed = 0;
  let failed = 0;
  const errors = [];
  const startedAt = new Date().toISOString();

  // Simple worker pool
  let idx = 0;
  async function worker(id) {
    while (true) {
      const cur = idx++;
      if (cur >= todo.length) return;
      const [from, to] = todo[cur];
      try {
        const row = await fetchFare(from, to);
        row.fetched_at = new Date().toISOString();
        done.set(pairKey(from, to), row);
        results.push(row);
      } catch (e) {
        failed++;
        errors.push(`${from}->${to}: ${e.message}`);
      }
      completed++;
      if (opts.delayMs > 0) await sleep(opts.delayMs);
      if (completed % 200 === 0 || completed === todo.length) {
        console.log(`[${completed}/${todo.length}] ok=${results.length} failed=${failed}`);
        saveProgress();
      }
    }
  }

  function saveProgress() {
    const payload = {
      meta: {
        source: "rapidkl-geoservice",
        directed: opts.directed,
        symmetric_assumption: !opts.directed,
        station_count: codes.length,
        pair_count: results.length,
        started_at: startedAt,
        updated_at: new Date().toISOString(),
      },
      fares: results.sort((a, b) => (a.from === b.from ? (a.to < b.to ? -1 : 1) : a.from < b.from ? -1 : 1)),
    };
    fs.writeFileSync(jsonPath, JSON.stringify(payload, null, 1));
    const header = "from,to,adult,cash,cashless,concession,fare,fetched_at";
    const lines = payload.fares.map((r) =>
      [r.from, r.to, r.adult, r.cash, r.cashless, r.concession, r.fare, r.fetched_at || ""].join(","),
    );
    fs.writeFileSync(csvPath, header + "\n" + lines.join("\n") + "\n");
  }

  const workers = Array.from({ length: Math.min(opts.concurrency, Math.max(todo.length, 1)) }, (_, i) => worker(i));
  await Promise.all(workers);
  saveProgress();

  console.log(`\nDone. Saved ${results.length} fares, ${failed} failed.`);
  console.log(`  JSON: ${jsonPath}`);
  console.log(`  CSV:  ${csvPath}`);
  if (errors.length > 0) {
    console.log(`First ${Math.min(10, errors.length)} errors:`);
    for (const e of errors.slice(0, 10)) console.log("  " + e);
    const errPath = path.join(outDir, "fares-errors.log");
    fs.writeFileSync(errPath, errors.join("\n") + "\n");
    console.log(`Full error list: ${errPath}`);
    console.log("Re-run the same command to retry failed pairs.");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
