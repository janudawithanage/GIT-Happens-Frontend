import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { LoaderProvider } from '@/components/loader-provider';
import { LoaderShell } from '@/components/loader-ui';
import './loader.css';

export const metadata: Metadata = { title: { template: '%s | Waypoint Flow Loader', default: 'Loads | Waypoint Flow Loader' }, description: 'Peliyagoda dock loading workspace · simulated operations' };
export default function LoaderLayout({ children }: { children: ReactNode }) {
  return <LoaderProvider><LoaderShell>{children}</LoaderShell></LoaderProvider>;
}
