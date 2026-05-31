import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "AI Company Intelligence Platform",
    template: "%s | AI Company Intelligence Platform"
  },
  description: "Executive company intelligence reports from company URLs"
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
