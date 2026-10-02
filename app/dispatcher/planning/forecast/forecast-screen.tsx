"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { DIcon, Dropdown, Mono, type DispatcherIconName } from "../../../../components/dispatcher-ui";
import { brandShare, chilledDemand, projectedVolume, weeks } from "../../data";

const periods = ["Next 10 weeks", "Next 6 weeks", "Next 4 weeks"] as const;
const depots = ["Peliyagoda", "Kandy Regional Hub"] as const;
const brands = ["All", "Fresh", "Style", "Tech"] as const;

function ChartCard({ icon, title, badge, sub, legend, footer, children, tableOpen, onTable }: { icon: DispatcherIconName; title: string; badge?: ReactNode; sub: string; legend: ReactNode; footer: ReactNode; children: ReactNode; tableOpen: boolean; onTable: () => void }) {
  return <section className="dispatcher-glass rounded-[26px] p-[23px]">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="flex flex-wrap items-center gap-2 text-[17px] font-bold"><DIcon name={icon} />{title}{badge}</h2><p className="mt-[3px] text-[12px] font-medium text-[#64748b]">{sub}</p></div><div className="flex flex-wrap items-center gap-[14px] text-[11px] font-medium text-[#475569]">{legend}</div></div>
    <div className="mt-4">{children}</div>
    <div className="mt-3 flex flex-wrap items-center justify-between gap-2"><p className="text-[13px] font-bold text-[#0f172a]">{footer}</p><button type="button" aria-pressed={tableOpen} onClick={onTable} className="flex cursor-pointer items-center gap-[6px] text-[13px] font-bold text-[#0284c7] hover:underline"><DIcon name="table" />{tableOpen ? "View as chart" : "View as table"}</button></div>
  </section>;
}

function DataTable({ rows, cap, unit = "m³" }: { rows: { week: string; value: number }[]; cap: number; unit?: string }) {
  return <div className="overflow-x-auto rounded-[14px] border border-white bg-white/80"><table className="w-full text-left text-[12px]"><thead><tr className="dashboard-mono text-[10px] uppercase tracking-[1px] text-[#64748b]"><th className="px-3 py-2 font-medium">Week</th><th className="px-3 py-2 font-medium">Projected</th><th className="px-3 py-2 font-medium">Capacity</th><th className="px-3 py-2 font-medium">Headroom</th></tr></thead><tbody>{rows.map(r => <tr key={r.week} className="border-t border-slate-100"><td className="px-3 py-2 font-bold">{r.week}</td><td className="px-3 py-2"><Mono>{r.value} {unit}</Mono></td><td className="px-3 py-2"><Mono>{cap} {unit}</Mono></td><td className={`px-3 py-2 font-bold ${r.value > cap ? "text-[#ea580c]" : "text-emerald-700"}`}><Mono>{r.value > cap ? `−${r.value - cap}` : `+${cap - r.value}`} {unit}</Mono></td></tr>)}</tbody></table></div>;
}

export default function ForecastScreen() {
  const [period, setPeriod] = useState<(typeof periods)[number]>("Next 10 weeks");
  const [depot, setDepot] = useState<(typeof depots)[number]>("Peliyagoda");
  const [brand, setBrand] = useState<(typeof brands)[number]>("All");
  const [volumeTable, setVolumeTable] = useState(false);
  const [chilledTable, setChilledTable] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [hover, setHover] = useState<{ chart: "v" | "c"; i: number } | null>(null);
  const [open, setOpen] = useState({ reefer: true, fleet: false, mix: true });

  const n = Number(period.split(" ")[1]);
  const depotScale = depot === "Peliyagoda" ? 1 : 0.42;
  const share = brandShare[brand];
  const cap = Math.round(480 * depotScale * share);
  const volume = projectedVolume.slice(0, n).map((v, i) => ({ week: weeks[i], value: Math.round(v * depotScale * share) }));
  const chilledCap = Math.round(180 * depotScale);
  const chilledVisible = brand === "All" || brand === "Fresh";
  const chilled = chilledDemand.slice(0, n).map((v, i) => ({ week: weeks[i], value: Math.round(v * depotScale) }));
  const yMax = Math.ceil(Math.max(cap * 1.25, ...volume.map(v => v.value)) / 4 / 10) * 40;
  const cMax = Math.ceil(Math.max(chilledCap * 1.33, ...chilled.map(v => v.value)) / 3 / 10) * 30;
  const overWeeks = volume.filter(v => v.value > cap), overChilled = chilled.filter(v => v.value > chilledCap);
  const span = (list: { week: string }[]) => list.length ? `${list[0].week.replace("Week ", "Weeks ")}${list.length > 1 ? `–${list[list.length - 1].week.replace("Week ", "")}` : ""}` : "";

  // line chart geometry in a 640×170 viewBox
  const LW = 640, LH = 170, px = (i: number) => (chilled.length === 1 ? LW / 2 : (i / (chilled.length - 1)) * (LW - 40) + 20), py = (v: number) => LH - (v / cMax) * LH;
  const line = chilled.map((p, i) => `${i ? "L" : "M"}${px(i)},${py(p.value)}`).join(" ");

  return <>
    <section className="flex flex-wrap items-end justify-between gap-3 px-[6px] pt-1">
      <div><h1 className="text-[32px] font-bold text-white">Capacity &amp; Forecast</h1><p className="mt-[6px] text-[14px] font-medium text-white/72">Plan ahead for upcoming demand</p></div>
      <div className="flex flex-wrap items-center gap-2"><Dropdown icon="cal" label="Forecast period:" value={period} options={periods} onChange={setPeriod} strong /><Dropdown icon="pinFilter" label="Depot:" value={depot} options={depots} onChange={setDepot} strong /><Dropdown icon="tag" label="Brand:" value={brand} options={brands} onChange={setBrand} strong /></div>
    </section>

    <div className="grid items-start gap-[18px] lg:grid-cols-[minmax(0,760fr)_minmax(0,388fr)]">
      <div className="flex flex-col gap-[18px]">
        <ChartCard icon="bar" title="Projected Order Volume" sub={`${brand === "All" ? "All brands" : `Waypoint ${brand}`} · ${depot} · m³ per week`} tableOpen={volumeTable} onTable={() => setVolumeTable(t => !t)}
          legend={<><span className="flex items-center gap-[6px]"><span className="size-3 rounded-[3px] bg-[#38bdf8]" />Within capacity</span><span className="flex items-center gap-[6px]"><span className="size-3 rounded-[3px] bg-[#ea580c]" />Above planned capacity</span><span className="flex items-center gap-[6px]"><span className="w-4 border-t-[1.5px] border-dashed border-[#0284c7]" />Planned capacity</span></>}
          footer={overWeeks.length ? `${span(overWeeks)} exceed planned capacity by up to ${Math.max(...overWeeks.map(w => w.value)) - cap} m³.` : "All weeks stay within planned capacity."}>
          {volumeTable ? <DataTable rows={volume} cap={cap} /> : <div className="relative flex h-[230px] pl-9">
            {[0, 1, 2, 3, 4].map(k => <div key={k} className="absolute left-9 right-0 border-t border-slate-200/70" style={{ bottom: `${(k / 4) * 200 + 22}px` }}><Mono className="absolute -left-9 -top-[7px] w-7 text-right text-[10px] text-[#64748b]">{(yMax / 4) * k}</Mono></div>)}
            <div className="absolute left-9 right-0 border-t-[1.5px] border-dashed border-[#0284c7]" style={{ bottom: `${(cap / yMax) * 200 + 22}px` }}><Mono className="absolute -top-[22px] right-0 rounded bg-sky-100/80 px-2 py-[2px] text-[10px] font-bold text-[#0284c7]">Planned capacity · {cap} m³</Mono></div>
            <div className="relative z-10 flex flex-1 items-end justify-around gap-2">{volume.map((v, i) => { const over = v.value > cap; return <div key={v.week} className="relative flex h-full flex-1 flex-col items-center justify-end" onMouseEnter={() => setHover({ chart: "v", i })} onMouseLeave={() => setHover(null)}>
              <div className="relative flex h-[200px] w-full max-w-[42px] items-end justify-center"><div className="dispatcher-hatch absolute inset-x-0 top-0 h-full rounded-full opacity-70" /><div className={`relative w-full rounded-full ${over ? "bg-gradient-to-b from-[#f97316] to-[#ea580c]" : "bg-gradient-to-b from-[#38bdf8] to-[#0284c7]"} ${hover?.chart === "v" && hover.i === i ? "brightness-110" : ""}`} style={{ height: `${(v.value / yMax) * 200}px` }}>{over && <Mono className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-orange-100 px-1 text-[10px] font-bold text-[#c2410c]">{v.value} m³</Mono>}</div></div>
              <span className={`mt-2 h-[14px] whitespace-nowrap text-[11px] font-medium ${over ? "font-bold text-[#ea580c]" : "text-[#475569]"}`}>{v.week}</span>
              {hover?.chart === "v" && hover.i === i && <div role="tooltip" className="absolute bottom-[60%] z-20 whitespace-nowrap rounded-xl bg-[#0f172a] px-3 py-2 text-[11px] text-white shadow-lg"><b>{v.week}</b><br /><Mono>{v.value} m³ · {over ? `${v.value - cap} over` : `${cap - v.value} headroom`}</Mono></div>}
            </div>; })}</div>
          </div>}
        </ChartCard>

        <ChartCard icon="snowTitle" title="Chilled Demand" badge={<span className="rounded-full bg-orange-100/80 px-[10px] py-1 text-[11px] font-bold text-[#ea580c]">Waypoint Fresh only</span>} sub="Style and Tech have no chilled demand · m³ per week" tableOpen={chilledTable} onTable={() => setChilledTable(t => !t)}
          legend={<><span className="flex items-center gap-[6px]"><span className="w-4 border-t-2 border-[#ea580c]" />Fresh chilled</span><span className="flex items-center gap-[6px]"><span className="w-4 border-t-[1.5px] border-dashed border-[#0284c7]" />Refrigerated capacity</span></>}
          footer={!chilledVisible ? `Waypoint ${brand} has no chilled demand.` : overChilled.length ? `${span(overChilled)} exceed refrigerated capacity by up to ${Math.max(...overChilled.map(w => w.value)) - chilledCap} m³.` : "Chilled demand stays within refrigerated capacity."}>
          {!chilledVisible ? <p className="rounded-[14px] bg-white/70 px-4 py-10 text-center text-[13px] text-[#64748b]">No chilled orders for Waypoint {brand}. Switch the brand filter to All or Fresh.</p> : chilledTable ? <DataTable rows={chilled} cap={chilledCap} /> : <div className="relative pl-9">
            <div className="relative h-[170px]">
              {[0, 1, 2, 3].map(k => <div key={k} className="absolute left-0 right-0 border-t border-slate-200/70" style={{ bottom: `${(k / 3) * 170}px` }}><Mono className="absolute -left-9 -top-[7px] w-7 text-right text-[10px] text-[#64748b]">{(cMax / 3) * k}</Mono></div>)}
              <svg viewBox={`0 0 ${LW} ${LH}`} preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible" aria-label="Fresh chilled demand per week">
                <path d={`${line} L${px(chilled.length - 1)},${LH} L${px(0)},${LH} Z`} fill="rgba(249,115,22,0.16)" />
                <line x1={0} x2={LW} y1={py(chilledCap)} y2={py(chilledCap)} stroke="#0284c7" strokeWidth={1.5} strokeDasharray="5 4" vectorEffect="non-scaling-stroke" />
                <path d={line} fill="none" stroke="#ea580c" strokeWidth={2} vectorEffect="non-scaling-stroke" />
              </svg>
              <Mono className="absolute left-1 rounded bg-sky-100/80 px-2 py-[2px] text-[10px] font-bold text-[#0284c7]" style={{ bottom: `${(chilledCap / cMax) * 170 + 4}px` }}>Refrigerated capacity · {chilledCap} m³</Mono>
              {chilled.map((p, i) => { const over = p.value > chilledCap, h = hover?.chart === "c" && hover.i === i; return <button key={p.week} type="button" aria-label={`${p.week}: ${p.value} m³`} onMouseEnter={() => setHover({ chart: "c", i })} onMouseLeave={() => setHover(null)} onFocus={() => setHover({ chart: "c", i })} onBlur={() => setHover(null)} className="absolute flex size-6 -translate-x-1/2 translate-y-1/2 items-center justify-center" style={{ left: `${(px(i) / LW) * 100}%`, bottom: `${(p.value / cMax) * 170}px` }}>
                <span className={`rounded-full border-2 border-[#ea580c] ${over ? "size-3 bg-[#ea580c]" : "size-[9px] bg-white"} ${h ? "scale-125" : ""}`} />
                {over && <Mono className="absolute -top-5 whitespace-nowrap rounded bg-orange-100 px-1 text-[10px] font-bold text-[#c2410c]">{p.value} m³</Mono>}
                {h && <span role="tooltip" className="absolute bottom-7 z-20 whitespace-nowrap rounded-xl bg-[#0f172a] px-3 py-2 text-left text-[11px] text-white shadow-lg"><b>{p.week}</b><br /><Mono>{p.value} m³ · {over ? `${p.value - chilledCap} over` : `${chilledCap - p.value} headroom`}</Mono></span>}
              </button>; })}
            </div>
            <div className="relative mt-2 h-4">{chilled.map((p, i) => <span key={p.week} className={`absolute -translate-x-1/2 whitespace-nowrap text-[11px] ${p.value > chilledCap ? "font-bold text-[#ea580c]" : "font-medium text-[#475569]"}`} style={{ left: `${(px(i) / LW) * 100}%` }}>{p.week}</span>)}</div>
          </div>}
        </ChartCard>
      </div>

      <div className="flex flex-col gap-[14px]">
        <section className="relative rounded-[26px] border-[1.5px] border-[#ea580c] bg-white/94 p-[22px] shadow-[0_12px_32px_-8px_rgba(13,26,51,0.08)] backdrop-blur-xl">
          <div className="flex items-center justify-between"><h2 className="flex items-center gap-[10px] text-[16px] font-bold"><span className="flex size-[38px] items-center justify-center rounded-[12px] bg-orange-100/80"><DIcon name="trend" /></span>Upcoming demand signal</h2><button type="button" aria-label="About this forecast" aria-expanded={noteOpen} onClick={() => setNoteOpen(o => !o)} className="dispatcher-subtle cursor-pointer rounded-full p-[6px] hover:bg-white"><DIcon name="info" /></button></div>
          {noteOpen && <div role="note" className="absolute right-4 top-[62px] z-20 w-[248px] rounded-[14px] border border-white bg-white p-3 shadow-[0_16px_40px_-8px_rgba(5,13,31,0.22)]"><Mono className="text-[9px] font-bold tracking-[0.36px] text-[#0f172a]">ABOUT THIS FORECAST</Mono><p className="mt-1 text-[12px] leading-4 text-[#0f172a]">Forecast values are model-generated estimates and should support planning decisions rather than replace operational validation.</p></div>}
          <p className="mt-3 text-[14px] font-medium leading-5">Fresh chilled demand is increasing ahead of the selected planning period.</p>
          <div className="mt-3 flex flex-wrap gap-[6px]"><span className="flex items-center gap-[6px] rounded-full bg-orange-100/80 px-[10px] py-[5px] text-[11px] font-bold text-[#ea580c]"><DIcon name="calOrange" />{span(overWeeks.length ? overWeeks : overChilled) || "No peak weeks"}</span><span className="flex items-center gap-[6px] rounded-full bg-orange-100/80 px-[10px] py-[5px] text-[11px] font-bold text-[#ea580c]"><DIcon name="trendSmall" />Chilled +{Math.round((Math.max(...chilledDemand.slice(0, n)) / chilledDemand[0] - 1) * 100)}% vs week 1</span></div>
          <Link href="/dispatcher/planning" className="dispatcher-accent mt-3 flex items-center justify-center gap-2 rounded-full px-[18px] py-3 text-[13px] font-bold text-white">View Planning Impact<DIcon name="chevWhite" /></Link>
        </section>

        <div className="flex items-center justify-between px-1 pt-[6px]"><h2 className="text-[16px] font-bold text-white">Vehicle Capacity</h2><span className="flex items-center gap-[6px] rounded-full bg-slate-100/95 px-[10px] py-[5px] text-[11px] font-bold text-[#64748b]"><DIcon name="book" />From challenge brief</span></div>
        {([["reefer", "snowTile", "Refrigerated vehicles", "16", "chilled-capable", <><p className="text-[12px] font-bold">16 chilled-capable vehicles across the fleet</p><div className="flex justify-between text-[12px]"><span className="text-[#475569]">Refrigerated trucks</span><Mono className="font-bold">12</Mono></div><div className="flex justify-between text-[12px]"><span className="text-[#475569]">Refrigerated small vans</span><Mono className="font-bold">4</Mono></div><p className="text-[11px] text-[#64748b]">Only these vehicles can carry chilled or frozen goods.</p></>],
          ["fleet", "truckTile", "Total fleet", "60", "vehicles", <><div className="flex justify-between text-[12px]"><span className="text-[#475569]">Peliyagoda depot</span><Mono className="font-bold">45</Mono></div><div className="flex justify-between text-[12px]"><span className="text-[#475569]">Kandy Regional Hub</span><Mono className="font-bold">15</Mono></div><p className="text-[11px] text-[#64748b]">38 of 45 Peliyagoda vehicles are serviceable today.</p></>],
          ["mix", "layers", "Fleet composition", "3", "vehicle types", <><div className="flex gap-[3px]"><span className="h-2 rounded bg-[#ea580c]" style={{ flex: 12 }} /><span className="h-2 rounded bg-[rgba(2,132,199,0.55)]" style={{ flex: 40 }} /><span className="h-2 rounded bg-[#0284c7]" style={{ flex: 8 }} /></div>{([["bg-[#ea580c]", "Refrigerated trucks", 12], ["bg-[rgba(2,132,199,0.55)]", "Dry-box trucks", 40], ["bg-[#0284c7]", "Small vans (4 refrigerated)", 8]] as const).map(([c, l, v]) => <div key={l} className="flex items-center gap-2 text-[12px]"><span className={`size-[10px] rounded-[3px] ${c}`} /><span className="flex-1 text-[#475569]">{l}</span><Mono className="font-bold">{v}</Mono></div>)}<p className="text-[11px] text-[#64748b]">Each vehicle has an assigned driver, so driver capacity follows the fleet.</p></>]] as [keyof typeof open, DispatcherIconName, string, string, string, ReactNode][]).map(([key, icon, label, value, unit, body]) => <section key={key} className="dispatcher-glass flex flex-col gap-3 rounded-[22px] px-[18px] py-4">
          <button type="button" aria-expanded={open[key]} onClick={() => setOpen(o => ({ ...o, [key]: !o[key] }))} className="flex cursor-pointer items-center gap-3 text-left"><span className="flex size-10 items-center justify-center rounded-[12px] bg-slate-100/95"><DIcon name={icon} /></span><span className="flex-1"><span className="block text-[12px] font-medium text-[#475569]">{label}</span><span className="flex items-center gap-2"><Mono className="text-[20px] font-bold">{value}</Mono><span className="text-[12px] text-[#64748b]">{unit}</span></span></span><span className="rounded-full bg-white/66 p-[6px]"><DIcon name={open[key] ? "up" : "down"} /></span></button>
          {open[key] && <><div className="h-px bg-[rgba(15,23,42,0.08)]" />{body}</>}
        </section>)}
      </div>
    </div>
  </>;
}
