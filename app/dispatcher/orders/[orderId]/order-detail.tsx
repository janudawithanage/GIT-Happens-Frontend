"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { DButton, DIcon, Mono, type DispatcherIconName } from "../../../../components/dispatcher-ui";
import { findFleet, useDispatcher } from "../../dispatcher-store";
import { RunRules } from "../orders-screen";

const brandName = { Fresh: "Waypoint Fresh", Style: "Waypoint Style", Tech: "Waypoint Tech" } as const;

function Section({ icon, title, side, children }: { icon: DispatcherIconName; title: string; side?: ReactNode; children: ReactNode }) {
  return <section className="rounded-[20px] border border-white/90 bg-white/88 p-5 shadow-sm backdrop-blur-xl">
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4"><h2 className="flex items-center gap-3"><span className="flex size-8 items-center justify-center rounded-lg bg-slate-50"><DIcon name={icon} /></span><Mono className="text-[12px] font-bold uppercase tracking-[1.2px] text-[#0f172a]">{title}</Mono></h2>{side ?? <DIcon name="infoGrey" size={14} />}</div>
    <div className="mt-4 grid gap-3">{children}</div>
  </section>;
}

function Field({ label, children, sub, tone = "" }: { label: string; children: ReactNode; sub?: string; tone?: string }) {
  return <div className={`min-w-0 rounded-[12px] border border-slate-100 bg-slate-50/70 px-3 py-3 ${tone}`}><Mono className="block text-[9px] uppercase tracking-[1px] text-[#94a3b8]">{label}</Mono><div className="mt-1 text-[13px] font-bold text-[#0f172a]">{children}</div>{sub && <p className="mt-1 text-[11px] text-[#64748b]">{sub}</p>}</div>;
}

export default function OrderDetail({ orderId }: { orderId: string }) {
  const router = useRouter();
  const { orders, wave, checkAssignment, selectPlanOrder } = useDispatcher();
  const [notesOpen, setNotesOpen] = useState(false);
  const order = orders.find(o => o.id === orderId);
  if (!order) return <section className="dispatcher-glass mx-auto mt-10 max-w-[520px] rounded-[26px] p-8 text-center"><h1 className="text-[22px] font-bold">Order not found</h1><p className="mt-2 text-[13px] text-[#64748b]">{orderId} is not part of Monday&apos;s confirmed run.</p><Link href="/dispatcher/orders" className="mt-5 inline-block rounded-full bg-[#0284c7] px-5 py-3 text-[13px] font-bold text-white">Back to Orders</Link></section>;

  const deferred = order.status === "Deferred";
  const entry = wave.find(e => e.orderId === order.id);
  const vehicleId = entry?.vehicle ?? (order.load === "Ambient" ? "VEH021" : "VEH014");
  const vehicle = findFleet(vehicleId)!;
  const checks = checkAssignment(order.id, vehicleId);
  const pass = (key: string) => checks.find(c => c.key === key)?.pass ?? true;
  const capacityOk = !deferred && pass("volume") && pass("weight");
  const constraints = [
    { title: "Depot compatible", detail: `Peliyagoda Central covers ${order.district === "Colombo" ? "Colombo North/Flagship" : "the Gampaha corridor"} route directly.`, ok: true },
    { title: "Temperature compatible", detail: order.load === "Ambient" ? "Ambient goods ride in any vehicle in the roster." : `Reefer cooling active at ${order.temp}, well within ${order.load === "Chilled" ? "2°C–4°C chilled band" : "controlled 18–24°C band"}.`, ok: pass("temp") },
    { title: "Vehicle access compatible", detail: `${order.dock} access verified for ${vehicle.type.replace(" Rigid", "")} ${vehicle.id}.`, ok: true },
    { title: capacityOk ? "Capacity available" : "Capacity unavailable", detail: deferred ? "No vehicle in this run has room; order is carried over to the next run." : `${order.weightKg} kg / ${order.volumeM3} m³ fits remaining capacity in ${vehicle.id}.`, ok: capacityOk },
  ];
  const passed = constraints.filter(c => c.ok).length;
  const assign = () => { selectPlanOrder(order.id); router.push("/dispatcher/planning"); };

  return <>
    <section className="flex flex-wrap items-end justify-between gap-4 pt-2">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2 text-[12px]"><Mono className="rounded-md bg-[#0f172a] px-2 py-1 text-[12px] font-bold text-white">{order.id}</Mono><Mono className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">● {brandName[order.segment]}</Mono><span className="font-semibold text-white">• {order.district} District</span><Mono className="text-white/80">• Peliyagoda Depot (Bay 04)</Mono></div>
        <Mono className="mt-2 inline-block rounded-full bg-white px-2 py-[2px] text-[10px] font-bold text-[#0369a1]">Depot: Peliyagoda Central</Mono>
        <h1 className="mt-2 flex flex-wrap items-baseline gap-3 text-[32px] font-extrabold tracking-[-1.2px] text-white sm:text-[36px]">Order Details <span className="text-[24px] font-medium text-white/80">/ Allocation Check</span></h1>
        <p className="mt-1 flex items-center gap-2 text-[13px] text-white/85"><DIcon name="shieldSky" />Auto-Constraint Engine: Armed &amp; Evaluated</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="dispatcher-nav flex items-center gap-3 rounded-[14px] px-3 py-2 text-[13px] font-medium text-[#0284c7]"><DIcon name="alarmSkySmall" />Cutoff<br />16:00:<Mono className="rounded-md bg-white px-2 py-1 text-[11px] font-bold leading-4 text-[#0284c7]">Before<br />16:00</Mono></span>
        <DButton tone="ghost" onClick={() => router.push("/dispatcher/orders")} className="rounded-[14px] px-4 py-2 text-[13px] leading-4"><DIcon name="arrowLeft" />Back to<br />Orders</DButton>
        <DButton tone="accent" disabled={deferred || !checks.every(c => c.pass)} onClick={assign} className="rounded-[14px] !bg-[#0ea5e9] px-4 py-2 text-[13px] leading-4 hover:!bg-[#0284c7]"><DIcon name="checkCircleWhite" />{entry?.vehicle ? <>Open in<br />Plan</> : <>Assign to<br />Plan</>}</DButton>
      </div>
    </section>

    <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
      <div className="flex flex-col gap-4">
        <Section icon="store" title="Section A • Order & Outlet">
          <div className="grid gap-3 sm:grid-cols-3"><Field label="Order ID"><Mono>{order.id}</Mono></Field><Field label="Outlet ID"><Mono>{order.outletId}</Mono></Field><Field label="Brand"><span className="text-emerald-700">{brandName[order.segment]}</span></Field></div>
          <div className="grid gap-3 sm:grid-cols-3"><div className="sm:col-span-2"><Field label="Destination outlet" sub={order.address}>{order.outlet}</Field></div><Field label="Dispatch depot">Peliyagoda Bay 04</Field></div>
        </Section>
        <Section icon="clockViolet" title="Section B • Delivery Specifications">
          <div className="grid gap-3 sm:grid-cols-3"><Field label="Delivery window"><Mono className="flex items-center gap-2"><DIcon name="clockSmall" />{order.window[0]} – {order.window[1]}</Mono></Field><Field label="Dock type">{order.dock}</Field><Field label="Parking restriction"><span className="text-emerald-700">{order.parking}</span></Field></div>
        </Section>
        <Section icon="snowSection" title="Section C • Load Specifications">
          <div className="grid gap-3 sm:grid-cols-4"><Field label="Temperature" tone={order.load !== "Ambient" ? "!border-sky-100 !bg-sky-50/70" : ""}><Mono className="flex items-center gap-2 text-[#0369a1]">{order.load !== "Ambient" && <DIcon name="snowTemp" />}{order.load === "Chilled" ? <>2°C – 4°C<br />Safe</> : order.load === "Controlled" ? <>Controlled<br />{order.temp}</> : "Ambient"}</Mono></Field><Field label="Net weight"><Mono>{order.weightKg} kg</Mono></Field><Field label="Volume"><Mono>{order.volumeM3} m³</Mono></Field><Field label="Packaging units">{order.packaging}</Field></div>
        </Section>
        <Section icon="truckSection" title="Section D • Planning & Assignment Status" side={<Mono className={`rounded-full border px-3 py-1 text-[10px] font-bold ${deferred ? "border-amber-200 bg-amber-50 text-amber-700" : entry?.vehicle ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-sky-200 bg-sky-50 text-[#0284c7]"}`}>{deferred ? "Deferred (Next run)" : entry?.vehicle ? `Assigned (${entry.vehicle})` : "Confirmed (Unassigned)"}</Mono>}>
          <div className="grid gap-3 sm:grid-cols-3"><Field label="Target vehicle" sub={vehicle.type.replace(" Rigid", "").replace(" Reefer", " Reefer")}><Mono>{vehicle.id}</Mono></Field><Field label="Target trip" sub={`Departure ${vehicle.departure}`}><Mono>{vehicle.trip}</Mono></Field><Field label="Assigned driver" sub="Peliyagoda Roster">{vehicle.driver}</Field></div>
        </Section>
      </div>

      <aside aria-label="Allocation constraint check" className="rounded-[20px] border border-white/90 bg-white/88 p-5 shadow-sm backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-3"><span className="flex size-8 items-center justify-center rounded-lg bg-emerald-50"><DIcon name="badgeCheck" /></span><div><h2 className="text-[15px] font-bold">Allocation Constraint Check</h2><p className="text-[11px] text-[#64748b]">Autonomous dispatch rule evaluation</p></div></div><Mono className={`flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-bold ${passed === 4 ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"}`}>{passed === 4 && <DIcon name="checkSmall" />}{passed === 4 ? "All 4 Constraints Passed" : `${passed} of 4 Constraints Passed`}</Mono></div>
        <ul className="mt-5 space-y-3">{constraints.map(c => <li key={c.title} className={`flex items-start gap-3 rounded-[14px] border px-4 py-3 ${c.ok ? "border-slate-100 bg-slate-50/70" : "border-amber-200 bg-amber-50/70"}`}>{c.ok ? <DIcon name="checkRow" /> : <DIcon name="warnOrange" size={15} />}<div className="min-w-0 flex-1"><p className="text-[13px] font-bold text-[#0f172a]">{c.title}</p><p className="mt-[2px] text-[11px] leading-4 text-[#64748b]">{c.detail}</p></div><span title={c.detail}><DIcon name="infoRow" size={14} /></span></li>)}</ul>
        <button type="button" aria-expanded={notesOpen} onClick={() => setNotesOpen(o => !o)} className="mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-[12px] bg-slate-50 py-2 text-[12px] font-bold text-[#334155] hover:bg-slate-100"><DIcon name="slidersDark" />{notesOpen ? "Hide" : "View"} bay assignment &amp; corridor notes</button>
        {notesOpen && <div className="mt-2 rounded-[12px] border border-slate-100 bg-white px-4 py-3 text-[12px] leading-5 text-[#334155]"><p><b>Bay:</b> Peliyagoda Bay 04 · Wave 1 staging lane B</p><p><b>Corridor:</b> {order.district === "Colombo" ? "Colombo North Express via Baseline Road" : "A1 Kandy Road via Kadawatha"}</p><p><b>Notes:</b> {order.dock}; {order.parking.toLowerCase()}. Load {order.packaging.toLowerCase()} rear-first.</p></div>}
        <div className="mt-5 rounded-[16px] border border-sky-100 bg-sky-50/40 p-4">
          <div className="flex items-center justify-between"><Mono className={`flex items-center gap-2 text-[11px] font-bold tracking-[1px] ${deferred ? "text-amber-700" : "text-[#0284c7]"}`}><span className={`size-2 rounded-full ${deferred ? "bg-amber-500" : "bg-[#0ea5e9]"}`} />{deferred ? "ACTION BLOCKED" : "ACTION READY"}</Mono><span className="text-[13px] font-bold text-[#0284c7]">Wave 1 Dispatch Lock</span></div>
          <p className="mt-3 text-[13px] leading-5 text-[#334155]">{deferred ? `This order is deferred to the next run. Review its reason in Exceptions before re-planning.` : `All operational requirements confirmed. Ready to stage for Wave 1 dispatch to ${order.outlet}.`}</p>
          <div className="mt-4 flex flex-wrap gap-3">{deferred ? <DButton tone="accent" onClick={() => router.push("/dispatcher/exceptions")} className="flex-1 rounded-[12px] !bg-[#0ea5e9] px-4 py-[10px] text-[13px]">Review in Exceptions</DButton> : <DButton tone="accent" disabled={!checks.every(c => c.pass)} onClick={assign} className="flex-1 rounded-[12px] !bg-[#0ea5e9] px-4 py-[10px] text-[13px] hover:!bg-[#0284c7]"><DIcon name="listCheck" />{entry?.vehicle ? "Open in Plan" : "Assign to Plan"}</DButton>}<DButton tone="light" onClick={() => router.push("/dispatcher/orders")} className="rounded-[12px] px-4 py-[10px] text-[13px]">Back to Orders</DButton></div>
        </div>
      </aside>
    </div>

    <RunRules tripIcon="tripLimit" />
  </>;
}
