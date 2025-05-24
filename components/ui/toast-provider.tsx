"use client";

import { Toaster as SonnerToaster } from "sonner";

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
