/*
 * Authorship: Bowen Dong (A) owns the shared homepage/app shell for the public demo.
 * Scope: Global app layout used across the V2 frontend.
 */

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SocialCOMPACT Survivor",
  description: "Run and visualize SocialCOMPACT Survivor matches.",
};

// Author: Bowen Dong (A) - shared app-shell layout for the public V2 demo.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
