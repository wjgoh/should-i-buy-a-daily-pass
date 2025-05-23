"use client";

import { TrainFareCalculator } from "@/components/train-fare-calculator";
import { ThemeToggle } from "@/components/theme-toggle";
import { useSearchParams } from "next/navigation";

export default function Home() {
  const searchParams = useSearchParams();

  // Extract URL parameters
  const origin = searchParams.get("origin") || "";
  const destination = searchParams.get("destination") || "";
  const returnTrip = searchParams.get("return") === "true";
  const concession = searchParams.get("concession") === "true";

  return (
    <main className="min-h-screen p-4 md:p-6 lg:p-8 flex flex-col items-center justify-center bg-background">
      <div className="w-full max-w-md mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Should I buy daily pass?</h1>
          <ThemeToggle />
        </div>
        <TrainFareCalculator
          initialOrigin={origin}
          initialDestination={destination}
          initialReturn={returnTrip}
          initialConcession={concession}
        />
      </div>
    </main>
  );
}
