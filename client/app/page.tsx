"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, ROLE_DASHBOARDS, type UserRole } from "@/lib/auth-context";
import Link from "next/link";

/* ── Icon Components ── */
function HeartPulseIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19.5 12.572l-7.5 7.428l-7.5-7.428A5 5 0 1 1 12 6.006a5 5 0 1 1 7.5 6.572" />
      <path d="M12 6v15" opacity="0.3" />
      <polyline points="7 13 9.5 10 12 14 14.5 10 17 13" />
    </svg>
  );
}

function StethoscopeIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 12a4 4 0 0 1-4-4V4h4" />
      <path d="M18 12a4 4 0 0 0 4-4V4h-4" />
      <path d="M6 12v2a6 6 0 0 0 12 0v-2" />
      <circle cx="12" cy="20" r="2" />
      <path d="M12 18v-4" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M5.5 21a7.5 7.5 0 0 1 13 0" />
    </svg>
  );
}

function ActivityIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" />
    </svg>
  );
}

function TargetIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
  );
}

/* ── Feature Bullet ── */
function FeatureBullet({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <div
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          backgroundColor: "var(--color-primary-soft)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--color-primary)",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <span style={{ fontSize: "14px", color: "var(--color-text-secondary)" }}>{text}</span>
    </div>
  );
}

/* ── Role Card ── */
function RoleCard({
  href,
  icon,
  title,
  description,
  delay,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: string;
}) {
  return (
    <Link
      href={href}
      id={`login-${title.toLowerCase().replace(/\s+/g, "-")}`}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
        padding: "32px 24px",
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-card)",
        textDecoration: "none",
        color: "inherit",
        transition: "all 0.2s ease",
        animation: `slideUp 0.4s ease-out ${delay} both`,
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.boxShadow = "var(--shadow-card-hover)";
        el.style.borderColor = "var(--color-primary)";
        el.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.boxShadow = "var(--shadow-card)";
        el.style.borderColor = "var(--color-border)";
        el.style.transform = "translateY(0)";
      }}
    >
      <div
        style={{
          width: "72px",
          height: "72px",
          borderRadius: "50%",
          backgroundColor: "var(--color-primary-soft)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--color-primary)",
          transition: "background-color 0.2s ease",
        }}
      >
        {icon}
      </div>
      <div style={{ textAlign: "center" }}>
        <h3
          style={{
            fontSize: "18px",
            fontWeight: 600,
            color: "var(--color-text-primary)",
            margin: "0 0 6px 0",
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontSize: "14px",
            color: "var(--color-text-muted)",
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          {description}
        </p>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          color: "var(--color-primary)",
          fontSize: "14px",
          fontWeight: 500,
          marginTop: "4px",
        }}
      >
        Sign in
        <ArrowRightIcon />
      </div>
    </Link>
  );
}

/* ── Homepage ── */
export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // If user is already logged in, redirect to their dashboard
  useEffect(() => {
    if (!loading && user) {
      if (user.mustChangePassword) {
        router.replace("/change-password");
      } else {
        router.replace(ROLE_DASHBOARDS[user.role as UserRole]);
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          backgroundColor: "var(--color-page-bg)",
        }}
      >
        <div className="spinner" style={{ width: "32px", height: "32px" }} />
      </div>
    );
  }

  if (user) return null; // Redirect will happen

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--color-page-bg)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Header ── */}
      <header
        style={{
          padding: "20px 32px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <div style={{ color: "var(--color-primary)" }}>
          <HeartPulseIcon />
        </div>
        <span
          style={{
            fontSize: "18px",
            fontWeight: 700,
            color: "var(--color-text-primary)",
            letterSpacing: "-0.01em",
          }}
        >
          MediRehab
          <span style={{ color: "var(--color-primary)", fontWeight: 700 }}> AI</span>
        </span>
      </header>

      {/* ── Main Content ── */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px 80px",
        }}
      >
        {/* Hero Text */}
        <div
          className="animate-fade-in"
          style={{
            textAlign: "center",
            maxWidth: "600px",
            marginBottom: "48px",
          }}
        >
          <h1
            style={{
              fontSize: "clamp(28px, 5vw, 42px)",
              fontWeight: 700,
              lineHeight: 1.15,
              color: "var(--color-text-primary)",
              margin: "0 0 16px 0",
              letterSpacing: "-0.02em",
            }}
          >
            Smarter Rehab,
            <br />
            <span style={{ color: "var(--color-primary)" }}>Faster Recovery</span>
          </h1>
          <p
            style={{
              fontSize: "16px",
              lineHeight: 1.6,
              color: "var(--color-text-secondary)",
              margin: "0 0 32px 0",
              maxWidth: "480px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Connect with your healthcare provider and track rehabilitation
            exercises with AI-powered motion analysis.
          </p>

          {/* Feature Bullets */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              alignItems: "flex-start",
              maxWidth: "320px",
              margin: "0 auto",
            }}
          >
            <FeatureBullet icon={<ActivityIcon />} text="AI-powered exercise tracking" />
            <FeatureBullet icon={<ChartIcon />} text="Real-time progress analytics" />
            <FeatureBullet icon={<TargetIcon />} text="Personalized recovery plans" />
          </div>
        </div>

        {/* Role Selection Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "20px",
            maxWidth: "540px",
            width: "100%",
          }}
        >
          <RoleCard
            href="/login/doctor"
            icon={<StethoscopeIcon />}
            title="Doctor"
            description="Manage patients and assign rehabilitation exercises"
            delay="0.1s"
          />
          <RoleCard
            href="/login/patient"
            icon={<UserIcon />}
            title="Patient"
            description="View assigned exercises and track your recovery"
            delay="0.2s"
          />
        </div>
      </main>

      {/* ── Footer ── */}
      <footer
        style={{
          textAlign: "center",
          padding: "20px 24px",
          fontSize: "12px",
          color: "var(--color-text-muted)",
        }}
      >
        © {new Date().getFullYear()} MediRehab AI. All rights reserved.
      </footer>
    </div>
  );
}
