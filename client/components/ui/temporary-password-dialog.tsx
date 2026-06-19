"use client";

import { useState } from "react";

function CopyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function TemporaryPasswordDialog({
  isOpen,
  password,
  onClose,
}: {
  isOpen: boolean;
  password?: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !password) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(password).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(15, 23, 42, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: "20px",
      }}
    >
      <div
        className="card animate-slide-up"
        style={{ width: "100%", maxWidth: "440px", padding: "32px", textAlign: "center" }}
      >
        <div style={{ marginBottom: "20px", color: "var(--color-primary)", display: "flex", justifyContent: "center" }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h3 style={{ fontSize: "20px", fontWeight: 600, margin: "0 0 12px 0", color: "var(--color-text-primary)" }}>
          Temporary Password Generated
        </h3>
        <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", margin: "0 0 24px 0", lineHeight: 1.5 }}>
          Please save this password. It will not be shown again. The user will be required to change it upon their first login.
        </p>

        <div
          style={{
            backgroundColor: "var(--color-page-bg)",
            border: "1px dashed var(--color-border)",
            borderRadius: "var(--radius-md)",
            padding: "16px",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <code style={{ fontSize: "18px", fontWeight: 700, color: "var(--color-text-primary)", letterSpacing: "0.05em" }}>
            {password}
          </code>
          <button
            className="btn btn-secondary"
            style={{ height: "32px", padding: "0 12px", gap: "6px" }}
            onClick={handleCopy}
          >
            {copied ? <CheckIcon /> : <CopyIcon />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        <button className="btn btn-primary btn-full" onClick={onClose}>
          I have saved it
        </button>
      </div>
    </div>
  );
}
