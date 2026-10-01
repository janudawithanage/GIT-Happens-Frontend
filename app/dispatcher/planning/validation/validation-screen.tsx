"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DButton, DIcon, Modal, Mono, type DispatcherIconName } from "../../../../components/dispatcher-ui";
import type { Segment } from "../../data";
import { useDispatcher } from "../../dispatcher-store";

const brands: Segment[] = ["Fresh", "Style", "Tech"];

export default function ValidationScreen() {
  const router = useRouter();
  const { orders, wave, deferred, allocatedCount, planStatus, setPlanStatus, showToast } = useDispatcher();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const unassigned = wave.filter(e => !e.vehicle).length;
  const totals = brands.map(b => { const total = orders.filter(o => o.segment === b).length; const def = deferred.filter(d => d.brand === b).length; return { brand: b, total, deferred: def, allocated: total - def - (b === "Fresh" ? unassigned : 0) }; });
  const checks: [DispatcherIconName, string, string][] = [["box", "Capacity", "Within limits"], ["thermo", "Temperature", "Compatible"], ["truck", "Vehicle access", "Compatible"], ["clock", "Delivery windows", "Within planned windows"], ["fuel", "Fuel", "Within weekly quota"], ["route", "Trips", "Within daily limits"]];
  const ready = unassigned === 0;
  const preview = deferred.slice(0, 2);
  const publish = () => { setPlanStatus("Published"); setConfirmOpen(false); showToast("Monday's plan published. Loader trips sent; store managers notified of deferrals."); };

  return <>
    <section className="flex flex-wrap items-end justify-between gap-4 pt-2">
      <div><h1 className="text-[32px] font-bold text-white">Plan Validation</h1><p className="mt-2 flex flex-wrap items-center gap-4 text-[14px] font-medium text-white/80"><span className="flex items-center gap-2"><DIcon name="pin" />Peliyagoda</span><span className="flex items-center gap-2"><DIcon name="calWhite" />Monday, 28 September 2026</span></p></div>
      <div className="flex items-center gap-3"><span className="flex items-center gap-2 rounded-full bg-white/66 px-3 py-[5px] text-[11px] font-bold text-[#475569]"><DIcon name="clockChip" />Orders closed Sat · 16:00</span><Link href="/dispatcher/planning" className="flex items-center gap-2 text-[11px] font-bold text-[#38bdf8] hover:underline"><DIcon name="routeChip" />Plan draft v3</Link></div>
    </section>

    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
      <div className="flex flex-col gap-5">
        <section className="dispatcher-glass rounded-[26px] p-7">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200/70 pb-6"><div className="flex items-center gap-5"><span className={`flex size-16 items-center justify-center rounded-full ${ready ? "bg-emerald-50" : "bg-amber-50"}`}>{ready ? <DIcon name="checkBig" /> : <DIcon name="alertOrange" size={28} />}</span><div><Mono className="text-[10px] font-bold uppercase tracking-[1px] text-[#475569]">Validation result</Mono><h2 className="text-[28px] font-bold leading-tight">{planStatus === "Published" ? "Plan published" : ready ? "Plan is ready" : "Plan needs attention"}</h2><p className="mt-1 flex flex-wrap items-center gap-2 text-[14px] font-bold text-[#475569]">{allocatedCount} orders allocated <span className="text-slate-300">·</span><span className="flex items-center gap-1 text-[#c2410c]"><DIcon name="alertOrange" />{deferred.length} deferrals recorded</span></p></div></div><span className="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700"><DIcon name="shield" />{ready ? "6 of 6 checks passed" : "5 of 6 checks passed"}</span></div>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">{checks.map(([icon, label, value], i) => { const ok = ready || i !== 0; return <li key={label} className="flex items-center gap-4 rounded-[18px] border border-white bg-white/80 px-4 py-4"><span className="flex size-9 items-center justify-center rounded-xl bg-slate-50"><DIcon name={icon} /></span><span className="min-w-0 flex-1"><span className="block text-[12px] text-[#475569]">{label}</span><span className="block text-[13px] font-bold">{ok ? value : `${unassigned} order not allocated`}</span></span><span className={`flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold ${ok ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{ok && <DIcon name="pass" />}{ok ? "Pass" : "Check"}</span></li>; })}</ul>
        </section>

        <section className="dispatcher-glass rounded-[26px] p-6">
          <div className="flex items-center justify-between"><h2 className="flex items-center gap-3 text-[18px] font-bold"><DIcon name="alertTitle" />Recorded deferrals<span className="rounded-full bg-orange-50 px-2 py-[2px] text-[11px] text-[#c2410c]">{deferred.length}</span></h2><Link href="/dispatcher/exceptions" className="flex items-center gap-1 text-[13px] font-bold text-[#0284c7] hover:underline">View all {deferred.length}<DIcon name="chevSkySmall" /></Link></div>
          <ul className="mt-4 flex flex-col gap-3">{preview.map(d => <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 rounded-[18px] border border-white bg-white/85 px-5 py-4"><div className="flex items-center gap-4"><span className="flex size-11 items-center justify-center rounded-xl bg-orange-50"><DIcon name={d.reason.startsWith("Refrigerated") ? "thermoOrangeTile" : "truckOrangeTile"} /></span><div><p className="flex items-center gap-2"><Mono className="text-[13px] font-bold">{d.id}</Mono><span className="rounded bg-slate-100 px-2 text-[10px] font-bold text-[#475569]">{d.brand}</span></p><p className="text-[15px] font-bold">{d.outlet}</p><p className="text-[13px] text-[#475569]"><Mono className="mr-2 text-[9px] uppercase tracking-[1px] text-[#64748b]">Reason</Mono>{d.reason}{d.reason.startsWith("Vehicle") ? " in the current plan." : "."}</p></div></div><DButton tone="light" onClick={() => router.push(`/dispatcher/exceptions?order=${d.id}`)} className="rounded-full px-5 py-3 text-[14px] shadow-sm">Review<DIcon name="chevReview" /></DButton></li>)}</ul>
          {deferred.length > 2 && <p className="mt-4 text-[12px] text-[#475569]">{deferred.length - 2} more deferred orders have reasons recorded for store notification.</p>}
          {!deferred.length && <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-[13px] text-emerald-800">No deferrals in this plan — every confirmed order has a vehicle.</p>}
        </section>
      </div>

      <div className="flex flex-col gap-5">
        <section className="dispatcher-glass rounded-[26px] p-6">
          <div className="flex items-center justify-between gap-2"><h2 className="text-[18px] font-bold">Allocation Summary</h2><span className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-[11px] font-bold text-[#475569]"><DIcon name="db" />Prototype seed data</span></div>
          <ul className="mt-4 divide-y divide-slate-200/70">{totals.map(t => <li key={t.brand} className="py-4"><div className="flex justify-between"><span className="text-[15px] font-bold">Waypoint {t.brand}</span><Mono className="text-[12px] text-[#475569]">{t.total} orders</Mono></div><div className="mt-3 flex h-2 gap-1"><span className="rounded-full bg-[#0284c7]" style={{ flex: t.allocated }} /><span className="rounded-full bg-[#c2410c]" style={{ flex: t.deferred }} /></div><p className="mt-2 flex gap-4 text-[13px] text-[#475569]"><span className="flex items-center gap-1"><DIcon name="checkSky" />{t.allocated} allocated</span><span className="flex items-center gap-1"><DIcon name="pauseOrange" />{t.deferred} deferred</span></p></li>)}</ul>
          <Mono className="mt-2 flex flex-wrap justify-between gap-2 text-[12px] text-[#0f172a]"><span className="font-sans text-[13px] text-[#475569]">All brands</span><span>{orders.length} orders · {allocatedCount} allocated · {deferred.length} deferred</span></Mono>
        </section>
        <section className="dispatcher-glass rounded-[26px] p-6">
          <h2 className="text-[18px] font-bold">{planStatus === "Published" ? "Published to loading team" : "Publish to loading team"}</h2>
          <p className="mt-3 text-[13px] leading-5 text-[#475569]">{planStatus === "Published" ? "Trips and stop order are live on loader devices. Store managers have the deferral reasons." : "Sends vehicle trips and stop order to the loading team. Deferred orders reach store managers with reasons."}</p>
          <DButton tone="accent" disabled={!ready || planStatus === "Published"} onClick={() => setConfirmOpen(true)} className="mt-5 w-full rounded-full px-5 py-4 text-[15px]"><DIcon name="sendWhite" />{planStatus === "Published" ? "Plan Published" : "Publish Plan"}</DButton>
          {!ready && <p className="mt-2 text-center text-[12px] text-amber-700">Assign the remaining order in Planning before publishing.</p>}
          <DButton tone="light" onClick={() => router.push(planStatus === "Published" ? "/dispatcher/live" : "/dispatcher/planning")} className="mt-3 w-full rounded-full px-5 py-4 text-[15px]"><DIcon name="back" />{planStatus === "Published" ? "Go to Live Operations" : "Return to Planning"}</DButton>
        </section>
      </div>
    </div>

    {confirmOpen && <Modal label="Publish Monday's plan?" onClose={() => setConfirmOpen(false)} className="flex flex-col items-center gap-[18px] text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-sky-500/10"><DIcon name="sendSky" /></span>
      <h2 className="text-[22px] font-bold">Publish Monday’s plan?</h2>
      <p className="text-[14px] font-medium leading-5 text-[#475569]">Send trips to the loader and deferral reasons to store managers.</p>
      <div className="flex flex-wrap justify-center gap-2"><Mono className="flex items-center gap-[6px] rounded-full bg-slate-100 px-[10px] py-[6px] text-[11px] font-bold text-[#475569]"><DIcon name="routeGrey" />{orders.length} confirmed</Mono><Mono className="flex items-center gap-[6px] rounded-full bg-sky-500/10 px-[10px] py-[6px] text-[11px] font-bold text-[#0284c7]"><DIcon name="checkAccent" />{allocatedCount} allocated</Mono><Mono className="flex items-center gap-[6px] rounded-full bg-amber-600/10 px-[10px] py-[6px] text-[11px] font-bold text-[#b45309]"><DIcon name="pauseWarn" />{deferred.length} deferred</Mono></div>
      <div className="flex w-full gap-3 pt-[6px]"><DButton tone="ghost" onClick={() => setConfirmOpen(false)} className="flex-1 rounded-full px-5 py-[14px] text-[14px]">Cancel</DButton><DButton tone="accent" onClick={publish} className="flex-1 rounded-full px-5 py-[14px] text-[14px]"><DIcon name="sendWhite" />Publish Plan</DButton></div>
    </Modal>}
  </>;
}
