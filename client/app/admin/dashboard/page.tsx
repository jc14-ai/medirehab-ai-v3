"use client";

import { useEffect, useState } from "react";
import { api, type ApiDoctor, type ApiExercise, ApiError } from "@/lib/api";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import Link from "next/link";

function UsersIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function UserCheckIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <polyline points="16 11 18 13 22 9" />
    </svg>
  );
}

function UserXIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="17" y1="8" x2="21" y2="12" />
      <line x1="21" y1="8" x2="17" y2="12" />
    </svg>
  );
}

function ActivityIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

export default function AdminDashboard() {
  const [doctors, setDoctors] = useState<ApiDoctor[]>([]);
  const [exercises, setExercises] = useState<ApiExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        const [docsRes, exRes] = await Promise.all([
          api.getDoctors(),
          api.getExercises(),
        ]);
        if (mounted) {
          setDoctors(docsRes.doctors);
          setExercises(exRes.exercises);
        }
      } catch (err) {
        if (mounted) {
          if (err instanceof ApiError) {
            setError(err.message);
          } else {
            setError("Failed to load dashboard data");
          }
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{ padding: "24px", borderColor: "var(--color-danger)", backgroundColor: "#FEF2F2" }}>
        <h3 style={{ color: "var(--color-danger)", margin: "0 0 8px 0" }}>Error loading dashboard</h3>
        <p style={{ color: "var(--color-text-secondary)", margin: 0 }}>{error}</p>
      </div>
    );
  }

  const activeDoctors = doctors.filter(d => d.isActive && !d.archivedAt).length;
  const inactiveDoctors = doctors.length - activeDoctors;
  
  // Basic reverse so newest are likely first (assuming backend appends or sorts asc by default, though we don't know for sure).
  const recentDoctors = [...doctors].reverse().slice(0, 5);
  const recentExercises = [...exercises].reverse().slice(0, 5);

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: "28px", fontWeight: 700, margin: "0 0 8px 0", color: "var(--color-text-primary)" }}>
          Dashboard Overview
        </h1>
        <p style={{ fontSize: "15px", color: "var(--color-text-secondary)", margin: 0 }}>
          Manage your platform's doctors and exercise catalog.
        </p>
      </div>

      {/* Summary Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
        <StatCard title="Total Doctors" value={doctors.length} icon={<UsersIcon />} />
        <StatCard title="Active Doctors" value={activeDoctors} icon={<UserCheckIcon />} />
        <StatCard title="Inactive/Archived" value={inactiveDoctors} icon={<UserXIcon />} />
        <StatCard title="Total Exercises" value={exercises.length} icon={<ActivityIcon />} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "24px" }}>
        {/* Recent Doctors */}
        <div className="card" style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: "16px", fontWeight: 600, margin: 0 }}>Recent Doctors</h2>
            <Link href="/admin/doctors" style={{ fontSize: "14px", color: "var(--color-primary)", textDecoration: "none", fontWeight: 500, display: "flex", alignItems: "center", gap: "4px" }}>
              View all <ArrowRightIcon />
            </Link>
          </div>
          <div style={{ padding: "12px 0" }}>
            {recentDoctors.length === 0 ? (
              <p style={{ padding: "24px", textAlign: "center", color: "var(--color-text-muted)", margin: 0 }}>No doctors found.</p>
            ) : (
              <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {recentDoctors.map(doctor => (
                  <li key={doctor.id} style={{ padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--color-page-bg)" }}>
                    <div>
                      <div style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>
                        {doctor.profile ? `Dr. ${doctor.profile.firstName} ${doctor.profile.lastName}` : "Unknown"}
                      </div>
                      <div style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>{doctor.email}</div>
                    </div>
                    <StatusBadge isActive={doctor.isActive} archivedAt={doctor.archivedAt} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Recent Exercises */}
        <div className="card" style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: "16px", fontWeight: 600, margin: 0 }}>Recent Exercises</h2>
            <Link href="/admin/exercises" style={{ fontSize: "14px", color: "var(--color-primary)", textDecoration: "none", fontWeight: 500, display: "flex", alignItems: "center", gap: "4px" }}>
              View all <ArrowRightIcon />
            </Link>
          </div>
          <div style={{ padding: "12px 0" }}>
            {recentExercises.length === 0 ? (
              <p style={{ padding: "24px", textAlign: "center", color: "var(--color-text-muted)", margin: 0 }}>No exercises found.</p>
            ) : (
              <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {recentExercises.map(exercise => (
                  <li key={exercise.id} style={{ padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--color-page-bg)" }}>
                    <div style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>
                      {exercise.name || exercise.id}
                    </div>
                    <StatusBadge isActive={!exercise.archivedAt} archivedAt={exercise.archivedAt} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
