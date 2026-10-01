"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DButton, DIcon, Mono } from "../../../components/dispatcher-ui";
import { fleet } from "../data";
import { useDispatcher } from "../dispatcher-store";

type LoadFilter = "All" | "Chilled" | "Ambient";

export default function PlanningScreen() {
  const router = useRouter();
  const { orders, wave, deferred, risks, allocatedCount, selectedPlanOrder, selectPlanOrder, assignOrder, vehicleLoad, checkAssignment, setPlanStatus, showToast } = useDispatcher();
  const [filter, setFilter] = useState<LoadFilter>("All");
  const [showAll, setShowAll] = useState(false);
  const [vehicleId, setVehicleId] = useState("VEH014");
  const orderById = new Map(orders.map(o => [o.id, o]));
  const entries = wave.filter(e => { const o = orderById.get(e.orderId); return o && (filter === "All" || (filter === "Chilled" ? o.load !== "Ambient" : o.load === "Ambient")); });
  const visible = showAll ? entries : entries.slice(0, 4);
  const awaiting = wave.filter(e => !e.vehicle);
  const order = orderById.get(selectedPlanOrder)!;
  const entry = wave.find(e => e.orderId === selectedPlanOrder);
  const vehicle = fleet.find(v => v.id === vehicleId)!;
  const checks = checkAssignment(selectedPlanOrder, vehicleId);
  const passed = checks.filter(c => c.pass).length;
  const onVehicle = entry?.vehicle === vehicleId;
  const preview = vehicleLoad(vehicleId, selectedPlanOrder);
  const validate = () => { setPlanStatus("Validated"); router.push("/dispatcher/planning/validation"); };

  return <>
    <section className="flex flex-wrap items-start justify-between gap-4 pt-2">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3"><h1 className="text-[32px] font-extrabold tracking-[-1.2px] text-white sm:text-[34px]">Plan Deliveries</h1><Mono className="rounded-full bg-white px-3 py-1 text-[10px] font-bold text-[#0284c7]">● Wave 1 Active</Mono></div>
        <p className="mt-1 text-[13px] font-medium text-white/85">Monday, 28 September run • Peliyagoda • Planned after Sat cutoff</p>
        <p className="mt-1 flex items-center gap-2 text-[13px] text-white/85"><DIcon name="shieldSky" />Constraint Engine: Armed &amp; Evaluated (Strict Multi-Drop Logic)</p>
      </div>
      <div className="flex flex-wrap items-start gap-3">
        <div className="flex flex-col gap-2"><span className="dispatcher-nav flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-medium text-[#0284c7]"><DIcon name="alarmSkySmall" />Sat cutoff: <Mono className="rounded-md bg-white px-2 py-[2px] text-[11px] font-bold text-[#0284c7] shadow-sm">Before 16:00</Mono></span><Mono className="dispatcher-nav rounded-full px-4 py-2 text-[12px] font-bold text-[#047857]">● Constraint Engine: Armed (Strict)</Mono></div>
        <div className="flex flex-col gap-2"><Mono className="flex items-center gap-2 rounded-full border border-white/40 bg-white/70 px-4 py-2 text-[12px] font-bold text-[#334155] backdrop-blur"><DIcon name="depotNet" />Depot: Peliyagoda Central</Mono><Link href="/dispatcher/planning/forecast" className="rounded-full border border-white/40 bg-white/55 px-4 py-2 text-center text-[12px] font-bold text-[#0f172a] backdrop-blur hover:bg-white/80">Capacity &amp; Forecast →</Link></div>
      </div>
    </section>

    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,0.75fr)]">
      <section aria-label="Orders to plan" className="dispatcher-glass flex flex-col rounded-[22px] p-4">
        <div className="flex items-start justify-between gap-2 px-1"><div className="flex items-start gap-3"><span className="flex size-8 items-center justify-center rounded-lg bg-sky-50"><DIcon name="archive" /></span><div><Mono className="text-[12px] font-bold uppercase tracking-[1px]">Orders to plan</Mono><p className="text-[11px] text-[#64748b]">{awaiting.length} awaiting allocation</p></div></div><div className="flex rounded-full bg-white/70 p-[2px]">{(["All", "Chilled", "Ambient"] as LoadFilter[]).map(f => <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)} className={`cursor-pointer rounded-full px-2 py-1 text-[12px] ${filter === f ? "bg-white font-bold shadow-sm" : "text-[#475569]"}`}>{f}</button>)}</div></div>
        <ul className="mt-4 flex flex-col gap-3">{visible.map(e => { const o = orderById.get(e.orderId)!; const sel = o.id === selectedPlanOrder; return <li key={o.id}><button type="button" aria-pressed={sel} onClick={() => selectPlanOrder(o.id)} className={`w-full cursor-pointer rounded-[16px] border p-4 text-left transition ${sel ? "border-sky-200 bg-sky-50/70 shadow-sm" : "border-white bg-white/75 hover:bg-white"}`}>
          <div className="flex items-center justify-between gap-2"><Mono className="text-[12px] font-bold">{o.id}</Mono>{sel ? <Mono className="rounded-full bg-[#0ea5e9] px-2 py-[2px] text-[10px] font-bold text-white">Selected</Mono> : e.vehicle ? <Mono className="text-[10px] text-[#64748b]">{e.label} · {e.vehicle}</Mono> : <Mono className="rounded-full bg-amber-50 px-2 text-[10px] font-bold text-amber-700">Unassigned</Mono>}</div>
          <p className="mt-2 text-[13px] font-bold text-[#0f172a]">{o.outlet}</p>{sel && <p className="text-[12px] text-[#64748b]">{o.address}</p>}
          <Mono className={`mt-2 flex flex-wrap items-center gap-2 text-[11px] text-[#334155] ${sel ? "border-t border-sky-100 pt-3" : ""}`}><span className={`flex items-center gap-1 font-bold ${o.load === "Ambient" ? "text-emerald-700" : "text-[#0369a1]"}`}>{o.load !== "Ambient" && <DIcon name={sel ? "snowChip" : "snowTiny"} />}{o.load === "Chilled" ? (sel ? "2°C–4°C" : "Chilled") : o.load}</span>•<span>{o.volumeM3} m³</span>•<span>{o.weightKg} kg</span>{e.vehicle && sel && <span className="text-[#64748b]">• on {e.vehicle}</span>}</Mono>
        </button></li>; })}</ul>
        <div className="mt-4 flex items-center justify-between px-1"><Mono className="text-[11px] text-[#64748b]">Peliyagoda Staging Stock: 100%</Mono>{entries.length > 4 && <button type="button" onClick={() => setShowAll(s => !s)} className="dashboard-mono cursor-pointer text-[11px] font-bold text-[#0284c7]">{showAll ? "Show less" : `+${entries.length - 4} more`}</button>}</div>
      </section>

      <section aria-label="Active fleet trips" className="dispatcher-glass rounded-[22px] p-4">
        <div className="flex items-start justify-between gap-2 px-1"><div className="flex items-start gap-3"><span className="flex size-8 items-center justify-center rounded-lg bg-sky-50"><DIcon name="truckFleet" /></span><div><Mono className="text-[12px] font-bold uppercase tracking-[1px]">Active fleet trips</Mono><p className="text-[11px] text-[#64748b]">Peliyagoda Roster • Wave 1 Selection</p></div></div><Mono className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">Wave 1</Mono></div>
        <div className="mt-4 flex flex-col gap-3">{fleet.map(v => { const load = v.id === vehicleId ? preview : vehicleLoad(v.id); const vol = Math.round((load.volume / v.volumeCap) * 100), wt = Math.round((load.weight / v.weightCap) * 100); const sel = v.id === vehicleId;
          if (!sel) return <button key={v.id} type="button" onClick={() => setVehicleId(v.id)} className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-[16px] border border-white bg-white/75 px-4 py-3 text-left hover:bg-white"><span><span className="flex items-center gap-3"><Mono className="text-[12px] font-bold">{v.id}</Mono><span className="text-[12px] text-[#334155]">{v.type}</span></span><Mono className="mt-1 block text-[11px] text-[#475569]">Capacity: {vol}% {vol > 80 ? "full" : "used"} • Driver: {v.driver}</Mono></span>{vol > 80 ? <Mono className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700">Near Cap</Mono> : <Mono className="text-[10px] text-[#64748b]">Available</Mono>}</button>;
          return <div key={v.id} className="rounded-[16px] border border-sky-100 bg-sky-50/40 p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-3"><Mono className="text-[14px] font-bold">{v.id}</Mono><Mono className="rounded bg-sky-100/70 px-2 text-[10px] font-bold text-[#0369a1]">{v.type}</Mono></div><Mono className={`rounded-full border px-2 py-[2px] text-[10px] font-bold ${passed === checks.length ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}`}>{onVehicle ? "Assigned" : passed === checks.length ? "Ready for Allocation" : "Constraint Conflict"}</Mono></div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">{[["Volume Capacity", vol, `${load.volume} m³ / ${v.volumeCap} m³`], ["Payload Weight", wt, `${load.weight.toLocaleString()} kg / ${v.weightCap.toLocaleString()} kg`]].map(([label, pct, detail]) => <div key={label as string}><div className="flex justify-between"><Mono className="text-[11px] text-[#475569]">{label}</Mono><Mono className={`text-[11px] font-bold ${(pct as number) > 100 ? "text-red-600" : "text-[#0284c7]"}`}>{pct}% used</Mono></div><div className="mt-2 h-[6px] rounded-full bg-white"><div className={`h-full rounded-full ${(pct as number) > 100 ? "bg-red-500" : "bg-[#0ea5e9]"}`} style={{ width: `${Math.min(100, pct as number)}%` }} /></div><Mono className="mt-2 block text-[10px] text-[#94a3b8]">{detail}</Mono></div>)}</div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-sky-100 pt-3"><span className="text-[12px] text-[#334155]">Driver: {v.driver} <Mono className="text-[#94a3b8]">(Dep: {v.departure})</Mono></span><DButton tone="accent" disabled={onVehicle || passed !== checks.length} onClick={() => assignOrder(selectedPlanOrder, v.id)} className="rounded-full !bg-[#0ea5e9] px-3 py-[6px] text-[12px] hover:!bg-[#0284c7]"><DIcon name="assignCheck" />{onVehicle ? `${selectedPlanOrder} on ${v.id}` : passed === checks.length ? `Assign ${selectedPlanOrder} Here →` : "Checks failed"}</DButton></div>
          </div>; })}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-[14px] border border-white bg-white/75 px-3 py-3"><Mono className="text-[11px] text-[#334155]">Target Corridor Routing: {order.district === "Colombo" ? "Colombo North Express" : "A1 Gampaha Corridor"}</Mono><Link href="/dispatcher/live" className="dashboard-mono text-[11px] font-bold text-[#0284c7] hover:underline">Map Route</Link></div>
        </div>
      </section>

      <aside aria-label="Verification engine" className="dispatcher-glass rounded-[22px] p-4">
        <div className="flex items-start justify-between gap-2"><div className="flex items-start gap-3"><span className="flex size-7 items-center justify-center rounded-full bg-emerald-50"><DIcon name="badgeGreen" /></span><div><Mono className="text-[12px] font-bold uppercase leading-4 tracking-[1px]">Verification<br />Engine</Mono><p className="text-[11px] text-[#475569]">Constraint Validation</p></div></div><Mono className={`flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-bold leading-3 ${passed === checks.length ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}`}>{passed === checks.length && <DIcon name="passGreen" />}{passed === checks.length ? "Passed" : "Failed"}<br />{passed}/{checks.length}</Mono></div>
        <ul className="mt-4 flex flex-col gap-2">{checks.map(c => <li key={c.key} title={c.detail} className={`flex items-center gap-2 rounded-[12px] border px-3 py-2 text-[12px] ${c.pass ? "border-white bg-white/80 text-[#0f172a]" : "border-red-200 bg-red-50 font-bold text-red-700"}`}>{c.pass ? <DIcon name="checkGreenSmall" /> : <DIcon name="alertRed" />}{c.label}</li>)}</ul>
        <div className="mt-3 rounded-[12px] border border-white bg-white/80 px-3 py-3"><Mono className="text-[10px] font-bold uppercase tracking-[1px]">Assigned vehicle profile</Mono><p className="mt-2 text-[12px] text-[#475569]">Carrier: {vehicle.reefer ? "Peliyagoda Reefer Logistics" : "Peliyagoda Fleet Services"}</p><p className="text-[12px] text-[#475569]">Tailgate Ramp: {vehicle.reefer ? "Hydraulic Verified" : "Manual · Verified"}</p></div>
        <div className="mt-3 rounded-[12px] border border-sky-100 bg-sky-50/50 px-3 py-3"><p className="flex items-center gap-2 text-[12px] font-bold text-[#0284c7]"><DIcon name="bulb" />Allocation Insight</p><p className="mt-1 text-[11px] leading-4 text-[#475569]">{passed === checks.length ? `Consolidating ${order.id} into ${vehicle.id} preserves corridor delivery window ${order.window[0]}–${order.window[1]} without curfew risks.` : `${vehicle.id} cannot take ${order.id}: ${checks.filter(c => !c.pass).map(c => c.detail.toLowerCase()).join("; ")}. Try another vehicle.`}</p></div>
      </aside>
    </div>

    <section aria-label="Plan status" className="dispatcher-glass flex flex-wrap items-center justify-between gap-3 rounded-[20px] px-4 py-3">
      <Mono className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-[#475569]"><span>Allocated: <b className="text-[#0f172a]">{allocatedCount}</b></span><span className="text-slate-300">|</span><span>Deferred: <b className="text-[#0f172a]">{deferred.length}</b></span><span className="text-slate-300">|</span><span>Warnings: <b className="text-[#0f172a]">{risks.length}</b></span><span className="text-slate-300">|</span><span>Total Wave Demand: <b className="text-[#0f172a]">{orders.length} Orders</b></span>{awaiting.length ? <span className="font-bold text-amber-700">● {awaiting.length} order awaiting allocation</span> : <span className="font-bold text-emerald-700">● Selected assignment: Checks passed</span>}</Mono>
      <div className="flex gap-2"><DButton tone="light" onClick={() => showToast("Draft saved as Plan v3 · 06:21.")} className="rounded-full px-4 py-2 text-[13px]">Save Draft</DButton><DButton tone="accent" disabled={awaiting.length > 0} title={awaiting.length ? "Assign every order in the wave before validating" : undefined} onClick={validate} className="rounded-full !bg-[#0ea5e9] px-4 py-2 text-[13px] hover:!bg-[#0284c7]"><DIcon name="validateWhite" />Validate Plan</DButton></div>
    </section>
  </>;
}
