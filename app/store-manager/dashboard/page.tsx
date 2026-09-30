import type { Metadata } from "next";
import DashboardScreen from "./screen";

export const metadata: Metadata = { title: "Store Dashboard | Waypoint Flow", description: "Colombo 07 store dispatch dashboard" };

export default function Page() { return <DashboardScreen />; }
