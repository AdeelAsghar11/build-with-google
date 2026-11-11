import type { Metadata } from "next";
import { Source_Serif_4, Source_Sans_3, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { AppHeader } from "@/components/layout/AppHeader";
import { WorkflowNav } from "@/components/layout/WorkflowNav";
import { AppFooter } from "@/components/layout/AppFooter";

const sourceSerif = Source_Serif_4({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const sourceSans = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Insaaf — Teacher-Assisted, Bias-Audited AI Grading",
  description:
    "An AI grading copilot with two-panel grading, verbatim evidence verification, prompt injection defense, and strict teacher approval gates.",
};

import { Suspense } from "react";
import { DemoProvider } from "@/lib/store/demo-context";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${sourceSerif.variable} ${sourceSans.variable} ${ibmPlexMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)] antialiased font-[family-name:var(--font-body)]">
        <DemoProvider>
          <AppHeader />
          <Suspense fallback={<div className="h-12 border-b border-[var(--border)]" />}>
            <WorkflowNav />
          </Suspense>
          <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
          <AppFooter />
        </DemoProvider>
      </body>
    </html>
  );
}
