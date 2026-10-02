"use client";
/* eslint-disable @next/next/no-img-element -- map layers are stretched SVGs; next/image adds nothing here */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Chip, DButton, DIcon, Modal, Mono, type DispatcherIconName } from "../../components/dispatcher-ui";
import { findFleet, useDispatcher } from "./dispatcher-store";

const mapLayers: [string, string, string?][] = [
  ["70803.svg", "0 83.77% 0 0"], ["edb09.svg", "0 83.77% 0 10.32%", "0 -2.27% 0 -2.28%"], ["189f5.svg", "0 9.77% 0 57.52%", "0 -0.21%"], ["1bbd5.svg", "0 -2.48% -1.39% 16.51%"], ["f16ed.svg", "0 -2.48% -1.39% 16.51%"],
  ["be786.svg", "32.6% 6.33% 30.02% 15.13%", "-4.79% -1.58%"], ["aafd6.svg", "32.6% 6.33% 30.02% 15.13%", "-2.39% -0.79%"], ["99154.svg", "32.6% 6.33% 30.02% 15.13%", "-1.06% -0.35%"],
  ["16b04.svg", "31.21% 5.36% 28.63% 14.17%", "-0.74% -0.26%"], ["a60e7.svg", "50.1% 45.67% 46.52% 50.62%", "-2.94% -1.85%"],
];
const placeLabels: [string, string, string][] = [["COLOMBO", "13.76%", "75.55%"], ["PELIYAGODA", "28.89%", "49.5%"], ["KADAWATHA", "43.88%", "40.76%"], ["NITTAMBUWA", "60.52%", "35.39%"], ["KEGALLE", "75.65%", "27.63%"], ["KANDY", "89.27%", "25.65%"], ["KADUWELA", "50.21%", "76.34%"], ["INDIAN OCEAN", "2.89%", "89.46%"]];

type Corridor = "All Routes" | "Colombo" | "Gampaha";

function Kpi({ title, value, icon, children, tone = "slate", href }: { title: string; value: number | string; icon: DispatcherIconName; children: ReactNode; tone?: "slate" | "orange"; href: string }) {
  return <Link href={href} className="group flex min-h-[105px] min-w-0 items-center gap-4 rounded-[16px] border border-white/80 bg-white/90 px-5 py-4 shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white">
    <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl border ${tone === "orange" ? "border-orange-200 bg-orange-50" : "border-slate-100 bg-slate-50"}`}><DIcon name={icon} /></span>
    <div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><h2 className={`dashboard-mono max-w-[110px] text-[10px] font-medium uppercase leading-[16px] tracking-[1px] ${tone === "orange" ? "text-[#c2410c]" : "text-[#94a3b8]"}`}>{title}</h2><strong className="text-[26px] font-bold leading-none tracking-[-1px] text-[#0f172a]">{value}</strong></div><div className="mt-2 flex items-center justify-between gap-2 text-[12px] font-medium leading-[17px] text-[#334155]">{children}</div></div>
  </Link>;
}

export default function CommandCenter() {
  const router = useRouter();
  const { orders, allocatedCount, deferred, vehicles, blockedResolved, resolveBlocked } = useDispatcher();
  const [corridor, setCorridor] = useState<Corridor>("All Routes");
  const [swapOpen, setSwapOpen] = useState(false);
  const [swapTo, setSwapTo] = useState("VEH014");
  const planned = Math.round((allocatedCount / orders.length) * 1000) / 10;
  const actionItems = blockedResolved ? 3 : 4;
  const showColombo = corridor !== "Gampaha", showGampaha = corridor !== "Colombo";

  return <>
    <section className="flex flex-wrap items-end justify-between gap-4 pt-2">
      <div className="min-w-0">
        <span className="dispatcher-nav inline-flex items-center gap-3 rounded-full px-[13px] py-[5px] text-[11px]"><span className="flex items-center gap-2"><span className="size-2 rounded-full bg-[#10b981]" /><Mono className="font-bold tracking-[-0.275px] text-[#1e293b]">ACTION REQUIRED</Mono></span><span className="text-[#cbd5e1]">•</span><span className="font-semibold text-[#475569]">Peliyagoda Depot (Central Hub)</span></span>
        <h1 className="mt-3 text-[32px] font-extrabold leading-tight tracking-[-1.2px] text-white sm:text-[38px]">Good morning, Dispatcher</h1>
        <p className="mt-1 flex flex-wrap items-center gap-2 text-[14px] font-medium text-white/80"><DIcon name="clockSky" />Peliyagoda • Monday, 28 September 2026 • Live deliveries and plan review</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <DButton tone="light" onClick={() => router.push("/dispatcher/live")} className="rounded-[14px] px-5 py-[10px] text-[13px]"><DIcon name="liveOps" />View Live Operations</DButton>
        <DButton tone="accent" onClick={() => router.push("/dispatcher/planning")} className="rounded-[14px] !bg-[#0ea5e9] px-5 py-[10px] text-[13px] hover:!bg-[#0284c7]"><DIcon name="calendarWhite" />Open Planning</DButton>
      </div>
    </section>

    <section aria-label="Run summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Kpi title="Confirmed orders" value={orders.length} icon="kpiConfirmed" href="/dispatcher/orders"><span className="flex items-center gap-2"><DIcon name="checkGreen" />All outlets verified</span><span className="dashboard-mono rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold leading-[14px] text-emerald-700">100%<br />Inbound</span></Kpi>
      <Kpi title="Planned orders" value={allocatedCount} icon="routes" href="/dispatcher/planning"><span className="flex items-center gap-2"><DIcon name="warehouse" />Ready for staging</span><span className="dashboard-mono rounded-full bg-violet-50 px-2 py-1 text-[10px] font-bold text-violet-700">{planned}%</span></Kpi>
      <Kpi title="Active deliveries" value={41} icon="truckDark" href="/dispatcher/live"><span className="flex items-center gap-2"><DIcon name="network" />Across {vehicles.length} active vehicles</span><span className="dashboard-mono rounded-full bg-sky-50 px-2 py-1 text-[10px] font-bold text-sky-700">● Live<br />Enroute</span></Kpi>
      <Kpi title="Deferred orders" value={deferred.length} icon="kpiDeferred" tone="orange" href="/dispatcher/exceptions"><span className="flex items-center gap-2"><DIcon name="infoAmber" />Next run review</span><span className="dashboard-mono rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700">{deferred.length ? <>Requires<br />Review</> : "Clear"}</span></Kpi>
    </section>

    <section className="grid items-start gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
      <div className="rounded-[16px] border border-white/80 bg-white/90 p-5 shadow-sm backdrop-blur-xl">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-50"><DIcon name="routes" /></span><div><div className="flex flex-wrap items-center gap-2"><h2 className="text-[16px] font-extrabold tracking-[-0.4px]">Active Delivery Routes</h2><Mono className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-[2px] text-[10px] font-bold text-emerald-700">● {corridor === "All Routes" ? 2 : 1} Active Corridors</Mono></div><p className="mt-1 max-w-[340px] text-[12px] leading-[18px] text-[#64748b]">Real-time corridor telemetry, waypoint status, and active vehicular clusters</p></div></div>
          <div role="tablist" aria-label="Corridor" className="flex rounded-[12px] border border-white bg-slate-50/80 p-1">{(["All Routes", "Colombo", "Gampaha"] as Corridor[]).map(c => <button key={c} role="tab" aria-selected={corridor === c} type="button" onClick={() => setCorridor(c)} className={`cursor-pointer rounded-[10px] px-4 py-1.5 text-center text-[12px] leading-[17px] ${corridor === c ? "bg-white font-bold text-[#0f172a] shadow-sm" : "font-medium text-[#475569] hover:bg-white/60"}`}>{c === "All Routes" ? <>All<br />Routes</> : <>Peliyagoda →<br />{c}</>}</button>)}</div>
        </div>
        <div className="relative mt-5 h-[432px] overflow-hidden rounded-[16px] border border-white bg-[#eaf2fb]">
          <div aria-hidden className="absolute left-0 top-0 h-[503px] w-full min-w-[727px]">
            <img alt="" src="/figma/dispatcher/f440d.svg" className="absolute inset-0 size-full" />
            {mapLayers.map(([file, inset, inner]) => <div key={file} className="absolute" style={{ inset }}>{inner ? <div className="absolute" style={{ inset: inner }}><img alt="" src={`/figma/dispatcher/${file}`} className="block size-full" /></div> : <img alt="" src={`/figma/dispatcher/${file}`} className="absolute inset-0 size-full" />}</div>)}
            {placeLabels.map(([label, left, top]) => <span key={label} className="absolute text-[10px] font-bold text-[#365d7c]" style={{ left, top }}>{label}</span>)}
            <span className="absolute text-[10px] font-bold text-[#1a7bb8]" style={{ left: "51.58%", top: "50.5%" }}>A1</span>
          </div>
          <div className="relative flex items-start justify-between gap-2 p-[14px]">
            <span className="dispatcher-nav flex items-center gap-2 rounded-full px-[13px] py-[5px]"><span className="size-2 rounded-full bg-[#0ea5e9]" /><Mono className="text-[11px] font-bold text-[#1e293b]">Active Delivery Corridors</Mono><span className="text-[#cbd5e1]">•</span><span className="hidden text-[10px] font-semibold text-[#475569] sm:inline">Peliyagoda Hub Operations</span></span>
            <span className="dispatcher-nav flex items-center gap-[10px] rounded-[12px] px-[13px] py-[7px]"><DIcon name="sync" /><Mono className="text-[10px] font-bold text-[#334155]">Last Sync: <span className="text-[#059669]">12s ago</span></Mono></span>
          </div>
          <div className="dispatcher-nav absolute left-[44%] top-[74px] hidden rounded-[12px] px-3 py-2 sm:flex sm:items-center sm:gap-3"><span className="flex size-8 items-center justify-center rounded-lg bg-emerald-50"><DIcon name="depot" /></span><span><span className="block text-[12px] font-bold text-[#0f172a]">Peliyagoda Central Depot</span><Mono className="text-[9px] font-bold text-emerald-600">● Primary Depot • 18 Vehicles Active</Mono></span></div>
          {showGampaha && <Link href="/dispatcher/live?vehicle=VEH028" className="dispatcher-nav absolute left-[72.8%] top-[208px] flex items-center gap-2 rounded-full px-3 py-[6px] hover:bg-white"><span className="size-2 rounded-full bg-[#10b981]" /><Mono className="text-[11px] font-bold">VEH028</Mono><span className="text-[10px] text-[#64748b]">→ Gampaha</span><Mono className="text-[9px] font-bold text-emerald-600">On Schedule</Mono></Link>}
          {showColombo && <Link href="/dispatcher/live?vehicle=VEH012" className="dispatcher-nav absolute left-[16.1%] top-[198px] flex items-center gap-2 rounded-full px-3 py-[6px] hover:bg-white"><span className="size-2 rounded-full bg-[#0ea5e9]" /><Mono className="text-[11px] font-bold">VEH012</Mono><span className="text-[10px] text-[#64748b]">→ Colombo</span><Mono className="text-[9px] font-bold text-sky-600">En Route</Mono></Link>}
          {showColombo && <div className="dispatcher-nav absolute bottom-[56px] left-[24.5%] w-[224px] rounded-[12px] px-[11px] py-[9px]"><div className="flex items-center justify-between"><Mono className="rounded bg-sky-500/10 px-1 text-[9px] font-bold text-[#0284c7]">ORD-0092308</Mono><Mono className="rounded bg-amber-50 px-1 text-[9px] font-bold text-amber-600">+20m</Mono></div><p className="mt-1 text-[12px] font-bold text-[#0f172a]">Kelani Bridge Slowdown</p><div className="mt-1 flex items-center justify-between text-[10px] text-[#64748b]"><span>VEH012 • Est. +20m</span><Link href="/dispatcher/live" className="dashboard-mono font-bold text-[#0284c7] hover:underline">Review Trips</Link></div></div>}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-[14px] border border-slate-100 bg-white/70 px-4 py-3 text-[11px]"><Mono className="font-medium text-[#334155]"><b className="text-[#0f172a]">{vehicles.length}</b> Active Vehicles</Mono><span className="text-[#cbd5e1]">•</span><Mono className="font-medium text-[#334155]"><b className="text-emerald-600">94.2%</b> On-Time Trip Rate</Mono><span className="text-[#cbd5e1]">•</span><Mono className="flex items-center gap-2 font-bold text-[#0284c7]"><DIcon name="alarmSky" />Staging Cutoff: 11:30 AM</Mono><Mono className="flex w-full items-center gap-2 text-[10px] text-[#334155]"><span className="size-2 rounded-full bg-[#10b981]" />Route Status: Operations Normal</Mono></div>
        <Link href="/dispatcher/planning/forecast" className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-[12px] px-1 py-1 hover:bg-white/60">
          <Mono className="w-[70px] text-[10px] font-medium uppercase leading-4 tracking-[1px] text-[#94a3b8]">Fleet capacity</Mono>
          <span aria-hidden className="flex h-8 items-end gap-1">{[["#14b8a6", 20], ["#0ea5e9", 28], ["#0ea5e9", 24], ["#0284c7", 32], ["#94a3b8", 22]].map(([c, h], i) => <span key={i} className="w-2 rounded-full" style={{ background: c as string, height: h as number }} />)}</span>
          <Mono className="text-[11px] font-bold text-[#0f172a]">Depot: Peliyagoda (38/45<br />Serviceable Vehicles)</Mono>
          <Mono className="text-[11px] text-[#64748b]">Reefer: <span className="font-bold text-amber-600">Tight<br />(91%)</span></Mono>
          <Mono className="text-[11px] text-[#64748b]">Dry Trucks:<br /><span className="font-bold text-emerald-600">Available (64%)</span></Mono>
          <Mono className="text-[11px] text-[#64748b]">Vans: <span className="font-bold text-[#0284c7]">6<br />Available</span></Mono>
        </Link>
      </div>

      <aside aria-label="Needs attention" className="flex flex-col gap-[14px] rounded-[16px] border border-white/80 bg-white/90 p-[21px] shadow-sm backdrop-blur-xl">
        <div className="flex items-center justify-between gap-2 border-b border-slate-200/60 pb-[13px]">
          <div className="flex items-center gap-[10px]"><span className="flex h-8 w-[26px] items-center justify-center rounded-[12px] border border-red-200/60 bg-[#fef2f2]"><DIcon name="exclaim" /></span><div><h2 className="text-[14px] font-extrabold leading-[14px]">Needs Attention</h2><p className="mt-1 text-[11px] leading-4 text-[#94a3b8]">Immediate<br />dispatcher resolution</p></div></div>
          <Mono className="flex items-center gap-1 rounded-full border border-red-200/60 bg-[#fef2f2] py-[5px] pl-[11px] pr-3 text-[10px] font-bold leading-[15px] text-[#b91c1c]"><span className="h-[6px] w-1 rounded-full bg-[#ef4444]" />{actionItems} Action Items ({blockedResolved ? 0 : 1} Blocked<br />· 3 Review)</Mono>
        </div>
        <AttentionItem icon="warnAmber" iconBg="bg-amber-100/80" title="2 deliveries at risk" pill="Traffic · Window Risk" pillTone="border-amber-200/60 bg-[#fffbeb] text-[#b45309]" className="border-amber-200/80"
          body={<>ORD-10251 ETA 11:35 vs 11:30 window (+5 min).<br />ORD-10234 has only 18 min margin. Review trips.</>}
          actions={<button type="button" onClick={() => router.push("/dispatcher/live?risk=ORD-10251")} className="cursor-pointer rounded-lg bg-[#0f172a] px-3 py-1 text-[11px] font-bold text-white hover:bg-[#1e293b]">Review Trips</button>} />
        <AttentionItem icon="stagingRose" iconBg="bg-rose-100/80" title="2 staging discrepancies" pill="Staging Discrepancy" pillTone="border-rose-200/60 bg-[#fff1f2] text-[#be123c]"
          body={<>VEH012 · OUT047: 4 of 6 chilled cases staged; 2 short.<br />One damaged item also awaits review.</>}
          actions={<button type="button" onClick={() => router.push("/dispatcher/planning")} className="cursor-pointer rounded-lg border border-[#e2e8f0] bg-white px-[13px] py-[5px] text-[11px] font-bold text-[#1e293b] hover:bg-slate-50">Re-plan Shortfall</button>} />
        <AttentionItem icon="clockSky" iconBg="bg-sky-100/80" title={`${deferred.length} orders deferred`} pill="Decision Needed" pillTone="border-sky-200/60 bg-[#f0f9ff] text-[#0284c7]"
          body={deferred.length ? <>{deferred.length} orders deferred · {deferred.filter(d => d.previous > 0).length} also deferred previously · 2<br />outlets unserved for 4+ days. Review prioritization.</> : <>All deferred orders have been re-planned.</>}
          actions={<button type="button" onClick={() => router.push("/dispatcher/exceptions")} className="cursor-pointer rounded-lg border border-[#e2e8f0] bg-white px-[13px] py-[5px] text-[11px] font-bold text-[#1e293b] hover:bg-slate-50">Review Deferrals</button>} />
        {!blockedResolved && <div className="flex flex-col gap-2 rounded-[12px] border-2 border-red-400/80 bg-red-50/50 p-[14px]">
          <div className="flex items-start justify-between gap-2"><div className="flex items-center gap-2"><span className="flex size-6 items-center justify-center rounded-lg bg-[#dc2626]"><DIcon name="scaleWhite" size={16} /></span><h3 className="text-[12px] font-bold leading-[18px] text-[#450a0a]">Vehicle capacity<br />violation</h3></div><Mono className="rounded-full border border-red-300 bg-red-100/80 px-[9px] py-[3px] text-[10px] font-bold leading-[15px] text-[#b91c1c]">CRITICAL ·<br />BLOCKED</Mono></div>
          <p className="pl-8 text-[11px] font-medium leading-[15px] text-[#7f1d1d]">Trip exceeds VEH019 weight capacity by 420 kg<br />(Max 3,200 kg · Loaded 3,620 kg) — BLOCKED.</p>
          <div className="flex justify-end gap-2 pt-1"><button type="button" onClick={() => setSwapOpen(true)} className="cursor-pointer rounded-lg border border-red-200 bg-white/90 px-[13px] py-[5px] text-[11px] font-bold text-[#1e293b] hover:bg-white">Swap Vehicle</button><button type="button" onClick={() => router.push("/dispatcher/planning")} className="cursor-pointer rounded-lg bg-[#dc2626] px-3 py-1 text-[11px] font-bold text-[#0f172a] hover:bg-[#ef4444]">Re-plan Trip</button></div>
        </div>}
      </aside>
    </section>

    {swapOpen && <Modal label="Swap vehicle for VEH019 trip" onClose={() => setSwapOpen(false)}>
      <h2 className="text-[20px] font-bold">Swap vehicle for VEH019 trip</h2>
      <p className="mt-2 text-[13px] leading-5 text-[#475569]">The trip carries 3,620 kg. Pick a vehicle with enough payload; the loader is told about the change when you confirm.</p>
      <fieldset className="mt-4 space-y-2"><legend className="sr-only">Replacement vehicle</legend>{["VEH014", "VEH021", "VEH034"].map(id => { const v = findFleet(id)!; const fits = v.weightCap >= 3620; return <label key={id} className={`flex cursor-pointer items-center justify-between gap-3 rounded-2xl border px-4 py-3 ${swapTo === id ? "border-[#0ea5e9] bg-sky-50" : "border-slate-200 bg-white"} ${fits ? "" : "opacity-60"}`}><span className="flex items-center gap-3"><input type="radio" name="swap" value={id} checked={swapTo === id} disabled={!fits} onChange={() => setSwapTo(id)} /><span><Mono className="text-[13px] font-bold">{id}</Mono><span className="block text-[11px] text-[#64748b]">{v.type} · max {v.weightCap.toLocaleString()} kg</span></span></span>{fits ? <Chip tone="green">Fits</Chip> : <Chip tone="red">Too small</Chip>}</label>; })}</fieldset>
      <div className="mt-6 flex gap-3"><DButton tone="ghost" onClick={() => setSwapOpen(false)} className="flex-1 rounded-full px-5 py-3 text-[14px]">Cancel</DButton><DButton tone="accent" disabled={findFleet(swapTo)!.weightCap < 3620} onClick={() => { resolveBlocked(swapTo); setSwapOpen(false); }} className="flex-1 rounded-full px-5 py-3 text-[14px]">Confirm swap</DButton></div>
    </Modal>}
  </>;
}

function AttentionItem({ icon, iconBg, title, pill, pillTone, body, actions, className = "border-slate-200/60" }: { icon: DispatcherIconName; iconBg: string; title: string; pill: string; pillTone: string; body: ReactNode; actions: ReactNode; className?: string }) {
  return <div className={`flex flex-col gap-2 rounded-[12px] border bg-slate-50/70 p-[13px] ${className}`}>
    <div className="flex items-center justify-between gap-2"><div className="flex items-center gap-2"><span className={`flex size-6 items-center justify-center rounded-lg ${iconBg}`}><DIcon name={icon} size={16} /></span><h3 className="text-[12px] font-bold leading-[18px] text-[#0f172a]">{title}</h3></div><Mono className={`whitespace-nowrap rounded-full border px-[9px] py-[3px] text-[10px] font-bold leading-[15px] ${pillTone}`}>{pill}</Mono></div>
    <p className="pl-8 text-[11px] leading-[15px] text-[#475569]">{body}</p>
    <div className="flex justify-end pt-1">{actions}</div>
  </div>;
}
