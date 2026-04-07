import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "True North Steelworks",
  description: "Steel building tools - Quote Calculator & Building Designer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased" style={{ fontFamily: "'DM Mono', 'Courier New', monospace" }}>
        {children}
      </body>
    </html>
  );
}
