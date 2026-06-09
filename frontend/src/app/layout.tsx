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
