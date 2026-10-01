"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { markSignOutNavigation } from "@/lib/sign-in-navigation";

export function ProfileMenu() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const detailsRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const detailsId = useId();

  useEffect(() => {
    if (!open) return;
    detailsRef.current?.focus();

    function dismiss(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setShowDetails(false);
      }
    }

    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [open]);

  return <div
    ref={containerRef}
    className="relative ml-1 shrink-0"
    onBlur={event => {
      if (!event.currentTarget.contains(event.relatedTarget)) {
        setOpen(false);
        setShowDetails(false);
      }
    }}
    onKeyDown={event => {
      if (event.key === "Escape" && open) {
        event.preventDefault();
        setOpen(false);
        setShowDetails(false);
        triggerRef.current?.focus();
      }
    }}
  >
    <button
      ref={triggerRef}
      type="button"
      aria-label="Profile: Marcus Vance"
      aria-expanded={open}
      aria-controls={menuId}
      onClick={() => { setOpen(value => !value); setShowDetails(false); }}
      className="flex h-8 w-8 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-white ring-2 ring-[#ff7a1a] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-600"
    >
      <Image src="/figma/dashboard/37c7d.png" width={28} height={28} alt="Marcus Vance" className="h-full w-full object-cover" />
    </button>
    {open && <div id={menuId} role="region" aria-label="Profile menu" className="absolute right-0 top-full z-50 mt-3 w-72 max-w-[calc(100vw-3.5rem)] overflow-hidden rounded-2xl border border-white bg-white text-[#0f172a] shadow-[0_16px_48px_rgba(15,23,42,.22)]">
      <div className="flex items-center gap-3 border-b border-slate-100 p-4">
        <Image src="/figma/dashboard/37c7d.png" width={40} height={40} alt="" className="h-10 w-10 rounded-full object-cover" />
        <div className="min-w-0"><p className="text-sm font-bold">Marcus Vance</p><p className="mt-0.5 text-xs text-slate-500">Store Manager</p></div>
      </div>
      <ul className="p-2">
        <li>
          <button ref={detailsRef} type="button" aria-expanded={showDetails} aria-controls={detailsId} onClick={() => setShowDetails(value => !value)} className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-semibold hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-sky-600">
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M5 21v-2a7 7 0 0 1 14 0v2" /></svg>
            Profile details
            <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`ml-auto transition-transform ${showDetails ? "rotate-180" : ""}`}><path d="m6 9 6 6 6-6" /></svg>
          </button>
          {showDetails && <dl id={detailsId} className="mx-3 mb-2 space-y-3 rounded-xl bg-slate-50 p-3 text-xs">
            {[['Email', 'manager@waypointgroup.com'], ['Role', 'Store Manager'], ['Store', 'Waypoint Style — Colombo 07'], ['Outlet', 'OUT104']].map(([label, value]) => <div key={label}><dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</dt><dd className="mt-1 break-words text-slate-700">{value}</dd></div>)}
          </dl>}
        </li>
        <li className="mt-1 border-t border-slate-100 pt-1">
          <button type="button" onClick={() => { markSignOutNavigation(); setOpen(false); setShowDetails(false); router.replace("/sign-in"); }} className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-red-600 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-red-500">
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>
            Sign out
          </button>
        </li>
      </ul>
    </div>}
  </div>;
}
