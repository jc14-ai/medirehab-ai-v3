"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";

export default function AdminProfilePage() {
  const { user } = useAuth();
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long.");
      return;
    }

    if (currentPassword === newPassword) {
      setError("New password must be different from your current password.");
      return;
    }

    setLoading(true);
    try {
      await api.changePassword(currentPassword, newPassword);
      setSuccess("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to change password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "600px" }}>
      <div>
        <h1 style={{ fontSize: "28px", fontWeight: 700, margin: "0 0 8px 0", color: "var(--color-text-primary)" }}>
          Settings & Profile
        </h1>
        <p style={{ fontSize: "15px", color: "var(--color-text-secondary)", margin: 0 }}>
          Manage your account settings and change your password.
        </p>
      </div>

      <div className="card" style={{ padding: "24px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 600, margin: "0 0 16px 0", color: "var(--color-text-primary)", borderBottom: "1px solid var(--color-border)", paddingBottom: "12px" }}>
          Account Information
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Role</span>
            <div style={{ fontSize: "15px", color: "var(--color-text-primary)", fontWeight: 500, marginTop: "4px" }}>
              {user?.role}
            </div>
          </div>
          <div>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Email Address</span>
            <div style={{ fontSize: "15px", color: "var(--color-text-primary)", fontWeight: 500, marginTop: "4px" }}>
              {user?.email}
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: "24px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 600, margin: "0 0 16px 0", color: "var(--color-text-primary)", borderBottom: "1px solid var(--color-border)", paddingBottom: "12px" }}>
          Change Password
        </h2>
        
        {error && (
          <div style={{ padding: "12px 16px", backgroundColor: "#FEF2F2", color: "var(--color-danger)", borderRadius: "var(--radius-md)", marginBottom: "20px", fontSize: "14px" }}>
            {error}
          </div>
        )}
        
        {success && (
          <div style={{ padding: "12px 16px", backgroundColor: "#DCFCE7", color: "#166534", borderRadius: "var(--radius-md)", marginBottom: "20px", fontSize: "14px" }}>
            {success}
          </div>
        )}

        <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "6px" }}>Current Password</label>
            <input
              type="password"
              className="input"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "6px" }}>New Password</label>
            <input
              type="password"
              className="input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "6px" }}>Confirm New Password</label>
            <input
              type="password"
              className="input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          <div style={{ marginTop: "8px" }}>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ minWidth: "140px" }}>
              {loading ? <div className="spinner spinner-white" style={{ width: "16px", height: "16px" }} /> : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
