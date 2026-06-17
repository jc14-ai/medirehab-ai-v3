"use client";

import { useAuth } from "@/lib/auth-context";

export default function PatientDashboard() {
  const { user, logout } = useAuth();

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--color-page-bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        className="card animate-fade-in"
        style={{ padding: "48px", textAlign: "center", maxWidth: "440px" }}
      >
        <div
          className="badge badge-blue"
          style={{ marginBottom: "16px" }}
        >
          PATIENT
        </div>
        <h1
          style={{
            fontSize: "24px",
            fontWeight: 600,
            color: "var(--color-text-primary)",
            margin: "0 0 8px 0",
          }}
        >
          Patient Dashboard
        </h1>
        <p
          style={{
            fontSize: "14px",
            color: "var(--color-text-muted)",
            margin: "0 0 24px 0",
          }}
        >
          Welcome, {user?.email}. Dashboard coming soon.
        </p>
        <button className="btn btn-secondary" onClick={logout}>
          Sign out
        </button>
      </div>
    </div>
  );
}
