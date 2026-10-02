export const loaderViews = ['load-plan', 'report-shortfall', 'plan-changes', 'departure-review', 'history', 'trip-status', 'partial-load-approved', 'plan-acknowledged'] as const;
export type LoaderView = 'loads' | typeof loaderViews[number];
export const loaderTitles: Record<LoaderView, string> = {
  loads: 'Loads', 'load-plan': 'Load plan', 'report-shortfall': 'Report shortfall',
  'plan-changes': 'Plan changed', 'departure-review': 'Departure review', history: 'History',
  'trip-status': 'Trip status', 'partial-load-approved': 'Partial load approved', 'plan-acknowledged': 'Plan v3 acknowledged',
};
export const queue = [
  { vehicle: 'VEH008', type: 'Dry-box Truck', route: 'Fresh ambient → Colombo · 5 stops', time: '03:35', status: 'Plan changed', icon: '01e01.svg', href: '/loader/plan-changes' },
  { vehicle: 'VEH027', type: 'Reefer Truck', route: 'Fresh → Gampaha · 4 stops', time: '03:30', status: 'Ready', icon: '9318b.svg' },
  { vehicle: 'VEH019', type: 'Reefer Van', route: 'Fresh → Colombo (van-only) · 3 stops', time: '03:45', status: 'Queued', icon: 'b35e8.svg' },
  { vehicle: 'VEH044', type: 'Dry-box Truck', route: 'Style → Colombo mall bays · 3 stops', time: '08:30', status: 'Later', icon: 'b35e8.svg' },
];
export const stops = [
  { stop: 4, outlet: 'OUT058', name: 'Ja-Ela', detail: '18 chilled + 6 ambient cases' },
  { stop: 3, outlet: 'OUT052', name: 'Kiribathgoda', detail: '22 chilled + 10 ambient cases' },
  { stop: 2, outlet: 'OUT047', name: 'Kadawatha', detail: 'Meat 4/6 · 2 short to report' },
  { stop: 1, outlet: 'OUT041', name: 'Gampaha Town', detail: '16 chilled + 8 ambient cases' },
];
export const revisedOrder = [
  { title: 'Load 1 · Stop 5 · OUT027 Dehiwala', detail: 'Already loaded — keep', status: 'Keep' },
  { title: 'Load 2 · Stop 4 · OUT023 Maradana', detail: 'New — 9 cases from Staging S4', status: 'Add' },
  { title: 'Load 3 · Stop 3 · OUT021 Wellawatte', detail: 'Was load 2 — move behind Maradana', status: 'Move' },
  { title: 'Load 4 · Stop 2 · OUT016 Kollupitiya', detail: 'Not loaded yet', status: 'Next' },
  { title: 'Load 5 · Stop 1 · OUT012 Fort', detail: 'Not loaded yet', status: 'Next' },
];
export type Shortfall = { kind: string; found: number; note: string };
export type LoaderState = { shortfall: Shortfall | null; approved: boolean; acknowledged: boolean; released: boolean };
export const initialLoaderState: LoaderState = { shortfall: null, approved: false, acknowledged: false, released: false };
