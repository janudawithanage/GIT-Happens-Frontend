import Link from "next/link";
import type { ReactNode } from "react";

/** Shared dashboard chrome; role screens supply their own navigation and actions. */
export function WorkspaceHeader({ role, href, logo, navigation, search, actions, status, accent = "orange", className = "" }: {
  role: string;
  href: string;
  logo: ReactNode;
  navigation: ReactNode;
  search: ReactNode;
  actions: ReactNode;
  status?: ReactNode;
  accent?: "orange" | "blue";
  className?: string;
}) {
  return <header className={`workspace-header ${className}`} data-accent={accent}>
    <div className="workspace-header-primary">
      <Link href={href} className="workspace-brand" aria-label={`Waypoint Flow · ${role}`}>
        <span className="workspace-logo">{logo}</span>
        <span className="workspace-wordmark"><strong>Waypoint Flow</strong><span>{role}</span></span>
      </Link>
      <span className="workspace-header-divider" aria-hidden />
      <div className="workspace-navigation">{navigation}</div>
      {status && <div className="workspace-header-status">{status}</div>}
    </div>
    <div className="workspace-header-tools">
      <div className="workspace-header-search">{search}</div>
      {actions}
    </div>
  </header>;
}
