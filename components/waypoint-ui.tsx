import type { ReactNode } from "react";
import Image from "next/image";

export function BrandLogo({ size = 40 }: { size?: number }) {
  return <span className="flex shrink-0 items-center justify-center rounded-2xl border border-white/90 bg-white/85 p-[5px] shadow-sm backdrop-blur-md" style={{ width: size, height: size }}><Image src="/figma/logo.png" alt="Waypoint Flow" width={size - 12} height={size - 12} /></span>;
}

export function SiteHeader() {
  return <header className="relative z-10 mx-auto w-full max-w-[1280px] px-5 pt-5 sm:px-12 lg:px-16"><div className="glass-nav flex min-h-[66px] items-center justify-between rounded-[18px] border border-white/85 px-4 py-[13px] backdrop-blur-xl sm:px-5"><div className="flex items-center gap-[14px]"><BrandLogo /><div><div className="bg-gradient-to-r from-[#0f172a] to-[#0369a1] bg-clip-text text-[14px] font-bold tracking-[.7px] text-transparent">WAYPOINT FLOW</div><div className="hidden text-[11px] leading-[16px] tracking-[-.275px] text-[#64748b] sm:block">Intelligent Delivery Operations</div></div></div><span className="rounded-full border border-white/85 bg-white/85 px-[15px] py-[9px] text-[12px] font-bold text-[#334155] shadow-sm backdrop-blur-xl">Secure access</span></div></header>;
}

export function SiteFooter() {
  return <footer className="relative z-10 flex min-h-[46px] w-full items-center border-t border-white/60 bg-[#091224]/55 px-5 text-[12px] text-white/70 backdrop-blur-md sm:px-12 lg:px-12"><div className="mx-auto flex w-full max-w-[1184px] flex-col items-center justify-between gap-3 sm:flex-row"><span>© 2026 Waypoint Group. All logistics protocols reserved.</span><nav aria-label="Legal and support" className="flex items-center gap-4"><a className="hover:text-white" href="mailto:compliance@waypointgroup.com">Compliance</a><span>•</span><a className="hover:text-white" href="mailto:support@waypointgroup.com">Fleet Support</a><span>•</span><a className="hover:text-white" href="mailto:privacy@waypointgroup.com">Privacy &amp; Data</a></nav></div></footer>;
}

export function PrimaryButton({ children, type = "button" }: { children: ReactNode; type?: "button" | "submit" }) {
  return <button type={type} className="magma-button relative flex h-12 w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-2xl px-5 text-[14px] font-bold tracking-[.35px] text-[#0f172a] transition-transform hover:-translate-y-0.5 active:translate-y-0">{children}</button>;
}

export function StatCard() {
  return <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3 rounded-2xl border border-white/90 bg-white/85 p-3 shadow-lg backdrop-blur-xl"><div className="flex min-w-0 items-center gap-[10px]"><span className="rounded-xl bg-gradient-to-r from-[#f97316] to-[#f59e0b] px-2 py-1 text-[10px] font-bold text-[#0f172a]">98%</span><div className="min-w-0"><p className="truncate text-[12px] font-bold leading-4 text-[#0f172a]">Waypoint Flow dispatch</p><p className="truncate text-[11px] leading-4 text-[#475569]">98% Synchronized • Continuous Feed</p></div></div><span className="shrink-0 rounded-full border border-emerald-300/50 bg-emerald-500/15 px-[11px] py-[3px] text-[10px] font-bold text-[#065f46]">On Schedule</span></div>;
}

export function Sidebar({ items, active }: { items: { label: string; href: string }[]; active?: string }) {
  return <aside className="w-60 rounded-2xl border border-slate-200 bg-white/85 p-3" aria-label="Workspace navigation"><nav className="flex flex-col gap-1">{items.map(item => <a key={item.href} href={item.href} aria-current={active === item.href ? "page" : undefined} className={`rounded-xl px-3 py-2 text-sm ${active === item.href ? "bg-sky-100 font-bold text-sky-900" : "text-slate-600 hover:bg-slate-100"}`}>{item.label}</a>)}</nav></aside>;
}

export function DataTable<T extends Record<string, string | number>>({ columns, rows }: { columns: { key: keyof T; label: string }[]; rows: T[] }) {
  return <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white/85"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-slate-600"><tr>{columns.map(column => <th className="px-4 py-3 font-bold" key={String(column.key)}>{column.label}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={index} className="border-t border-slate-100">{columns.map(column => <td className="px-4 py-3 text-slate-800" key={String(column.key)}>{row[column.key]}</td>)}</tr>)}</tbody></table></div>;
}
