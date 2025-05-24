"use client";

import { AlertTriangle } from "lucide-react";
import { Toaster as SonnerToaster, toast } from "sonner";

// Toast utility functions for common error messages
export const stationToasts = {
  originMissing: () => {
    toast.error("Please select an origin station", {
      description: "You need to specify where your journey begins",
      icon: <AlertTriangle className="h-4 w-4" />,
    });
  },
  destinationMissing: () => {
    toast.error("Please select a destination station", {
      description: "You need to specify where your journey ends",
      icon: <AlertTriangle className="h-4 w-4" />,
    });
  },
  selectStation: () => {
    toast.error("Please select a station", {
      description: "Both origin and destination stations are required",
      icon: <AlertTriangle className="h-4 w-4" />,
    });
  },
};

export function ToastProvider() {
  return (
    <SonnerToaster
      position="bottom-right"
      richColors
      toastOptions={{
        duration: 3000,
        className: "font-sans",
      }}
    />
  );
}
