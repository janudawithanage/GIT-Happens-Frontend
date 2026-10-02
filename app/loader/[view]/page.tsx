import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LoaderScreen } from '@/components/loader-screens';
import { loaderTitles, loaderViews } from '@/lib/loader-demo';

export function generateStaticParams() { return loaderViews.map(view => ({ view })); }
export async function generateMetadata({ params }: { params: Promise<{ view: string }> }): Promise<Metadata> {
  const { view } = await params;
  return { title: loaderTitles[view as keyof typeof loaderTitles] ?? 'Loader' };
}
export default async function LoaderPage({ params }: { params: Promise<{ view: string }> }) {
  const { view } = await params;
  const match = loaderViews.find(item => item === view);
  if (!match) notFound();
  return <LoaderScreen view={match} />;
}
