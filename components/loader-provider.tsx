"use client";

import { createContext, useContext, useEffect, useReducer, useRef, type ReactNode } from 'react';
import { initialLoaderState, type LoaderState, type Shortfall } from '@/lib/loader-demo';

type Action = { type: 'report'; shortfall: Shortfall } | { type: 'approve' | 'acknowledge' | 'release' | 'reopen' | 'reset' } | { type: 'restore'; state: LoaderState };
function reducer(state: LoaderState, action: Action): LoaderState {
  switch (action.type) {
    case 'report': return { ...state, shortfall: action.shortfall, approved: false, released: false };
    case 'approve': return { ...state, approved: true };
    case 'acknowledge': return { ...state, acknowledged: true };
    case 'release': return { ...state, released: true };
    case 'reopen': return { ...state, released: false };
    case 'reset': return initialLoaderState;
    case 'restore': return action.state;
  }
}
const LoaderContext = createContext<{ state: LoaderState; dispatch: React.Dispatch<Action> } | null>(null);
export function LoaderProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialLoaderState);
  const restored = useRef(false);
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('waypoint-loader-demo-v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.approved === 'boolean' && typeof parsed.acknowledged === 'boolean' && typeof parsed.released === 'boolean' && (parsed.shortfall === null || (typeof parsed.shortfall?.found === 'number' && typeof parsed.shortfall?.kind === 'string' && typeof parsed.shortfall?.note === 'string'))) dispatch({ type: 'restore', state: parsed });
      }
    } catch { /* Storage is optional in the demo. */ }
    restored.current = true;
  }, []);
  useEffect(() => {
    if (restored.current) { try { sessionStorage.setItem('waypoint-loader-demo-v1', JSON.stringify(state)); } catch { /* Storage is optional. */ } }
  }, [state]);
  return <LoaderContext value={{ state, dispatch }}>{children}</LoaderContext>;
}
export function useLoader() {
  const context = useContext(LoaderContext);
  if (!context) throw new Error('LoaderProvider is required');
  return context;
}
