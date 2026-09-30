import type { Metadata } from "next";
import { notFound } from "next/navigation";
import OrdersScreen from "./screen";

export const metadata: Metadata = { title: "Orders & Order Detail | Waypoint Flow", description: "Store order queue and selected manifest" };

export default async function Page({ params }: { params: Promise<{ view: string }> }) {
  const { view } = await params;
  if (decodeURIComponent(view) !== "Orders & Order Detail") notFound();
  return <OrdersScreen />;
}
