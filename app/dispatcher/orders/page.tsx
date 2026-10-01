import type { Metadata } from "next";
import OrdersScreen from "./orders-screen";

export const metadata: Metadata = { title: "Confirmed Orders" };

export default function Page() { return <OrdersScreen />; }
