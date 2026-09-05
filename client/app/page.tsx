"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useAuth, ROLE_DASHBOARDS, type UserRole } from "@/lib/auth-context";

function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.12 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return <div ref={ref} className={`reveal ${visible ? "reveal-visible" : ""} ${className}`} style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}>{children}</div>;
}

function HeartPulseIcon({ size = 20 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20.8 8.8a5 5 0 0 0-8.8-2.9a5 5 0 1 0-8.8 2.9L12 19l8.8-10.2Z" /><path d="M4 12h4l1.5-3 2.5 6 1.5-3H20" /></svg>;
}

function ArrowIcon() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
}

function Logo() {
  return <Link href="/" className="inline-flex items-center gap-2.5 no-underline"><span className="grid size-9 place-items-center rounded-xl bg-[var(--color-primary)] text-white shadow-sm"><HeartPulseIcon /></span><span className="text-[17px] font-bold tracking-tight text-[var(--color-text-primary)]">MediRehab<span className="text-[var(--color-primary)]"> AI</span></span></Link>;
}

export default function HomePage() {
  const { user, loading } = useAuth();
  if (loading) return <div className="grid min-h-screen place-items-center bg-[var(--color-page-bg)]"><div className="spinner size-8" /></div>;

  const dashboardHref = user?.mustChangePassword ? "/change-password" : user ? ROLE_DASHBOARDS[user.role as UserRole] : null;
  const doctorHref = dashboardHref ?? "/login/doctor";

  return <div className="min-h-screen overflow-hidden bg-[var(--color-page-bg)] text-[var(--color-text-primary)]">
    <header className="sticky top-0 z-20 border-b border-[var(--color-border)] bg-[color:rgba(244,250,248,0.9)] backdrop-blur-md"><div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6"><Logo /><nav className="hidden items-center gap-8 text-sm text-[var(--color-text-muted)] md:flex"></nav><Link href={user ? dashboardHref ?? "/" : "/get-started"} className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary-dark)] px-4 py-2 text-sm font-semibold text-white no-underline transition-colors hover:bg-[var(--color-primary)]">{user ? "Dashboard" : "Get started"} <ArrowIcon /></Link></div></header>

    <main>
      <section className="border-b border-[var(--color-border)]"><div className="mx-auto max-w-3xl px-6 pb-24 pt-24 text-center md:pb-32 md:pt-32"><Reveal className="hero-reveal"><div><h1 className="text-balance text-5xl font-bold leading-[1.04] tracking-[-0.065em] md:text-7xl">A clearer path from care plan to recovery.</h1><p className="mx-auto mt-7 max-w-xl text-lg leading-8 text-[var(--color-text-secondary)]">MediRehab AI connects clinical guidance, patient sessions, and motion feedback in one calm workflow.</p><Link href={user ? doctorHref : "/get-started"} className="mt-9 inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-6 py-3 font-semibold text-white no-underline shadow-[0_12px_24px_rgba(15,118,110,0.2)] transition-all hover:-translate-y-0.5 hover:bg-[var(--color-primary-dark)]">{user ? "Open dashboard" : "Get started"} <ArrowIcon /></Link></div></Reveal></div></section>

      <section id="about" className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-[0.8fr_1.2fr] md:gap-24 md:py-28"><Reveal><div><h2 className="max-w-md text-4xl font-bold leading-tight tracking-[-0.05em] md:text-5xl">About the project</h2></div></Reveal><Reveal delay={100}><div className="max-w-2xl space-y-5 text-lg leading-8 text-[var(--color-text-secondary)]"><p>Recovery does not happen in one appointment. It happens between visits, in small sessions, with feedback that helps the next decision become more precise.</p><p>MediRehab keeps that thread visible for both sides of care: clinicians shape the plan, patients complete the work, and motion data gives the team something useful to review.</p></div></Reveal></section>

      <section className="border-y border-[var(--color-border)] bg-white/60"><div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-[0.7fr_1.3fr] md:gap-24 md:py-28"><Reveal className="md:sticky md:top-24 md:self-start"><div><h2 className="max-w-md text-4xl font-bold leading-tight tracking-[-0.05em] md:text-5xl">The Mission</h2></div></Reveal><Reveal delay={100}><div className="grid gap-5"><div className="rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-card)] md:p-8"><h3 className="text-2xl font-bold tracking-tight">Assign</h3><p className="mt-3 text-base leading-7 text-[var(--color-text-muted)]">Create a focused care plan with exercises, dosage, and goals tailored to the patient.</p></div><div className="rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-card)] md:p-8"><h3 className="text-2xl font-bold tracking-tight">Complete</h3><p className="mt-3 text-base leading-7 text-[var(--color-text-muted)]">Guide each session with clear instructions while capturing movement and patient feedback.</p></div><div className="rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-card)] md:p-8"><h3 className="text-2xl font-bold tracking-tight">Review</h3><p className="mt-3 text-base leading-7 text-[var(--color-text-muted)]">Bring progress signals together so clinicians can make the next visit more useful.</p></div></div></Reveal></div></section>

      {/* <section id="platform" className="mx-auto max-w-6xl px-6 py-20 md:py-28"><Reveal><div className="mb-12 max-w-xl"><Eyebrow>Platform surfaces</Eyebrow><h2 className="text-4xl font-bold leading-tight tracking-[-0.05em] md:text-5xl">One system, shaped for two sides of care.</h2></div></Reveal><div className="grid gap-6 md:grid-cols-2"><Reveal><ProductPanel kind="doctor" /></Reveal><Reveal delay={120}><ProductPanel kind="patient" /></Reveal></div><Reveal delay={160}><ComputerVisionPanel /></Reveal></section> */}

      {/* <section id="workflow" className="border-y border-[var(--color-border)] bg-white/60"><div className="mx-auto max-w-6xl px-6 py-20 md:py-28"><Reveal><div className="mb-14 flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><Eyebrow>How recovery flows</Eyebrow><h2 className="text-4xl font-bold tracking-[-0.05em] md:text-5xl">Measured, then made human.</h2></div><div className="text-sm text-[var(--color-text-muted)]">A continuous loop of care</div></div></Reveal><div className="grid gap-8 md:grid-cols-3">{[["01", "Assess", "Establish the baseline"], ["02", "Guide", "Support the daily session"], ["03", "Recover", "Build visible momentum"]].map(([number, title, label], index) => <Reveal key={number} delay={index * 100} className="workflow-step"><div><div className={`text-6xl font-bold tracking-[-0.08em] ${index === 2 ? "text-[var(--color-primary)]" : "text-[var(--color-primary-light)]"}`}>{number}</div><h3 className="mt-5 text-xl font-bold tracking-tight">{title}</h3><div className="mt-2 text-sm text-[var(--color-text-muted)]">{label}</div></div></Reveal>)}</div></div></section> */}

      {/* <section className="mx-auto max-w-6xl px-6 py-20 md:py-28"><Reveal><div className="grid gap-12 md:grid-cols-[0.8fr_1.2fr] md:items-end md:gap-24"><div><Eyebrow>Workspace access</Eyebrow><h2 className="text-4xl font-bold leading-tight tracking-[-0.05em] md:text-5xl">The right view for every role.</h2></div><div className="grid gap-4 sm:grid-cols-2"><Link href={doctorHref} className="group rounded-2xl border border-[var(--color-border)] bg-white p-5 no-underline shadow-[var(--shadow-card)] transition-all hover:-translate-y-1 hover:border-[var(--color-primary)] hover:shadow-[var(--shadow-card-hover)]"><StethoscopeIcon /><h3 className="mt-6 text-xl font-bold">Doctor</h3><div className="mt-2 text-sm text-[var(--color-text-muted)]">Patients, programs, progress</div><div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-primary-dark)]">{user ? "Open dashboard" : "Sign in"} <span className="transition-transform group-hover:translate-x-1"><ArrowIcon /></span></div></Link><Link href={patientHref} className="group rounded-2xl border border-[var(--color-border)] bg-white p-5 no-underline shadow-[var(--shadow-card)] transition-all hover:-translate-y-1 hover:border-[var(--color-primary)] hover:shadow-[var(--shadow-card-hover)]"><PatientIcon /><h3 className="mt-6 text-xl font-bold">Patient</h3><div className="mt-2 text-sm text-[var(--color-text-muted)]">Exercises, sessions, progress</div><div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-primary-dark)]">{user ? "Open dashboard" : "Sign in"} <span className="transition-transform group-hover:translate-x-1"><ArrowIcon /></span></div></Link></div></div></Reveal></section> */}

      {/* <section className="mx-auto max-w-6xl px-6 pb-20"><Reveal><div className="rounded-[2rem] bg-[var(--color-primary-dark)] px-7 py-12 text-white md:px-12 md:py-16"><Eyebrow>Start with the next step</Eyebrow><div className="flex flex-col justify-between gap-8 md:flex-row md:items-end"><h2 className="max-w-2xl text-4xl font-bold leading-tight tracking-[-0.05em] md:text-5xl">Bring the whole recovery loop into focus.</h2><Link href={doctorHref} className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-[var(--color-primary-dark)] no-underline transition-transform hover:-translate-y-0.5">{user ? "Open dashboard" : "Get started"} <ArrowIcon /></Link></div></div></Reveal></section> */}
    </main>

    <footer className="border-t border-[var(--color-border)] bg-white/50"><div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 md:grid-cols-[1.5fr_1fr_1fr_1fr]"><div><Logo /><div className="mt-5 flex items-center gap-2 text-sm text-[var(--color-text-muted)]"><span className="size-2 rounded-full bg-[var(--color-success)]" />Connected care workspace</div></div><div className="grid content-start gap-3 text-sm"><span className="font-semibold">Platform</span><a href="#about" className="text-[var(--color-text-muted)] no-underline hover:text-[var(--color-primary-dark)]">About</a><a href="#platform" className="text-[var(--color-text-muted)] no-underline hover:text-[var(--color-primary-dark)]">Surfaces</a><a href="#workflow" className="text-[var(--color-text-muted)] no-underline hover:text-[var(--color-primary-dark)]">Workflow</a></div><div className="grid content-start gap-3 text-sm"><span className="font-semibold">Workspaces</span><Link href="/login/doctor" className="text-[var(--color-text-muted)] no-underline hover:text-[var(--color-primary-dark)]">Doctor sign in</Link><Link href="/login/patient" className="text-[var(--color-text-muted)] no-underline hover:text-[var(--color-primary-dark)]">Patient sign in</Link></div><div className="grid content-start gap-3 text-sm"><span className="font-semibold">Access</span><a href="#access" className="text-[var(--color-text-muted)] no-underline hover:text-[var(--color-primary-dark)]">Choose a workspace</a><Link href={dashboardHref ?? "/"} className="text-[var(--color-text-muted)] no-underline hover:text-[var(--color-primary-dark)]">Dashboard</Link></div></div><div className="border-t border-[var(--color-border)]"><div className="mx-auto flex max-w-6xl flex-col justify-between gap-2 px-6 py-5 text-xs text-[var(--color-text-muted)] sm:flex-row"><span>© {new Date().getFullYear()} MediRehab AI</span><span>Role-based access for rehabilitation care</span></div></div></footer>
  </div>;
}
