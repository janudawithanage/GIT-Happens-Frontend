import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { DriverProvider } from '@/components/driver-provider';
import { DriverShell } from '@/components/driver-ui';
import './driver.css';
export const metadata: Metadata = { title: { template: '%s | Waypoint Flow Driver', default: 'Today’s route | Waypoint Flow Driver' }, description: 'Driver delivery workspace · simulated operations' };
export default function DriverLayout({ children }: { children: ReactNode }) { return <DriverProvider><DriverShell>{children}</DriverShell></DriverProvider>; }