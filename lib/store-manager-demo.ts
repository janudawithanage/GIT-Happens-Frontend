"use client";

import { useSyncExternalStore } from "react";

export type CargoItem = { id: string; name: string; sku: string; category: string; quantity: number; unit: string; weight: number; icon: string };
export type DemoState = { items: CargoItem[]; date: string; slot: number; bay: number; handling: string; note: string; confirmed: boolean; counts: Record<string, number>; receiptComplete: boolean; escalation: string; photo: string };
const initialState: DemoState = {
  items: [
    { id: "knitwear", name: "AW24 Merino Knitwear Assortment", sku: "AL-KNT-4402", category: "Ready-to-Wear", quantity: 40, unit: "Totes", weight: 80, icon: "8336c.svg" },
    { id: "blazers", name: "Structured Tailored Blazers", sku: "AL-BLZ-9101", category: "Formal Apparel", quantity: 24, unit: "Wardrobes", weight: 72, icon: "e4802.svg" },
    { id: "scarves", name: "Silk Accessorized Scarves", sku: "AL-ACC-1188", category: "Accessories", quantity: 15, unit: "Crates", weight: 18, icon: "f0733.svg" },
    { id: "footwear", name: "Footwear Run (Core Styles)", sku: "FT-1182", category: "Footwear", quantity: 10, unit: "Crates", weight: 25, icon: "f0733.svg" },
  ],
  date: "2026-09-26", slot: 0, bay: 1, handling: "Hanging", note: "Unload hanging garments first. Count footwear crates before signing.", confirmed: false,
  counts: { knitwear: 40, blazers: 24, scarves: 14, footwear: 10 }, receiptComplete: false, escalation: "", photo: "",
};
let state = initialState;
let loaded = false;
const listeners = new Set<() => void>();
const storageKey = "waypoint-store-manager-demo-v1";
function getSnapshot() {
  if (!loaded) {
    loaded = true;
    try { const saved = localStorage.getItem(storageKey); if (saved) state = { ...initialState, ...JSON.parse(saved) }; } catch { /* Use sample data if browser storage is unavailable. */ }
  }
  return state;
}
function subscribe(callback: () => void) { listeners.add(callback); return () => { listeners.delete(callback); }; }
export function updateDemo(patch: Partial<DemoState>) {
  state = { ...getSnapshot(), ...patch };
  try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch { /* The current tab still works without storage. */ }
  listeners.forEach(listener => listener());
}
export function useStoreDemo() { return useSyncExternalStore(subscribe, getSnapshot, () => initialState); }
export function resetStoreDemo() { state = initialState; try { localStorage.removeItem(storageKey); } catch {} listeners.forEach(listener => listener()); }
