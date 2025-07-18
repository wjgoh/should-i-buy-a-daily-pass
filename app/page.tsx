"use client";

import { Suspense } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import TrainFareCalculatorWrapper from "../components/train-fare-calculator-wrapper";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="p-4 md:p-6 lg:p-8 pb-12 md:pb-15 lg:pb-20 flex flex-col items-center flex-grow">
        <div className="w-full max-w-md mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Should I buy daily pass?</h1>
            <ThemeToggle />
          </div>
          <Suspense
            fallback={
              <div className="text-center py-10">
                Loading fare calculator...
              </div>
            }
          >
            <TrainFareCalculatorWrapper />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
