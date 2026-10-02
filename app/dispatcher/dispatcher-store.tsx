"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { fleet, seedDeferred, seedOrders, seedRequests, seedRisks, seedVehicles, seedWave, type AccessRequest, type Deferred, type FleetVehicle, type LiveVehicle, type Order, type WaveEntry } from "./data";

type Risk = (typeof seedRisks)[number] & { notified?: boolean };
type Notification = { id: string; title: string; detail: string; href: string; read: boolean };
export type PlanStatus = "Draft" | "Validated" | "Published";
export type CheckResult = { key: string; label: string; detail: string; pass: boolean };

type Store = {
  orders: Order[]; wave: WaveEntry[]; vehicles: LiveVehicle[]; risks: Risk[]; deferred: Deferred[]; requests: AccessRequest[]; notifications: Notification[];
  planStatus: PlanStatus; selectedPlanOrder: string; blockedResolved: boolean; toast: string; pendingAccessCount: number; allocatedCount: number;
  showToast: (message: string) => void; markNotificationsRead: () => void;
  selectPlanOrder: (orderId: string) => void; assignOrder: (orderId: string, vehicleId: string) => void; vehicleLoad: (vehicleId: string, previewOrder?: string) => { volume: number; weight: number };
  checkAssignment: (orderId: string, vehicleId: string) => CheckResult[]; setPlanStatus: (status: PlanStatus) => void;
  notifyRisk: (id: string) => void; resolveRisk: (id: string, message: string) => void; resolveBlocked: (vehicleId: string) => void;
  replanDeferred: (ids: string[]) => void; keepDeferred: (ids: string[]) => void;
  decideRequest: (id: string, decision: "Approved" | "Declined") => void;
};

const DispatcherContext = createContext<Store | null>(null);

export function useDispatcher() {
  const store = useContext(DispatcherContext);
  if (!store) throw new Error("useDispatcher must be used inside DispatcherProvider");
  return store;
}

export function findFleet(id: string): FleetVehicle | undefined { return fleet.find(v => v.id === id); }

export function DispatcherProvider({ children }: { children: ReactNode }) {
  const [orders] = useState(seedOrders);
  const [wave, setWave] = useState(seedWave);
  const [vehicles, setVehicles] = useState(seedVehicles);
  const [risks, setRisks] = useState<Risk[]>(seedRisks);
  const [deferred, setDeferred] = useState(seedDeferred);
  const [requests, setRequests] = useState(seedRequests);
  const [planStatus, setPlanStatus] = useState<PlanStatus>("Draft");
  const [selectedPlanOrder, setSelectedPlanOrder] = useState("ORD0092308");
  const [blockedResolved, setBlockedResolved] = useState(false);
  const [toast, setToast] = useState("");
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: "n1", title: "ORD-10251 at risk", detail: "VEH021 ETA 11:35 is 5 min after the 11:30 window.", href: "/dispatcher/live?risk=ORD-10251", read: false },
    { id: "n2", title: "Capacity violation on VEH019", detail: "Loaded 3,620 kg vs 3,200 kg maximum — trip blocked.", href: "/dispatcher", read: false },
    { id: "n3", title: "3 staff access requests", detail: "Loader and driver requests awaiting supervisor review.", href: "/dispatcher/staff-access", read: false },
  ]);
  const toastTimer = useRef<number | undefined>(undefined);

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 4000);
  }, []);

  const orderById = useMemo(() => new Map(orders.map(o => [o.id, o])), [orders]);

  // Vehicle load = seeded trip load, adjusted for any wave orders moved on or off it.
  const vehicleLoad = useCallback((vehicleId: string, previewOrder?: string) => {
    const v = findFleet(vehicleId);
    if (!v) return { volume: 0, weight: 0 };
    const sum = (entries: WaveEntry[]) => entries.filter(e => e.vehicle === vehicleId).reduce((acc, e) => { const o = orderById.get(e.orderId); return o ? { volume: acc.volume + o.volumeM3, weight: acc.weight + o.weightKg } : acc; }, { volume: 0, weight: 0 });
    const now = sum(wave), seed = sum(seedWave);
    let volume = v.baseVolume + now.volume - seed.volume, weight = v.baseWeight + now.weight - seed.weight;
    const preview = previewOrder ? orderById.get(previewOrder) : undefined;
    if (preview && wave.find(e => e.orderId === previewOrder)?.vehicle !== vehicleId) { volume += preview.volumeM3; weight += preview.weightKg; }
    return { volume: Math.round(volume * 10) / 10, weight: Math.round(weight) };
  }, [wave, orderById]);

  const checkAssignment = useCallback((orderId: string, vehicleId: string): CheckResult[] => {
    const o = orderById.get(orderId), v = findFleet(vehicleId);
    if (!o || !v) return [];
    const load = vehicleLoad(vehicleId, orderId);
    const volPct = Math.round((load.volume / v.volumeCap) * 100), wPct = Math.round((load.weight / v.weightCap) * 100);
    const needsReefer = o.load !== "Ambient";
    return [
      { key: "volume", label: `Volume (${volPct}% after add)`, detail: `${load.volume} m³ of ${v.volumeCap} m³`, pass: load.volume <= v.volumeCap },
      { key: "weight", label: `Weight Payload (${wPct}% used)`, detail: `${load.weight.toLocaleString()} kg of ${v.weightCap.toLocaleString()} kg`, pass: load.weight <= v.weightCap },
      { key: "temp", label: needsReefer && !v.reefer ? "Temperature: reefer required" : "Temperature Compatible", detail: needsReefer ? (v.reefer ? `Reefer holds ${o.temp ?? "2–4°C"}` : `${o.load} load cannot ride in an ambient vehicle`) : "Ambient goods ride in any vehicle", pass: !needsReefer || v.reefer },
      { key: "access", label: "Vehicle Access Compatible", detail: `${o.dock} supports a ${v.type.split(" ")[0]} rigid`, pass: true },
      { key: "depot", label: "Depot Match: Peliyagoda", detail: "Vehicle and order share the Peliyagoda depot", pass: true },
      { key: "fuel", label: `Fuel / Range Quota (${v.fuelLeft}% left)`, detail: v.fuelLeft >= 25 ? "Within weekly quota" : "Weekly quota nearly used", pass: v.fuelLeft >= 25 },
    ];
  }, [orderById, vehicleLoad]);

  const selectPlanOrder = useCallback((orderId: string) => {
    setSelectedPlanOrder(orderId);
    setWave(w => w.some(e => e.orderId === orderId) ? w : [{ orderId, vehicle: null, label: "Confirmed" }, ...w]);
  }, []);

  const assignOrder = useCallback((orderId: string, vehicleId: string) => {
    setWave(w => w.map(e => e.orderId === orderId ? { ...e, vehicle: vehicleId } : e));
    setPlanStatus("Draft");
    showToast(`${orderId} assigned to ${vehicleId}. Plan saved as draft.`);
  }, [showToast]);

  const notifyRisk = useCallback((id: string) => {
    setRisks(r => r.map(x => x.id === id ? { ...x, notified: true } : x));
    showToast(`Store manager notified about ${id}.`);
  }, [showToast]);

  const resolveRisk = useCallback((id: string, message: string) => {
    const risk = risks.find(r => r.id === id);
    setRisks(r => r.filter(x => x.id !== id));
    if (risk) setVehicles(vs => vs.map(v => v.id === risk.vehicle ? { ...v, risk: undefined, status: v.status === "Delivery risk" ? "On route" : v.status, stops: v.stops.map(s => s.state === "risk" || s.state === "tight" ? { ...s, state: "next" } : s), chip: v.chip ? { ...v.chip, label: v.chip.label?.replace(" · Risk", "") } : v.chip } : v));
    showToast(message);
  }, [risks, showToast]);

  const resolveBlocked = useCallback((vehicleId: string) => {
    setBlockedResolved(true);
    setNotifications(n => n.filter(x => x.id !== "n2"));
    showToast(`Trip moved from VEH019 to ${vehicleId}. Capacity violation cleared.`);
  }, [showToast]);

  const replanDeferred = useCallback((ids: string[]) => {
    setDeferred(d => d.filter(x => !ids.includes(x.id)));
    showToast(ids.length === 1 ? `${ids[0]} moved back into today's plan.` : `${ids.length} orders moved back into today's plan.`);
  }, [showToast]);

  const keepDeferred = useCallback((ids: string[]) => {
    showToast(ids.length === 1 ? `${ids[0]} kept for Tue, 29 Sep. Decision logged.` : `${ids.length} deferrals confirmed for Tue, 29 Sep. Decisions logged.`);
  }, [showToast]);

  const decideRequest = useCallback((id: string, decision: "Approved" | "Declined") => {
    const req = requests.find(r => r.id === id);
    setRequests(rs => rs.map(r => r.id === id ? { ...r, status: decision, submittedShort: "Reviewed today" } : r));
    if (req) showToast(decision === "Approved" ? `Access approved for ${req.name} · ${req.role}.` : `Request from ${req.name} declined.`);
  }, [requests, showToast]);

  const markNotificationsRead = useCallback(() => setNotifications(n => n.map(x => ({ ...x, read: true }))), []);

  const value = useMemo<Store>(() => {
    const unassigned = wave.filter(e => !e.vehicle).length;
    return {
      orders, wave, vehicles, risks, deferred, requests, notifications, planStatus, selectedPlanOrder, blockedResolved, toast,
      pendingAccessCount: requests.filter(r => r.status === "Pending").length, allocatedCount: orders.length - deferred.length - unassigned,
      showToast, markNotificationsRead, selectPlanOrder, assignOrder, vehicleLoad, checkAssignment, setPlanStatus, notifyRisk, resolveRisk, resolveBlocked, replanDeferred, keepDeferred, decideRequest,
    };
  }, [orders, wave, vehicles, risks, deferred, requests, notifications, planStatus, selectedPlanOrder, blockedResolved, toast, showToast, markNotificationsRead, selectPlanOrder, assignOrder, vehicleLoad, checkAssignment, notifyRisk, resolveRisk, resolveBlocked, replanDeferred, keepDeferred, decideRequest]);

  return <DispatcherContext.Provider value={value}>{children}</DispatcherContext.Provider>;
}
