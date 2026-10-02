import type { Metadata } from "next";
import ForecastScreen from "./forecast-screen";

export const metadata: Metadata = { title: "Capacity & Forecast" };

export default function Page() { return <ForecastScreen />; }
