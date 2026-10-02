"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import { DButton, DIcon, Dropdown, Mono, Pagination, downloadCsv, type DispatcherIconName } from "../../../components/dispatcher-ui";
import { minutes, type LoadType, type Order } from "../data";
import { useDispatcher } from "../dispatcher-store";

type Tab = "All" | "Fresh" | "Style" | "Tech" | "Chilled" | "Deferred";
const windowsFilter = ["All Windows", "Early (before 08:00)", "Morning (08:00–12:00)", "Afternoon (after 12:00)"] as const;
const PAGE = 6;

export function SegmentPill({ segment }: { segment: Order["segment"] }) {
  const style = segment === "Fresh" ? "border-slate-200 bg-slate-50 text-[#334155]" : segment === "Style" ? "border-indigo-200 bg-indigo-50 text-indigo-700" : "border-sky-200 bg-sky-50 text-sky-700";
  return <Mono className={`rounded-full border px-2 py-[3px] text-[10px] font-bold ${style}`}>{segment}</Mono>;
}

export function LoadChip({ order }: { order: Order }) {
  if (order.load === "Chilled") return <Mono className="inline-flex items-center gap-1 rounded-md border border-sky-100 bg-sky-50 px-2 py-[3px] text-[10px] font-bold text-[#0369a1]"><DIcon name="snowChip" />Chilled {order.temp}</Mono>;
  if (order.load === "Controlled") return <Mono className="inline-flex items-center gap-1 rounded-md border border-slate-100 bg-slate-50 px-2 py-[3px] text-[10px] text-[#475569]"><DIcon name="thermoDark" />Controlled {order.temp}</Mono>;
  return <Mono className="inline-flex items-center gap-1 rounded-md border border-slate-100 bg-slate-50 px-2 py-[3px] text-[10px] text-[#475569]"><DIcon name="ambient" />Ambient</Mono>;
}

function Kpi({ icon, iconTone, title, sub, value, tone = "slate" }: { icon: DispatcherIconName; iconTone: string; title: string; sub: ReactNode; value: number; tone?: "slate" | "orange" }) {
  return <div className="flex min-h-[70px] items-center gap-4 rounded-[18px] border border-white/90 bg-white/90 px-5 py-4 shadow-sm backdrop-blur-xl">
    <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${iconTone}`}><DIcon name={icon} /></span>
    <div className="min-w-0 flex-1"><Mono className={`block text-[10px] font-medium uppercase tracking-[1px] ${tone === "orange" ? "font-bold text-[#c2410c]" : "text-[#94a3b8]"}`}>{title}</Mono><div className="mt-1 truncate text-[13px] font-bold">{sub}</div></div>
    <strong className={`text-[26px] font-bold leading-none ${tone === "orange" ? "text-[#ea580c]" : ""}`}>{value}</strong>
  </div>;
}

function inWindow(order: Order, filter: (typeof windowsFilter)[number]) {
  const start = minutes(order.window[0]);
  if (filter === "Early (before 08:00)") return start < 480;
  if (filter === "Morning (08:00–12:00)") return start >= 480 && start < 720;
  if (filter === "Afternoon (after 12:00)") return start >= 720;
  return true;
}

export default function OrdersScreen() {
  const router = useRouter();
  const { orders, deferred } = useDispatcher();
  const [tab, setTab] = useState<Tab>("All");
  const [query, setQuery] = useState("");
  const [windowFilter, setWindowFilter] = useState<(typeof windowsFilter)[number]>("All Windows");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [loads, setLoads] = useState<LoadType[]>([]);
  const [districts, setDistricts] = useState<Order["district"][]>([]);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState("ORD0092308");

  const counts = useMemo(() => ({ All: orders.length, Fresh: orders.filter(o => o.segment === "Fresh").length, Style: orders.filter(o => o.segment === "Style").length, Tech: orders.filter(o => o.segment === "Tech").length, Chilled: orders.filter(o => o.load === "Chilled").length, Deferred: orders.filter(o => o.status === "Deferred").length }), [orders]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter(o => (tab === "All" || o.segment === tab || (tab === "Chilled" && o.load === "Chilled") || (tab === "Deferred" && o.status === "Deferred"))
      && (!q || `${o.id} ${o.outletId} ${o.outlet} ${o.district} ${o.address}`.toLowerCase().includes(q))
      && inWindow(o, windowFilter) && (!loads.length || loads.includes(o.load)) && (!districts.length || districts.includes(o.district)));
  }, [orders, tab, query, windowFilter, loads, districts]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const current = Math.min(page, pages);
  const rows = filtered.slice((current - 1) * PAGE, current * PAGE);
  const weight = filtered.reduce((s, o) => s + o.weightKg, 0), volume = filtered.reduce((s, o) => s + o.volumeM3, 0);
  const reset = (fn: () => void) => { fn(); setPage(1); };
  const toggle = <T,>(list: T[], value: T) => list.includes(value) ? list.filter(v => v !== value) : [...list, value];
  const exportCsv = () => downloadCsv("confirmed-orders-28-sep.csv", [["Order ID", "Outlet ID", "Outlet", "Segment", "District", "Window", "Load", "Temp", "Status", "Weight kg", "Volume m3"], ...filtered.map(o => [o.id, o.outletId, o.outlet, o.segment, o.district, `${o.window[0]}-${o.window[1]}`, o.load, o.temp ?? "", o.status, o.weightKg, o.volumeM3])]);

  return <>
    <section className="flex flex-wrap items-end justify-between gap-4 pt-2">
      <div>
        <span className="dispatcher-nav inline-flex items-center gap-3 rounded-full px-[13px] py-[5px] text-[11px]"><span className="flex items-center gap-2"><span className="size-2 rounded-full bg-[#10b981]" /><Mono className="font-bold text-[#1e293b]">OPERATIONS NORMAL</Mono></span><span className="font-semibold text-[#475569]">Peliyagoda Depot</span></span>
        <h1 className="mt-3 text-[32px] font-extrabold leading-tight tracking-[-1.2px] text-white sm:text-[36px]">Confirmed Orders</h1>
        <p className="mt-1 flex flex-wrap items-center gap-2 text-[13px] font-medium text-white/80"><DIcon name="clockSmall" />Peliyagoda • Monday, 28 September run • Orders closed Sat 16:00</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="dispatcher-nav flex items-center gap-2 rounded-full px-3 py-[6px] text-[12px] font-medium text-[#64748b]"><DIcon name="alarmOrange" />Sat cutoff: <Mono className="rounded-md bg-white px-2 py-[2px] text-[11px] font-bold text-[#0f172a] shadow-sm">Before 16:00</Mono></span>
        <button type="button" aria-label="Download filtered orders as CSV" onClick={exportCsv} className="dispatcher-nav flex size-[38px] cursor-pointer items-center justify-center rounded-full hover:bg-white"><DIcon name="download" /></button>
        <DButton tone="accent" onClick={() => router.push("/dispatcher/planning")} className="rounded-full !bg-[#0ea5e9] px-4 py-[9px] text-[13px] hover:!bg-[#0284c7]"><DIcon name="play" />Start Planning Run</DButton>
      </div>
    </section>

    <section aria-label="Order totals" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Kpi icon="ordersKpi" iconTone="bg-slate-50" title="Confirmed orders" sub="All outlets verified" value={counts.All} />
      <Kpi icon="snowSky" iconTone="bg-sky-50" title="Chilled load" sub={<Mono className="text-[#0284c7]">2°C – 4°C Safe</Mono>} value={counts.Chilled} />
      <Kpi icon="leafViolet" iconTone="bg-violet-50" title="Fresh load" sub={<span className="text-violet-700">Early routing</span>} value={counts.Fresh} />
      <Kpi icon="clockOrange" iconTone="bg-orange-50" title="Next-run deferrals" sub={<span className="text-[#c2410c]">{deferred.length} need a reason</span>} value={deferred.length} tone="orange" />
    </section>

    <section className="rounded-[26px] border border-white/90 bg-white/55 p-6 shadow-sm backdrop-blur-xl">
      <div role="tablist" aria-label="Order segment" className="inline-flex max-w-full flex-wrap gap-1 rounded-[14px] border border-white bg-white/70 p-1">
        {(Object.keys(counts) as Tab[]).map(t => <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => reset(() => setTab(t))} className={`dashboard-mono cursor-pointer rounded-[10px] px-[14px] py-[7px] text-[11px] font-bold uppercase tracking-[0.5px] ${tab === t ? "bg-[#0ea5e9] text-white shadow-sm" : t === "Deferred" ? "bg-sky-50 text-[#0284c7] hover:bg-sky-100" : "text-[#475569] hover:bg-white"}`}>{t} ({counts[t]})</button>)}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <label className="flex h-[36px] w-full max-w-[448px] items-center gap-2 rounded-[12px] border border-white bg-white/90 px-3 shadow-sm"><DIcon name="searchGrey" /><input aria-label="Filter orders" value={query} onChange={e => reset(() => setQuery(e.target.value))} placeholder="Filter order ID, outlet, or district…" className="min-w-0 flex-1 bg-transparent text-[12px] outline-none placeholder:text-[#94a3b8]" /></label>
        <div className="relative flex items-center gap-2">
          <Dropdown label="Window:" value={windowFilter} options={windowsFilter} onChange={v => reset(() => setWindowFilter(v))} strong />
          <button type="button" aria-expanded={filtersOpen} onClick={() => setFiltersOpen(o => !o)} className="flex cursor-pointer items-center gap-2 rounded-full border border-white bg-white/94 px-3 py-2 text-[12px] font-bold text-[#0f172a] hover:bg-white"><DIcon name="sliders" />Filters{loads.length + districts.length > 0 && <span className="rounded-full bg-[#0ea5e9] px-[6px] text-[10px] text-white">{loads.length + districts.length}</span>}</button>
          {filtersOpen && <div className="dispatcher-glass-strong absolute right-0 top-[calc(100%+8px)] z-30 w-[260px] rounded-2xl p-4 text-[12px]">
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#64748b]">Load &amp; temperature</p>
            {(["Chilled", "Ambient", "Controlled"] as LoadType[]).map(l => <label key={l} className="mt-2 flex cursor-pointer items-center gap-2"><input type="checkbox" checked={loads.includes(l)} onChange={() => reset(() => setLoads(x => toggle(x, l)))} />{l}</label>)}
            <p className="mt-4 text-[11px] font-bold uppercase tracking-wide text-[#64748b]">District</p>
            {(["Colombo", "Gampaha"] as Order["district"][]).map(d => <label key={d} className="mt-2 flex cursor-pointer items-center gap-2"><input type="checkbox" checked={districts.includes(d)} onChange={() => reset(() => setDistricts(x => toggle(x, d)))} />{d}</label>)}
            <div className="mt-4 flex justify-between"><button type="button" onClick={() => reset(() => { setLoads([]); setDistricts([]); })} className="cursor-pointer font-bold text-[#0284c7]">Clear</button><button type="button" onClick={() => setFiltersOpen(false)} className="cursor-pointer font-bold text-[#0f172a]">Done</button></div>
          </div>}
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-[16px] border border-white bg-white/92 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left">
            <thead><tr className="dashboard-mono border-b border-slate-100 text-[10px] font-medium uppercase tracking-[1px] text-[#64748b]">{["Order ID", "Destination Outlet", "Segment", "District", "Delivery Window", "Load & Temp", "Fulfillment Status", "Actions"].map((h, i) => <th key={h} className={`px-4 py-4 font-medium ${i === 7 ? "text-right" : ""}`}>{h}</th>)}</tr></thead>
            <tbody>{rows.map(o => { const def = o.status === "Deferred"; const sel = selected === o.id; return <tr key={o.id} onClick={() => setSelected(o.id)} className={`cursor-pointer border-b border-slate-100 last:border-0 ${def ? "bg-amber-50/60 hover:bg-amber-50" : sel ? "bg-sky-50/40" : "hover:bg-slate-50/70"}`}>
              <td className="px-4 py-3"><span className="flex items-center gap-2">{def ? <DIcon name="warnOrange" size={15} /> : sel ? <DIcon name="radioSky" /> : <span className="w-[15px]" />}<Mono className={`text-[12px] font-bold ${def ? "text-[#c2410c]" : sel ? "text-[#0284c7]" : "text-[#0f172a]"}`}>{o.id}</Mono></span></td>
              <td className="px-4 py-3"><span className="block text-[13px] font-bold text-[#0f172a]">{o.outletId} • {o.outlet}</span><span className="text-[11px] text-[#64748b]">{o.address}</span></td>
              <td className="px-4 py-3"><SegmentPill segment={o.segment} /></td>
              <td className="px-4 py-3 text-[13px] text-[#0f172a]">{o.district}</td>
              <td className="px-4 py-3"><Mono className="flex items-center gap-2 text-[12px] text-[#0f172a]"><DIcon name="clockGrey" />{o.window[0]} – {o.window[1]}</Mono></td>
              <td className="px-4 py-3"><LoadChip order={o} /></td>
              <td className="px-4 py-3">{def ? <Mono className="rounded-full border border-amber-200 bg-amber-50 px-2 py-[3px] text-[10px] font-bold text-amber-700">Carryover • deferred</Mono> : <Mono className="rounded-full border border-sky-100 bg-sky-50 px-2 py-[3px] text-[10px] font-bold text-[#0284c7]">● Confirmed</Mono>}</td>
              <td className="px-4 py-3 text-right">{def ? <Link href="/dispatcher/exceptions" onClick={e => e.stopPropagation()} className="inline-flex items-center gap-1 text-[13px] font-bold text-[#c2410c] hover:underline">Reassign <DIcon name="chevOrange" /></Link> : <Link href={`/dispatcher/orders/${o.id}`} onClick={e => e.stopPropagation()} className={`inline-flex items-center gap-1 text-[13px] font-bold hover:underline ${sel ? "text-[#0284c7]" : "text-[#334155]"}`}>View <DIcon name={sel ? "chevSky" : "chevDark"} /></Link>}</td>
            </tr>; })}
            {!rows.length && <tr><td colSpan={8} className="px-4 py-12 text-center text-[13px] text-[#64748b]">No orders match these filters. <button type="button" onClick={() => reset(() => { setTab("All"); setQuery(""); setWindowFilter("All Windows"); setLoads([]); setDistricts([]); })} className="cursor-pointer font-bold text-[#0284c7]">Clear filters</button></td></tr>}</tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
          <Mono className="text-[12px] text-[#475569]">Showing <b className="text-[#0f172a]">{filtered.length ? (current - 1) * PAGE + 1 : 0}-{Math.min(current * PAGE, filtered.length)}</b> of <b className="text-[#0f172a]">{filtered.length}</b> confirmed orders <span className="mx-2 text-slate-300">|</span> Weight: <b className="text-[#0f172a]">{weight.toLocaleString()} kg</b> <span className="mx-2 text-slate-300">|</span> Volume: <b className="text-[#0f172a]">{volume.toFixed(1)} m³</b></Mono>
          <Pagination page={current} pages={pages} onPage={setPage} />
        </div>
      </div>
    </section>

    <RunRules tripIcon="tripLimitOrange" />
  </>;
}

export function RunRules({ tripIcon }: { tripIcon: DispatcherIconName }) {
  const cards: [DispatcherIconName, string, string, string, string][] = [
    ["cutoff", "Order cutoff", "Next-run orders close at 16:00", "Late orders wait for the following operating run.", "text-[#94a3b8]"],
    ["coldChain", "Cold chain", "Chilled orders need a reefer", "Refrigerated vehicles can also carry ambient goods.", "text-[#94a3b8]"],
    [tripIcon, "Trip limit", "Two trips per vehicle maximum", "Check weight, volume, window and weekly fuel quota.", tripIcon === "tripLimitOrange" ? "font-bold text-[#c2410c]" : "font-bold text-[#0284c7]"],
  ];
  return <section aria-label="Run rules" className="grid gap-4 md:grid-cols-3">{cards.map(([icon, label, title, body, labelTone]) => <div key={label} className="flex gap-4 rounded-[18px] border border-white/90 bg-white/88 p-5 shadow-sm backdrop-blur-xl"><span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sky-50"><DIcon name={icon} /></span><div><Mono className={`text-[10px] uppercase tracking-[1px] ${labelTone}`}>{label}</Mono><p className="mt-1 text-[14px] font-bold text-[#0f172a]">{title}</p><p className="mt-1 text-[12px] text-[#64748b]">{body}</p></div></div>)}</section>;
}
