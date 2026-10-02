import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DriverScreen } from '@/components/driver-screens';
import { driverTitles, driverViews } from '@/lib/driver-demo';
export function generateStaticParams() { return driverViews.map(view => ({ view })); }
export async function generateMetadata({ params }: { params: Promise<{ view: string }> }): Promise<Metadata> { const { view } = await params; return { title: driverTitles[view as keyof typeof driverTitles] ?? 'Driver' }; }
export default async function DriverPage({ params }: { params: Promise<{ view: string }> }) { const { view } = await params; const match = driverViews.find(v => v === view); if (!match) notFound(); return <DriverScreen view={match} />; }
