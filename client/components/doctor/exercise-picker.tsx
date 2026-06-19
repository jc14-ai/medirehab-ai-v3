"use client";

import { type ApiExercise } from "@/lib/api";

export function ExercisePicker({
  exercises,
  onAssign,
  isBusy,
}: {
  exercises: ApiExercise[];
  onAssign: (exerciseId: string) => void;
  isBusy?: boolean;
}) {
  return (
    <div className="card" style={{ padding: "0", overflow: "hidden" }}>
      <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--color-border)" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 600, margin: 0 }}>Available Exercises</h2>
      </div>
      {exercises.length === 0 ? (
        <div style={{ padding: "32px 24px", textAlign: "center", color: "var(--color-text-muted)" }}>
          No available exercises for this patient.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {exercises.map((exercise) => (
            <div key={exercise.id} style={{ padding: "18px 24px", borderBottom: "1px solid var(--color-page-bg)", display: "flex", justifyContent: "space-between", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>{exercise.name}</div>
                <div style={{ color: "var(--color-text-secondary)", fontSize: "14px", maxWidth: "56ch" }}>{exercise.description || "No description provided."}</div>
              </div>
              <button className="btn btn-primary" onClick={() => onAssign(exercise.id)} disabled={isBusy} style={{ height: "38px", padding: "0 14px" }}>
                Assign
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
