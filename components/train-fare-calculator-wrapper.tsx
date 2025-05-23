"use client";

import { useSearchParams } from "next/navigation";
import { TrainFareCalculator } from "./train-fare-calculator";

export default function TrainFareCalculatorWrapper() {
  const searchParams = useSearchParams();

  // Parse parameters from URL
  const origin = searchParams.get("origin") || "";
  const destination = searchParams.get("destination") || "";
  const returnJourney = searchParams.get("return") === "true";
  const concession = searchParams.get("concession") === "true";

  return (
    <TrainFareCalculator
      initialOrigin={origin}
      initialDestination={destination}
      initialReturn={returnJourney}
      initialConcession={concession}
    />
  );
}
