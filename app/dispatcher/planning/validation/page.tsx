import type { Metadata } from "next";
import ValidationScreen from "./validation-screen";

export const metadata: Metadata = { title: "Plan Validation" };

export default function Page() { return <ValidationScreen />; }
