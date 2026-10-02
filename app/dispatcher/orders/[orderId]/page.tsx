import type { Metadata } from "next";
import OrderDetail from "./order-detail";

type Props = { params: Promise<{ orderId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { orderId } = await params;
  return { title: `${decodeURIComponent(orderId)} · Allocation Check` };
}

export default async function Page({ params }: Props) {
  const { orderId } = await params;
  return <OrderDetail orderId={decodeURIComponent(orderId)} />;
}
