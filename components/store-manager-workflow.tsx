"use client";

import Image from "next/image";
import { useState } from "react";
import { DashboardButton } from "./dashboard-ui";
import { Sidebar } from "./waypoint-ui";
import { FlowDialog, StoreShell } from "./store-manager-ui";
import { OrderConfirmed, OrderFlow } from "./store-manager-order-flow";
import { DeliveryFlow } from "./store-manager-delivery-flow";
import { IssueFlow } from "./store-manager-issue-flow";
import { resetStoreDemo, updateDemo, useStoreDemo } from "@/lib/store-manager-demo";
import { storeManagerRoutes, type WorkflowView } from "@/lib/store-manager-routes";

export default function StoreManagerWorkflow({ view }: { view: WorkflowView }) {
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");
  const [dialog, setDialog] = useState("");
  const [sidebar, setSidebar] = useState(false);
  const demo = useStoreDemo();
  const order = view.startsWith("order-") || view === "create-order";
  const issue = view === "issues" || view.startsWith("issue-");
  function announce(message: string) { setToast(message); window.setTimeout(() => setToast(""), 4500); }
  return <>
    <StoreShell active={order ? "Orders" : issue ? "Issues" : "Deliveries"} search={search} onSearch={setSearch} overlay={view === "order-confirmed" ? <OrderConfirmed /> : undefined}>
      {order ? <OrderFlow review={view !== "create-order"} search={search} /> : issue ? <IssueFlow mode={view === "issue-detail" ? "resolved" : view === "issue-resolution" ? "critical" : "overview"} search={search} onSearch={setSearch} announce={announce} open={setDialog} /> : <DeliveryFlow mode={view === "receive-review" ? "review" : view === "receive-delivery" ? "receive" : "tracking"} search={search} announce={announce} open={setDialog} />}
    </StoreShell>
    <div data-demo-toolbar className="dashboard-stage flex flex-wrap items-center justify-center gap-3 px-4 pb-4 text-[10px] text-slate-300"><span>Sample workspace • telemetry and dispatch actions are simulated • changes saved in this browser</span><button type="button" onClick={() => { resetStoreDemo(); announce("Sample workspace reset."); }} className="cursor-pointer underline underline-offset-2">Reset sample data</button><button type="button" onClick={() => setSidebar(true)} className="cursor-pointer underline underline-offset-2 lg:hidden">Store navigation</button></div>
    {sidebar && <FlowDialog title="Store navigation" onClose={() => setSidebar(false)}><Sidebar active={order ? "Orders" : issue ? "Issues" : "Deliveries"} items={Object.entries(storeManagerRoutes).map(([label,href])=>({label,href}))} /></FlowDialog>}
    {toast && <div role="status" className="fixed bottom-5 right-5 z-[60] max-w-[calc(100vw-40px)] rounded-2xl bg-slate-900 px-5 py-3 text-[12px] text-white shadow-xl">{toast}</div>}
    {dialog && <FlowDialog title={dialog} onClose={()=>setDialog("")}>
      {dialog === "Original evidence photo" ? <div className="relative aspect-video overflow-hidden rounded-2xl"><Image src={demo.photo || "/figma/store-manager/322ca.png"} alt="Original issue evidence photo" fill unoptimized={Boolean(demo.photo)} sizes="500px" className="object-contain" /></div> : dialog === "Store Inventory" ? <div className="space-y-3">{demo.items.map(item=><div key={item.id} className="flex justify-between gap-3 rounded-xl bg-white p-3 text-[12px]"><span>{item.name}</span><strong>{item.quantity} {item.unit}</strong></div>)}<p className="text-[11px] text-slate-500">Simulated stock after receipt.</p></div> : dialog === "Call Dispatch" ? <p className="text-sm leading-6 text-slate-600">Sample dispatcher: S. Silva at Peliyagoda DC. Phone calling is simulated in this workspace.</p> : <form onSubmit={event=>{event.preventDefault();const data=new FormData(event.currentTarget);updateDemo({escalation:`${dialog}: ${String(data.get("note"))}`});setDialog("");announce(`${dialog} saved locally in the sample workspace.`);}}><label className="workflow-label">{dialog} note<textarea required name="note" rows={4} className="workflow-field mt-2" placeholder="Describe the discrepancy and requested action…" /></label><DashboardButton type="submit" tone="orange" className="mt-4">Save simulated request</DashboardButton></form>}
    </FlowDialog>}
  </>;
}
