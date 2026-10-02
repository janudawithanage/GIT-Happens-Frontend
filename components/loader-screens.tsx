"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { DataTable } from './waypoint-ui';
import { useLoader } from './loader-provider';
import { LoaderAsset, LoaderBadge, LoaderButton, LoaderDialog, LoaderHeading, LoaderPanel, LoaderRow, LoaderSectionLabel, LoaderStats, LoaderTile } from './loader-ui';
import { queue, revisedOrder, stops, type LoaderView } from '@/lib/loader-demo';

export function LoaderScreen({ view }: { view: LoaderView }) {
  switch (view) {
    case 'loads': case 'plan-acknowledged': return <LoadingQueue acknowledged={view === 'plan-acknowledged'} />;
    case 'load-plan': return <LoadPlan />;
    case 'report-shortfall': return <ReportShortfall />;
    case 'plan-changes': return <PlanChanges />;
    case 'history': return <LoadingHistory />;
    case 'trip-status': case 'partial-load-approved': case 'departure-review': return <TripReview view={view} />;
  }
}

function LoadingQueue({ acknowledged }: { acknowledged: boolean }) {
  const router = useRouter();
  const { state } = useLoader();
  const accepted = acknowledged || state.acknowledged;
  const pending = acknowledged || Boolean(state.shortfall);
  const approved = state.approved;
  const [selected, setSelected] = useState<typeof queue[number] | null>(null);
  const loaded = approved || state.released ? 4 : 2;
  return <div className="loader-page-grid">
    <LoaderHeading title="Loads" subtitle={`Peliyagoda DC · Dock 3 · Tue 29 Sep, ${acknowledged ? '03:15' : '03:13'}`} />
    <LoaderStats cards={[{value:'5',label:'Assigned'}, {value:state.released?'0':'1',label:'Loading',tone:'#ff7a1a'}, {value:approved?'0':'1',label:'Attention',tone:'#ff3b30'}]} />
    <LoaderPanel className="loader-current-load loader-highlight">
      <div className="flex flex-wrap items-center justify-between gap-2"><LoaderBadge tone="orange" icon="7a11b.svg">Bay 3 · {state.released ? 'Released' : approved ? 'Loading complete' : pending ? 'awaiting dispatch' : 'Loading now'}</LoaderBadge><span className="text-[13px] font-semibold text-[#ff7a1a]">Departs 03:30</span></div>
      <div className="mt-2.5 flex items-center gap-3"><span className="loader-vehicle-tile"><LoaderAsset file="929e2.svg" /></span><div className="min-w-0"><h2 className="text-[20px] font-semibold leading-[25px] tracking-[-.24px]">VEH012 · Reefer Truck</h2><p className="loader-secondary mt-0.5 text-[15px] leading-5">Fresh → Gampaha · Trip 1 · 4 stops</p></div></div>
      <div className="mt-2.5"><div className="flex justify-between gap-2 text-[13px] leading-[18px]"><strong className="font-semibold">{loaded} of 4 stops loaded</strong><span className="loader-secondary">Chilled 2–4 °C</span></div><div role="progressbar" aria-label="Stops loaded" aria-valuemin={0} aria-valuemax={4} aria-valuenow={loaded} className="loader-progress mt-1.5"><i style={{width:`${loaded/4*100}%`}} /></div></div>
      <div className="loader-shortfall-strip mt-2.5"><LoaderAsset file="48601.svg" /><span>{approved ? 'Stop 2 · partial approved · Trip 2 top-up' : pending ? 'Stop 2 · shortfall sent · dispatch reviewing' : 'Stop 2 · meat 4/6 · 2 short to report'}</span></div>
      <LoaderButton className="mt-2.5" icon="7e9e8.svg" onClick={() => router.push(state.released ? '/loader/history' : approved ? '/loader/departure-review' : pending ? '/loader/trip-status' : '/loader/load-plan')}>{state.released ? 'View released load' : approved ? 'Review departure checks' : pending ? 'Check Trip Status' : 'Continue Loading'}</LoaderButton>
    </LoaderPanel>
    <div className="loader-queue-group"><LoaderSectionLabel side={accepted ? 'Plan v3 current · 03:15' : 'Plan v3 · 03:12'}>Dock queue</LoaderSectionLabel><LoaderPanel className="loader-grouped">{queue.map(item => {
      const isChanged = item.vehicle === 'VEH008';
      return <button type="button" key={item.vehicle} className="loader-row-button" onClick={() => item.href ? router.push(accepted ? '/loader/plan-changes' : item.href) : setSelected(item)}><LoaderRow icon={item.icon} tone={isChanged ? 'amber' : undefined} title={`${item.vehicle} · ${item.type}`} detail={item.route} side={<><div className="loader-queue-status"><strong>{item.time}</strong><LoaderBadge tone={isChanged ? 'amber' : item.status==='Ready'?'green':'gray'}>{isChanged && accepted ? 'v3 accepted' : item.status}</LoaderBadge></div>{isChanged && <LoaderAsset file="1520b.svg" />}</>} /></button>;
    })}</LoaderPanel></div>
    <Link href="/loader/history" className="loader-history-entry"><LoaderTile file="8001a.svg" tone="green" /><div className="min-w-0 flex-1"><strong>Shift history</strong><p className="loader-secondary">Released loads, flags sent and plan changes</p></div><span className="font-semibold text-[#ff7a1a]">History</span><LoaderAsset file="31ff8.svg" /></Link>
    {selected && <LoaderDialog title={`${selected.vehicle} · ${selected.type}`} onClose={() => setSelected(null)}><p>{selected.route}<br />Departure: {selected.time} · {selected.status}</p><p>{selected.status === 'Ready' ? 'Loaded by N. Silva. All checks completed; this vehicle is ready for its assigned driver.' : 'This load is assigned to another bay and is waiting for its scheduled loading window.'}</p><LoaderButton secondary onClick={() => setSelected(null)}>Back to queue</LoaderButton></LoaderDialog>}
  </div>;
}

function LoadPlan() {
  const router = useRouter();
  const { state } = useLoader();
  return <div className="loader-page-grid loader-plan-page">
    <LoaderHeading title="VEH012" subtitle="Waypoint Fresh → Gampaha · Trip 1" />
    <div className="loader-plan-summary"><LoaderPanel className="loader-inner"><div className="flex flex-wrap gap-2"><LoaderBadge tone="blue" icon="ced28.svg">Reefer truck</LoaderBadge><LoaderBadge tone="blue" icon="831e3.svg">Chilled 2–4 °C</LoaderBadge></div><p className="mt-1.5 text-[12px] font-semibold text-slate-700">Departs 03:30 · Plan v3 current</p></LoaderPanel><LoaderPanel className="loader-inner mt-3.5"><div className="flex items-start gap-2.5 text-[13px] leading-[18px] text-[#007aff]"><LoaderAsset file="8d6aa.svg" /><p>Reverse load: Stop 4 first at the front wall; Stop 1 last by the door.</p></div></LoaderPanel></div>
    <div className="loader-plan-stops"><LoaderPanel className="loader-inner loader-order-heading"><h2>Load order</h2><LoaderBadge tone="green" icon="c481c.svg">{state.approved ? '4' : '2'} of 4 loaded</LoaderBadge></LoaderPanel>
      <ol className="mt-3.5 space-y-3.5">{stops.map((stop,index) => {
        const attention = index === 2 && !state.approved;
        const complete = index < 2 || state.approved;
        return <li key={stop.outlet}><LoaderPanel className={`${attention ? 'loader-highlight' : ''} ${index === 3 && !complete ? 'loader-clear' : ''} loader-stop`}><div className="flex items-center gap-3"><span className={`loader-load-number ${attention ? 'loader-number-orange' : complete ? 'loader-number-green' : ''}`}><small>LOAD</small><strong>{index+1}</strong></span><div className="min-w-0 flex-1"><h3 className="text-[15px] font-semibold leading-5">Stop {stop.stop} · {stop.outlet} {stop.name}</h3><p className="loader-secondary mt-px text-[13px] leading-[18px]">{index===2 && state.approved ? `Meat ${state.shortfall?.found ?? 4}/6 · partial approved` : stop.detail}</p></div><LoaderBadge tone={attention?'orange':complete?'green':'gray'}>{attention?'Attention':complete?'Loaded':'Waiting'}</LoaderBadge></div>
          {index===2 && <><div className="loader-line-items mt-2.5 border-t border-slate-400/20 pt-2.5">{[{label:'Chilled · dairy',count:'12 / 12',done:true},{label:'Chilled · meat',count:`${state.shortfall?.found ?? 4} / 6`,done:state.approved},{label:'Ambient · dry goods',count:'9 / 9',done:true}].map(line => <div key={line.label}><span className={`loader-line-check ${line.done ? 'loader-line-done' : ''}`}>{line.done && <LoaderAsset file="a13bb.svg" />}</span><span className="flex-1">{line.label}</span><strong className={line.done ? '' : 'text-[#ff7a1a]'}>{line.count}</strong></div>)}</div><div className="mt-2.5 flex gap-2.5"><LoaderButton danger icon="9adb9.svg" disabled={Boolean(state.shortfall)} onClick={() => router.push('/loader/report-shortfall')}>{state.shortfall ? 'Shortfall sent' : 'Report 2 short'}</LoaderButton><LoaderButton secondary icon="77e0e.svg" disabled={!state.approved} onClick={() => router.push('/loader/partial-load-approved')}>Loaded</LoaderButton></div>{state.shortfall && !state.approved && <button type="button" className="mt-3 cursor-pointer text-[13px] font-semibold text-[#007aff]" onClick={() => router.push('/loader/trip-status')}>Check dispatch decision →</button>}</>}
        </LoaderPanel></li>;
      })}</ol>
    </div>
  </div>;
}

function ReportShortfall() {
  const router = useRouter();
  const { state, dispatch } = useLoader();
  const [kind, setKind] = useState(state.shortfall?.kind ?? 'Short quantity');
  const [found, setFound] = useState(state.shortfall?.found ?? 4);
  const [note, setNote] = useState(state.shortfall?.note ?? '2 cases of chicken not staged at chiller bay C2. Checked C3 too.');
  function send(e: React.FormEvent) {
    e.preventDefault();
    dispatch({type:'report',shortfall:{kind,found,note:note.trim()}});
    router.push('/loader/trip-status');
  }
  return <form onSubmit={send} className="loader-page-grid loader-shortfall-page">
    <LoaderHeading title="Report a shortfall" subtitle={`Report ${6-found} missing cases before VEH012 leaves. Departure waits for dispatch’s decision.`} />
    <LoaderPanel className="loader-shortfall-stop"><LoaderRow icon="27cfb.svg" title="Stop 2 · OUT047 Kadawatha" detail="Meat · 6 cases planned" side={<LoaderBadge tone="blue" icon="831e3.svg">Chilled</LoaderBadge>} /></LoaderPanel>
    <div className="loader-shortfall-fields"><LoaderSectionLabel>What&apos;s wrong</LoaderSectionLabel><LoaderPanel className="loader-grouped"><div role="radiogroup" aria-label="Shortfall type">{[{label:'Missing item',detail:'Line not staged at all',icon:'083b7.svg'}, {label:'Damaged',detail:'Crushed, leaking or torn',icon:'1672a.svg'}, {label:'Short quantity',detail:'Fewer cases than planned',icon:'8f465.svg'}].map(item => <button key={item.label} type="button" role="radio" aria-checked={kind===item.label} className="loader-row-button" onClick={() => { setKind(item.label); if(item.label==='Missing item')setFound(0); }}><LoaderRow icon={item.icon} tone={kind===item.label?'orange':undefined} title={item.label} detail={item.detail} side={kind===item.label && <LoaderAsset file="4dad8.svg" />} /></button>)}</div></LoaderPanel>
      <LoaderSectionLabel>Quantity</LoaderSectionLabel><LoaderPanel className="loader-inner"><div className="flex items-center justify-between gap-3"><div><p className="text-[17px] font-semibold leading-[22px]" aria-live="polite">{found} cases found</p><p className="loader-secondary text-[13px] leading-[18px]">of 6 planned</p></div><div className="loader-stepper"><button type="button" aria-label="Decrease cases found" disabled={found===0} onClick={() => setFound(v => Math.max(0,v-1))}><LoaderAsset file="38cb8.svg" /></button><span /><button type="button" aria-label="Increase cases found" disabled={found===6} onClick={() => setFound(v => Math.min(6,v+1))}><LoaderAsset file="b73cc.svg" /></button></div></div><div className="mt-2.5"><LoaderBadge tone="amber" icon="e2448.svg">Short {6-found} cases</LoaderBadge></div></LoaderPanel>
      <LoaderPanel className="loader-inner mt-3.5"><label htmlFor="shortfall-note" className="loader-secondary block text-[12px] leading-4">Note</label><textarea id="shortfall-note" required maxLength={500} value={note} onChange={e => setNote(e.target.value)} className="mt-1 min-h-[44px] w-full resize-y bg-transparent text-[17px] leading-[22px] outline-none" /></LoaderPanel>
    </div>
    <div className="loader-shortfall-recipients"><LoaderSectionLabel>Who sees this</LoaderSectionLabel><LoaderPanel className="loader-grouped"><LoaderRow icon="72e8d.svg" title="Dispatcher · Nimal Perera" detail="Reviews the shortage and decides whether to source the cases, approve a partial load, or re-plan." /><LoaderRow icon="3f68f.svg" title="Driver and store manager" detail="See the revised quantity only after dispatch approves the plan." /></LoaderPanel><LoaderButton type="submit" className="mt-3.5" icon="e1d0a.svg" disabled={found===6}>Send shortfall</LoaderButton></div>
  </form>;
}

function PlanChanges() {
  const router = useRouter();
  const { state, dispatch } = useLoader();
  const [call, setCall] = useState(false);
  return <div className="loader-page-grid loader-changes-page">
    <LoaderHeading title="Plan changed" subtitle="VEH008 · Colombo · plan v2 → v3 at 03:12" />
    <LoaderPanel className="loader-highlight-amber loader-change-alert"><div className="flex items-center gap-3"><LoaderTile file="cfbd7.svg" tone="amber" /><h2 className="text-[17px] font-semibold leading-[22px]">{state.acknowledged ? 'Plan v3 acknowledged' : 'Loading paused · review v3'}</h2></div><p className="loader-secondary mt-2 text-[13px] leading-[18px]">Your printed v2 list is outdated. Review the removals, additions and new order before continuing.</p><div className="mt-2"><LoaderBadge tone={state.acknowledged?'green':'red'} icon={state.acknowledged?'c481c.svg':'c5246.svg'}>{state.acknowledged?'Loading resumed':'Loading paused'}</LoaderBadge></div></LoaderPanel>
    <div className="loader-changes-list"><LoaderSectionLabel side="3 changes">What changed</LoaderSectionLabel><LoaderPanel className="loader-grouped"><LoaderRow icon="80ef3.svg" tone="red" title="Unload OUT019 Borella · 14 cases" detail="Deferred · return 14 to Staging S2" /><LoaderRow icon="509f6.svg" title="Add OUT023 Maradana · 9 cases" detail="From VEH031 · collect at Staging S4" /><LoaderRow icon="cdc71.svg" title="Reorder OUT021 Wellawatte" detail="Now stop 3, so load it 3rd instead of 2nd." /></LoaderPanel></div>
    <div className="loader-new-order"><LoaderSectionLabel>New load order</LoaderSectionLabel><LoaderPanel className="loader-grouped">{revisedOrder.map(item => <LoaderRow key={item.title} title={item.title} detail={item.detail} side={<LoaderBadge tone={item.status==='Keep'||item.status==='Add'?'green':item.status==='Move'?'blue':'gray'} icon={item.status==='Keep'?'c481c.svg':undefined}>{item.status}</LoaderBadge>} />)}</LoaderPanel><LoaderButton className="mt-3.5" icon="db3f1.svg" onClick={() => { dispatch({type:'acknowledge'}); router.push('/loader/plan-acknowledged'); }}>{state.acknowledged?'Back to loads':'Acknowledge v3'}</LoaderButton><LoaderButton secondary icon="29f04.svg" className="mt-2.5 text-[#007aff]" onClick={() => setCall(true)}>Call Dispatch</LoaderButton></div>
    {call && <LoaderDialog title="Call Dispatch" onClose={() => setCall(false)}><p>Nimal Perera · Peliyagoda Dispatch</p><p>Simulated call. In the connected system this action calls your assigned dispatcher.</p><LoaderButton secondary onClick={() => setCall(false)}>End demo call</LoaderButton></LoaderDialog>}
  </div>;
}

function TripReview({ view }: { view: 'trip-status' | 'partial-load-approved' | 'departure-review' }) {
  const router = useRouter();
  const { state, dispatch } = useLoader();
  const [dialog, setDialog] = useState('');
  const pendingShortfall = Boolean(state.shortfall) && !state.approved;
  const departure = view==='departure-review' && !pendingShortfall;
  const approved = state.shortfall ? state.approved : view==='partial-load-approved' || departure || state.approved;
  const found = state.shortfall?.found ?? 4;
  const title = departure ? state.released ? 'Ready for departure' : 'Loading complete' : approved ? 'Partial load approved' : 'Waiting for dispatch';
  function release() {
    if (state.shortfall && !state.approved) { router.push('/loader/trip-status'); return; }
    dispatch({type:'release'});setDialog('Load released');
  }
  return <div className="loader-page-grid loader-trip-page">
    <LoaderPanel className="loader-trip-hero"><span className={`loader-result-icon ${departure?'loader-result-green':''}`}><LoaderAsset file={departure?'1729a.svg':'6411e.svg'} /></span><h1>{title}</h1><p>{departure ? 'VEH012 · Trip 1 → Gampaha · loaded 03:27 · target 03:30' : `VEH012 · Trip 1 · ${approved?'Final checks next':'Departure on hold'}`}</p></LoaderPanel>
    <div className="loader-trip-checks"><LoaderSectionLabel>{departure?'Pre-departure checks':'Trip checks'}</LoaderSectionLabel><LoaderPanel className="loader-grouped">
      <LoaderRow icon="d662a.svg" title={departure?'4 stops prepared in sequence':approved?'4 of 4 stops prepared':'3 of 4 stops prepared'} detail={departure?'Approved partial included at Stop 2':approved?`Stop 2 revised to meat ${found}/6 · Trip 2 top-up`:`Stop 2 has ${found} of 6 meat cases`} side={<LoaderAsset file={departure?'f4adf.svg':'e70c0.svg'} />} />
      <LoaderRow icon="01de9.svg" title="Reefer at 3 °C" detail="Target 2–4 °C for chilled goods" side={<LoaderAsset file="f4adf.svg" />} />
      <LoaderRow icon="c4d4b.svg" title={departure?"Run sheet on driver's phone":approved?'Driver route updated':'Driver route awaits update'} detail={departure?'Downloaded — works without signal':approved?'Revised quantity downloaded for offline use':'Revised quantity follows dispatch approval'} side={<LoaderAsset file={departure?'f4adf.svg':'e70c0.svg'} />} />
    </LoaderPanel></div>
    <div className="loader-trip-shortfall"><LoaderSectionLabel>{approved?'Approved shortfall':'Open shortfall'}</LoaderSectionLabel><LoaderPanel className="loader-highlight-amber"><LoaderRow icon="e70c0.svg" tone="amber" title={departure?'Stop 2 · OUT047 · partial approved':`Stop 2 · OUT047 · ${6-found} cases short`} detail={`Meat ${found}/6 · ${approved?`${6-found} short · top up on Trip 2`:'reported to dispatch'}`} /><LoaderBadge tone={departure?'green':'amber'} icon={departure?'c481c.svg':'8b409.svg'}>{departure?'Dispatch approved · store notified':approved?'Approved · store notified':'Dispatcher decision pending'}</LoaderBadge></LoaderPanel></div>
    <div className="loader-trip-handover"><LoaderSectionLabel>{departure?'Handover':'Next step'}</LoaderSectionLabel><LoaderPanel className="loader-grouped"><LoaderRow icon="72e8d.svg" title={departure?'Kasun Fernando · Driver':'Dispatcher · Nimal Perera'} detail={departure?'Confirmed pickup on his phone':approved?'Approved 03:20 · load finished 03:27':'Checking stock or partial approval'} side={<LoaderBadge tone={departure?'green':'amber'} icon={departure?'c481c.svg':'8b409.svg'}>{departure?'03:28':approved?'Approved':'Pending'}</LoaderBadge>} /></LoaderPanel>
      <LoaderButton className="mt-3.5" icon={departure?'28e79.svg':'1f573.svg'} disabled={departure && state.released} onClick={() => departure ? release() : approved ? router.push('/loader/departure-review') : setDialog('Dispatch decision')}>{departure ? state.released?'Ready for departure':'Mark ready for departure' : approved?'Review departure checks':'Check dispatch decision'}</LoaderButton>
      <LoaderButton secondary className="mt-3.5" onClick={() => { if(departure)dispatch({type:'reopen'});router.push(departure?'/loader/load-plan':approved?'/loader':'/loader/load-plan'); }}>{departure?'Reopen Load':approved?'Back to loads':'Back to load plan'}</LoaderButton>
    </div>
    {dialog && <LoaderDialog title={dialog} onClose={() => setDialog('')}>{dialog==='Load released' ? <><p>VEH012 is ready for departure. R. Perera&apos;s release is recorded in shift history.</p><LoaderButton onClick={() => router.push('/loader/history')}>View loading history</LoaderButton></> : <><p>Nimal Perera approves a partial load of {found} of 6 meat cases. The missing {6-found} cases will be topped up on Trip 2.</p><p>This simulates dispatch approval, the revised route download, and completion of the remaining load checks.</p><LoaderButton onClick={() => { dispatch({type:'approve'});router.push('/loader/partial-load-approved'); }}>Simulate dispatch approval</LoaderButton><LoaderButton secondary onClick={() => setDialog('')}>Keep waiting</LoaderButton></>}</LoaderDialog>}
  </div>;
}

function LoadingHistory() {
  const { state } = useLoader();
  const [record, setRecord] = useState('');
  const found = state.shortfall?.found ?? 4;
  const released = [
    {vehicle:'VEH008 · Dry-box truck',route:'Fresh ambient → Colombo · 5 of 5 stops',loader:'Loaded by N. Silva · reloaded to plan v3',time:'03:52',badge:'Plan v3',tone:'amber' as const,icon:'919e4.svg'},
    {vehicle:'VEH012 · Reefer truck',route:'Fresh → Gampaha · 4 of 4 stops',loader:'Loaded by R. Perera · 1 flag sent',time:'03:31',badge:'1 flag',tone:'red' as const,icon:'30393.svg'},
    {vehicle:'VEH027 · Reefer truck',route:'Fresh → Gampaha · 4 of 4 stops',loader:'Loaded by N. Silva · no issues',time:'03:26',badge:'Clean',tone:'green' as const,icon:'c7674.svg'},
  ];
  return <div className="loader-page-grid loader-history-page"><LoaderHeading title="History" subtitle="Peliyagoda DC · all bays" /><LoaderStats cards={[{value:'3',label:'Released',tone:'#34c759'},{value:'1',label:'Flags raised',tone:'#ff3b30'},{value:'1',label:'Plan change',tone:'#cc8c00'}]} />
    <div className="loader-released-group"><LoaderSectionLabel side="Newest first">Released · Tue 29 Sep</LoaderSectionLabel><LoaderPanel className="loader-grouped">{released.map(item => <button key={item.vehicle} type="button" className="loader-row-button" onClick={() => setRecord(item.vehicle)}><LoaderRow icon="8a8b5.svg" title={item.vehicle} detail={item.route} side={<><div className="loader-queue-status"><strong>{item.time}</strong><LoaderBadge tone={item.tone} icon={item.icon}>{item.badge}</LoaderBadge></div><LoaderAsset file="1520b.svg" /></>}><div className="loader-history-loader"><LoaderAsset file="c771e.svg" /><span>{item.loader}</span></div></LoaderRow></button>)}</LoaderPanel></div>
    <div className="loader-activity-group"><LoaderSectionLabel>Activity · Flags &amp; plan changes</LoaderSectionLabel><LoaderPanel className="loader-grouped"><LoaderRow icon="3f5b7.svg" tone="red" title={`OUT047 Kadawatha · ${6-found} cases short`} detail="VEH012 · Chilled meat · flagged 03:14" side={<LoaderBadge tone="green" icon="c7674.svg">Resolved</LoaderBadge>}><p className="loader-history-resolution">Approved partial: meat {found}/6 · store notified · Trip 2 top-up</p></LoaderRow><LoaderRow icon="01e01.svg" tone="amber" title="OUT019 Borella · 14 cases unloaded" detail="VEH008 · Plan v3 removed this stop · 03:15" side={<LoaderBadge tone="blue" icon="8a6de.svg">Recorded</LoaderBadge>}><p className="loader-history-resolution">Returned to Staging S2 · deferred by Dispatch</p></LoaderRow></LoaderPanel></div>
    <div className="loader-earlier-group"><LoaderSectionLabel>Earlier</LoaderSectionLabel><LoaderPanel className="loader-grouped">{[{date:'Fri 25 Sep',detail:'11 loads released · 1 flag'}, {date:'Thu 24 Sep',detail:'12 loads released · no flags'}].map(item => <button type="button" key={item.date} className="loader-row-button" onClick={() => setRecord(item.date)}><LoaderRow icon="5ffe9.svg" title={item.date} detail={item.detail} side={<LoaderAsset file="1520b.svg" />} /></button>)}</LoaderPanel><div className="loader-history-note"><LoaderAsset file="671cf.svg" /><p>Every record shows who loaded it, because the dock tablet is shared between loaders.</p></div></div>
    {record && <LoaderDialog title={record} onClose={() => setRecord('')}><p>Sample shift record · Peliyagoda DC</p><DataTable columns={[{key:'event',label:'Event'},{key:'loader',label:'Recorded by'}]} rows={record.includes('25')||record.includes('24')?[{event:'Shift loads released',loader:'N. Silva / R. Perera'}]:[{event:'Load checks complete',loader:record.includes('012')?'R. Perera':'N. Silva'},{event:record.includes('008')?'Plan v3 acknowledged':record.includes('012')?'Partial quantity approved':'All quantities verified',loader:'Nimal Perera'}]} /><LoaderButton secondary onClick={() => setRecord('')}>Close record</LoaderButton></LoaderDialog>}
  </div>;
}
