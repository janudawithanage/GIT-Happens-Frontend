import type { Metadata } from "next";
import { notFound } from "next/navigation";
import OrdersScreen from "./screen";
import StoreManagerWorkflow from "@/components/store-manager-workflow";
import { workflowViews, type WorkflowView } from "@/lib/store-manager-routes";

export async function generateMetadata({ params }: { params: Promise<{ view: string }> }): Promise<Metadata> {
  const { view } = await params;
  const title = workflowViews[view as WorkflowView] ?? "Orders & Order Detail";
  return { title: `${title} | Waypoint Flow`, description: "Store Manager operations workspace" };
}

export default async function Page({ params }: { params: Promise<{ view: string }> }) {
  const { view } = await params;
  const decoded = decodeURIComponent(view);
  if (decoded === "Orders & Order Detail" || decoded === "orders") return <OrdersScreen />;
  if (Object.hasOwn(workflowViews, decoded)) return <StoreManagerWorkflow key={decoded} view={decoded as WorkflowView} />;
  notFound();
}
