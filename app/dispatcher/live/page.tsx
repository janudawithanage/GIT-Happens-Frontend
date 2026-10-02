import type { Metadata } from "next";
import { Suspense } from "react";
import LiveScreen from "./live-screen";

export const metadata: Metadata = { title: "Live Monitor" };

export default function Page() {
  return <Suspense fallback={<div className="dispatcher-glass h-[600px] animate-pulse rounded-[26px]" />}><LiveScreen /></Suspense>;
}
