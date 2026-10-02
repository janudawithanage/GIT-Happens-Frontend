import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DispatcherShell } from "../../components/dispatcher-ui";
import { DispatcherProvider } from "./dispatcher-store";

export const metadata: Metadata = { title: { template: "%s | Waypoint Flow Dispatch", default: "Command Center | Waypoint Flow Dispatch" }, description: "Central dispatch for the Peliyagoda depot" };

export default function DispatcherLayout({ children }: { children: ReactNode }) {
  return <DispatcherProvider><DispatcherShell>{children}</DispatcherShell></DispatcherProvider>;
}
