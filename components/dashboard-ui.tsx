import Image from "next/image";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { ProfileMenu } from "./profile-menu";
import { WorkspaceHeader } from "./workspace-header";

const icons = {
  delayed: ["0cc34.svg", 16.6667, 16.6667], vehicle: ["88b0f.svg", 11.25, 12.5], box: ["32350.svg", 12.5, 12.5], bay: ["b4cd8.svg", 8.125, 13.75],
  approaching: ["38ef7.svg", 15, 15], vehicleSmall: ["4c907.svg", 13.75, 10], boxSmall: ["500b7.svg", 11.25, 11.25], delivered: ["a3af6.svg", 16.6667, 16.6667],
  live: ["a2343.svg", 10.6667, 13.3333], scan: ["e19e5.svg", 16.5, 13.5], damaged: ["915c9.svg", 15, 15], shortage: ["9d24c.svg", 16.6667, 15.8333], late: ["165b5.svg", 17.6875, 17.75],
  warning: ["522cd.svg", 15.5833, 13.4583], add: ["eee2d.svg", 15, 15], arrow: ["82989.svg", 10, 10], orders: ["556c7.svg", 13.5, 15], truck: ["31243.svg", 16.5, 12], clock: ["64d08.svg", 15, 15], alert: ["c6922.svg", 16.5, 14.25],
  logo: ["3ea19.svg", 20, 20], search: ["b681c.svg", 12.75, 12.75], bell: ["8669b.svg", 12, 15], bolt: ["38a9a.svg", 14.6667, 14],
} as const;
export type DashboardIconName = keyof typeof icons;
export function DashboardIcon({ name, className = "" }: { name: DashboardIconName; className?: string }) {
  const [file, width, height] = icons[name];
  return <Image src={`/figma/dashboard/${file}`} alt="" width={width} height={height} className={className} />;
}

export function GlassPanel({ children, className = "", id }: { children: ReactNode; className?: string; id?: string }) {
  return <section id={id} className={`dashboard-glass rounded-[24px] p-5 ${className}`}>{children}</section>;
}

export function DashboardButton({ children, tone = "light", className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: "light" | "orange" | "muted" }) {
  const style = tone === "orange" ? "dashboard-orange border-orange-400/50 text-[#0f172a]" : tone === "muted" ? "border-transparent bg-slate-100 text-slate-400" : "border-white bg-white/90 text-[#334155] hover:bg-white";
  return <button {...props} className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border px-4 py-[8px] text-[11px] font-bold shadow-sm transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60 ${style} ${className}`}>{children}</button>;
}

export function DashboardPageHeading({ title, subtitle, actions, className = "" }: { title: string; subtitle?: string; actions: ReactNode; className?: string }) {
  return <div className={`mt-4 flex flex-wrap items-start justify-between gap-3 ${className}`}>
    <div className="min-w-0">
      <div className="flex flex-wrap gap-2">
        <span className="rounded-full border border-white/75 bg-white/80 px-3 py-1 text-[10px] font-semibold"><span className="mr-1 text-emerald-500">●</span>Operational Grid Nominal</span>
        <span className="rounded-full border border-white/70 bg-white/45 px-3 py-1 text-[10px] text-[#475569]">Waypoint Style — Colombo 07 • OUT104</span>
      </div>
      <h1 className="mt-1 text-[26px] font-extrabold leading-tight tracking-[-1px] text-white sm:text-[29px]">{title}</h1>
      {subtitle && <p className="mt-1 text-[12px] text-white/75">{subtitle}</p>}
    </div>
    <div className="flex flex-wrap gap-2 sm:mt-3">{actions}</div>
  </div>;
}

export function DashboardStatCard({ title, value, detail, foot, icon, alert = false }: { title: string; value: string; detail: ReactNode; foot: ReactNode; icon: DashboardIconName; alert?: boolean }) {
  return <article className={`dashboard-kpi flex h-[128px] min-w-0 flex-col justify-between rounded-[24px] p-5 ${alert ? "text-[#ff6b00]" : "text-[#0f172a]"}`}><div className="flex items-start justify-between gap-2"><h2 className={`pt-2 text-[11px] font-bold tracking-[.3px] ${alert ? "text-[#ff6b00]" : "text-[#64748b]"}`}>{title}</h2><span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border ${alert ? "border-orange-300/50 bg-orange-300/10" : "border-white bg-white/80"}`}><DashboardIcon name={icon} /></span></div><div className="flex min-w-0 items-end justify-between gap-1"><div className="flex min-w-0 items-baseline gap-[6px]"><strong className="text-[24px] font-bold leading-none">{value}</strong><span className={alert ? "whitespace-nowrap text-[10px]" : "truncate text-[11px]"}>{detail}</span></div><span className={alert ? "shrink-0 text-right text-[9px]" : "shrink-0 text-right text-[10px]"}>{foot}</span></div><div className={`h-[6px] w-full rounded-full ${alert ? "bg-[#ff7a1a]" : "bg-white/85"}`} /></article>;
}

export function DashboardFooter({ syncLabel = 'Store Sync: 100% Up', locationLabel = 'Outlet: OUT104', activityLabel = 'Telemetry Core: Active', accent = 'orange' }: { syncLabel?: string; locationLabel?: string; activityLabel?: string; accent?: 'orange' | 'blue' } = {}) {
  return <footer className="workspace-footer relative z-10 flex min-h-[46px] flex-wrap items-center justify-between gap-2 border-t border-white/70 bg-white/40 px-5 py-2 text-[11px] text-[#475569] backdrop-blur-xl sm:px-10"><div className="flex flex-wrap items-center gap-3"><span className="font-semibold text-[#0f172a]"><span className={`mr-2 inline-block h-[6px] w-[6px] rounded-full ${accent === 'blue' ? 'bg-[#0ea5e9]' : 'bg-[#ff7a1a]'}`} />{activityLabel}</span><span>•</span><span>{syncLabel}</span><span>•</span><span className="dashboard-mono text-[10px]">{locationLabel}</span></div><div className="dashboard-mono flex gap-4 text-[10px]"><span>v4.12.0</span><span>© 2026 Waypoint Group</span></div></footer>;
}

export function DashboardHeader({ active, onNavigate, search, onSearchChange, onNotifications }: { active: string; onNavigate: (section: string) => void; search: string; onSearchChange: (value: string) => void; onNotifications: () => void }) {
  return <WorkspaceHeader role="Store Dispatch" href="/store-manager/dashboard" logo={<DashboardIcon name="logo" />}
    navigation={<nav aria-label="Store dashboard">{["Dashboard", "Orders", "Deliveries", "Issues"].map(item => <button type="button" key={item} onClick={() => onNavigate(item)} aria-current={active === item ? "page" : undefined}>{item}</button>)}</nav>}
    search={<label className="workspace-search-field"><DashboardIcon name="search" /><input aria-label="Search orders and vehicles" value={search} onChange={e => onSearchChange(e.target.value)} placeholder="Search orders, vehicles..." /></label>}
    actions={<><button type="button" aria-label="Notifications" onClick={onNotifications} className="workspace-icon-button relative"><DashboardIcon name="bell" /><span className="absolute right-0 top-0 flex h-[14px] w-[14px] items-center justify-center rounded-full bg-[#ff7a1a] text-[8px] font-extrabold text-[#0f172a] ring-2 ring-white">3</span></button><ProfileMenu /></>}
  />;
}
