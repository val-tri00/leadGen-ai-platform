import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LeadGen AI",
  description: "AI-assisted lead generation portfolio project"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

