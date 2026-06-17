"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth, ROLE_DASHBOARDS, type UserRole } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import Link from "next/link";

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

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, refreshUser, logout } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      await api.changePassword(currentPassword, newPassword);
      await refreshUser();
      // After password change, redirect to the user's dashboard
      if (user) {
        router.push(ROLE_DASHBOARDS[user.role as UserRole]);
      } else {
        router.push("/");
      }
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
      {/* Header */}
      <header
        style={{
          padding: "20px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
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
        </div>
        <button
          className="btn btn-secondary"
          onClick={logout}
          style={{ height: "36px", fontSize: "13px" }}
        >
          Sign out
        </button>
      </header>

      {/* Main */}
      <main
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px 80px",
        }}
      >
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
          }}
        >
          {/* Icon */}
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              backgroundColor: "#FEF3C7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#D97706",
              marginBottom: "20px",
            }}
          >
            <LockIcon />
          </div>

          <h1
            style={{
              fontSize: "22px",
              fontWeight: 600,
              color: "var(--color-text-primary)",
              margin: "0 0 6px 0",
            }}
          >
            Password change required
          </h1>
          <p
            style={{
              fontSize: "14px",
              color: "var(--color-text-muted)",
              margin: "0 0 28px 0",
              lineHeight: 1.5,
            }}
          >
            For security, you must change your temporary password before
            continuing.
          </p>

          {/* Error */}
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

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label
                htmlFor="current-password"
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "var(--color-text-primary)",
                  marginBottom: "6px",
                }}
              >
                Current password
              </label>
              <input
                id="current-password"
                type="password"
                className="input"
                placeholder="Enter your temporary password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                autoComplete="current-password"
                autoFocus
              />
            </div>

            <div>
              <label
                htmlFor="new-password"
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "var(--color-text-primary)",
                  marginBottom: "6px",
                }}
              >
                New password
              </label>
              <input
                id="new-password"
                type="password"
                className="input"
                placeholder="At least 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                autoComplete="new-password"
                minLength={8}
              />
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "var(--color-text-primary)",
                  marginBottom: "6px",
                }}
              >
                Confirm new password
              </label>
              <input
                id="confirm-password"
                type="password"
                className="input"
                placeholder="Re-enter your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                minLength={8}
              />
            </div>

            <button
              type="submit"
              id="change-password-submit"
              className="btn btn-primary btn-lg btn-full"
              disabled={isSubmitting}
              style={{ marginTop: "6px" }}
            >
              {isSubmitting ? (
                <>
                  <div className="spinner spinner-white" style={{ width: "18px", height: "18px" }} />
                  Changing password...
                </>
              ) : (
                "Change password"
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
