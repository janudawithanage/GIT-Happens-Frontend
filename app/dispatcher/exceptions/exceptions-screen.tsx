"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { DButton, DIcon, Dropdown, Modal, Mono, Pagination, downloadCsv, type DispatcherIconName } from "../../../components/dispatcher-ui";
import type { DeferReason, Deferred, Segment } from "../data";
import { useDispatcher } from "../dispatcher-store";

type Filter = "All" | Segment | "Deferred before" | "No deferrals";
const sorts = ["Sorted by order number", "Sorted by outlet", "Sorted by reason", "Sorted by previous deferrals"] as const;
const reasons: [DeferReason, string, DispatcherIconName][] = [["Refrigerated capacity unavailable", "Refrigerated capacity", "thermoReason"], ["Vehicle capacity unavailable", "Vehicle capacity", "truckReason"], ["Delivery window cannot be met", "Delivery window", "clockReason"], ["Van-only access · no van free", "Van-only access", "vanReason"], ["Weekly fuel quota reached", "Fuel quota", "fuelReason"]];
const reasonIcon = Object.fromEntries(reasons.map(([r, , i]) => [r, i])) as Record<DeferReason, DispatcherIconName>;
const brandIcon: Record<Segment, DispatcherIconName> = { Fresh: "leafSmall", Style: "shirtSmall", Tech: "cpuSmall" };
const PAGE = 8;

function BrandChip({ brand }: { brand: Segment }) {
  return <span className="inline-flex items-center gap-[5px] rounded-full border border-slate-100 bg-white px-2 py-1 text-[11px] font-bold text-[#475569] shadow-sm"><DIcon name={brandIcon[brand]} />{brand}</span>;
}

export default function ExceptionsScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const { deferred, replanDeferred, keepDeferred } = useDispatcher();
  const [filter, setFilter] = useState<Filter>("All");
  const [reason, setReason] = useState<DeferReason | null>(null);
  const [sort, setSort] = useState<(typeof sorts)[number]>("Sorted by order number");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>(["ORD-10288", "ORD-10301"]);
  const [review, setReview] = useState<string[] | null>(null);
  const [decision, setDecision] = useState<"keep" | "replan">("keep");

  const openId = params.get("order");
  const open = openId ? deferred.find(d => d.id === openId) : undefined;
  const setOpen = (id: string | null) => router.replace(id ? `${pathname}?order=${id}` : pathname, { scroll: false });
  const liveSelected = selected.filter(id => deferred.some(d => d.id === id));

  const count = (f: (d: Deferred) => boolean) => deferred.filter(f).length;
  const counts: Record<Filter, number> = { All: deferred.length, Fresh: count(d => d.brand === "Fresh"), Style: count(d => d.brand === "Style"), Tech: count(d => d.brand === "Tech"), "Deferred before": count(d => d.previous > 0), "No deferrals": count(d => d.previous === 0) };
  const rows = deferred.filter(d => (filter === "All" || d.brand === filter || (filter === "Deferred before" && d.previous > 0) || (filter === "No deferrals" && d.previous === 0)) && (!reason || d.reason === reason))
    .sort((a, b) => sort === "Sorted by outlet" ? a.outlet.localeCompare(b.outlet) : sort === "Sorted by reason" ? a.reason.localeCompare(b.reason) : sort === "Sorted by previous deferrals" ? b.previous - a.previous : a.id.localeCompare(b.id));
  const pages = Math.max(1, Math.ceil(rows.length / PAGE));
  const current = Math.min(page, pages);
  const pageRows = rows.slice((current - 1) * PAGE, current * PAGE);
  const allOnPage = pageRows.length > 0 && pageRows.every(r => liveSelected.includes(r.id));
  const toggle = (id: string) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const confirmReview = () => {
    if (!review) return;
    if (decision === "replan") replanDeferred(review); else keepDeferred(review);
    setSelected(s => s.filter(id => !review.includes(id)));
    setReview(null); setOpen(null);
  };
  const exportLog = () => downloadCsv("deferral-log-28-sep.csv", [["Order", "Outlet", "Brand", "Reason", "Original window", "Next run", "Previous deferrals", "Decided by", "Store notified"], ...deferred.map(d => [d.id, d.outlet, d.brand, d.reason, d.window, "Tue, 29 Sep", d.previous, "D. Perera · Sat 16:38 · Plan v3", "Sat 16:43"])]);
  const tiles: [string | number, string, DispatcherIconName, boolean, Filter | null][] = [[counts["All"], "Deferred", "pause", true, "All"], [counts.Fresh, "Waypoint Fresh", "leaf", false, "Fresh"], [counts.Style, "Waypoint Style", "shirt", false, "Style"], [counts.Tech, "Waypoint Tech", "cpu", false, "Tech"], [counts["Deferred before"], "Deferred before", "history", true, "Deferred before"]];

  return <>
    <section className="flex flex-wrap items-end justify-between gap-3 px-[6px] pt-1">
      <div><h1 className="text-[32px] font-bold text-white">Deferred Orders</h1><p className="mt-[6px] flex flex-wrap items-center gap-[6px] text-[13px] font-medium text-white/72"><DIcon name="calWhite" />Monday, 28 September 2026 <span>· Peliyagoda · Plan v3 published Sat 16:42</span></p></div>
      <span className="flex items-center gap-[6px] rounded-full bg-white/66 px-[10px] py-[5px] text-[11px] font-bold text-[#475569]"><DIcon name="calChip" />Next operating day: Tuesday, 29 September</span>
    </section>

    <section aria-label="Deferral totals" className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">{tiles.map(([value, label, icon, warm, f], i) => <button key={label} type="button" disabled={!deferred.length} aria-pressed={filter === f && i > 0} onClick={() => { setFilter(f ?? "All"); setPage(1); }} className={`flex cursor-pointer items-center gap-4 rounded-[22px] border border-white/95 px-5 py-5 text-left shadow-[0_12px_32px_-8px_rgba(13,26,51,0.08)] backdrop-blur-xl transition hover:-translate-y-px disabled:cursor-default disabled:hover:translate-y-0 ${i === 0 ? "bg-white/94 py-6" : "bg-white/80"} ${filter === f && i > 0 ? "ring-2 ring-[#0284c7]/50" : ""}`}><span className={`flex shrink-0 items-center justify-center rounded-xl ${i === 0 ? "size-11" : "size-9"} ${warm ? "bg-orange-100/80" : "bg-white shadow-sm"}`}><DIcon name={icon} /></span><span><Mono className={`block font-bold leading-none ${i === 0 ? "text-[28px]" : "text-[22px]"} ${i === 4 ? "text-[#c2410c]" : "text-[#0f172a]"}`}>{value}</Mono><span className="mt-1 block text-[13px] font-bold text-[#475569]">{label}</span></span></button>)}</section>

    {deferred.length > 0 ? <>
      <section aria-label="By reason" className="dispatcher-glass flex flex-wrap items-center gap-x-5 gap-y-2 rounded-[22px] px-4 py-3 xl:rounded-full"><span className="text-[12px] font-bold text-[#475569]">By reason</span>{reasons.map(([r, label, icon]) => { const n = count(d => d.reason === r); return n ? <button key={r} type="button" aria-pressed={reason === r} onClick={() => { setReason(x => x === r ? null : r); setPage(1); }} className={`flex cursor-pointer items-center gap-[6px] rounded-full px-2 py-1 text-[12px] font-medium text-[#334155] ${reason === r ? "bg-sky-100 ring-1 ring-[#0284c7]/40" : "hover:bg-white/80"}`}><DIcon name={icon} />{label}<b className="text-[#0f172a]">{n}</b></button> : null; })}</section>

      <section className="relative rounded-[26px] border border-white/90 bg-white/55 p-5 shadow-sm backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex flex-wrap gap-2">{(Object.keys(counts) as Filter[]).map(f => <button key={f} type="button" aria-pressed={filter === f} onClick={() => { setFilter(f); setPage(1); }} className={`flex cursor-pointer items-center gap-1 rounded-full px-3 py-[7px] text-[12px] font-bold ${filter === f ? "bg-[#0284c7] text-white" : "border border-white bg-white/90 text-[#334155] hover:bg-white"}`}>{f === "Deferred before" && <DIcon name="alertChip" />}{f}{f !== "No deferrals" && ` ${counts[f]}`}</button>)}</div><Dropdown value={sort} options={sorts} onChange={setSort} className="[&>button]:border-transparent [&>button]:bg-transparent" /></div>
        <div className="mt-4 overflow-x-auto rounded-[16px] border border-white bg-white/85">
          <table className="w-full min-w-[960px] text-left">
            <thead><tr className="dashboard-mono text-[10px] uppercase tracking-[1px] text-[#475569]"><th className="w-10 px-4 py-3"><input type="checkbox" aria-label="Select all on this page" checked={allOnPage} onChange={() => setSelected(s => allOnPage ? s.filter(id => !pageRows.some(r => r.id === id)) : [...new Set([...s, ...pageRows.map(r => r.id)])])} className="size-[18px] cursor-pointer accent-[#0284c7]" /></th>{["Order", "Outlet", "Brand", "Reason", "Original window", "Next run", "Previous deferrals"].map(h => <th key={h} className="px-3 py-3 font-medium">{h}</th>)}</tr></thead>
            <tbody>{pageRows.map(d => { const sel = liveSelected.includes(d.id); return <tr key={d.id} onClick={() => setOpen(d.id)} className={`cursor-pointer border-t border-slate-100 ${open?.id === d.id ? "outline-2 -outline-offset-2 outline-[#0284c7] bg-sky-50/70" : sel ? "bg-sky-100/50" : "hover:bg-slate-50/80"}`}>
              <td className="px-4 py-3" onClick={e => e.stopPropagation()}><input type="checkbox" aria-label={`Select ${d.id}`} checked={sel} onChange={() => toggle(d.id)} className="size-[18px] cursor-pointer accent-[#0284c7]" /></td>
              <td className="px-3 py-3"><Mono className="text-[12px] font-bold">{d.id}</Mono></td><td className="px-3 py-3 text-[13px] font-bold">{d.outlet}</td><td className="px-3 py-3"><BrandChip brand={d.brand} /></td>
              <td className="px-3 py-3"><span className="flex items-center gap-2 text-[13px] text-[#334155]"><DIcon name={reasonIcon[d.reason]} />{d.reason}</span></td>
              <td className="px-3 py-3"><Mono className="text-[12px] text-[#334155]">{d.window.replace("–", "-")}</Mono></td><td className="px-3 py-3 text-[13px] font-bold">Tue, 29 Sep</td>
              <td className="px-3 py-3">{d.previous ? <span className="flex items-center gap-2 text-[11px] text-[#64748b]"><Mono className="flex items-center gap-1 rounded-md bg-orange-100/80 px-[6px] py-[2px] text-[11px] font-bold text-[#c2410c]"><DIcon name="legendAlert" />{d.previous}</Mono>{d.previous === 1 ? "time" : "times"} before</span> : <Mono className="text-[12px] text-[#475569]">0</Mono>}</td>
            </tr>; })}
            {!pageRows.length && <tr><td colSpan={8} className="px-4 py-10 text-center text-[13px] text-[#64748b]">No deferrals match this filter.</td></tr>}</tbody>
          </table>
        </div>
        <div className="mt-4 flex items-center justify-between"><span className="text-[12px] text-[#475569]">Showing {pageRows.length} of {rows.length} deferred orders</span><Pagination page={current} pages={pages} onPage={setPage} /></div>

        {open && <div className="absolute inset-0 z-20 flex items-start justify-center rounded-[26px] bg-[rgba(15,23,42,0.06)] pt-24" onMouseDown={e => { if (e.target === e.currentTarget) setOpen(null); }}>
          <div role="dialog" aria-label={`${open.id} deferral detail`} className="dispatcher-glass-strong flex w-[340px] max-w-[calc(100%-24px)] flex-col gap-3 rounded-[22px] p-5">
            <div className="flex items-center justify-between"><Mono className="text-[17px] font-bold">{open.id}</Mono><span className="flex items-center gap-2"><span className="flex items-center gap-[5px] rounded-full bg-slate-100 px-2 py-1 text-[11px] font-bold text-[#475569]"><DIcon name={brandIcon[open.brand]} />{open.brand}</span><button type="button" aria-label="Close" onClick={() => setOpen(null)} className="cursor-pointer rounded-full bg-white/66 p-[6px] hover:bg-white"><DIcon name="close" /></button></span></div>
            <p className="text-[15px] font-bold">{open.outlet}</p>
            <div className="h-px bg-[rgba(15,23,42,0.08)]" />
            <div><Mono className="text-[9px] font-bold tracking-[0.36px] text-[#64748b]">DEFERRED BECAUSE</Mono><p className="mt-[2px] flex items-center gap-[6px] text-[13px] font-bold"><DIcon name={open.reason.startsWith("Vehicle") ? "truckSmall" : reasonIcon[open.reason]} size={13} />{open.reason}</p></div>
            <div className="grid grid-cols-2 gap-3"><div><Mono className="text-[9px] font-bold tracking-[0.36px] text-[#64748b]">PREVIOUS DEFERRALS</Mono><Mono className={`mt-[2px] flex items-center gap-[6px] text-[13px] font-bold ${open.previous ? "text-[#b45309]" : "text-[#0f172a]"}`}>{open.previous > 0 && <DIcon name="alertWarn" />}{open.previous}</Mono></div><div><Mono className="text-[9px] font-bold tracking-[0.36px] text-[#64748b]">LAST SERVED</Mono><p className="mt-[2px] text-[13px] font-bold">{open.lastServed}</p></div><div><Mono className="text-[9px] font-bold tracking-[0.36px] text-[#64748b]">ORIGINAL WINDOW</Mono><Mono className="mt-[2px] block text-[13px] font-bold">{open.window}</Mono></div><div><Mono className="text-[9px] font-bold tracking-[0.36px] text-[#64748b]">NEXT RUN</Mono><p className="mt-[2px] text-[13px] font-bold">Tue, 29 Sep</p></div></div>
            <div className="dispatcher-subtle flex flex-col gap-[6px] rounded-[14px] p-3"><Mono className="text-[9px] font-bold tracking-[0.36px] text-[#64748b]">DECISION LOG</Mono><p className="flex items-center gap-2 text-[12px] font-medium text-[#475569]"><DIcon name="user" />Deferred by D. Perera · Sat 16:38 · Plan v3</p><p className="flex items-center gap-2 text-[12px] font-medium text-[#475569]"><DIcon name="bellSmall" />Store manager notified · Sat 16:43</p></div>
            <DButton tone="accent" onClick={() => { setDecision("keep"); setReview([open.id]); }} className="w-full rounded-full px-[18px] py-3 text-[13px]">Review Decision<DIcon name="chevWhite" /></DButton>
          </div>
        </div>}
      </section>
    </> : <section className="flex flex-col items-center justify-center gap-3 rounded-[26px] border border-white/90 bg-white/80 px-6 py-14 text-center shadow-sm backdrop-blur-xl">
      <span className="flex size-[62px] items-center justify-center rounded-full bg-emerald-50"><DIcon name="checkBig" /></span>
      <h2 className="mt-2 text-[20px] font-bold">No orders deferred for Monday’s run.</h2>
      <p className="text-[13px] text-[#475569]">All confirmed orders for Monday, 28 September are assigned to a vehicle and trip.</p>
      <Link href="/dispatcher/planning/validation" className="mt-1 flex items-center gap-2 text-[13px] font-bold text-[#0284c7] hover:underline"><DIcon name="routeChip" />View today’s plan</Link>
    </section>}

    <section aria-label="Selection" className="dispatcher-glass flex flex-wrap items-center justify-between gap-3 rounded-[26px] px-5 py-3 xl:rounded-full">
      <p className="flex flex-wrap items-center gap-2 text-[12px] text-[#475569]"><DIcon name="info" /><b className="text-[13px] text-[#0f172a]">{liveSelected.length} selected</b>· Each deferral keeps its reason, decision time and who decided it.</p>
      <div className="flex gap-2"><DButton tone="light" onClick={exportLog} className="rounded-full px-5 py-3 text-[13px]"><DIcon name="downloadDark" />Export log</DButton><DButton tone="accent" disabled={!liveSelected.length} onClick={() => { setDecision("keep"); setReview(liveSelected); }} className="rounded-full px-5 py-3 text-[13px]">Review Selected<DIcon name="chevWhite" /></DButton></div>
    </section>

    {review && <Modal label="Review deferral decision" onClose={() => setReview(null)}>
      <h2 className="text-[20px] font-bold">Review {review.length === 1 ? review[0] : `${review.length} deferrals`}</h2>
      <p className="mt-2 text-[13px] leading-5 text-[#475569]">Your decision is logged with your name and time, and the store manager sees the outcome.</p>
      <fieldset className="mt-4 space-y-2"><legend className="sr-only">Decision</legend>{([["keep", "Keep for Tue, 29 Sep", "Confirm the deferral; the order rides first on the next run."], ["replan", "Re-plan into today’s run", "Move the order back to Planning to find a vehicle with room."]] as const).map(([value, title, body]) => <label key={value} className={`flex cursor-pointer gap-3 rounded-2xl border px-4 py-3 ${decision === value ? "border-[#0ea5e9] bg-sky-50" : "border-slate-200 bg-white"}`}><input type="radio" name="decision" checked={decision === value} onChange={() => setDecision(value)} className="mt-1" /><span><span className="block text-[13px] font-bold">{title}</span><span className="block text-[12px] text-[#64748b]">{body}</span></span></label>)}</fieldset>
      <div className="mt-6 flex gap-3"><DButton tone="ghost" onClick={() => setReview(null)} className="flex-1 rounded-full px-5 py-3 text-[14px]">Cancel</DButton><DButton tone="accent" onClick={confirmReview} className="flex-1 rounded-full px-5 py-3 text-[14px]">Confirm decision</DButton></div>
    </Modal>}
  </>;
}
