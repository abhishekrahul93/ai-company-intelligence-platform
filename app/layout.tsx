import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CareerForge Resume Builder",
  description: "AI-powered resume builder for polished, ATS-ready CVs"
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
