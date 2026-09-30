import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sign in | Waypoint Flow",
  description: "Waypoint Flow intelligent delivery operations sign-in",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
