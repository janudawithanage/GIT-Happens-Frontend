"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { PrimaryButton, SiteFooter, SiteHeader, StatCard } from "../../components/waypoint-ui";

const roles = ["Dispatcher", "Store Manager", "Loader", "Driver"] as const;
type Role = typeof roles[number];
const demoAccounts: Record<Role, { email: string; password: string }> = {
  Dispatcher: { email: "dispatcher@waypointgroup.com", password: "Waypoint2026!" },
  "Store Manager": { email: "manager@waypointgroup.com", password: "Waypoint2026!" },
  Loader: { email: "loader@waypointgroup.com", password: "Waypoint2026!" },
  Driver: { email: "driver@waypointgroup.com", password: "Waypoint2026!" },
};

export function SignInScreen() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("Dispatcher");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const demoAccount = demoAccounts[role];

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    if (email.trim().toLowerCase() !== demoAccount.email || password !== demoAccount.password) {
      setMessage(`Those demo credentials do not match. Use the ${role} account shown above.`);
      return;
    }
    if (role !== "Store Manager") {
      setMessage(`${role} demo credentials verified. The ${role} workspace is coming soon.`);
      return;
    }
    setMessage("");
    router.push("/store-manager/dashboard");
  }

  function fillDemoAccount() {
    setEmail(demoAccount.email);
    setPassword(demoAccount.password);
    setMessage("");
  }

  return <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#172133] text-[#0f172a]">
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden"><div className="warehouse-backdrop absolute inset-[-4%]" /><div className="absolute inset-0 bg-gradient-to-b from-[#091224]/35 via-[#091224]/20 to-[#091224]/50 backdrop-blur-[7px]" /><div className="absolute -left-28 -top-24 h-[720px] w-[720px] rounded-full bg-sky-400/15 blur-[95px]" /><div className="absolute -right-24 top-[329px] h-[620px] w-[620px] rounded-full bg-orange-500/10 blur-[90px]" /><div className="absolute bottom-0 left-1/4 h-[500px] w-[500px] rounded-full bg-blue-200/15 blur-[85px]" /></div>
    <SiteHeader />
    <main className="relative z-10 mx-auto flex w-full max-w-[1248px] flex-1 items-center justify-center px-5 py-10 sm:px-12 lg:px-12"><div className="grid w-full max-w-[1152px] translate-y-[6px] items-center gap-10 lg:grid-cols-[minmax(0,552px)_minmax(0,552px)] lg:gap-12">
      <section className="min-w-0 lg:pr-2" aria-label="Platform overview"><div className="inline-flex items-center gap-[10px] rounded-full border border-white/80 bg-white/65 px-[17px] py-[7px] text-[12px] font-bold text-[#0c4a6e] shadow-sm backdrop-blur-xl"><span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(52,211,153,.25)]" />Waypoint Group • v2.6</div><h1 className="mt-4 text-[clamp(38px,3.75vw,48px)] font-bold leading-none tracking-[-1.2px] text-white">Streamlining every<br className="hidden sm:block" /> parcel from node to<br className="hidden sm:block" /> <span className="bg-gradient-to-r from-[#f97316] via-[#f59e0b] to-[#ea580c] bg-clip-text text-transparent">doorstep.</span></h1><p className="mt-4 max-w-[552px] text-[16px] font-medium leading-[26px] text-white/70">Unified mission command for automated distribution hubs, predictive dispatch schedules, and high-frequency real-time fulfillment pipelines.</p><div className="glass-card relative mt-6 h-[288px] overflow-hidden rounded-[24px] border border-white/90"><Image src="/figma/warehouse.png" alt="Modern automated warehouse and delivery operations" fill sizes="(max-width: 1024px) 100vw, 544px" className="object-cover" priority /><div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-900/15 to-transparent" /><StatCard /></div></section>
      <section className="flex min-w-0 justify-center" aria-label="Sign in"><div className="glass-card flex min-h-[562px] w-full max-w-[448px] flex-col rounded-[32px] border border-white/90 bg-white/85 p-6 backdrop-blur-[20px] sm:p-[36px]"><div className="flex items-center gap-[14px]"><span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/95 bg-white/60 shadow-sm backdrop-blur-xl"><Image src="/figma/logo.png" alt="" width={40} height={40} /></span><div><h2 className="text-[24px] font-bold leading-8 tracking-[-.6px]">Welcome back</h2><p className="text-[12px] font-medium leading-4 text-[#1e293b]">Sign in to your operations workspace</p></div></div>
      <div className="mt-5 rounded-2xl border border-white/80 bg-white/85 px-[11px] pb-[11px] pt-[15px] shadow-[0_8px_20px_-6px_rgba(15,23,42,.05)] backdrop-blur-xl"><p className="mb-[6px] text-[10px] font-bold tracking-[.5px] text-[#334155]">SELECT ACTIVE ROLE</p><div className="grid grid-cols-2 gap-[6px]">{roles.map(option => <button key={option} type="button" onClick={() => { if (role !== option) { setRole(option); setEmail(""); setPassword(""); setShowPassword(false); } setMessage(""); }} aria-pressed={role === option} className={`cursor-pointer rounded-xl border border-[#c4d6e5] px-[11px] py-[5px] text-[11px] font-bold leading-[16.5px] text-[#334155] transition-colors ${role === option ? "bg-[#e3f5ff]" : "bg-white hover:bg-sky-50"}`}>{option}</button>)}</div></div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-orange-200/70 bg-orange-50/80 px-3 py-2 text-[11px] leading-4"><div aria-live="polite" className="min-w-0"><p className="font-bold text-[#9a3412]">{role} demo credentials</p><p className="break-words text-[#475569]">{demoAccount.email} · {demoAccount.password}</p></div><button type="button" onClick={fillDemoAccount} className="cursor-pointer rounded-full bg-white px-3 py-1 font-bold text-[#9a3412] shadow-sm hover:bg-orange-100">Use demo account</button></div>
      <form className="mt-4 space-y-3" onSubmit={submit}><div><label htmlFor="email" className="mb-[6px] block text-[12px] font-bold leading-4 text-[#334155]">Work Email</label><div className="relative"><Image src="/figma/mail.svg" alt="" width={16} height={16} className="absolute left-[14px] top-1/2 -translate-y-1/2" /><input id="email" name="email" type="email" required autoComplete="username" value={email} onChange={event => setEmail(event.target.value)} placeholder="name@waypointgroup.com" className="h-[42px] w-full rounded-2xl border border-white/90 bg-white/90 pl-10 pr-4 text-[14px] text-slate-900 shadow-[0_2px_6px_-1px_rgba(15,23,42,.04)] outline-none placeholder:text-[#64748b] focus:ring-2 focus:ring-sky-400" /></div></div><div><label htmlFor="password" className="mb-[6px] block text-[12px] font-bold leading-4 text-[#334155]">Password</label><div className="relative"><Image src="/figma/lock.svg" alt="" width={16} height={16} className="absolute left-[14px] top-1/2 -translate-y-1/2" /><input id="password" name="password" type={showPassword ? "text" : "password"} required minLength={8} autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} placeholder="••••••••••••" className="h-[42px] w-full rounded-2xl border border-white/90 bg-white/90 pl-10 pr-11 text-[14px] text-slate-900 shadow-[0_2px_6px_-1px_rgba(15,23,42,.04)] outline-none placeholder:text-[#64748b] focus:ring-2 focus:ring-sky-400" /><button type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-[14px] top-1/2 -translate-y-1/2 cursor-pointer"><Image src="/figma/eye.svg" alt="" width={16} height={16} /></button></div></div><div className="flex items-center justify-between gap-2 pt-1"><label className="flex cursor-pointer items-center gap-2 text-[12px] font-medium text-[#1e293b]"><input name="remember" type="checkbox" className="h-4 w-4 accent-sky-600" />Remember me</label><button type="button" onClick={() => setMessage(`Demo recovery: use the ${role} credentials shown above.`)} className="cursor-pointer text-[12px] font-bold text-[#0369a1] hover:underline">Forgot password?</button></div><div className="pt-2"><PrimaryButton type="submit"><span className="relative z-10">Sign In to Terminal</span><Image src="/figma/arrow.svg" alt="" width={16} height={16} className="relative z-10" /></PrimaryButton></div></form>
      {message && <p role="alert" className="mt-3 rounded-xl bg-sky-50 px-3 py-2 text-[11px] leading-4 text-sky-900">{message}</p>}
      <div className="mt-auto flex items-center justify-center gap-2 border-t border-slate-200/80 pt-4 text-center text-[11px] font-medium leading-[16px] text-[#334155]"><Image src="/figma/shield.svg" alt="" width={14} height={14} /><span>Secure access to Waypoint operations • 256-bit TLS Encrypted</span></div></div></section>
    </div></main>
    <SiteFooter />
  </div>;
}
