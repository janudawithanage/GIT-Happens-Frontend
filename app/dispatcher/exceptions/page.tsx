import type { Metadata } from "next";
import { Suspense } from "react";
import ExceptionsScreen from "./exceptions-screen";

export const metadata: Metadata = { title: "Deferred Orders" };

export default function Page() {
  return <Suspense fallback={<div className="dispatcher-glass h-[600px] animate-pulse rounded-[26px]" />}><ExceptionsScreen /></Suspense>;
}
