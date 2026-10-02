"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import dimensions from "@/public/figma/store-manager/dimensions.json";
import { DashboardButton, DashboardFooter, DashboardHeader, GlassPanel } from "./dashboard-ui";
import { storeManagerRoutes } from "@/lib/store-manager-routes";

export function FlowAsset({ file, className = "" }: { file: string; className?: string }) {
  const [width, height] = (dimensions as Record<string, number[]>)[file] ?? [16, 16];
  return <Image src={`/figma/store-manager/${file}`} alt="" width={width} height={height} style={{ width, height }} className={`shrink-0 ${className}`} />;
}

export function StoreShell({ active, search, onSearch, children, overlay }: { active: string; search: string; onSearch: (value: string) => void; children: ReactNode; overlay?: ReactNode }) {
  const router = useRouter();
  const [dialog, setDialog] = useState("");
  return <main className="dashboard-stage workspace-stage min-h-screen px-3 py-5 text-[#0f172a] sm:px-6 sm:py-[42px]">
    <div className="dashboard-shell workspace-shell relative mx-auto max-w-[1280px] overflow-hidden rounded-[38px] border border-white/90">
      <div className="orders-backdrop absolute inset-0" />
      <div inert={Boolean(overlay)} className="workspace-body relative z-10 px-4 pb-8 pt-5 sm:px-10">
        <DashboardHeader active={active} search={search} onSearchChange={onSearch} onNotifications={() => setDialog("Notifications")} onNavigate={section => { const href = storeManagerRoutes[section as keyof typeof storeManagerRoutes]; if (href) router.push(href); else setDialog("Marcus Vance · Store Manager"); }} />
        {children}
      </div>
      <DashboardFooter />
      {overlay}
    </div>
    {dialog && <FlowDialog title={dialog} onClose={() => setDialog("")}><p className="text-sm leading-6 text-slate-600">{dialog === "Notifications" ? "Sample notifications: ETA revised to 09:10; Bay 2 ready for intake; ISS-00241 awaiting recount." : "Colombo 07 · OUT104. This profile is part of the simulated store workspace."}</p><DashboardButton className="mt-5" onClick={() => setDialog("")}>Close</DashboardButton></FlowDialog>}
  </main>;
}

export function FlowPanel({ children, className = "" }: { children: ReactNode; className?: string }) { return <GlassPanel className={`workflow-panel ${className}`}>{children}</GlassPanel>; }
export function FlowHeading({ title, subtitle, side }: { title: string; subtitle?: string; side?: ReactNode }) {
  return <div className="mb-4 flex items-start justify-between gap-3 border-b border-slate-200/70 pb-3"><div><h2 className="text-[14px] font-bold tracking-[-.35px]">{title}</h2>{subtitle && <p className="mt-0.5 text-[11px] leading-4 text-[#64748b]">{subtitle}</p>}</div>{side}</div>;
}
export function FlowBadge({ children, tone = "green" }: { children: ReactNode; tone?: "green" | "blue" | "orange" | "red" | "gray" }) {
  const colors = { green: "border-emerald-200 bg-emerald-50 text-emerald-700", blue: "border-blue-200 bg-blue-50 text-blue-700", orange: "border-amber-200 bg-amber-50 text-amber-700", red: "border-rose-200 bg-rose-50 text-rose-600", gray: "border-slate-200 bg-slate-50 text-slate-500" };
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold leading-3 ${colors[tone]}`}>{children}</span>;
}
export function FlowRibbon({ title, subtitle, badge, critical = false, actions, back, extra }: { title: string; subtitle: string; badge?: ReactNode; critical?: boolean; actions?: ReactNode; back?: ReactNode; extra?: ReactNode }) {
  return <section className="mt-4 text-white"><div className="flex flex-wrap items-start justify-between gap-3"><div className="flex flex-wrap items-center gap-2">{back}<span className={`rounded-full border border-white/70 px-3 py-1 text-[10px] font-semibold ${critical ? "bg-rose-100 text-rose-700" : "bg-white/85 text-[#334155]"}`}><span className={`mr-1.5 ${critical ? "text-rose-500" : "text-emerald-500"}`}>●</span>{critical ? "CRITICAL EXCEPTION • Dock Quarantine Active" : "Operational Grid Nominal"}</span><span className="rounded-full border border-white/70 bg-white/65 px-3 py-1 text-[10px] text-[#475569]">Waypoint Style — Colombo 07 • OUT104</span>{extra}</div><div className="flex flex-wrap gap-2">{actions}</div></div><div className="mt-2 flex flex-wrap items-center justify-between gap-3"><div><div className="flex flex-wrap items-center gap-3"><h1 className="text-[26px] font-extrabold leading-tight tracking-[-1px] sm:text-[29px]">{title}</h1>{badge}</div><p className="mt-1 text-[12px] text-white/75">{subtitle}</p></div></div></section>;
}
export function FlowMetric({ label, value, detail, icon, tone = "normal" }: { label: string; value: ReactNode; detail: string; icon?: string; tone?: "normal" | "green" | "red" }) {
  return <article className="workflow-panel min-w-0 rounded-2xl border border-white/90 p-4"><div className="flex items-center justify-between gap-2"><h2 className="text-[10px] font-bold uppercase tracking-[.4px] text-[#565e74]">{label}</h2>{icon && <FlowAsset file={icon} />}</div><div className={`workflow-number mt-2 text-[22px] font-bold leading-7 ${tone === "red" ? "text-rose-600" : tone === "green" ? "text-emerald-700" : "text-[#0b1c30]"}`}>{value}</div><p className={`mt-1 text-[11px] ${tone === "red" ? "text-rose-600" : "text-emerald-700"}`}>{detail}</p></article>;
}
export function FlowTelemetry({ cards }: { cards: { label: string; value: string; detail: string; icon: string }[] }) {
  return <div className="mt-8 grid gap-4 md:grid-cols-3">{cards.map(card => <article key={card.label} className="dashboard-kpi flex min-h-20 items-center gap-3 rounded-2xl p-4"><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${card.label === "QUARANTINE LOCK" ? "bg-rose-600" : "bg-emerald-500/10"}`}><FlowAsset file={card.icon} /></span><div className="min-w-0"><h2 className="text-[9px] font-semibold uppercase tracking-wide text-[#565e74]">{card.label}</h2><p className="text-[12px] font-bold">{card.value}</p><p className="text-[10px] text-emerald-700">{card.detail}</p></div></article>)}</div>;
}
export function FlowTimeline({ steps, active = 2, complete = false, compact = false }: { steps: { title: string; detail: string; time: string }[]; active?: number; complete?: boolean; compact?: boolean }) {
  return <ol className="ml-3 border-l-2 border-emerald-200">{steps.map((step, index) => <li key={step.title} className={`relative pl-5 ${compact ? "py-1.5" : "py-2"} ${index > active && !complete ? "opacity-40" : ""}`}><span className={`absolute -left-[13px] top-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white text-[12px] font-bold text-white ${index < active || complete ? "bg-emerald-500" : index === active ? "bg-[#ff7a1a]" : "bg-slate-300"}`}>{index < active || complete ? "✓" : "●"}</span><div className={`rounded-xl ${index === active && !compact ? `border p-3 ${complete ? "border-emerald-300 bg-emerald-50" : "border-orange-300 bg-white shadow-md"}` : ""}`}><div className="flex flex-wrap items-start justify-between gap-1"><h3 className={`text-[12px] font-bold ${index === active ? complete ? "text-emerald-800" : "text-orange-700" : ""}`}>{step.title}</h3><span className="dashboard-mono text-[9px] text-[#64748b]">{step.time}</span></div><p className="mt-0.5 text-[11px] leading-4 text-[#64748b]">{step.detail}</p>{index === active && !compact && <p className="mt-3 border-t border-slate-100 pt-2 text-[10px] text-[#64748b]">Colombo 07 receiving <span className="ml-2 text-emerald-600">• {complete ? "Custody confirmed" : "Route updated"}</span></p>}</div></li>)}</ol>;
}
export function FlowDialog({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#091224]/70 p-4 backdrop-blur-sm" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }} onKeyDown={event => { if (event.key === "Escape") onClose(); }}><div role="dialog" aria-modal="true" aria-label={title} className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-white bg-[#f8fafc] p-6 shadow-2xl"><div className="mb-4 flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-widest text-orange-600">Simulated workflow</p><h2 className="mt-1 text-xl font-extrabold">{title}</h2></div><button autoFocus type="button" aria-label="Close dialog" onClick={onClose} className="cursor-pointer rounded-full bg-slate-100 px-3 py-1">×</button></div>{children}</div></div>;
}

export function FlowScene({ file, alt, children, dock = false }: { file: string; alt: string; children?: ReactNode; dock?: boolean }) {
  const [zoom, setZoom] = useState(1);
  return <div className={`relative overflow-hidden rounded-2xl bg-slate-900 ${dock ? "h-[320px]" : "h-[320px]"}`}><Image src={`/figma/store-manager/${file}`} alt={alt} fill sizes="(max-width: 1024px) 100vw, 650px" className="object-cover transition-transform" style={{ transform: `scale(${zoom})` }} /><div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/65 via-transparent to-transparent" />{children}<div className="absolute right-3 top-3 flex flex-col gap-1"><button type="button" aria-label="Zoom in" onClick={() => setZoom(value => Math.min(2, value + .2))} className="h-7 w-7 cursor-pointer rounded-lg bg-white/90 text-lg shadow">+</button><button type="button" aria-label="Zoom out" onClick={() => setZoom(value => Math.max(1, value - .2))} className="h-7 w-7 cursor-pointer rounded-lg bg-white/90 text-lg shadow">−</button><button type="button" aria-label="Reset image zoom" onClick={() => setZoom(1)} className="h-7 w-7 cursor-pointer rounded-lg bg-white/90 text-sm shadow">◎</button></div></div>;
}
