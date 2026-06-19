"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth, ROLE_DASHBOARDS, type UserRole } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";
import Link from "next/link";

/* ── Icons ── */
function HeartPulseIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19.5 12.572l-7.5 7.428l-7.5-7.428A5 5 0 1 1 12 6.006a5 5 0 1 1 7.5 6.572" />
      <polyline points="7 13 9.5 10 12 14 14.5 10 17 13" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

/* ── Role config ── */
const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Administrator",
  DOCTOR: "Doctor",
  PATIENT: "Patient",
};

const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  ADMIN: "Access the administration dashboard",
  DOCTOR: "Manage patients and assign rehabilitation exercises",
  PATIENT: "View your assigned exercises and track recovery",
};

interface LoginFormProps {
  expectedRole: UserRole;
}

export default function LoginForm({ expectedRole }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, loading, login, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading || !user) return;

    if (user.mustChangePassword) {
      router.replace("/change-password");
      return;
    }

    router.replace(ROLE_DASHBOARDS[user.role as UserRole]);
  }, [user, loading, router]);

  if (loading || user) {
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const { mustChangePassword, user } = await login(email, password);

      // Role mismatch check
      if (user.role !== expectedRole) {
        await logout();
        setError(
          `This login page is for ${ROLE_LABELS[expectedRole].toLowerCase()} accounts. Your account has the ${ROLE_LABELS[user.role as UserRole].toLowerCase()} role.`
        );
        setIsSubmitting(false);
        return;
      }

      // Must change password redirect
      if (mustChangePassword) {
        router.push("/change-password");
        return;
      }

      // Route to dashboard
      router.push(ROLE_DASHBOARDS[user.role as UserRole]);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
      setIsSubmitting(false);
    }
  };

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
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            textDecoration: "none",
            color: "inherit",
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
        </Link>
      </header>

      {/* ── Main ── */}
      <main
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "1fr",
          alignItems: "center",
          justifyItems: "center",
          padding: "40px 24px 80px",
          gap: "48px",
        }}
      >
        {/* Split layout on wider screens */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "48px",
            maxWidth: "960px",
            width: "100%",
            alignItems: "center",
          }}
          className="login-grid"
        >
          {/* ── Left Side — Hero Copy ── */}
          <div
            className="animate-fade-in login-hero"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "24px",
            }}
          >
            <h1
              style={{
                fontSize: "clamp(26px, 4vw, 36px)",
                fontWeight: 700,
                lineHeight: 1.15,
                color: "var(--color-text-primary)",
                margin: 0,
                letterSpacing: "-0.02em",
              }}
            >
              Smarter Rehab,
              <br />
              <span style={{ color: "var(--color-primary)" }}>Faster Recovery</span>
            </h1>
            <p
              style={{
                fontSize: "15px",
                lineHeight: 1.6,
                color: "var(--color-text-secondary)",
                margin: 0,
                maxWidth: "380px",
              }}
            >
              Connect with your healthcare provider and track rehabilitation
              exercises with AI-powered motion analysis.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {[
                { text: "AI-powered exercise tracking" },
                { text: "Real-time progress analytics" },
                { text: "Personalized recovery plans" },
              ].map((item) => (
                <div key={item.text} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      backgroundColor: "var(--color-primary-soft)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--color-primary)",
                      flexShrink: 0,
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <span style={{ fontSize: "14px", color: "var(--color-text-secondary)" }}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right Side — Login Card ── */}
          <div
            className="animate-slide-up"
            style={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-xl)",
              boxShadow: "var(--shadow-elevated)",
              padding: "40px 36px",
              width: "100%",
              maxWidth: "420px",
              justifySelf: "center",
            }}
          >
            {/* Card Header */}
            <div style={{ marginBottom: "28px" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  height: "28px",
                  padding: "0 12px",
                  fontSize: "12px",
                  fontWeight: 600,
                  borderRadius: "9999px",
                  backgroundColor: "var(--color-primary-light)",
                  color: "var(--color-primary-dark)",
                  marginBottom: "16px",
                  letterSpacing: "0.02em",
                  textTransform: "uppercase",
                }}
              >
                {ROLE_LABELS[expectedRole]}
              </div>
              <h2
                style={{
                  fontSize: "22px",
                  fontWeight: 600,
                  color: "var(--color-text-primary)",
                  margin: "0 0 6px 0",
                }}
              >
                Sign in to MediRehab AI
              </h2>
              <p
                style={{
                  fontSize: "14px",
                  color: "var(--color-text-muted)",
                  margin: 0,
                }}
              >
                {ROLE_DESCRIPTIONS[expectedRole]}
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div
                role="alert"
                className="animate-fade-in"
                style={{
                  padding: "12px 16px",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "#FEE2E2",
                  border: "1px solid #FECACA",
                  color: "#991B1B",
                  fontSize: "14px",
                  lineHeight: 1.5,
                  marginBottom: "20px",
                }}
              >
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              {/* Email Field */}
              <div>
                <label
                  htmlFor="login-email"
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "var(--color-text-primary)",
                    marginBottom: "6px",
                  }}
                >
                  Email address
                </label>
                <div style={{ position: "relative" }}>
                  <div
                    style={{
                      position: "absolute",
                      left: "14px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--color-text-muted)",
                      display: "flex",
                      pointerEvents: "none",
                    }}
                  >
                    <MailIcon />
                  </div>
                  <input
                    id="login-email"
                    type="email"
                    className={`input ${error ? "" : ""}`}
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    autoFocus
                    style={{ paddingLeft: "42px" }}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="login-password"
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "var(--color-text-primary)",
                    marginBottom: "6px",
                  }}
                >
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <div
                    style={{
                      position: "absolute",
                      left: "14px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--color-text-muted)",
                      display: "flex",
                      pointerEvents: "none",
                    }}
                  >
                    <LockIcon />
                  </div>
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    className="input"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    style={{ paddingLeft: "42px", paddingRight: "44px" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    style={{
                      position: "absolute",
                      right: "4px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: "36px",
                      height: "36px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--color-text-muted)",
                      background: "none",
                      border: "none",
                      borderRadius: "var(--radius-sm)",
                      cursor: "pointer",
                      transition: "color 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "var(--color-text-secondary)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "var(--color-text-muted)";
                    }}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                id="login-submit"
                className="btn btn-primary btn-lg btn-full"
                disabled={isSubmitting}
                style={{ marginTop: "6px", position: "relative" }}
              >
                {isSubmitting ? (
                  <>
                    <div className="spinner spinner-white" style={{ width: "18px", height: "18px" }} />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>

            {/* Back to homepage */}
            {expectedRole !== "ADMIN" && (
              <div style={{ textAlign: "center", marginTop: "20px" }}>
                <Link
                  href="/"
                  style={{
                    fontSize: "14px",
                    color: "var(--color-text-muted)",
                    textDecoration: "none",
                    transition: "color 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "var(--color-primary)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "var(--color-text-muted)";
                  }}
                >
                  ← Back to homepage
                </Link>
              </div>
            )}
          </div>
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

      {/* Responsive styles are in globals.css (.login-grid, .login-hero) */}
    </div>
  );
}
