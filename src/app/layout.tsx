import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FreeCraft — Design. Create. Share. Free.",
  description: "A free, open-source creative workspace for students and creators.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
