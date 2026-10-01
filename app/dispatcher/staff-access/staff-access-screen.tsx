"use client";

import Link from "next/link";
import { useState } from "react";
import { DButton, DIcon } from "../../../components/dispatcher-ui";
import type { AccessRequest } from "../data";
import { useDispatcher } from "../dispatcher-store";

type Tab = "Pending" | "Reviewed" | "All";
const declineReasons = ["Not on the depot roster", "Requested role does not match HR record", "Duplicate request", "Identity could not be confirmed"];

function RoleBadge({ role }: { role: AccessRequest["role"] }) {
  return <span className={`rounded-[14px] px-[11px] py-[5px] text-[11px] font-bold ${role === "Loader" ? "bg-[#ecfcf5] text-[#057a57]" : "bg-sky-50 text-[#0369a1]"}`}>{role}</span>;
}

export default function StaffAccessScreen() {
  const { requests, decideRequest } = useDispatcher();
  const [tab, setTab] = useState<Tab>("Pending");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [declineReason, setDeclineReason] = useState(declineReasons[0]);

  const pending = requests.filter(r => r.status === "Pending");
  const reviewed = requests.filter(r => r.status !== "Pending");
  const q = query.trim().toLowerCase();
  const list = (tab === "Pending" ? pending : tab === "Reviewed" ? reviewed : requests).filter(r => !q || `${r.name} ${r.employeeId} ${r.username}`.toLowerCase().includes(q));
  const selected = list.find(r => r.id === selectedId) ?? list[0];
  const choose = (id: string) => { setSelectedId(id); setConfirmed(false); setDeclining(false); };
  const decide = (decision: "Approved" | "Declined") => {
    if (!selected) return;
    decideRequest(selected.id, decision);
    const next = pending.find(r => r.id !== selected.id);
    setSelectedId(tab === "Pending" ? next?.id ?? null : selected.id); setConfirmed(false); setDeclining(false);
  };
  const empty = tab === "Pending" && pending.length === 0;

  return <>
    <section className="flex flex-wrap items-end justify-between gap-3 px-[6px] pt-1">
      <div><h1 className="text-[32px] font-bold text-white">Staff Access Requests</h1><p className="mt-[6px] flex flex-wrap items-center gap-[6px] text-[13px] font-medium text-white/72"><DIcon name="calWhite" />Monday, 28 September 2026 <span>· Peliyagoda · Supervisor review</span></p></div>
      <span className="flex items-center gap-[6px] rounded-full bg-white/66 px-[10px] py-[5px] text-[11px] font-bold text-[#475569]"><DIcon name="calChip" />{pending.length ? `${pending.length} request${pending.length > 1 ? "s" : ""} awaiting review` : "No pending requests"}</span>
    </section>

    <section aria-label="Request status and search" className="dispatcher-glass flex flex-wrap items-center gap-[10px] rounded-[22px] px-4 py-[10px]">
      <div role="tablist" aria-label="Request status" className="flex flex-wrap gap-[10px]">{([["Pending", pending.length], ["Reviewed", reviewed.length], ["All", requests.length]] as [Tab, number][]).map(([t, n]) => <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => { setTab(t); setSelectedId(null); setConfirmed(false); setDeclining(false); }} className={`h-10 cursor-pointer whitespace-pre rounded-[20px] px-[15px] text-[13px] ${tab === t ? "bg-[#0284c7] font-bold text-white" : "border border-[#e2e8f0] bg-white font-medium text-[#334559] hover:bg-slate-50"}`}>{`${t}  ·  ${n}`}</button>)}</div>
      <label className="ml-auto flex h-10 w-full items-center rounded-[20px] border border-[#e2e8f0] bg-white px-[14px] sm:w-[270px]"><span className="sr-only">Search name or staff ID</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search name or staff ID" className="w-full bg-transparent text-[12px] font-medium text-[#334155] outline-none placeholder:text-[#64748b]" /></label>
    </section>

    {empty ? <section className="flex min-h-[560px] flex-col items-center justify-center gap-4 rounded-[26px] bg-white/93 px-6 text-center shadow-[0_12px_32px_-8px_rgba(13,26,51,0.08)] backdrop-blur-xl">
      <span className="flex size-16 items-center justify-center rounded-full bg-emerald-50"><DIcon name="checkBig" /></span>
      <h2 className="text-[24px] font-bold">No access requests pending</h2>
      <p className="text-[14px] text-[#334155]">New Loader and Driver requests will appear here for authorized review.</p>
      <Link href="/dispatcher" className="mt-2 rounded-[22px] bg-[#0284c7] px-10 py-3 text-[13px] font-bold text-white hover:bg-[#0369a1]">Return to Command Center</Link>
    </section> : <div className="grid items-start gap-[18px] lg:grid-cols-[minmax(0,680fr)_minmax(0,468fr)]">
      <section aria-label={`${tab} requests`} className="flex min-h-[650px] flex-col gap-3 rounded-[26px] bg-white/93 p-5 shadow-[0_12px_32px_-8px_rgba(13,26,51,0.08)] backdrop-blur-xl">
        <div className="flex items-center justify-between gap-2"><h2 className="text-[19px] font-bold">{tab === "Pending" ? "Pending requests" : tab === "Reviewed" ? "Reviewed requests" : "All requests"}</h2>{tab === "Pending" && <span className="rounded-[15px] bg-[#fffbeb] px-3 py-[6px] text-[11px] font-bold text-[#334559]">{pending.length} need a decision</span>}</div>
        <p className="text-[12px] font-medium text-[#64748b]">Review staff identity and requested workspace before granting access.</p>
        <ul className="flex flex-col gap-3">{list.map(r => { const sel = selected?.id === r.id; return <li key={r.id}><button type="button" aria-pressed={sel} onClick={() => choose(r.id)} className={`flex w-full cursor-pointer items-start justify-between gap-3 rounded-[18px] border px-[17px] py-[15px] text-left ${sel ? "border-[#0ea5e9] bg-[#f0f9ff]" : "border-[#e2e8f0] bg-white hover:bg-slate-50"}`}>
          <span className="flex min-w-0 flex-col gap-[7px]"><span className="text-[17px] font-bold">{r.name}</span><span className="whitespace-pre text-[12px] font-medium text-[#334559]">{`${r.employeeId}  ·  ${r.depot}`}</span><span className="text-[11px] font-medium text-[#64748b]">{r.submittedShort}</span></span>
          <span className="flex shrink-0 flex-col items-end gap-[10px]"><RoleBadge role={r.role} /><span className={`text-[11px] font-bold ${r.status === "Pending" ? "text-[#f59e0b]" : r.status === "Approved" ? "text-[#057a57]" : "text-[#dc2626]"}`}>{r.status === "Pending" ? "Pending review" : r.status}</span></span>
        </button></li>; })}</ul>
        {!list.length && <p className="rounded-[14px] bg-slate-50 px-4 py-6 text-center text-[12px] text-[#64748b]">No requests match “{query}”.</p>}
        {tab === "Pending" && list.length > 0 && <p className="rounded-[14px] bg-[#f0f9ff] px-[15px] py-3 text-[12px] font-medium text-[#0284c7]">Select a request to review role, depot, and staff record.</p>}
      </section>

      {selected ? <section aria-label="Selected request review" className="flex min-h-[650px] flex-col gap-[10px] rounded-[26px] bg-white/96 px-[22px] py-5 shadow-[0_12px_32px_-8px_rgba(13,26,51,0.08)] backdrop-blur-xl">
        <p className="whitespace-pre text-[11px] font-bold text-[#0284c7]">{`REQUEST  ·  ${selected.id}  ·  ${selected.status.toUpperCase()}`}</p>
        <h2 className="text-[23px] font-bold">{selected.name}</h2>
        <div className="flex items-center gap-2 py-1"><RoleBadge role={selected.role} /><span className="whitespace-pre text-[12px] font-medium text-[#334559]">{`${selected.username}  ·  ${selected.depot}${selected.depot.endsWith("Depot") || selected.depot.endsWith("Hub") ? "" : " Depot"}`}</span></div>
        <div className="h-px bg-[#e2e8f0]" />
        <h3 className="text-[14px] font-bold">Staff details</h3>
        <dl className="flex flex-col">{([["Employee ID", selected.employeeId], ["Requested role", selected.role], ["Depot", selected.depot], ["Home dock", selected.dock], ["Mobile", selected.mobile], ["Submitted", selected.submitted]] as const).map(([k, v]) => <div key={k} className="flex min-h-[31px] items-center gap-2 text-[12px]"><dt className="w-[143px] font-medium text-[#64748b]">{k}</dt><dd className="font-bold">{v}</dd></div>)}</dl>
        {selected.status === "Pending" ? <>
          <div className="rounded-[16px] bg-[#fffbeb] px-[15px] py-3"><p className="text-[12px] font-bold text-[#91570a]">Manager confirmation required</p><p className="mt-1 text-[11px] font-medium text-[#334559]">{selected.note}</p><label className="mt-2 flex cursor-pointer items-center gap-2 text-[11px] font-bold text-[#334559]"><input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} className="accent-[#0284c7]" />I confirmed the employee and requested role</label></div>
          <p className="text-[11px] font-medium text-[#64748b]">Only an authorized supervisor or admin can approve access.</p>
          {declining ? <div className="rounded-[16px] border border-red-200 bg-red-50/60 p-3"><label className="text-[12px] font-bold text-[#7f1d1d]" htmlFor="decline-reason">Reason for declining</label><select id="decline-reason" value={declineReason} onChange={e => setDeclineReason(e.target.value)} className="mt-2 w-full rounded-xl border border-red-200 bg-white px-3 py-2 text-[12px]">{declineReasons.map(r => <option key={r}>{r}</option>)}</select><div className="mt-3 flex gap-2"><DButton tone="light" onClick={() => setDeclining(false)} className="flex-1 rounded-[22px] border-[#e2e8f0] px-4 py-[10px] text-[13px]">Back</DButton><DButton tone="danger" onClick={() => decide("Declined")} className="flex-1 rounded-[22px] px-4 py-[10px] text-[13px]">Decline request</DButton></div></div>
            : <div className="mt-auto flex gap-[10px]"><DButton tone="light" onClick={() => setDeclining(true)} className="h-11 w-[128px] rounded-[22px] border-[#e2e8f0] text-[13px] text-[#334559]">Decline</DButton><DButton tone="accent" disabled={!confirmed} title={confirmed ? undefined : "Confirm the employee and role first"} onClick={() => decide("Approved")} className="h-11 flex-1 rounded-[22px] text-[13px]">Approve access</DButton></div>}
        </> : <div className={`mt-2 rounded-[16px] px-[15px] py-3 ${selected.status === "Approved" ? "bg-emerald-50" : "bg-red-50"}`}><p className={`text-[12px] font-bold ${selected.status === "Approved" ? "text-[#057a57]" : "text-[#b91c1c]"}`}>{selected.status === "Approved" ? "Access granted" : "Request declined"}</p><p className="mt-1 text-[11px] font-medium text-[#334559]">{selected.status === "Approved" ? `${selected.name} can sign in as ${selected.role} with ${selected.username}.` : `${selected.name} was told the request was not approved.`}</p></div>}
      </section> : <section className="flex min-h-[650px] items-center justify-center rounded-[26px] bg-white/96 p-6 text-center text-[13px] text-[#64748b]">Select a request to see staff details.</section>}
    </div>}

    <section className="dispatcher-glass rounded-[22px] px-5 py-[14px] text-[12px] font-medium text-[#334559]">Access activates after approval. The applicant signs in with the requested username; passwords are never shown here.</section>
  </>;
}
