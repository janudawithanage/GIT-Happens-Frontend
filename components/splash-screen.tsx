import Image from "next/image";

export function SplashScreen({ progress = 8, leaving = false }: { progress?: number; leaving?: boolean }) {
  return <section className={`splash-screen${leaving ? " splash-screen-leaving" : ""}`} aria-label="Loading Waypoint Flow" aria-busy="true">
    <div aria-hidden="true" className="splash-glows">
      <Image src="/figma/splash/glow-blue.svg" width={420} height={420} alt="" className="splash-glow-blue" unoptimized />
      <Image src="/figma/splash/glow-orange.svg" width={380} height={380} alt="" className="splash-glow-orange" unoptimized />
    </div>
    <div className="splash-brand">
      <div className="splash-logo"><Image src="/figma/splash/logo.png" alt="" width={64} height={64} preload unoptimized /></div>
      <div className="splash-role"><Image src="/figma/splash/role-dot.svg" alt="" width={7} height={7} unoptimized />LOADERS &amp; DRIVERS</div>
      <div className="splash-wordmark"><h1>WAYPOINT <span>FLOW</span></h1><p>INTELLIGENT DELIVERY OPERATIONS</p></div>
    </div>
    <div className="splash-loading">
      <div className="splash-track" role="progressbar" aria-label="Preparing sign-in" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><div className="splash-progress" style={{ width: `${progress}%` }} /></div>
      <div className="splash-loading-caption"><span><Image src="/figma/splash/status-dot.svg" alt="" width={6} height={6} unoptimized />SYNCING TODAY&apos;S WORK</span><strong aria-hidden="true">{progress}%</strong></div>
      <p role="status" className="sr-only">Preparing your sign-in screen.</p>
    </div>
  </section>;
}
