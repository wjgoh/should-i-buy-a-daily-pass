import type React from "react";
import "@/app/globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { ToastProvider } from "@/components/ui/toast-provider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SiteFooter } from "@/app/footer/site-footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Should I buy daily pass?",
  description: "Calculate train fares for your journey",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <SiteFooter />
          <SpeedInsights />
          <ToastProvider />
        </ThemeProvider>
      </body>
    </html>
  );
}
