import { NextResponse } from "next/server";
import { findBackupFare } from "@/lib/fare-backup";

const API_BASE_URL = process.env.RAPIDKL_API_URL;

function backupResponse(from: string, to: string) {
  const hit = findBackupFare(from, to);
  if (!hit) return null;
  // Mirror the live API shape. Include both spellings: the live API uses
  // "consession" (typo) while the app/backup use "concession".
  return {
    fares: {
      adult: hit.adult,
      cash: hit.cash,
      cashless: hit.cashless,
      consession: hit.concession,
      concession: hit.concession,
      fare: hit.fare,
    },
    _source: "backup",
    _fetched_at: hit.fetched_at ?? null,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!from || !to) {
    return NextResponse.json(
      { error: "Missing from or to parameters" },
      { status: 400 },
    );
  }

  if (!API_BASE_URL) {
    // No live API configured — serve straight from the local backup.
    const fallback = backupResponse(from, to);
    if (fallback) return NextResponse.json(fallback);
    return NextResponse.json(
      { error: "API URL not configured and no backup fare found" },
      { status: 500 },
    );
  }

  try {
    const targetUrl = `${API_BASE_URL}?agency=rapidkl&from=${from}&to=${to}`;
    console.log("Fetching from:", targetUrl);

    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    const data = await response.json();
    console.log("API Response status:", response.status);

    if (!response.ok) {
      const fallback = backupResponse(from, to);
      if (fallback) {
        console.log(`Serving backup fare for ${from}->${to}`);
        return NextResponse.json(fallback);
      }
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching fare data:", error);
    const fallback = backupResponse(from, to);
    if (fallback) {
      console.log(`Serving backup fare for ${from}->${to} after fetch error`);
      return NextResponse.json(fallback);
    }
    return NextResponse.json(
      { error: "Failed to fetch fare data" },
      { status: 500 },
    );
  }
}
