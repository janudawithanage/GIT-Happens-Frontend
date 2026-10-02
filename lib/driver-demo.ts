export const driverTitles = {
  'stop-details': 'Stop details', 'proof-of-delivery': 'Proof of delivery',
  'delivery-completed': 'Delivery completed', 'next-stop-offline': 'Next stop',
  'proof-of-delivery-offline': 'Offline proof of delivery', 'saved-locally': 'Saved locally',
  sync: 'Sync', 'route-change': 'Route update', 'updated-route': 'Updated route',
  'report-issue': 'Report issue', 'failed-stop-route': 'Delivery issue recorded',
} as const;
export const driverViews = Object.keys(driverTitles) as (keyof typeof driverTitles)[];
export type DriverView = 'route' | keyof typeof driverTitles;
export const driverStops = [
  { number: 1, place: 'Kirulapone', outlet: 'OUT009', order: 'ORD-2598', units: 48, crates: 3, eta: '04:40', window: '04:30 – 05:00', distance: '1.1' },
  { number: 2, place: 'Nugegoda', outlet: 'OUT017', order: 'ORD-2614', units: 64, crates: 4, eta: '05:15', window: '05:00 – 06:00', distance: '2.4' },
  { number: 3, place: 'Maharagama', outlet: 'OUT022', order: 'ORD-2631', units: 50, crates: 3, eta: '06:05', window: '06:00 – 07:00', distance: '4.1' },
  { number: 4, place: 'Kottawa', outlet: 'OUT031', order: 'ORD-2650', units: 56, crates: 4, eta: '06:50', window: '06:30 – 07:30', distance: '6.8' },
] as const;
export type DeliveryDraft = { units: number; name: string; role: string; note: string; mode: 'signature' | 'photo'; signature: string; photo: string };
export type DeliveryRecord = DeliveryDraft & { stop: number; time: string; synced: boolean };
export type DriverIssue = { note: string; photo: string; time: string };
export type DriverState = { deliveries: DeliveryRecord[]; issue: DriverIssue | null; offline: boolean; reconnected: boolean; acknowledged: boolean };
export const initialDriverState: DriverState = { deliveries: [], issue: null, offline: false, reconnected: false, acknowledged: false };
export function defaultDraft(stop: number): DeliveryDraft {
  return { units: driverStops[stop - 1].units, name: 'Kasun Perera', role: 'Store Manager', note: 'Delivered in full.', mode: 'signature', signature: 'demo', photo: '' };
}
export function validDriverState(value: unknown): value is DriverState {
  if (!value || typeof value !== 'object') return false;
  const s = value as DriverState;
  return typeof s.offline === 'boolean' && typeof s.reconnected === 'boolean' && typeof s.acknowledged === 'boolean' && Array.isArray(s.deliveries) && s.deliveries.length <= 4 && s.deliveries.every(r => [2, 3].includes(r.stop) && Number.isInteger(r.units) && r.units >= 0 && r.units <= 999 && ['name', 'role', 'note', 'signature', 'photo', 'time'].every(k => typeof r[k as keyof DeliveryRecord] === 'string') && ['signature', 'photo'].includes(r.mode) && typeof r.synced === 'boolean') && (s.issue === null || (typeof s.issue.note === 'string' && typeof s.issue.photo === 'string' && typeof s.issue.time === 'string'));
}
