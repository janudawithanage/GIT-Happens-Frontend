"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { DashboardButton } from "./dashboard-ui";
import { FlowAsset, FlowBadge, FlowDialog, FlowHeading, FlowPanel, FlowRibbon } from "./store-manager-ui";
import { updateDemo, useStoreDemo } from "@/lib/store-manager-demo";
import { storeManagerRoutes } from "@/lib/store-manager-routes";

export const receivingSlots = [
  { name: "Early Morning", time: "08:00 – 10:00 AM", window: "08–10" },
  { name: "Mid-day Window", time: "11:30 – 13:30", window: "11:30–13:30" },
  { name: "Afternoon Intake", time: "14:00 – 16:30", window: "14–16:30" },
  { name: "Night Restock", time: "19:00 – 21:30", window: "19–21:30" },
];
function dateLabel(value: string) { return new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`)); }

export function OrderFlow({ review = false, search = "" }: { review?: boolean; search?: string }) {
  const router = useRouter();
  const draft = useStoreDemo();
  const [sku, setSku] = useState("");
  const [quantity, setQuantity] = useState(12);
  const [editId, setEditId] = useState("");
  const units = draft.items.reduce((sum, item) => sum + item.quantity, 0);
  const slot = receivingSlots[draft.slot];
  const editItem = draft.items.find(item => item.id === editId);
  const shownItems = draft.items.filter(item => `${item.name} ${item.sku}`.toLowerCase().includes(search.toLowerCase()));
  function reviewOrder() { if (units > 0) router.push("/store-manager/order-review"); }
  function confirmOrder() { updateDemo({ confirmed: true }); router.push("/store-manager/order-confirmed"); }
  function addItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const existing = draft.items.find(item => item.sku.toLowerCase() === sku.trim().toLowerCase());
    const items = existing ? draft.items.map(item => item.id === existing.id ? { ...item, quantity: item.quantity + quantity } : item) : [...draft.items, { id: `sample-${Date.now()}`, name: `Restock assortment · ${sku.trim()}`, sku: sku.trim(), category: "Accessories", quantity, unit: "Crates", weight: quantity * 1.2, icon: "af092.svg" }];
    updateDemo({ items }); setSku("");
  }
  return <>
    <FlowRibbon title={review ? "Review Restock Order" : "Create Restock Order"} subtitle="Order replenishment before the 4:00 PM cutoff window" back={review ? <button type="button" onClick={() => router.push("/store-manager/create-order")} className="rounded-full bg-white/70 px-3 py-1 text-[10px] font-semibold text-slate-600">← Back to Create Order</button> : undefined} actions={<DashboardButton tone="orange" disabled={!units} onClick={review ? confirmOrder : reviewOrder}><FlowAsset file={review ? "bc582.svg" : "8c074.svg"} />{review ? "Confirm Order →" : "Review Manifest →"}</DashboardButton>} />
    <div className="mx-auto mt-4 flex w-fit max-w-full flex-wrap items-center justify-center gap-2 rounded-full border border-white/80 bg-white/80 px-4 py-2 text-[10px] text-[#475569]"><span className="h-3 w-3 rounded-full bg-[#ff7a1a]" /><strong className="text-[#0f172a]">Next-Day Cutoff: 4:00 PM (16:00 Sri Lanka time)</strong><span>• Orders confirmed before 16:00 enter the next planning run</span><FlowBadge tone="orange">Before 16:00</FlowBadge>{review && <FlowBadge>✓ READY TO CONFIRM</FlowBadge>}</div>
    <div className="workflow-main mt-6 min-h-[970px]">
      <div className="space-y-5">
        <FlowPanel>
          <FlowHeading title={review ? "1. Order Details & Delivery Window" : "1. Restock Parameters"} subtitle={review ? "Outlet and requested window" : "Select concession collection and flagship receiving bay window"} side={review ? <div className="flex flex-wrap gap-1"><FlowBadge tone="gray">#ORD-8402-A</FlowBadge><FlowBadge tone="orange">Ready to Confirm</FlowBadge></div> : <span className="dashboard-mono pt-2 text-[9px] tracking-wider text-[#64748b]">STEP 1 OF 3</span>} />
          {review ? <div className="grid gap-4 sm:grid-cols-2">{[
            ["Store / Intake Bay", "Waypoint Style — Colombo 07 (OUT104)", "Waypoint Style — Colombo 07 (OUT104)"],
            ["Concession Brand", "Waypoint Style · Ready-to-wear", "Seasonal allocation"],
            ["Target Delivery Window", dateLabel(draft.date), "Requested next-day delivery"],
            ["Requested Receiving Bay", `Slot ${String.fromCharCode(65 + draft.slot)} • ${slot.name} Intake`, slot.time],
          ].map(([label, value, detail]) => <div key={label}><span className="workflow-label">{label}</span><div className="rounded-[18px] bg-white/90 p-3 text-[12px] font-semibold">{value}<p className="mt-0.5 text-[10px] font-normal text-[#64748b]">{detail}</p></div></div>)}</div> : <>
            <div className="grid gap-4 sm:grid-cols-2"><label><span className="workflow-label">Brand / Concession</span><select className="workflow-field" aria-label="Brand or concession"><option>Waypoint Style · Ready-to-wear</option></select></label><label><span className="workflow-label">Target Arrival Date</span><input type="date" required value={draft.date} onChange={event => { if(event.target.value) updateDemo({ date: event.target.value }); }} className="workflow-field dashboard-mono" /></label></div>
            <fieldset className="mt-5"><legend className="workflow-label">Preferred Unloading Staging Slot</legend><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{receivingSlots.map((entry, index) => <button type="button" key={entry.name} aria-pressed={draft.slot === index} onClick={() => updateDemo({ slot: index })} className={`min-h-[82px] cursor-pointer rounded-2xl p-3 text-left ${draft.slot === index ? "dashboard-orange" : "bg-white/85 hover:bg-white"}`}><span className={`block text-[8px] ${draft.slot === index ? "text-[#0f172a]" : "text-[#94a3b8]"}`}>SLOT {String.fromCharCode(65 + index)}{index === 0 ? " • FAST TRACK" : ""}</span><strong className="mt-1 block text-[11px]">{entry.name}</strong><span className="dashboard-mono mt-1 block text-[8px]">{entry.time}</span></button>)}</div></fieldset>
          </>}
        </FlowPanel>
        <FlowPanel>
          <FlowHeading title="2. Cargo Manifest" subtitle="Items requested for this store order" side={<FlowBadge tone="blue"><span className="dashboard-mono text-[9px]">{draft.items.length} Line Items ({units} Units)</span></FlowBadge>} />
          <div className="space-y-2">{shownItems.map(item => <article key={item.id} className="flex min-h-[70px] flex-wrap items-center gap-3 rounded-[18px] border border-white bg-white/85 p-3"><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${item.id === "knitwear" ? "border-orange-100 bg-orange-50" : item.id === "blazers" ? "border-sky-100 bg-sky-50" : "border-emerald-100 bg-emerald-50"}`}><FlowAsset file={review && item.id === "knitwear" ? "d567c.svg" : review && item.id === "footwear" ? "ae38a.svg" : item.icon} /></span><div className="min-w-0 flex-1"><h3 className="text-[12px] font-bold">{item.name}</h3><p className="dashboard-mono mt-1 text-[9px] text-[#64748b]">SKU: {item.sku} {review ? "• Verified" : `• ${item.category}`}</p></div><div className="text-right"><strong className="dashboard-mono text-[11px]">{item.quantity} {item.unit}</strong><p className="mt-1 text-[10px] text-[#94a3b8]">{item.weight.toFixed(1)} kg{review ? " • Secured" : ""}</p></div>{review ? <span className="flex h-7 w-7 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-500">✓</span> : <div className="flex gap-2"><button type="button" aria-label={`Edit ${item.name}`} onClick={() => setEditId(item.id)} className="cursor-pointer rounded-lg bg-white p-2"><FlowAsset file="60007.svg" /></button><button type="button" aria-label={`Remove ${item.name}`} onClick={() => updateDemo({ items: draft.items.filter(entry => entry.id !== item.id) })} className="cursor-pointer rounded-lg bg-white p-2"><FlowAsset file="10a5a.svg" /></button></div>}</article>)}</div>
          {!shownItems.length && <p className="py-5 text-center text-sm text-slate-500">No matching cargo items.</p>}
          {!review && <form onSubmit={addItem} className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl bg-white/65 p-3"><label className="min-w-0 flex-1"><span className="sr-only">SKU or tote barcode</span><input required maxLength={40} value={sku} onChange={event => setSku(event.target.value)} className="w-full rounded-xl border border-slate-100 bg-white px-3 py-2 text-[11px] outline-none" placeholder="Add SKU or scan tote barcode…" /></label><label className="flex items-center gap-1 rounded-xl bg-white px-3 py-2 text-[10px]">Qty:<input required type="number" min={1} max={9999} value={quantity} onChange={event => setQuantity(Number(event.target.value))} className="w-10 text-center outline-none" /></label><DashboardButton type="submit"><FlowAsset file="af092.svg" />Add Item</DashboardButton></form>}
        </FlowPanel>
        <FlowPanel>
          <FlowHeading title="3. Delivery Instructions" subtitle="Goods handling and receiving bay" side={<span className="dashboard-mono pt-2 text-[9px] tracking-wider text-[#64748b]">STEP 3 OF 3</span>} />
          <div className="grid gap-4 sm:grid-cols-2"><fieldset><legend className="workflow-label">Goods handling</legend>{review ? <div className="rounded-2xl bg-white/85 p-4 text-[12px] font-semibold">{draft.handling} garments<p className="mt-1 text-[10px] text-emerald-700">● Keep garments on rails</p></div> : <div className="grid grid-cols-3 gap-1">{["Hanging", "Boxed", "Fragile"].map((option, index) => <button type="button" key={option} onClick={() => updateDemo({ handling: option })} aria-pressed={draft.handling === option} className={`flex min-h-14 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-bold ${draft.handling === option ? "bg-slate-900 text-white" : "bg-white/85"}`}><FlowAsset file={["91e08.svg", "6057a.svg", "3960e.svg"][index]} />{option}</button>)}</div>}</fieldset><fieldset><legend className="workflow-label">Intake Portal Bay</legend>{review ? <div className="rounded-2xl bg-white/85 p-4 text-[12px] font-semibold">Bay {draft.bay} receiving<p className="mt-1 text-[10px] text-[#64748b]">Use Bay {draft.bay} for unloading</p></div> : <div className="grid grid-cols-3 gap-1">{[1, 2, 3].map(bay => <button type="button" key={bay} onClick={() => updateDemo({ bay })} aria-pressed={draft.bay === bay} className={`min-h-14 cursor-pointer rounded-xl border p-2 text-[11px] font-bold ${draft.bay === bay ? "border-slate-200 bg-white" : "border-transparent bg-white/80"}`}><span className={`mb-1 block ${bay === 1 ? "text-emerald-500" : bay === 2 ? "text-sky-400" : "text-amber-500"}`}>●</span>Bay {bay}</button>)}</div>}</fieldset></div>
          {review && <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-[11px] text-amber-900"><strong className="block">ⓘ RECEIVING NOTE</strong>{draft.note}</div>}
        </FlowPanel>
      </div>
      <FlowPanel>
        <FlowHeading title="Consignment Summary" subtitle="Check quantities and delivery window" side={<FlowBadge><span className="dashboard-mono">Validated</span></FlowBadge>} />
        <div className="grid grid-cols-2 gap-3">{[
          ["TOTAL UNITS", String(units), "Units", `${draft.items.length} SKU Categories`],
          ["DELIVERY WINDOW", slot.window, draft.slot === 0 ? "AM" : "", dateLabel(draft.date)],
          ["ORDER CUTOFF", "16:00", "SLST", "Confirm before 4 PM"],
          ["STAGING BAY", `Bay ${draft.bay}`, "North", "Dry-box truck"],
        ].map(([label, value, suffix, detail]) => <div key={label} className="min-h-[95px] rounded-[18px] bg-white/90 p-4"><h3 className="text-[9px] font-medium tracking-wide text-[#94a3b8]">{label}</h3><p className="mt-2 flex flex-wrap items-baseline gap-1"><strong className={`${label === "STAGING BAY" ? "text-[17px]" : "workflow-number text-[24px]"} leading-none`}>{value}</strong><span className="text-[11px] text-[#64748b]">{suffix}</span></p><p className={`mt-2 text-[10px] ${label === "STAGING BAY" ? "text-emerald-700" : "text-[#94a3b8]"}`}>{detail}</p></div>)}</div>
        {review && <div className="mt-4 rounded-2xl bg-white/90 p-4"><div className="flex justify-between text-[10px]"><span className="text-[#64748b]">PLANNING STATUS</span><strong className="dashboard-mono">Pending</strong></div><div className="mt-2 h-2 rounded-full bg-slate-100"><div className="h-full w-[28%] rounded-full bg-amber-500" /></div><p className="mt-2 text-[10px] text-[#94a3b8]">Dispatcher assigns a route after the 4 PM cutoff.</p></div>}
        <div className="mt-4 flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-[11px] text-emerald-900"><span className="text-emerald-500">✓</span><div><strong>Cutoff Compliance: Validated</strong><p className="mt-1 text-[10px]">Confirm by 16:00 for the next planning run.</p></div></div>
        {review && <dl className="mt-4 rounded-2xl bg-white/75 px-4 text-[11px]">{[["Fulfilment depot", "Peliyagoda DC"], ["Vehicle allocation", "Pending dispatcher plan"], ["Requested Window", `${draft.date}, ${slot.time}`]].map(([label,value]) => <div key={label} className="flex justify-between gap-3 border-b border-slate-100 py-3 last:border-0"><dt className="text-[#64748b]">{label}</dt><dd className="text-right font-semibold">{value}</dd></div>)}</dl>}
        <div className="mt-5 space-y-2"><DashboardButton tone="orange" disabled={!units} className="w-full" onClick={review ? confirmOrder : reviewOrder}><FlowAsset file={review ? "bc582.svg" : "e08ad.svg"} />{review ? "Confirm Order →" : "Review Operational Manifest →"}</DashboardButton><DashboardButton className="w-full" onClick={() => router.push(review ? "/store-manager/create-order" : storeManagerRoutes.Dashboard)}>{review ? "✎ Edit Order Details" : "▧ Back to Dashboard"}</DashboardButton></div>
        <div className="mt-4 flex justify-between gap-2 rounded-2xl bg-white/70 p-3 text-[10px]"><span><span className="text-emerald-500">● </span>Intake Bay {draft.bay} Operational</span><span className="dashboard-mono text-[9px] text-[#94a3b8]">{review ? "Order ready to confirm" : "Order form ready"}</span></div>
      </FlowPanel>
    </div>
    {editItem && <FlowDialog title="Edit cargo item" onClose={() => setEditId("")}><form onSubmit={event => { event.preventDefault(); const data = new FormData(event.currentTarget); const qty = Number(data.get("quantity")); updateDemo({ items: draft.items.map(item => item.id === editId ? { ...item, name: String(data.get("name")), quantity: qty, weight: item.weight / item.quantity * qty } : item) }); setEditId(""); }}><label className="workflow-label">Item name<input required name="name" defaultValue={editItem.name} className="workflow-field mt-2" /></label><label className="workflow-label mt-4">Quantity<input required name="quantity" type="number" min={1} max={9999} defaultValue={editItem.quantity} className="workflow-field mt-2" /></label><DashboardButton type="submit" tone="orange" className="mt-4">Save sample item</DashboardButton></form></FlowDialog>}
  </>;
}

export function OrderConfirmed() {
  const router = useRouter();
  const draft = useStoreDemo();
  const units = draft.items.reduce((sum, item) => sum + item.quantity, 0);
  return <div className="workflow-confirmation fixed inset-0 z-30 flex items-center justify-center bg-[#091224]/35 p-4 backdrop-blur-[7px]"><section role="dialog" aria-modal="true" aria-labelledby="confirmed-title" className="w-full max-w-[580px] rounded-[26px] border border-white/90 bg-[linear-gradient(135deg,#f8fafc_20%,#f8fafc_60%,#fbe4d2)] p-7 shadow-2xl"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#10bfa0] text-white shadow-lg"><FlowAsset file="cc80a.svg" /></div><div className="mt-4 text-center"><FlowBadge>● Order received before cutoff</FlowBadge><h2 id="confirmed-title" className="mt-3 text-[24px] font-extrabold tracking-[-.7px]">Restock Order Confirmed</h2><p className="dashboard-mono mt-1 text-[11px] text-[#64748b]">Order Ref: #ORD-8402-A</p></div><div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white bg-white/85 p-4"><div className="space-y-3 text-[11px]">{[["VEHICLE ALLOCATION", "Pending dispatcher plan", "c7bdf.svg"], ["REQUESTED DELIVERY WINDOW", `${dateLabel(draft.date)}, ${receivingSlots[draft.slot].time} (Bay ${draft.bay})`, "28079.svg"], ["ORDER RECEIVED", `${draft.items.length} Line Items (${units} Total Units)`, "cbb8f.svg"]].map(([label,value,icon]) => <div key={label} className="flex gap-2"><FlowAsset file={icon} /><div><p className="text-[9px] tracking-wide text-[#94a3b8]">{label}</p><strong>{value}</strong></div></div>)}</div><div className="flex flex-col items-center gap-2 border-l border-slate-100 pl-4"><FlowAsset file="b7e1b.svg" /><span className="dashboard-mono text-[8px] text-[#64748b]">TOKEN #CSGN-8402-V</span><FlowBadge>HUB VERIFIED</FlowBadge></div></div><div className="mt-5 space-y-2"><DashboardButton tone="orange" className="w-full" onClick={() => router.push(storeManagerRoutes.Orders)}>➤ View Order Status →</DashboardButton><DashboardButton className="w-full" onClick={() => router.push(storeManagerRoutes.Dashboard)}>Return to Store Manager Dashboard</DashboardButton><button type="button" onClick={() => window.print()} className="w-full cursor-pointer py-2 text-[11px] text-[#64748b]">▧ Print Manifest Receipt (PDF)</button></div><p className="mt-2 text-center text-[9px] text-[#64748b]">Sample confirmation • saved in this browser</p></section></div>;
}
