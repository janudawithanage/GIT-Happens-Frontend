"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ButtonHTMLAttributes, type CSSProperties, type ReactNode } from "react";
import { useDispatcher } from "../app/dispatcher/dispatcher-store";

const icons = {
  search: ["202ca.svg", 12.75, 12.75], bell: ["23a5a.svg", 12, 15], calWhite: ["5b7ce.svg", 14, 14], calChip: ["d5a9c.svg", 12, 12], cal: ["c81ae.svg", 14, 14],
  clockSky: ["21bb5.svg", 20, 20], liveOps: ["8784a.svg", 20, 20], calendarWhite: ["a21af.svg", 18, 20], kpiConfirmed: ["a9da6.svg", 20, 18], checkGreen: ["11e3f.svg", 20, 20],
  routes: ["2fbd3.svg", 18, 20], warehouse: ["92d3f.svg", 20, 18], truckDark: ["8e6a3.svg", 22, 16], network: ["b70a0.svg", 24, 23], kpiDeferred: ["253d0.svg", 20, 20], infoAmber: ["f8209.svg", 20, 20],
  sync: ["0111b.svg", 16, 16], depot: ["428cf.svg", 20, 18], alarmSky: ["ebda3.svg", 21.3, 19.65], exclaim: ["03959.svg", 4, 18], warnAmber: ["961b8.svg", 22, 19], stagingRose: ["715cb.svg", 20, 18], scaleWhite: ["925a0.svg", 20, 19],
  clockSmall: ["17b76.svg", 12.5, 12.5], alarmOrange: ["a4de4.svg", 15.09, 13.92], download: ["0e881.svg", 12, 12], play: ["cec69.svg", 7.79, 9.92], ordersKpi: ["d5880.svg", 15.83, 14.25], snowSky: ["56e4f.svg", 15.83, 15.83],
  leafViolet: ["bf604.svg", 13.45, 13.45], clockOrange: ["722eb.svg", 15.83, 15.83], searchGrey: ["ebc11.svg", 13.5, 13.5], chevDown: ["f7636.svg", 8, 4.93], sliders: ["d6661.svg", 12, 12], radioSky: ["3d7d3.svg", 15, 15],
  clockGrey: ["74c3e.svg", 12.5, 12.5], snowChip: ["cd988.svg", 10.83, 10.83], ambient: ["5060e.svg", 10.83, 10.83], chevSky: ["4a001.svg", 4.63, 7.5], chevDark: ["3303d.svg", 4.63, 7.5], chevOrange: ["3070b.svg", 4.63, 7.5],
  warnOrange: ["481cb.svg", 16.5, 14.25], thermoDark: ["e0ebd.svg", 9.75, 9.75], pageLeft: ["976b7.svg", 4.93, 8], pageRight: ["c4bc2.svg", 4.93, 8], cutoff: ["dadad.svg", 15, 13.5], coldChain: ["bffa8.svg", 14.25, 15],
  tripLimitOrange: ["5d8ad.svg", 16.5, 12], tripLimit: ["969d9.svg", 16.5, 12],
  shieldSky: ["498d6.svg", 10, 12.5], alarmSkySmall: ["bba10.svg", 15.09, 13.92], arrowLeft: ["98e55.svg", 10.67, 10.67], checkCircleWhite: ["e3512.svg", 14.17, 14.17], store: ["1c78f.svg", 12, 10.67], infoGrey: ["f7980.svg", 13.33, 21.33],
  clockViolet: ["ee937.svg", 13.33, 13.33], snowSection: ["c7ba9.svg", 13.33, 13.33], snowTemp: ["8eb64.svg", 11.67, 11.67], truckSection: ["28679.svg", 14.67, 10.67], badgeCheck: ["ecd99.svg", 16.5, 15.75], checkSmall: ["935a9.svg", 11.67, 11.67],
  checkRow: ["3b75c.svg", 15, 17], infoRow: ["dea41.svg", 12.5, 21.5], slidersDark: ["d876b.svg", 11.25, 11.25], listCheck: ["facca.svg", 12.67, 8.67],
  depotNet: ["ef24d.svg", 16, 15.33], archive: ["c5916.svg", 13.33, 13.33], snowTiny: ["ff31c.svg", 10, 10], truckFleet: ["49de1.svg", 14.67, 10.67], assignCheck: ["02e0b.svg", 12.83, 11.67], badgeGreen: ["38a9a.svg", 14.67, 14],
  passGreen: ["575b6.svg", 10, 10], checkGreenSmall: ["8079d.svg", 13.33, 13.33], bulb: ["6e226.svg", 9.38, 12.5], validateWhite: ["0d390.svg", 13.33, 13.33],
  pin: ["808e7.svg", 14, 14], clockChip: ["d19ab.svg", 12, 12], routeChip: ["4b80e.svg", 12, 12], checkBig: ["0979e.svg", 30, 30], alertOrange: ["1321f.svg", 14, 14], shield: ["2356a.svg", 12, 12], box: ["7460e.svg", 17, 17],
  pass: ["17aba.svg", 11, 11], thermo: ["9df00.svg", 17, 17], truck: ["c5edd.svg", 17, 17], clock: ["194f3.svg", 17, 17], fuel: ["ccbfa.svg", 17, 17], route: ["f0314.svg", 17, 17], alertTitle: ["b0152.svg", 18, 18],
  chevSkySmall: ["0a4d5.svg", 14, 14], truckOrangeTile: ["3f01a.svg", 21, 21], chevReview: ["5ad0d.svg", 16, 16], thermoOrangeTile: ["efa21.svg", 21, 21], db: ["3dcba.svg", 12, 12], checkSky: ["f8f7e.svg", 13, 13],
  pauseOrange: ["246ac.svg", 13, 13], sendWhite: ["06da7.svg", 16, 16], back: ["37384.svg", 16, 16], sendSky: ["79e5f.svg", 24, 24], routeGrey: ["27f81.svg", 12, 12], checkAccent: ["85977.svg", 12, 12], pauseWarn: ["16fad.svg", 12, 12],
  filter: ["ac7b6.svg", 15, 15], down: ["16669.svg", 14, 14], legendNav: ["c1adf.svg", 11, 11], legendPin: ["49379.svg", 11, 11], legendAlert: ["8fd84.svg", 11, 11], legendOffline: ["2fccf.svg", 11, 11],
  map: ["bcf63.svg", 18, 18], mapWhite: ["521d8.svg", 14, 14], listGrey: ["6c08c.svg", 14, 14], plus: ["9a6d0.svg", 16, 16], minus: ["a4230.svg", 16, 16], target: ["df320.svg", 16, 16], navBlue: ["e9621.svg", 12, 12],
  alertWarnTitle: ["8468f.svg", 17, 17], alertRed: ["6ba3c.svg", 12, 12], clockAmber: ["a246d.svg", 12, 12], list: ["2dbc6.svg", 16, 16], navAccent: ["398a8.svg", 13, 13], pinSuccess: ["61831.svg", 13, 13],
  alertWarn: ["f4457.svg", 13, 13], offline: ["39447.svg", 13, 13], chevAccent: ["2477b.svg", 13, 13], clockTitle: ["379e3.svg", 17, 17], alertRedTiny: ["749e1.svg", 10, 10], alertAmberTiny: ["9df98.svg", 10, 10],
  radio: ["a8086.svg", 12, 12], liveDot: ["b566d.svg", 7, 7], activeDot: ["57360.svg", 9, 9],
  navChip: ["5f14b.svg", 12, 12], close: ["6c4ed.svg", 12, 12], checkSuccess: ["f5e32.svg", 13, 13], routeDark: ["c0da5.svg", 14, 14], call: ["58899.svg", 14, 14], alertDanger: ["10a7c.svg", 18, 18],
  clockDanger: ["bcc95.svg", 13, 13], bellWhite: ["6f161.svg", 14, 14], resequence: ["bb156.svg", 14, 14], checkDark: ["dd873.svg", 14, 14],
  pause: ["dc4be.svg", 24, 24], leaf: ["133cb.svg", 19, 19], shirt: ["cbef2.svg", 19, 19], cpu: ["842a5.svg", 19, 19], history: ["30dff.svg", 19, 19], thermoReason: ["b5a03.svg", 14, 14], truckReason: ["b793c.svg", 14, 14],
  clockReason: ["67187.svg", 14, 14], vanReason: ["2119c.svg", 14, 14], fuelReason: ["134d9.svg", 14, 14], alertChip: ["3e698.svg", 12, 12], downSmall: ["e5b50.svg", 13, 13], checkboxTick: ["601fd.svg", 12, 12],
  leafSmall: ["a8aca.svg", 11, 11], shirtSmall: ["d39c5.svg", 11, 11], cpuSmall: ["431b2.svg", 11, 11], info: ["96c87.svg", 15, 15], downloadDark: ["3add3.svg", 15, 15], chevWhite: ["7f889.svg", 15, 15],
  truckSmall: ["7e4d6.svg", 13, 13], user: ["a97cb.svg", 13, 13], bellSmall: ["bc4e7.svg", 13, 13],
  pinFilter: ["ea699.svg", 14, 14], tag: ["f0dba.svg", 14, 14], bar: ["dd0cc.svg", 17, 17], table: ["758ae.svg", 14, 14], snowTitle: ["9b153.svg", 17, 17], trend: ["ccafa.svg", 19, 19], calOrange: ["37c4f.svg", 12, 12],
  trendSmall: ["d3378.svg", 12, 12], book: ["ce5e6.svg", 12, 12], snowTile: ["96c2d.svg", 19, 19], up: ["cc66d.svg", 14, 14], truckTile: ["49893.svg", 19, 19], layers: ["c39ea.svg", 19, 19],
} as const;

export type DispatcherIconName = keyof typeof icons;

export function DIcon({ name, className = "", size }: { name: DispatcherIconName; className?: string; size?: number }) {
  const [file, width, height] = icons[name];
  const scale = size ? size / Math.max(width, height) : 1;
  const style = { width: width * scale, height: height * scale };
  return <Image src={`/figma/dispatcher/${file}`} alt="" width={Math.ceil(width)} height={Math.ceil(height)} style={style} className={`shrink-0 ${className}`} />;
}

export function Glass({ children, className = "", strong = false, as: Tag = "section" }: { children: ReactNode; className?: string; strong?: boolean; as?: "section" | "div" | "article" | "aside" }) {
  return <Tag className={`${strong ? "dispatcher-glass-strong" : "dispatcher-glass"} relative rounded-[26px] ${className}`}>{children}</Tag>;
}

export function DButton({ children, tone = "light", className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: "light" | "accent" | "dark" | "danger" | "ghost" }) {
  const style = { light: "border border-white bg-white/90 text-[#0f172a] hover:bg-white", accent: "dispatcher-accent text-white", dark: "bg-[#0f172a] text-white hover:bg-[#1e293b]", danger: "bg-[#dc2626] text-white hover:bg-[#b91c1c]", ghost: "border border-white/95 bg-white/65 text-[#0f172a] hover:bg-white/90" }[tone];
  return <button type="button" {...props} className={`inline-flex cursor-pointer items-center justify-center gap-2 font-bold transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 ${style} ${className}`}>{children}</button>;
}

export function Chip({ children, tone = "slate", className = "" }: { children: ReactNode; tone?: "slate" | "sky" | "green" | "amber" | "red" | "orange" | "violet" | "glass"; className?: string }) {
  const style = { slate: "bg-[rgba(241,245,249,0.95)] text-[#475569]", sky: "bg-[rgba(2,132,199,0.1)] text-[#0284c7]", green: "bg-[rgba(4,120,87,0.1)] text-[#047857]", amber: "bg-[rgba(217,119,6,0.12)] text-[#b45309]", red: "bg-[rgba(220,38,38,0.1)] text-[#dc2626]", orange: "bg-[rgba(249,115,22,0.14)] text-[#ea580c]", violet: "bg-violet-50 text-violet-700", glass: "bg-white/65 text-[#475569]" }[tone];
  return <span className={`inline-flex shrink-0 items-center gap-[6px] whitespace-nowrap rounded-full px-[10px] py-[5px] text-[11px] font-bold ${style} ${className}`}>{children}</span>;
}

export function Mono({ children, className = "", style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return <span className={`dashboard-mono ${className}`} style={style}>{children}</span>;
}

export function PageTitle({ title, children, side }: { title: ReactNode; children?: ReactNode; side?: ReactNode }) {
  return <div className="flex flex-wrap items-end justify-between gap-3 px-[6px] pt-1"><div className="flex min-w-0 flex-col gap-[6px]"><h1 className="text-[28px] font-bold leading-tight text-white sm:text-[32px]">{title}</h1>{children && <div className="flex flex-wrap items-center gap-[6px] text-[13px] font-medium text-white/72">{children}</div>}</div>{side && <div className="flex flex-wrap items-center gap-2">{side}</div>}</div>;
}

const navItems = [
  { label: "Dashboard", href: "/dispatcher", match: (p: string) => p === "/dispatcher" },
  { label: "Orders", href: "/dispatcher/orders", match: (p: string) => p.startsWith("/dispatcher/orders") },
  { label: "Planning", href: "/dispatcher/planning", match: (p: string) => p.startsWith("/dispatcher/planning") },
  { label: "Live Operations", href: "/dispatcher/live", match: (p: string) => p.startsWith("/dispatcher/live") },
  { label: "Exceptions", href: "/dispatcher/exceptions", match: (p: string) => p.startsWith("/dispatcher/exceptions") },
];

function useOutsideClose(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) close(); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("mousedown", onDown); document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open, close]);
  return ref;
}

export function Dropdown<T extends string>({ label, value, options, onChange, icon, className = "", strong = false }: { label?: string; value: T; options: readonly T[]; onChange: (value: T) => void; icon?: DispatcherIconName; className?: string; strong?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useOutsideClose(open, () => setOpen(false));
  return <div ref={ref} className={`relative ${className}`}>
    <button type="button" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen(o => !o)} className={`flex cursor-pointer items-center gap-[6px] whitespace-nowrap rounded-full border border-white/95 px-3 py-2 text-[12px] hover:bg-white ${strong ? "bg-white/94" : "bg-white/66"}`}>
      {icon && <DIcon name={icon} />}{label && <span className="font-medium text-[#64748b]">{label}</span>}<span className="font-bold text-[#0f172a]">{value}</span><DIcon name="down" size={13} />
    </button>
    {open && <ul role="listbox" className="dispatcher-glass-strong absolute left-0 top-[calc(100%+6px)] z-40 min-w-full overflow-hidden rounded-2xl p-1 text-[12px]">{options.map(option => <li key={option}><button type="button" role="option" aria-selected={option === value} onClick={() => { onChange(option); setOpen(false); }} className={`w-full cursor-pointer whitespace-nowrap rounded-xl px-3 py-2 text-left ${option === value ? "bg-sky-50 font-bold text-[#0284c7]" : "text-[#334155] hover:bg-slate-50"}`}>{option}</button></li>)}</ul>}
  </div>;
}

function HeaderSearch() {
  const { orders, vehicles } = useDispatcher();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useOutsideClose(open, () => setOpen(false));
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const orderHits = orders.filter(o => `${o.id} ${o.outletId} ${o.outlet} ${o.district}`.toLowerCase().includes(q)).slice(0, 5).map(o => ({ key: o.id, title: o.id, detail: `${o.outletId} • ${o.outlet}`, href: `/dispatcher/orders/${o.id}` }));
    const vehicleHits = vehicles.filter(v => `${v.id} ${v.area} ${v.driver}`.toLowerCase().includes(q)).slice(0, 3).map(v => ({ key: v.id, title: v.id, detail: `${v.area} • ${v.driver}`, href: `/dispatcher/live?vehicle=${v.id}` }));
    return [...orderHits, ...vehicleHits];
  }, [query, orders, vehicles]);
  return <div ref={ref} className="relative min-w-0 flex-1">
    <label className="flex h-[43px] items-center rounded-full border border-white/90 bg-white/80 px-[13px] shadow-sm"><DIcon name="search" /><input aria-label="Search orders, trips, vehicles" value={query} onFocus={() => setOpen(true)} onChange={e => { setQuery(e.target.value); setOpen(true); }} onKeyDown={e => { if (e.key === "Enter" && results[0]) { router.push(results[0].href); setOpen(false); setQuery(""); } }} placeholder="Search orders, trips, vehicles…" className="w-full min-w-0 bg-transparent pl-[6px] text-[12px] font-medium text-[#334155] outline-none placeholder:text-[#94a3b8] sm:w-[176px]" /></label>
    {open && query.trim() && <div className="dispatcher-glass-strong absolute right-0 top-[calc(100%+8px)] z-50 w-[300px] max-w-[85vw] rounded-2xl p-2">{results.length ? results.map(r => <Link key={r.key} href={r.href} onClick={() => { setOpen(false); setQuery(""); }} className="block rounded-xl px-3 py-2 hover:bg-sky-50"><Mono className="text-[12px] font-bold text-[#0f172a]">{r.title}</Mono><span className="block truncate text-[11px] text-[#64748b]">{r.detail}</span></Link>) : <p className="px-3 py-3 text-[12px] text-[#64748b]">No orders or vehicles match “{query}”.</p>}</div>}
  </div>;
}

function Notifications() {
  const { notifications, markNotificationsRead } = useDispatcher();
  const [open, setOpen] = useState(false);
  const ref = useOutsideClose(open, () => setOpen(false));
  const unread = notifications.filter(n => !n.read).length;
  return <div ref={ref} className="relative">
    <button type="button" aria-label={`Notifications (${unread} unread)`} aria-expanded={open} onClick={() => { setOpen(o => !o); if (!open) markNotificationsRead(); }} className="relative flex size-8 cursor-pointer items-center justify-center rounded-full bg-white/80 shadow-sm hover:bg-white"><DIcon name="bell" />{unread > 0 && <span className="absolute right-1 top-1 flex size-[14px] items-center justify-center rounded-full bg-[#0ea5e9] text-[8px] font-extrabold text-[#0f172a] ring-2 ring-white">{unread}</span>}</button>
    {open && <div className="dispatcher-glass-strong absolute right-0 top-[calc(100%+10px)] z-50 w-[320px] max-w-[85vw] rounded-2xl p-2"><p className="px-3 pb-1 pt-2 text-[11px] font-bold uppercase tracking-wide text-[#64748b]">Notifications</p>{notifications.map(n => <Link key={n.id} href={n.href} onClick={() => setOpen(false)} className="block rounded-xl px-3 py-2 hover:bg-sky-50"><span className="block text-[12px] font-bold text-[#0f172a]">{n.title}</span><span className="block text-[11px] leading-4 text-[#64748b]">{n.detail}</span></Link>)}</div>}
  </div>;
}

function ProfileMenu() {
  const { pendingAccessCount } = useDispatcher();
  const [open, setOpen] = useState(false);
  const ref = useOutsideClose(open, () => setOpen(false));
  const links = [{ label: "Staff access requests", href: "/dispatcher/staff-access", badge: pendingAccessCount }, { label: "Capacity & forecast", href: "/dispatcher/planning/forecast" }, { label: "Plan validation", href: "/dispatcher/planning/validation" }, { label: "Sign out", href: "/" }];
  return <div ref={ref} className="relative pl-1">
    <button type="button" aria-label="Profile menu: Elena Vance, Dispatcher" aria-expanded={open} onClick={() => setOpen(o => !o)} className="block size-8 cursor-pointer overflow-hidden rounded-full bg-white p-[2px] shadow-[0_0_0_2px_rgba(3,133,199,0.8),0_4px_6px_-1px_rgba(3,133,199,0.2)]"><Image src="/figma/dispatcher/37c7d.png" alt="" width={28} height={28} className="size-full rounded-full object-cover" /></button>
    {open && <div className="dispatcher-glass-strong absolute right-0 top-[calc(100%+10px)] z-50 w-[240px] rounded-2xl p-2"><div className="px-3 pb-2 pt-1"><p className="text-[13px] font-bold text-[#0f172a]">Elena Vance</p><p className="text-[11px] text-[#64748b]">Dispatcher · Peliyagoda Depot</p></div>{links.map(l => <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="flex items-center justify-between rounded-xl px-3 py-2 text-[12px] font-semibold text-[#334155] hover:bg-sky-50">{l.label}{!!l.badge && <span className="rounded-full bg-[#0ea5e9] px-2 text-[10px] font-extrabold text-white">{l.badge}</span>}</Link>)}</div>}
  </div>;
}

export function DispatcherHeader() {
  const pathname = usePathname();
  return <header className="relative z-30 flex flex-wrap items-center justify-between gap-3 pb-2 pt-6">
    <div className="dispatcher-nav flex min-w-0 max-w-full items-center gap-2 rounded-full px-[13px] py-[7px]">
      <Link href="/dispatcher" className="flex shrink-0 items-center gap-[10px] py-1 pr-3"><span className="relative flex size-8 items-center justify-center rounded-[12px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.05)]"><Image src="/figma/dispatcher/09215.png" alt="" width={30} height={30} className="rounded-[11px]" /></span><span className="hidden sm:block"><span className="block text-[15px] font-extrabold leading-[15px] tracking-[-0.375px] text-[#0f172a]">Waypoint Flow</span><span className="block pt-[2px] text-[9px] font-bold leading-[13.5px] tracking-[0.45px] text-[#64748b]">CENTRAL DISPATCH</span></span></Link>
      <span className="h-5 w-px shrink-0 bg-[#e2e8f0]" />
      <nav aria-label="Dispatcher" className="flex min-w-0 items-center gap-1 overflow-x-auto">{navItems.map(item => { const active = item.match(pathname); return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={`shrink-0 whitespace-nowrap rounded-full text-[13px] leading-[19.5px] ${active ? "dispatcher-accent px-5 py-2 font-semibold text-white" : "px-[14px] py-[6px] font-medium text-[#475569] hover:bg-white/70"}`}>{item.label}</Link>; })}</nav>
    </div>
    <div className="dispatcher-nav flex w-full items-center gap-2 rounded-full px-[11px] py-[7px] sm:w-auto"><HeaderSearch /><Notifications /><ProfileMenu /></div>
  </header>;
}

export function DispatcherFooter() {
  return <footer className="relative z-10 mt-auto flex min-h-[46px] flex-wrap items-center justify-between gap-2 border-t border-white/70 bg-white/40 px-5 py-3 text-[11px] backdrop-blur-xl sm:px-10">
    <div className="flex flex-wrap items-center gap-3 font-medium text-[#475569]"><span className="font-semibold text-[#0f172a]"><span className="mr-2 inline-block size-[6px] rounded-full bg-[#0ea5e9]" />Dispatcher: Active</span><span className="text-[#cbd5e1]">•</span><span>Plan Sync: 100% Up</span><span className="text-[#cbd5e1]">•</span><Mono className="text-[10px]">Depot: Peliyagoda</Mono></div>
    <div className="dashboard-mono flex gap-4 text-[10px] text-[#475569]"><span>v4.12.0</span><span>© 2026 Waypoint Group</span></div>
  </footer>;
}

export function DispatcherShell({ children }: { children: ReactNode }) {
  const { toast } = useDispatcher();
  return <main className="dashboard-stage min-h-screen px-3 py-5 text-[#0f172a] sm:p-7">
    <div className="dashboard-shell relative mx-auto flex min-h-[calc(100vh-56px)] max-w-[1280px] flex-col overflow-hidden rounded-[38px] border border-white/95">
      <div aria-hidden className="dispatcher-backdrop absolute inset-0" />
      <div className="relative z-10 flex flex-col gap-[18px] px-4 pb-8 sm:px-7">
        <DispatcherHeader />
        {children}
      </div>
      <DispatcherFooter />
    </div>
    {toast && <div role="status" aria-live="polite" className="fixed bottom-5 right-5 z-[70] max-w-[min(420px,calc(100vw-40px))] rounded-2xl bg-[#0f172a] px-4 py-3 text-[13px] font-medium text-white shadow-xl">{toast}</div>}
  </main>;
}

export function Modal({ label, onClose, children, className = "" }: { label: string; onClose: () => void; children: ReactNode; className?: string }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  return <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(15,23,42,0.35)] p-4 backdrop-blur-[3px]" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
    <div role="dialog" aria-modal="true" aria-label={label} className={`dispatcher-glass-strong w-full max-w-[480px] rounded-[30px] p-8 shadow-[0_24px_60px_-12px_rgba(5,13,31,0.3)] ${className}`}>{children}</div>
  </div>;
}

export function Pagination({ page, pages, onPage }: { page: number; pages: number; onPage: (page: number) => void }) {
  const visible = Array.from({ length: pages }, (_, i) => i + 1).filter(p => pages <= 5 || Math.abs(p - page) <= 1 || p === 1 || p === pages);
  return <nav aria-label="Pagination" className="flex items-center gap-1">
    <button type="button" aria-label="Previous page" disabled={page <= 1} onClick={() => onPage(page - 1)} className="flex size-[26px] cursor-pointer items-center justify-center rounded-lg border border-[#e2e8f0] bg-white disabled:cursor-not-allowed disabled:opacity-40"><DIcon name="pageLeft" /></button>
    {visible.map((p, i) => <span key={p} className="flex items-center gap-1">{i > 0 && p - visible[i - 1] > 1 && <span className="px-1 text-[11px] text-slate-400">…</span>}<button type="button" aria-current={p === page ? "page" : undefined} onClick={() => onPage(p)} className={`dashboard-mono flex h-[26px] min-w-[26px] cursor-pointer items-center justify-center rounded-lg px-2 text-[11px] font-bold ${p === page ? "bg-[#0ea5e9] text-white" : "border border-[#e2e8f0] bg-white text-[#334155] hover:bg-sky-50"}`}>{p}</button></span>)}
    <button type="button" aria-label="Next page" disabled={page >= pages} onClick={() => onPage(page + 1)} className="flex size-[26px] cursor-pointer items-center justify-center rounded-lg border border-[#e2e8f0] bg-white disabled:cursor-not-allowed disabled:opacity-40"><DIcon name="pageRight" /></button>
  </nav>;
}

export function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csv = rows.map(row => row.map(cell => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url; link.download = filename; link.click();
  URL.revokeObjectURL(url);
}
