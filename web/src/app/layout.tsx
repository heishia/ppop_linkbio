import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PPOPLINK",
  description: "Link in Bio SaaS Service",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Cafe24+Ssurround&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}

