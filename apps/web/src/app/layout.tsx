import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PPOP LinkBio",
  description: "Link in Bio SaaS Service",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}

