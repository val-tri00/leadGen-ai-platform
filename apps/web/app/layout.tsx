import type { Metadata } from "next";
import { Navigation } from "./components/navigation";
import "./globals.css";
import { Providers } from "./providers";

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
      <body>
        <Providers>
          <Navigation />
          {children}
        </Providers>
      </body>
    </html>
  );
}
