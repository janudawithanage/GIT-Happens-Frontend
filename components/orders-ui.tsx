import Image from "next/image";
import type { ReactNode } from "react";

export type OrderStatus = "Confirmed" | "Planned" | "In Transit" | "Delivered" | "Deferred";
export type StoreOrder = {
  id: string;
  date: string;
  title: string;
  subtitle: string;
  status: OrderStatus;
  arrival: string;
  window: string;
  units: number;
  bay: string;
  category: string;
  carrier?: string;
  priority?: string;
};

const assetSize: Record<string, [number, number]> = {
  "1c3be.svg": [12.5587, 11.25], "32aca.svg": [11.3333, 11.3333], "eee2d.svg": [15, 15], "4a8e4.svg": [7.5, 4.625],
  "42fe3.svg": [12.5, 12.5], "46f8e.svg": [11.25, 12.5], "b4b7b.svg": [12.8333, 11.0833], "c8294.svg": [15, 17],
  "935a9.svg": [11.6667, 11.6667], "25901.svg": [13.75, 13.125], "467b3.svg": [12.0417, 14.1667], "acbce.svg": [10, 8.625],
  "1db44.svg": [16.6667, 15], "b4da6.svg": [10.5186, 10.7951], "c7a53.svg": [9.50833, 7.01458],
  "16462.svg": [11.9167, 8.66667], "b16e6.svg": [10.8333, 10.8333], "0787c.svg": [14.25, 14.25],
  "20b80.svg": [10.6667, 13.3333], "6d613.svg": [14.6667, 12.6667],
};

export function OrderAsset({ name, width = 14, height = 14, className = "" }: { name: string; width?: number; height?: number; className?: string }) {
  const [nativeWidth, nativeHeight] = assetSize[name] ?? [width, height];
  return <Image src={`/figma/orders/${name}`} alt="" width={nativeWidth} height={nativeHeight} className={`shrink-0 ${className}`} />;
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const tones: Record<OrderStatus, string> = {
    Confirmed: "border-emerald-200 bg-emerald-50 text-emerald-700",
    Planned: "border-slate-200 bg-slate-100/90 text-slate-700",
    "In Transit": "border-blue-200 bg-blue-50 text-blue-700",
    Delivered: "border-emerald-200 bg-emerald-50 text-emerald-700",
    Deferred: "border-red-200 bg-red-100 text-red-700",
  };
  const icon = status === "Deferred" ? "b4b7b.svg" : status === "Delivered" ? "935a9.svg" : undefined;
  return <span className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-bold ${tones[status]}`}>{icon ? <OrderAsset name={icon} width={12} height={12} /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}{status}</span>;
}

export function OrderField({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) {
  return <div className={`min-w-0 ${className}`}><dt className="text-[10px] font-bold uppercase tracking-[.5px] text-[#91a3be]">{label}</dt><dd className="mt-0.5 text-[11px] font-bold text-[#1e293b] sm:text-[12px]">{children}</dd></div>;
}

export function OrderCard({ order, selected, onSelect }: { order: StoreOrder; selected: boolean; onSelect: () => void }) {
  return <button type="button" onClick={onSelect} aria-pressed={selected} className={`relative block w-full cursor-pointer rounded-[24px] border p-4 text-left backdrop-blur-xl transition hover:-translate-y-0.5 hover:shadow-lg sm:p-[17px] ${selected ? "border-[2px] border-[#ff7a1a] bg-white/95 shadow-[0_16px_36px_-10px_rgba(255,122,26,.3)]" : "border-white/90 bg-white/90 shadow-sm"}`}>
    {selected && <span className="absolute inset-y-4 left-0 w-1.5 rounded-r-full bg-[#ff7a1a] shadow-[0_0_14px_#ff7a1a]" />}
    <div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="dashboard-mono text-[11px] font-bold tracking-wide text-[#8fa2bf]">#{order.id}</span>{selected && <span className="rounded-full bg-[#ff7a1a]/15 px-2 py-0.5 text-[10px] font-bold text-[#9c4500]">PRIORITY WAVE</span>}{!selected && <span className="text-[11px] text-[#91a3be]">{order.date}</span>}{order.status === "Deferred" && <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">CAPACITY DEFERRAL</span>}</div><h3 className="mt-1 text-[16px] font-bold leading-6 text-[#111c2e] sm:text-[17px]">{order.title}</h3><p className="text-[11px] text-[#64748b]">{order.subtitle}</p></div><OrderStatusBadge status={order.status} /></div>
    {order.status === "Deferred" && <div className="mt-3 flex gap-2 rounded-2xl border border-red-200/80 bg-white/85 p-3"><OrderAsset name="c8294.svg" width={15} height={17} /><div><strong className="text-[12px] text-[#9c4500]">Deferred: next run Sat 26 Sep, 09:00 AM</strong><p className="mt-0.5 max-w-[270px] text-[11px] leading-4 text-[#64748b]">No suitable vehicle remained for the booked window. Dispatcher recorded the deferral reason.</p></div></div>}
    <dl className={`mt-3 grid grid-cols-1 gap-3 border-t border-white/80 pt-3 sm:grid-cols-3 ${selected ? "mt-4" : ""}`}>
      {order.status === "In Transit" ? <><OrderField label="Revised ETA"><span className="inline-flex items-center gap-1"><OrderAsset name="42fe3.svg" width={13} height={13} />{order.arrival}</span></OrderField><OrderField label="Dispatch Carrier"><span className="inline-flex items-center gap-1"><OrderAsset name="46f8e.svg" width={11} height={13} />{order.carrier}</span></OrderField><OrderField label="Manifest Load">{order.units} Units • 4 Categories</OrderField></> : order.status === "Deferred" ? <><OrderField label="Original Slot"><span className="font-normal text-slate-400 line-through">25 Sep, 02:00 PM</span></OrderField><OrderField label="Next Run"><span className="text-red-700">Run 1 (Sat 26 Sep)</span></OrderField><OrderField label="Volume">{order.units} Units (Thermal)</OrderField></> : order.status === "Delivered" ? <><OrderField label="Dock Handover">{order.arrival}</OrderField><OrderField label="Verification"><span className="inline-flex items-center gap-1 text-emerald-700"><OrderAsset name="25901.svg" width={14} height={14} />Dock Verified</span></OrderField><OrderField label="Receipt Items">{order.units} Units Ingested</OrderField></> : <><OrderField label="Expected Arrival">{order.arrival}</OrderField><OrderField label="Delivery Window">{order.window}</OrderField><OrderField label="Consignment">{order.units} Units • Security Vault</OrderField></>}
    </dl>
    {selected && <div className="mt-4 flex flex-wrap gap-1.5">{["40 Totes", "24 Wardrobes", "15 Crates", "10 Crates"].map(item => <span key={item} className="dashboard-mono rounded-md border border-slate-200/80 bg-slate-50/80 px-2 py-0.5 text-[10px] text-[#64748b]">{item}</span>)}</div>}
  </button>;
}

export function OrderMetric({ label, value, detail, detailClassName = "text-[#64748b]" }: { label: string; value: string; detail: string; detailClassName?: string }) {
  return <div className="min-w-0 rounded-2xl border border-white/90 bg-white/90 px-2 py-3 text-center"><p className="text-[9px] font-semibold uppercase tracking-wide text-[#91a3be]">{label}</p><p className="dashboard-mono mt-1 text-[19px] font-bold leading-6 text-[#111c2e]">{value}</p><p className={`mt-1 truncate text-[9px] ${detailClassName}`}>{detail}</p></div>;
}

export function OrderProgress({ active }: { active: boolean }) {
  const stages = [
    { title: "Created", detail: "Store order received", time: "25 Sep, 14:10" },
    { title: "Validated", detail: "Order checked against available stock", time: "25 Sep, 14:25" },
    { title: "Staged", detail: "Loaded at Peliyagoda DC", time: "25 Sep, 18:30" },
    { title: active ? "In Transit • Active Leg" : "Awaiting next stage", detail: active ? "22.8 km from the outlet • ETA: 09:10 AM" : "Status updates are simulated", time: active ? "EN ROUTE" : "PENDING" },
    { title: "Intake", detail: "Driver checks in at Bay 1 North", time: "Est. 09:10 AM" },
    { title: "Verified", detail: "Store checks items and confirms receipt", time: "Pending Intake" },
  ];
  return <section className="min-h-[420px] rounded-2xl border border-white/80 bg-[#f4f7fd]/95 p-4"><div className="flex items-center justify-between gap-2"><h3 className="text-[10px] font-bold uppercase tracking-wide text-[#91a3be]">Order Progress</h3><span className="rounded-full bg-blue-100 px-2 py-1 text-[10px] font-bold text-blue-700">{active ? "Stage 4 of 6 Active" : "Sample status timeline"}</span></div><div className="relative mt-4 ml-3 space-y-4 border-l-2 border-[#e2e8f0] pl-4"><Image src="/figma/orders/be5f3.png" alt="" width={2} height={219} className="absolute -left-[2px] top-[2.81%] h-[62%] w-[2px]" />{stages.map((stage, index) => <div key={stage.title} className={`relative ${index > 3 ? "opacity-45" : ""} ${index === 3 ? "min-h-[110px] rounded-2xl border-2 border-blue-200 bg-white p-3 shadow-sm" : ""}`}><span className={`absolute flex h-5 w-5 items-center justify-center rounded-full text-[10px] text-white ring-4 ring-white ${index === 3 ? "-left-[26px] top-3 bg-blue-600" : "-left-[27px] top-0 bg-[#ff7a1a]"}`}>{index < 3 ? <OrderAsset name="c7a53.svg" width={10} height={8} /> : index === 3 ? <OrderAsset name="16462.svg" width={12} height={10} /> : <OrderAsset name="b16e6.svg" />}</span><div className="flex justify-between gap-2"><div><h4 className={`text-[11px] font-bold ${index === 3 ? "text-blue-700" : "text-[#111c2e]"}`}>{stage.title}</h4><p className="text-[10px] leading-4 text-[#64748b]">{stage.detail}</p>{index === 3 && <p className="mt-2 border-t border-slate-100 pt-2 text-[9px] text-[#91a3be]">ETA updated on Colombo route · <span className="font-bold text-emerald-600">ETA updated</span></p>}</div><span className="dashboard-mono shrink-0 text-right text-[8px] text-[#91a3be]">{stage.time}</span></div></div>)}</div></section>;
}
