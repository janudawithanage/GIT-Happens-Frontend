import type { Metadata } from "next";
import PlanningScreen from "./planning-screen";

export const metadata: Metadata = { title: "Plan Deliveries" };

export default function Page() { return <PlanningScreen />; }
