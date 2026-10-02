"use client";

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode, type ButtonHTMLAttributes } from 'react';
import dimensions from '@/public/figma/loader/dimensions.json';
import { DashboardButton, DashboardFooter, DashboardIcon, GlassPanel } from './dashboard-ui';
import { markSignOutNavigation } from '@/lib/sign-in-navigation';
import { useLoader } from './loader-provider';
import { WorkspaceHeader } from './workspace-header';

export function LoaderAsset({ file }: { file: string }) {
  const [width, height] = (dimensions as Record<string, number[]>)[file];
  return <Image src={`/figma/loader/${file}`} alt="" width={width} height={height} style={{ width, height }} className="shrink-0" />;
}
export function LoaderPanel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <GlassPanel className={`loader-glass ${className}`}>{children}</GlassPanel>;
}
export function LoaderButton({ children, icon, secondary = false, danger = false, className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { icon?: string; secondary?: boolean; danger?: boolean }) {
  return <DashboardButton {...props} tone={secondary || danger ? 'light' : 'orange'} className={`loader-button ${secondary ? 'loader-button-secondary' : danger ? 'loader-button-danger' : 'loader-button-primary'} ${className}`}>{icon && <LoaderAsset file={icon} />}{children}</DashboardButton>;
}
export function LoaderBadge({ children, tone = 'gray', icon }: { children: ReactNode; tone?: 'gray' | 'green' | 'orange' | 'amber' | 'blue' | 'red'; icon?: string }) {
  return <span className={`loader-badge loader-badge-${tone}`}>{icon && <LoaderAsset file={icon} />}{children}</span>;
}
export function LoaderTile({ file, tone = '' }: { file: string; tone?: string }) {
  return <span className={`loader-tile ${tone ? `loader-tile-${tone}` : ''}`}><LoaderAsset file={file} /></span>;
}
export function LoaderHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return <div className="loader-heading"><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div>;
}
export function LoaderSectionLabel({ children, side }: { children: ReactNode; side?: ReactNode }) {
  return <div className="loader-section-label"><h2>{children}</h2>{side && <span>{side}</span>}</div>;
}
export function LoaderStats({ cards }: { cards: { value: string; label: string; tone?: string }[] }) {
  return <div className="loader-stats">{cards.map(card => <LoaderPanel key={card.label}><strong style={{ color: card.tone }}>{card.value}</strong><p>{card.label}</p></LoaderPanel>)}</div>;
}
export function LoaderRow({ icon, tone, title, detail, side, children }: { icon?: string; tone?: string; title: string; detail?: string; side?: ReactNode; children?: ReactNode }) {
  return <div className="loader-row">{icon && <LoaderTile file={icon} tone={tone} />}<div className="min-w-0 flex-1"><h3>{title}</h3>{detail && <p>{detail}</p>}{children}</div>{side}</div>;
}
export function LoaderDialog({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { ref.current?.showModal(); }, []);
  return <dialog ref={ref} onCancel={onClose} onClick={e => { if (e.target === e.currentTarget) onClose(); }} className="loader-dialog"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-widest text-orange-600">Simulated workspace</p><h2 className="mt-1 text-xl font-bold">{title}</h2></div><button type="button" aria-label="Close dialog" onClick={onClose} className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-slate-100"><LoaderAsset file="a4828.svg" /></button></div><div className="mt-5 space-y-4 text-sm leading-6 text-slate-600">{children}</div></dialog>;
}

const nav = [{ label: 'Loads', href: '/loader', activeIcon: '8da70.svg', icon: '9c21d.svg' }, { label: 'Flags', href: '/loader/report-shortfall', activeIcon: '079aa.svg', icon: 'c2ddc.svg' }, { label: 'History', href: '/loader/history', activeIcon: 'caa4b.svg', icon: '5ce9e.svg' }];
export function LoaderNavigation({ active, sidebar = false }: { active: string; sidebar?: boolean }) {
  return <nav aria-label={sidebar ? 'Loader sidebar' : 'Loader navigation'} className={sidebar ? 'loader-sidebar-nav' : 'loader-tabs'}><div className="loader-tab-capsule">{nav.map(item => <Link key={item.label} href={item.href} aria-current={active === item.label ? 'page' : undefined}><LoaderAsset file={active === item.label ? item.activeIcon : active === 'Status' && item.label === 'Loads' ? '600b4.svg' : item.icon} /><span>{item.label}</span></Link>)}</div><Link href="/loader/trip-status" aria-current={active === 'Status' ? 'page' : undefined} className="loader-status-tab"><LoaderAsset file={active === 'Status' ? '02349.svg' : 'a6f54.svg'} /><span>Status</span></Link></nav>;
}
export function LoaderSidebar({ active }: { active: string }) {
  return <aside className="loader-sidebar"><LoaderPanel><p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Dock workspace</p><LoaderNavigation active={active} sidebar /><div className="mt-6 border-t border-slate-300/50 pt-4"><p className="text-sm font-semibold">Peliyagoda DC</p><p className="mt-1 text-xs text-slate-500">Dock 3 · Bay 3</p><LoaderBadge tone="green">● Cold chain nominal</LoaderBadge></div><p className="mt-6 text-[11px] leading-5 text-slate-500">R. Perera · Morning shift<br />02:00 – 10:00</p></LoaderPanel></aside>;
}
export function LoaderFooter() {
  return <div className="loader-footer"><DashboardFooter syncLabel="Dock Sync: 100% Up · Demo" locationLabel="Peliyagoda DC · Dock 3" /></div>;
}
export function LoaderHeader({ active, overview, shortfall, changes, detail, search, onSearchChange, onSearchSubmit, onDialog }: {
  active: string; overview: boolean; shortfall: boolean; changes: boolean; detail: string;
  search: string; onSearchChange: (value: string) => void; onSearchSubmit: (event: React.FormEvent<HTMLFormElement>) => void; onDialog: (title: string) => void;
}) {
  const router = useRouter();
  const back = () => router.push(shortfall ? '/loader/load-plan' : '/loader');
  const title = shortfall ? 'Report shortfall' : changes ? 'VEH008 · Bay 5' : 'VEH012 · Bay 3';
  return <>
    <header className="loader-header workspace-mobile-header"><div className="loader-header-capsule">
      <div className="flex min-w-0 items-center gap-2.5">{overview ? <span className="loader-logo"><LoaderAsset file="3ea19.svg" /></span> : <button type="button" aria-label={shortfall ? 'Close shortfall report' : 'Back to loads'} onClick={back} className="loader-header-action"><LoaderAsset file={shortfall ? 'a4828.svg' : '848da.svg'} /></button>}<div className="loader-header-wordmark"><strong>{overview ? 'Waypoint Flow' : title}</strong><span>{overview ? 'DOCK LOADER' : detail}</span></div></div>
      <div className={`flex shrink-0 items-center gap-2 ${shortfall ? 'loader-report-sync' : ''}`}><LoaderBadge tone="green" icon="6f43b.svg">Synced</LoaderBadge><button type="button" aria-label={overview ? 'Profile: R. Perera' : 'Trip options'} onClick={() => onDialog(overview ? 'R. Perera · Dock Loader' : 'Trip options')} className={overview ? 'loader-avatar' : 'loader-header-action'}>{overview ? 'RP' : <LoaderAsset file="8514a.svg" />}</button></div>
    </div></header>
    <div className="workspace-desktop-chrome">
      <WorkspaceHeader className="workspace-header-compact" role="Dock Loader" href="/loader" logo={<LoaderAsset file="3ea19.svg" />} status={<LoaderBadge tone="green" icon="6f43b.svg">Synced</LoaderBadge>}
        navigation={<nav aria-label="Desktop loader navigation">{[...nav, {label:'Status',href:'/loader/trip-status'}].map(item => <Link key={item.label} href={item.href} aria-current={active === item.label ? 'page' : undefined}>{item.label}</Link>)}</nav>}
        search={<form onSubmit={onSearchSubmit} className="workspace-search-field"><DashboardIcon name="search" /><input aria-label="Search loader vehicles and stops" value={search} onChange={e => onSearchChange(e.target.value)} placeholder="Search vehicles, stops..." /><button type="submit">Go</button></form>}
        actions={<><button type="button" aria-label="Loader notifications" onClick={() => onDialog('Notifications')} className="workspace-icon-button"><DashboardIcon name="bell" /></button><button type="button" aria-label="Profile: R. Perera" onClick={() => onDialog('R. Perera · Dock Loader')} className="workspace-avatar">RP</button></>}
      />
      {!overview && <div className="workspace-page-context"><button type="button" aria-label={shortfall ? 'Close shortfall report' : 'Back to loads'} onClick={back} className="workspace-icon-button"><LoaderAsset file={shortfall ? 'a4828.svg' : '848da.svg'} /></button><div><h2>{title}</h2><p>{detail}</p></div><button type="button" aria-label="Trip options" onClick={() => onDialog('Trip options')} className="workspace-icon-button"><LoaderAsset file="8514a.svg" /></button></div>}
    </div>
  </>;
}

export function LoaderShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { state, dispatch } = useLoader();
  const [dialog, setDialog] = useState('');
  const [search, setSearch] = useState('');
  const overview = ['/loader', '/loader/history', '/loader/plan-acknowledged'].includes(pathname);
  const shortfall = pathname.endsWith('report-shortfall');
  const changes = pathname.endsWith('plan-changes');
  const departure = pathname.endsWith('departure-review');
  const status = pathname.endsWith('trip-status') || pathname.endsWith('partial-load-approved') || departure;
  const active = shortfall ? 'Flags' : pathname.endsWith('history') ? 'History' : status ? 'Status' : 'Loads';
  const time = pathname.endsWith('history') ? '04:05' : shortfall ? '03:14' : departure ? '03:29' : pathname.endsWith('partial-load-approved') ? '03:27' : pathname.endsWith('trip-status') ? '03:16' : pathname.endsWith('plan-acknowledged') ? '03:15' : '03:13';
  const detail = shortfall ? 'VEH012 · STOP 2' : changes ? 'PLAN CHANGED' : departure ? 'READY TO DEPART' : status ? 'TRIP STATUS' : 'LOAD PLAN';
  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const value = search.toLowerCase().trim();
    if (!value) return;
    if (/008|borella|maradana|wellawatte/.test(value)) router.push('/loader/plan-changes');
    else if (/012|047|kadawatha|gampaha|058|052|041/.test(value)) router.push('/loader/load-plan');
    else setDialog('Search results');
  }
  return <main className="loader-stage workspace-stage"><div className="loader-shell dashboard-shell workspace-shell"><div aria-hidden className="loader-backdrop" /><div className="loader-workspace workspace-body"><div aria-hidden className="loader-system-bar"><span>{time}</span><div className="flex items-center gap-1.5"><span className="flex items-end gap-[2px]">{[4,6,8,11].map(height => <i key={height} style={{ height }} className="w-[3px] rounded-[1px] bg-white" />)}</span><LoaderAsset file="82919.svg" /><span className="loader-battery"><i /></span></div></div>
    <LoaderHeader active={active} overview={overview} shortfall={shortfall} changes={changes} detail={detail} search={search} onSearchChange={setSearch} onSearchSubmit={submitSearch} onDialog={setDialog} />
    <div className="loader-layout"><LoaderSidebar active={active} /><div className="loader-content">{children}</div></div><LoaderNavigation active={active} /><div aria-hidden className="loader-home-indicator"><i /></div>
    <div className="loader-demo-label">Simulated workspace · sample data</div></div><LoaderFooter /></div>
    {dialog && <LoaderDialog title={dialog} onClose={() => setDialog('')}>
      {dialog === 'Notifications' ? <ul className="space-y-3"><li>VEH008: plan v3 requires acknowledgement.</li><li>VEH012: Stop 2 has a 2-case shortfall.</li><li>Reefer temperature: 3 °C, within target.</li></ul> : dialog === 'Search results' ? <p>No load found for “{search}”. Search VEH012, VEH008, Kadawatha, or Gampaha.</p> : <><p>R. Perera · Dock Loader<br />loader@waypointgroup.com<br />Peliyagoda DC · Dock 3 · Morning shift</p><p>All actions use sample data in this browser session.</p><LoaderButton secondary onClick={() => { dispatch({type:'reset'}); setDialog(''); router.push('/loader'); }}>Reset demo</LoaderButton><LoaderButton secondary onClick={() => { dispatch({type:'reset'}); markSignOutNavigation(); router.replace('/sign-in'); }}>Sign out</LoaderButton>{state.shortfall && <p>Current flag: {6-state.shortfall.found} cases short · {state.approved ? 'Approved' : 'Pending decision'}</p>}</>}
    </LoaderDialog>}
  </main>;
}
