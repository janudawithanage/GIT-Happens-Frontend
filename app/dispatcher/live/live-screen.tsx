"use client";
/* eslint-disable @next/next/no-img-element -- map layers are stretched SVGs; next/image adds nothing here */

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { DButton, DIcon, Dropdown, Mono, type DispatcherIconName } from "../../../components/dispatcher-ui";
import { minutes, type LiveStatus, type LiveVehicle } from "../data";
import { useDispatcher } from "../dispatcher-store";

const W = 1132, H = 488;
const pct = (v: number, of: number) => `${(v / of) * 100}%`;
const box = (x: number, y: number, w?: number, h?: number) => ({ left: pct(x, W), top: pct(y, H), ...(w ? { width: pct(w, W) } : {}), ...(h ? { height: pct(h, H) } : {}) });
const fullLayers = ["32a41", "86608", "6915a", "00526", "33f81", "1061f", "4bc81"];
const contours: [string, number, number, number, number][] = [["384b7", 715.13, 26.16, 523.267, 348.844], ["55e1c", 784.9, 69.77, 383.729, 261.633], ["f367c", 845.95, 113.37, 261.633, 174.422], ["9e73e", 907, 152.62, 139.538, 95.932]];
const routes = ["fe008", "1d2cc", "c700f", "37d3f", "8d8cf", "15549", "d6de7", "133c3", "e551e", "8703f", "b6d08", "4aca1", "a2e72", "6b170", "86e23", "d05c4", "4363e", "34139", "becd5", "b024b", "bb848", "b299b", "e7a99"];
const places: [string, number, number, number, number][] = [["Colombo", 229.37, 307.86, 139.54, 310.47], ["Nugegoda", 334.02, 395.07, 261.63, 399.43], ["Kaduwela", 508.44, 307.86, 535.48, 310.47], ["Gampaha", 421.23, 107.27, 448.27, 95.93]];
const towns: [string, string, string][] = [["KELANIYA", "31.36%", "17.83%"], ["NITTAMBUWA", "52.12%", "21.52%"], ["WARAKAPOLA", "62.72%", "19.47%"], ["KEGALLE", "73.32%", "22.13%"], ["MAWANELLA", "82.69%", "19.67%"], ["PERADENIYA", "88.34%", "59.02%"]];

const depots = ["All depots", "Peliyagoda", "Kandy"] as const;
const brands = ["All brands", "Fresh", "Style", "Tech"] as const;
const statuses = ["All statuses", "On route", "At stop", "Delivery risk", "Offline"] as const;
const riskLevels = ["Any risk", "At risk", "Tight", "No risk"] as const;
const statusStyle: Record<LiveStatus, { icon: DispatcherIconName; text: string }> = { "On route": { icon: "navAccent", text: "text-[#0284c7]" }, "At stop": { icon: "pinSuccess", text: "text-[#047857]" }, "Delivery risk": { icon: "alertWarn", text: "text-[#b45309]" }, Offline: { icon: "offline", text: "text-[#64748b]" } };

const T0 = minutes("03:30"), SPAN = 9 * 60, NOW = minutes("06:21");
const tl = (time: string) => `${((minutes(time) - T0) / SPAN) * 100}%`;
const fmt = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

function Row({ label, children }: { label: string; children: ReactNode }) {
  return <div className="flex items-center justify-between gap-3"><span className="text-[12px] font-medium text-[#64748b]">{label}</span><span className="text-right text-[13px] font-bold text-[#0f172a]">{children}</span></div>;
}

export default function LiveScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const { vehicles, risks, notifyRisk, resolveRisk, showToast } = useDispatcher();
  const [depot, setDepot] = useState<(typeof depots)[number]>("All depots");
  const [brand, setBrand] = useState<(typeof brands)[number]>("All brands");
  const [status, setStatus] = useState<(typeof statuses)[number]>("All statuses");
  const [risk, setRisk] = useState<(typeof riskLevels)[number]>("Any risk");
  const [view, setView] = useState<"Map" | "List">("Map");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [showAll, setShowAll] = useState(false);
  const [refreshIn, setRefreshIn] = useState(30);
  const [updated, setUpdated] = useState(NOW);
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null);

  useEffect(() => {
    const id = window.setInterval(() => setRefreshIn(s => { if (s > 1) return s - 1; setUpdated(u => u + 0.5); return 30; }), 1000);
    return () => window.clearInterval(id);
  }, []);

  const selectedVehicle = params.get("vehicle");
  const selectedRisk = params.get("risk");
  const select = (key: "vehicle" | "risk" | null, id?: string) => router.replace(key && id ? `${pathname}?${key}=${id}` : pathname, { scroll: false });

  const matches = (v: LiveVehicle) => (depot === "All depots" || v.depot === depot) && (brand === "All brands" || v.brand === brand) && (status === "All statuses" || v.status === status)
    && (risk === "Any risk" || (risk === "No risk" ? !v.risk : v.risk === risk));
  const filtered = vehicles.filter(matches);
  const tracked = filtered.filter(v => v.stops.length);
  const parked = filtered.filter(v => !v.stops.length);
  const listed = showAll ? filtered : tracked;
  const activeRisks = risks.filter(r => filtered.some(v => v.id === r.vehicle));
  const vehicle = selectedVehicle ? vehicles.find(v => v.id === selectedVehicle) : undefined;
  const exception = selectedRisk ? risks.find(r => r.id === selectedRisk) : undefined;
  const highlight = vehicle?.id ?? exception?.vehicle;
  const filtersActive = depot !== "All depots" || brand !== "All brands" || status !== "All statuses" || risk !== "Any risk";

  const setZoomTo = (z: number) => { const next = Math.min(2.5, Math.max(1, z)); setZoom(next); if (next === 1) setPan({ x: 0, y: 0 }); };
  const onPointerDown = (e: ReactPointerEvent) => { if (zoom === 1 || (e.target as HTMLElement).closest("button")) return; drag.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y }; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); };
  const onPointerMove = (e: ReactPointerEvent) => { if (!drag.current) return; const lim = (zoom - 1) * 300; setPan({ x: Math.max(-lim, Math.min(lim, drag.current.px + e.clientX - drag.current.x)), y: Math.max(-lim / 2, Math.min(lim / 2, drag.current.py + e.clientY - drag.current.y)) }); };

  const chip = (v: LiveVehicle) => {
    if (!v.chip) return null;
    const isRisk = v.status === "Delivery risk", offline = v.status === "Offline", stop = v.status === "At stop";
    const border = isRisk ? "border-white bg-[#f57814]" : offline ? "border-[rgba(140,150,165,0.5)] bg-white/97" : stop ? "border-[rgba(22,163,74,0.5)] bg-white/97" : "border-[rgba(30,136,255,0.5)] bg-white/97";
    const dot = isRisk ? "01427" : offline ? "033c7" : stop ? "8b1d3" : "a8b59";
    const label = v.chip.label ?? v.id;
    return <button key={v.id} type="button" aria-label={`${label} — open details`} onClick={() => { const r = risks.find(x => x.vehicle === v.id && x.level === "At risk"); select(r ? "risk" : "vehicle", r ? r.id : v.id); }} className={`absolute flex cursor-pointer items-center gap-[5px] rounded-full border-[1.3px] py-[3.5px] pl-[4.4px] pr-[8.7px] shadow-[0_3.5px_8.7px_rgba(26,51,102,0.18)] transition hover:scale-105 ${border} ${highlight === v.id ? "ring-2 ring-[#0284c7] ring-offset-1" : ""}`} style={box(v.chip.x, v.chip.y)}>
      <img alt="" src={`/figma/dispatcher/${dot}.svg`} className="size-[8.7px]" /><Mono className="whitespace-nowrap text-[9.6px] font-bold text-[#161e2e]">{label}</Mono>
    </button>;
  };

  return <>
    <section className="flex flex-wrap items-center justify-between gap-3 px-[6px] pt-[2px]">
      <div className="flex flex-wrap items-center gap-4"><h1 className="text-[32px] font-bold text-white">Live Monitor</h1><Mono className="flex items-center gap-[6px] rounded-full bg-[rgba(4,120,87,0.1)] px-[10px] py-[5px] text-[11px] font-bold text-[#047857]"><DIcon name="liveDot" />LIVE</Mono><span className="flex items-center gap-2 text-[15px] font-bold text-white/72"><DIcon name="activeDot" />{tracked.length + parked.length} vehicles active</span></div>
      <div className="flex flex-wrap items-center gap-[10px]"><span className="text-[12px] font-medium text-white/72">Peliyagoda + Kandy · Mon 28 Sep 2026</span><span className="flex items-center gap-[6px] rounded-full bg-white/66 px-[10px] py-[5px] text-[11px] font-bold text-[#475569]"><DIcon name="radio" />Updated {fmt(Math.floor(updated))} · auto-refresh {refreshIn} s</span></div>
    </section>

    <section aria-label="Filters" className="dispatcher-glass flex flex-wrap items-center justify-between gap-3 rounded-[28px] py-2 pl-4 pr-[10px] xl:rounded-full">
      <div className="flex flex-wrap items-center gap-[6px]"><DIcon name="filter" /><span className="text-[13px] font-bold text-[#475569]">Filters</span>
        <Dropdown label="Depot:" value={depot} options={depots} onChange={setDepot} /><Dropdown label="Brand:" value={brand} options={brands} onChange={setBrand} /><Dropdown label="Vehicle status:" value={status} options={statuses} onChange={setStatus} /><Dropdown label="Risk level:" value={risk} options={riskLevels} onChange={setRisk} />
        <button type="button" disabled={!filtersActive} onClick={() => { setDepot("All depots"); setBrand("All brands"); setStatus("All statuses"); setRisk("Any risk"); }} className="cursor-pointer px-1 text-[12px] font-bold text-[#0284c7] disabled:cursor-default disabled:opacity-50">Reset</button>
      </div>
      <div className="flex flex-wrap items-center gap-[10px]">{([["On route", "legendNav", "bg-[rgba(2,132,199,0.1)]"], ["At stop", "legendPin", "bg-[rgba(4,120,87,0.1)]"], ["Delivery risk", "legendAlert", "bg-[rgba(217,119,6,0.12)]"], ["Offline", "legendOffline", "bg-[rgba(241,245,249,0.95)]"]] as [LiveStatus, DispatcherIconName, string][]).map(([label, icon, bg]) => <button key={label} type="button" aria-pressed={status === label} onClick={() => setStatus(s => s === label ? "All statuses" : label)} className={`flex cursor-pointer items-center gap-[6px] rounded-full pr-1 ${status === label ? "ring-2 ring-[#0284c7]/40" : ""}`}><span className={`flex size-5 items-center justify-center rounded-full ${bg}`}><DIcon name={icon} /></span><span className="text-[12px] font-bold text-[#475569]">{label}</span></button>)}</div>
    </section>

    <section className="dispatcher-glass rounded-[26px] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 px-1"><div className="flex flex-wrap items-center gap-[10px]"><DIcon name="map" /><h2 className="text-[16px] font-bold">Network map</h2><span className="text-[12px] font-medium text-[#64748b]">Abstract operational view · not to scale</span></div>
        <div role="tablist" aria-label="View" className="dispatcher-subtle flex gap-[2px] rounded-full p-[3px]">{(["Map", "List"] as const).map(v => <button key={v} type="button" role="tab" aria-selected={view === v} onClick={() => setView(v)} className={`flex cursor-pointer items-center gap-[6px] rounded-full px-[14px] py-[7px] text-[12px] font-bold ${view === v ? "bg-[#0284c7] text-white" : "text-[#475569] hover:bg-white/70"}`}><DIcon name={v === "Map" ? (view === v ? "mapWhite" : "map") : "listGrey"} size={14} />{v}</button>)}</div>
      </div>
      <div className="relative mt-3 overflow-x-auto rounded-[20px]">
        <div className="relative min-w-[900px] overflow-hidden rounded-[20px] border border-white/95 bg-[#f0f5fa]" style={{ aspectRatio: `${W} / ${H}` }}>
          {view === "Map" ? <div className={`absolute inset-0 ${zoom > 1 ? "cursor-grab active:cursor-grabbing" : ""}`} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={() => { drag.current = null; }}>
            <div className="absolute inset-0 origin-center bg-gradient-to-r from-[#e3f0fb] to-[#d9e5f5] transition-transform duration-200" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}>
              {fullLayers.map(f => <img key={f} alt="" src={`/figma/dispatcher/${f}.svg`} className="pointer-events-none absolute inset-0 size-full" />)}
              {contours.map(([f, x, y, w, h]) => <img key={f} alt="" src={`/figma/dispatcher/${f}.svg`} className="pointer-events-none absolute" style={box(x, y, w, h)} />)}
              <img alt="" src="/figma/dispatcher/82ea1.png" className="pointer-events-none absolute" style={box(623.56, 147.39, 235.47, 97.676)} />
              {routes.map(f => <img key={f} alt="" src={`/figma/dispatcher/${f}.svg`} className={`pointer-events-none absolute inset-0 size-full ${(f === "b299b" || f === "e7a99") && !risks.some(r => r.vehicle === "VEH021") ? "hidden" : ""}`} />)}
              <div className="pointer-events-none absolute" style={{ inset: "0 4.59% 0 15.02%" }}><div className="absolute" style={{ inset: "-0.11% 0 -0.1% 0" }}><img alt="" src="/figma/dispatcher/057af.svg" className="block size-full" /></div><img alt="" src="/figma/dispatcher/f4400.svg" className="absolute inset-0 size-full" /></div>
              {towns.map(([t, left, top]) => <span key={t} className="pointer-events-none absolute text-[10px] font-bold text-[#5d7892] opacity-80" style={{ left, top }}>{t}</span>)}
              {places.map(([name, hx, hy, lx, ly]) => <span key={name}><img alt="" src="/figma/dispatcher/764d0.svg" className="absolute" style={box(hx, hy, 29.652, 29.652)} /><img alt="" src="/figma/dispatcher/f5a76.svg" className="absolute" style={box(hx + 7.84, hy + 7.84, 13.954, 13.954)} /><span className="absolute rounded-[10px] border border-white bg-white/94 px-[8.7px] py-[4.4px] text-[9.9px] font-bold text-[#161e2e] shadow-[0_3.5px_10.5px_rgba(26,51,102,0.14)]" style={box(lx, ly)}>{name}</span></span>)}
              {([[204.95, 175.38, 267.74, 206.69, 313.96, 205.82, "Peliyagoda Distribution Center", "DEPOT · CENTRAL DC"], [893.91, 131.78, 956.71, 163.08, 912.23, 106.4, "Kandy Regional Hub", "REGIONAL HUB"]] as const).map(([rx, ry, dx, dy, lx, ly, name, tag]) => <span key={name}>
                <img alt="" src="/figma/dispatcher/0c54d.svg" className="absolute" style={box(rx, ry, 165.701, 102.735)} /><img alt="" src="/figma/dispatcher/7b87e.svg" className="absolute" style={box(rx + 21.8, ry + 13.52, 122.096, 75.699)} /><img alt="" src="/figma/dispatcher/9c2e5.svg" className="absolute" style={box(rx + 42.73, ry + 26.5, 80.234, 49.745)} />
                <span className="absolute flex items-center justify-center rounded-[14px] border-[2.6px] border-white shadow-[0_5px_15.7px_rgba(26,115,255,0.45)]" style={{ ...box(dx, dy, 40.117, 40.117), aspectRatio: "1", backgroundImage: "linear-gradient(135deg, rgb(80,170,255) 0%, rgb(20,110,230) 50%)" }}><img alt="" src="/figma/dispatcher/b6098.svg" className="size-[48%]" /></span>
                <span className="absolute flex flex-col whitespace-nowrap rounded-[10px] border border-white bg-white/94 px-[8.7px] py-[4.4px] font-bold shadow-[0_3.5px_10.5px_rgba(26,51,102,0.14)]" style={box(lx, ly)}><span className="text-[9.9px] text-[#161e2e]">{name}</span><Mono className="text-[7.85px] tracking-[0.3px] text-[#5c687c]">{tag}</Mono></span>
              </span>)}
              <Mono className="absolute rounded-md bg-white/85 px-[7px] py-[2.6px] text-[7.85px] font-bold text-[#5c687c]" style={box(488.38, 156.98)}>A1 · COLOMBO–KANDY</Mono>
              <span className="absolute rounded-full bg-white/90 px-[8.7px] py-[3.5px] text-[8.4px] font-semibold text-[#be5a0a]" style={box(669.78, 252.91)}>Low coverage · Kegalle stretch</span>
              <span className="absolute text-[10.65px] italic text-[#5a82b4]" style={box(34.88, 436.06)}>Indian Ocean</span><span className="absolute text-[9.13px] italic text-[#6e82a0]" style={box(924.44, 366.29)}>Central highlands</span>
              {parked.length > 0 && <button type="button" onClick={() => setView("List")} className="absolute cursor-pointer rounded-full bg-white/95 px-[8.7px] py-[3.5px] text-[8.4px] font-semibold text-[#5c687c] hover:bg-white" style={box(153.49, 181.4)}>+{parked.length} at depot / returning</button>}
              {filtered.map(chip)}
            </div>
            <div className="dispatcher-glass-strong absolute right-[15px] top-[15px] flex flex-col gap-1 rounded-[14px] p-1 !shadow-none">{([["plus", "Zoom in", () => setZoomTo(zoom + 0.25)], ["minus", "Zoom out", () => setZoomTo(zoom - 0.25)], ["target", "Reset view", () => setZoomTo(1)]] as [DispatcherIconName, string, () => void][]).map(([icon, label, fn]) => <button key={label} type="button" aria-label={label} onClick={fn} className="flex size-[34px] cursor-pointer items-center justify-center rounded-[10px] hover:bg-slate-100"><DIcon name={icon} /></button>)}</div>
            <span className="dispatcher-glass-strong absolute left-[15px] top-[15px] flex items-center gap-[6px] rounded-full px-3 py-[6px] text-[11px] font-medium text-[#475569] !shadow-none"><DIcon name="navBlue" />{filtered.length ? "Select a vehicle, route, stop or warning for details" : "No vehicles match these filters"}</span>
          </div> : <div className="absolute inset-0 overflow-y-auto bg-white/80 p-4">
            <table className="w-full text-left text-[12px]"><thead><tr className="dashboard-mono text-[10px] uppercase tracking-[1px] text-[#64748b]">{["Vehicle", "Brand · Trip", "Area", "Status", "ETA", "Driver", "Depot"].map(h => <th key={h} className="px-3 py-2 font-medium">{h}</th>)}</tr></thead>
              <tbody>{filtered.map(v => <tr key={v.id} onClick={() => select("vehicle", v.id)} className={`cursor-pointer border-t border-slate-100 hover:bg-sky-50/60 ${highlight === v.id ? "bg-sky-50" : ""}`}><td className="px-3 py-2"><Mono className="font-bold">{v.id}</Mono></td><td className="px-3 py-2">{v.brand} · Trip {v.trip}</td><td className="px-3 py-2 font-bold">{v.area}</td><td className="px-3 py-2"><span className={`flex items-center gap-1 font-bold ${statusStyle[v.status].text}`}><DIcon name={statusStyle[v.status].icon} />{v.status}</span></td><td className="px-3 py-2"><Mono className="font-bold">{v.eta}</Mono></td><td className="px-3 py-2">{v.driver}</td><td className="px-3 py-2">{v.depot}</td></tr>)}</tbody></table>
            {!filtered.length && <p className="py-10 text-center text-[13px] text-[#64748b]">No vehicles match these filters.</p>}
          </div>}

          {vehicle && <div className="dispatcher-glass-strong absolute right-[16px] top-[16px] z-10 flex max-h-[calc(100%-32px)] w-[300px] flex-col gap-[10px] overflow-y-auto rounded-[22px] p-[18px]">
            <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Mono className="text-[18px] font-bold">{vehicle.id}</Mono><span className={`flex items-center gap-[6px] rounded-full px-[10px] py-[5px] text-[11px] font-bold ${vehicle.status === "On route" ? "bg-[rgba(2,132,199,0.1)] text-[#0284c7]" : vehicle.status === "At stop" ? "bg-[rgba(4,120,87,0.1)] text-[#047857]" : vehicle.status === "Offline" ? "bg-slate-100 text-[#64748b]" : "bg-[rgba(217,119,6,0.12)] text-[#b45309]"}`}>{vehicle.status === "On route" ? <DIcon name="navChip" /> : <DIcon name={statusStyle[vehicle.status].icon} size={12} />}{vehicle.status}</span></div><button type="button" aria-label="Close vehicle details" onClick={() => select(null)} className="cursor-pointer rounded-full bg-white/66 p-[6px] hover:bg-white"><DIcon name="close" /></button></div>
            <p className="text-[11px] font-medium text-[#64748b]">Waypoint {vehicle.brand} · {vehicle.vehicleType} · {vehicle.depot}</p>
            <div className="h-px bg-[rgba(15,23,42,0.08)]" />
            <Row label="Driver">{vehicle.driver}</Row><Row label="Trip"><Mono>{vehicle.trip}</Mono></Row><Row label="Stops"><Mono>{vehicle.stops.length}</Mono></Row><Row label="Completed"><Mono>{vehicle.stops.filter(s => s.state === "done").length} / {vehicle.stops.length}</Mono></Row>
            <div className="h-[6px] overflow-hidden rounded-[3px] bg-[rgba(241,245,249,0.95)]"><div className="h-full rounded-[3px] bg-[#0284c7]" style={{ width: `${vehicle.stops.length ? (vehicle.stops.filter(s => s.state === "done").length / vehicle.stops.length) * 100 : 0}%` }} /></div>
            <Row label="Current">{vehicle.current}</Row><Row label="ETA"><Mono>{vehicle.eta} {minutes(vehicle.eta) < 720 ? "AM" : "PM"}</Mono></Row><Row label="Load"><Mono>{vehicle.load}% volume</Mono></Row>
            <Row label="Status"><span className={`flex items-center gap-[6px] ${vehicle.risk ? "text-[#b45309]" : "text-[#047857]"}`}>{vehicle.risk ? <DIcon name="alertWarn" /> : <DIcon name="checkSuccess" />}{vehicle.risk ? (vehicle.risk === "Tight" ? "Tight margin" : "At risk") : vehicle.status === "Offline" ? "Awaiting ping" : "On schedule"}</span></Row>
            <div className="flex gap-2"><DButton tone="ghost" onClick={() => select(null)} className="flex-1 rounded-full px-[14px] py-[10px] text-[12px]"><DIcon name="routeDark" />Return to map</DButton><DButton tone="accent" onClick={() => showToast(`Calling ${vehicle.driver} (${vehicle.id}) via fleet radio…`)} className="flex-1 rounded-full px-[14px] py-[10px] text-[12px]"><DIcon name="call" />Call driver</DButton></div>
          </div>}

          {exception && <div className={`dispatcher-glass-strong absolute right-[16px] top-[16px] z-10 flex max-h-[calc(100%-32px)] w-[330px] flex-col gap-[10px] overflow-y-auto rounded-[22px] border p-[18px]`} style={{ borderColor: exception.level === "At risk" ? "#dc2626" : "#d97706" }}>
            <div className="flex items-center justify-between"><div className="flex items-center gap-2"><DIcon name="alertDanger" /><span className="text-[16px] font-bold">Delivery risk</span><span className={`rounded-full px-[10px] py-[5px] text-[11px] font-bold ${exception.level === "At risk" ? "bg-[rgba(220,38,38,0.1)] text-[#dc2626]" : "bg-[rgba(217,119,6,0.12)] text-[#b45309]"}`}>{exception.level}</span></div><button type="button" aria-label="Close risk details" onClick={() => select(null)} className="cursor-pointer rounded-full bg-white/66 p-[6px] hover:bg-white"><DIcon name="close" /></button></div>
            <p className="text-[12px] font-bold text-[#475569]">{exception.vehicle} · {exception.brand} · Trip 1 · {exception.area}</p>
            <div className="h-px bg-[rgba(15,23,42,0.08)]" />
            <Row label="Order"><Mono>{exception.id}</Mono></Row><Row label="Outlet">{exception.outlet}</Row><Row label="ETA"><Mono className={exception.level === "At risk" ? "text-[#dc2626]" : ""}>{exception.eta} AM</Mono></Row><Row label="Window closes"><Mono>{exception.closes} AM</Mono></Row>
            <Row label="Projected delay"><span className={`flex items-center gap-[6px] ${exception.level === "At risk" ? "text-[#dc2626]" : "text-[#b45309]"}`}><DIcon name="clockDanger" />{exception.level === "At risk" ? `Predicted +${minutes(exception.eta) - minutes(exception.closes)} min` : `${minutes(exception.closes) - minutes(exception.eta)} min margin`}</span></Row>
            <div className={`flex flex-col gap-1 rounded-[14px] p-3 ${exception.level === "At risk" ? "bg-[rgba(220,38,38,0.1)]" : "bg-[rgba(217,119,6,0.12)]"}`}><Mono className={`text-[9px] font-bold tracking-[0.36px] ${exception.level === "At risk" ? "text-[#dc2626]" : "text-[#b45309]"}`}>LIKELY CAUSE</Mono><p className="text-[12px] font-medium text-[#0f172a]">{exception.cause}</p></div>
            <p className="text-[12px] font-bold text-[#475569]">Resolve</p>
            <DButton tone="accent" disabled={exception.notified} onClick={() => notifyRisk(exception.id)} className="w-full rounded-full px-[14px] py-[10px] text-[12px]"><DIcon name="bellWhite" />{exception.notified ? "Store manager notified" : "Notify store manager"}</DButton>
            <div className="flex gap-2"><DButton tone="ghost" onClick={() => { resolveRisk(exception.id, `Stops resequenced on ${exception.vehicle}. New ETA ${fmt(minutes(exception.closes) - 6)} — inside the window.`); select(null); }} className="flex-1 whitespace-nowrap rounded-full px-2 py-[10px] text-[12px]"><DIcon name="resequence" />Resequence stops</DButton><DButton tone="ghost" onClick={() => { resolveRisk(exception.id, `${exception.id} delay accepted and logged against ${exception.vehicle}.`); select(null); }} className="flex-1 rounded-full px-2 py-[10px] text-[12px]"><DIcon name="checkDark" />Accept &amp; log</DButton></div>
          </div>}
        </div>
      </div>
    </section>

    <div className="grid items-stretch gap-[18px] lg:grid-cols-2">
      <section aria-label="Delivery risks" className="dispatcher-glass flex flex-col gap-3 rounded-[26px] p-5">
        <div className="flex items-center justify-between"><h2 className="flex items-center gap-2 text-[16px] font-bold"><DIcon name="alertWarnTitle" />Delivery Risks<Mono className="rounded-full bg-[rgba(217,119,6,0.12)] px-[10px] py-[3px] text-[11px] text-[#b45309]">{activeRisks.length}</Mono></h2><span className="text-[11px] font-medium text-[#64748b]">Sorted by urgency</span></div>
        {activeRisks.map(r => { const sel = exception?.id === r.id; const red = r.level === "At risk"; return <button key={r.id} type="button" onClick={() => select("risk", r.id)} className={`flex w-full cursor-pointer flex-col gap-2 rounded-[18px] border p-[14px] text-left transition hover:bg-white ${sel ? (red ? "border-[#dc2626] bg-white" : "border-[#d97706] bg-white") : "border-white/95 bg-white/66"}`}>
          <div className="flex w-full items-center justify-between"><span className="flex items-center gap-2 text-[13px] font-bold"><Mono>{r.id}</Mono><span className="text-[#475569]">{r.area}</span></span><span className={`flex items-center gap-[6px] rounded-full px-[10px] py-[5px] text-[11px] font-bold ${red ? "bg-[rgba(220,38,38,0.1)] text-[#dc2626]" : "bg-[rgba(217,119,6,0.12)] text-[#b45309]"}`}><DIcon name={red ? "alertRed" : "clockAmber"} />{red ? "At risk" : "Tight"}</span></div>
          <div className="flex gap-[18px]">{([["ETA", r.eta], ["WINDOW CLOSES", r.closes]] as const).map(([l, v]) => <span key={l} className="dashboard-mono flex flex-col font-bold"><span className="text-[9px] tracking-[0.36px] text-[#64748b]">{l}</span><span className="text-[15px]">{v}</span></span>)}<span className="flex flex-col font-bold"><Mono className="text-[9px] tracking-[0.36px] text-[#64748b]">VEHICLE</Mono><span className="text-[12px] text-[#475569]">{r.vehicle} · {r.brand}</span></span></div>
          <span className={`text-[12px] font-bold ${red ? "text-[#dc2626]" : "text-[#b45309]"}`}>{r.note}{r.notified ? " · store notified" : ""}</span>
        </button>; })}
        {!activeRisks.length && <p className="rounded-[18px] bg-emerald-50 px-4 py-6 text-center text-[13px] font-medium text-emerald-800">No delivery risks for the selected vehicles.</p>}
      </section>

      <section aria-label="Vehicles" className="dispatcher-glass flex flex-col gap-2 rounded-[26px] p-5">
        <div className="flex items-center justify-between"><h2 className="flex items-center gap-2 text-[16px] font-bold"><DIcon name="list" />Vehicles<Mono className="rounded-full bg-[rgba(241,245,249,0.95)] px-[10px] py-[3px] text-[11px] text-[#475569]">{filtered.length}</Mono></h2><span className="text-[11px] font-medium text-[#64748b]">Same data as the map</span></div>
        <ul className="flex max-h-[245px] flex-col overflow-y-auto">{listed.map(v => { const sel = highlight === v.id; const riskRow = sel && exception; return <li key={v.id} className="border-b border-[rgba(15,23,42,0.08)] last:border-0"><button type="button" onClick={() => select("vehicle", v.id)} className={`my-1 flex w-full cursor-pointer items-center gap-[10px] rounded-[12px] px-1 py-[9px] text-left hover:bg-white/70 ${riskRow ? "bg-red-50" : sel ? "bg-sky-50" : ""}`}><Mono className="w-[52px] text-[12px] font-bold">{v.id}</Mono><span className="min-w-0 flex-1"><span className="block truncate text-[12px] font-bold">{v.area}</span><span className="block text-[11px] font-medium text-[#64748b]">{v.brand} · Trip {v.trip}</span></span><span className={`flex items-center gap-[5px] text-[11px] font-bold ${statusStyle[v.status].text}`}><DIcon name={statusStyle[v.status].icon} />{v.status}</span><span className="dashboard-mono flex flex-col items-end font-bold"><span className="text-[9px] text-[#64748b]">ETA</span><span className="text-[12px]">{v.eta}</span></span></button></li>; })}</ul>
        <div className="mt-auto flex items-center justify-between px-1 pt-[6px]"><span className="text-[11px] font-medium text-[#64748b]">{showAll ? `${filtered.length} vehicles` : `+${parked.length} at depot or returning`}</span><button type="button" onClick={() => setShowAll(s => !s)} className="flex cursor-pointer items-center gap-1 text-[12px] font-bold text-[#0284c7]">{showAll ? "Show active only" : `Show all ${filtered.length}`}<DIcon name="chevAccent" /></button></div>
      </section>
    </div>

    <section aria-label="Vehicle activity" className="dispatcher-glass rounded-[26px] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-[10px]"><DIcon name="clockTitle" /><h2 className="text-[16px] font-bold">Vehicle activity</h2><Mono className="text-[12px] text-[#475569]">03:30 – 12:30</Mono></div>
        <div className="flex flex-wrap items-center gap-[14px] text-[11px] font-medium text-[#475569]"><span className="flex items-center gap-[6px]"><span className="h-[6px] w-[18px] rounded-[3px] bg-[rgba(2,132,199,0.1)]" />Travel</span><span className="flex items-center gap-[6px]"><span className="size-[10px] rounded-full bg-[#0284c7]" />Stop done</span><span className="flex items-center gap-[6px]"><span className="size-[10px] rounded-full border-2 border-[#0284c7] bg-white" />Next stop</span><span className="flex items-center gap-[6px]"><span className="size-[10px] rounded-full bg-[#dc2626]" />Late risk</span><span className="flex items-center gap-[6px]"><span className="h-[6px] w-[18px] rounded-[3px] bg-[#64748b] opacity-35" />No signal</span><span className="font-bold text-[#0284c7]">Showing {tracked.length} of {filtered.length}</span></div>
      </div>
      <div className="mt-3 overflow-x-auto"><div className="min-w-[760px]">
        <div className="flex"><span className="w-[170px] shrink-0" /><div className="relative h-4 flex-1">{Array.from({ length: 9 }, (_, i) => <Mono key={i} className="absolute -translate-x-1/2 text-[10px] text-[#64748b]" style={{ left: tl(fmt(240 + i * 60)) }}>{fmt(240 + i * 60)}</Mono>)}<Mono className="absolute -top-px -translate-x-1/2 rounded bg-[#0284c7] px-[6px] text-[9px] font-bold text-white" style={{ left: tl("06:21") }}>NOW 06:21</Mono></div></div>
        {tracked.map(v => { const sel = highlight === v.id; const red = sel && !!exception; return <button key={v.id} type="button" onClick={() => select("vehicle", v.id)} className={`mt-[10px] flex h-6 w-full cursor-pointer items-center rounded-md text-left ${red ? "bg-red-100/70" : sel ? "bg-sky-100/60" : "hover:bg-white/50"}`}>
          <span className="flex w-[170px] shrink-0 items-center gap-2"><Mono className="text-[12px] font-bold">{v.id}</Mono><span className="text-[11px] font-medium text-[#64748b]">{v.brand} · T{v.trip}</span></span>
          <span className="relative h-6 flex-1">
            <span className="absolute inset-x-0 top-[11px] h-[2px] rounded bg-[rgba(15,23,42,0.06)]" />
            <span className="absolute top-[7px] h-[10px] rounded-full bg-[rgba(2,132,199,0.18)]" style={{ left: tl(v.tripStart), width: `calc(${tl(v.tripEnd)} - ${tl(v.tripStart)})` }} />
            {minutes(v.tripStart) < NOW && <span className="absolute top-[7px] h-[10px] rounded-full bg-[rgba(2,132,199,0.45)]" style={{ left: tl(v.tripStart), width: `calc(${tl("06:21")} - ${tl(v.tripStart)})` }} />}
            {v.noSignal && <span className="absolute top-[7px] h-[10px] rounded-sm bg-[#64748b]/35" style={{ left: tl(v.noSignal[0]), width: `calc(${tl(v.noSignal[1])} - ${tl(v.noSignal[0])})` }} />}
            {v.stops.map(s => <span key={s.time} title={`Stop ${s.time} · ${s.state}`} className={`absolute -translate-x-1/2 rounded-full ${s.state === "next" ? "top-[6px] size-3 border-2 border-[#0284c7] bg-white" : s.state === "up" ? "top-[7px] size-[10px] border-2 border-[#94a3b8] bg-white" : s.state === "done" ? "top-[7px] size-[10px] bg-[#0284c7]" : s.state === "tight" ? "top-[7px] size-[10px] bg-[#c2410c]" : "top-[7px] size-[10px] bg-[#dc2626]"}`} style={{ left: tl(s.time) }} />)}
            {v.stops.filter(s => s.state === "tight" || s.state === "risk").map(s => <Mono key={`w${s.time}`} className={`absolute top-1 flex items-center gap-[3px] rounded-md px-[6px] py-px text-[9px] font-bold ${s.state === "risk" ? "bg-[rgba(220,38,38,0.1)] text-[#dc2626]" : "bg-[rgba(217,119,6,0.12)] text-[#b45309]"}`} style={{ left: `calc(${tl(s.time)} + 8px)` }}><DIcon name={s.state === "risk" ? "alertRedTiny" : "alertAmberTiny"} />{s.state === "risk" ? "Risk +5m" : "Tight"}</Mono>)}
            <span className="absolute -top-1 h-8 w-[1.5px] bg-[#0284c7]" style={{ left: tl("06:21") }} />
          </span>
        </button>; })}
        {!tracked.length && <p className="py-6 text-center text-[12px] text-[#64748b]">No active trips for these filters.</p>}
      </div></div>
    </section>
  </>;
}
