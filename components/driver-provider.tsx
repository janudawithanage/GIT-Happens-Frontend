"use client";
import { createContext, useContext, useEffect, useReducer, type ReactNode, type Dispatch } from 'react';
import { initialDriverState, validDriverState, type DriverState, type DeliveryRecord, type DriverIssue } from '@/lib/driver-demo';

type Action = { type: 'restore'; state: DriverState } | { type: 'deliver'; record: DeliveryRecord } | { type: 'issue'; issue: DriverIssue } | { type: 'offline' | 'reconnect' | 'acknowledge' | 'reset' };
type Store = { data: DriverState; loaded: boolean; storageError: boolean };
function reducer(store: Store, action: Action | { type: 'storage-error'; failed: boolean }): Store {
  const s = store.data;
  switch (action.type) {
    case 'restore': return { ...store, data: action.state, loaded: true };
    case 'deliver': return { ...store, data: { ...s, offline: !action.record.synced, deliveries: [...s.deliveries.filter(r => r.stop !== action.record.stop), action.record], issue: action.record.stop === 2 ? null : s.issue } };
    case 'issue': return { ...store, data: { ...s, issue: action.issue, deliveries: s.deliveries.filter(r => r.stop !== 2) } };
    case 'offline': return { ...store, data: { ...s, offline: true, reconnected: false, acknowledged: false } };
    case 'reconnect': return { ...store, data: { ...s, offline: false, reconnected: true, deliveries: s.deliveries.map(r => ({ ...r, synced: true })) } };
    case 'acknowledge': return { ...store, data: { ...s, offline: false, reconnected: true, acknowledged: true } };
    case 'reset': return { ...store, data: initialDriverState };
    case 'storage-error': return { ...store, storageError: action.failed };
  }
}
const DriverContext = createContext<{ state: DriverState; dispatch: Dispatch<Action>; storageError: boolean; loaded: boolean } | null>(null);
export function DriverProvider({ children }: { children: ReactNode }) {
  const [store, dispatch] = useReducer(reducer, { data: initialDriverState, loaded: false, storageError: false });
  useEffect(() => {
    try {
      const saved = localStorage.getItem('waypoint-driver-demo-v1');
      const parsed: unknown = saved ? JSON.parse(saved) : null;
      dispatch({ type: 'restore', state: validDriverState(parsed) ? parsed : initialDriverState });
    } catch { dispatch({ type: 'restore', state: initialDriverState }); dispatch({ type: 'storage-error', failed: true }); }
  }, []);
  useEffect(() => {
    if (!store.loaded) return;
    try { localStorage.setItem('waypoint-driver-demo-v1', JSON.stringify(store.data)); dispatch({ type: 'storage-error', failed: false }); }
    catch { dispatch({ type: 'storage-error', failed: true }); }
  }, [store.data, store.loaded]);
  return <DriverContext value={{ state: store.data, dispatch, storageError: store.storageError, loaded: store.loaded }}>{children}</DriverContext>;
}
export function useDriver() {
  const context = useContext(DriverContext);
  if (!context) throw new Error('DriverProvider is required');
  return context;
}
