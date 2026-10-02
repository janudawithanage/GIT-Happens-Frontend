import type { Metadata } from "next";
import StaffAccessScreen from "./staff-access-screen";

export const metadata: Metadata = { title: "Staff Access Requests" };

export default function Page() { return <StaffAccessScreen />; }
