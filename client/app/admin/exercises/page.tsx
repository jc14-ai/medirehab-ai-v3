"use client";

import { useEffect, useState } from "react";
import { api, type ApiExercise, ApiError } from "@/lib/api";
import { StatusBadge } from "@/components/ui/status-badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ExerciseForm } from "@/components/admin/exercise-form";

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function ArchiveIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="21 8 21 21 3 21 3 8" />
      <rect x="1" y="3" width="22" height="5" />
      <line x1="10" y1="12" x2="14" y2="12" />
    </svg>
  );
}

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<ApiExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<ApiExercise | undefined>(undefined);
  const [formLoading, setFormLoading] = useState(false);

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => Promise<void>;
    isLoading: boolean;
  }>({
    isOpen: false,
    title: "",
    message: "",
    action: async () => {},
    isLoading: false,
  });

  const loadExercises = async () => {
    setLoading(true);
    try {
      const res = await api.getExercises();
      setExercises(res.exercises);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("Failed to load exercises");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExercises();
  }, []);

  const handleSaveExercise = async (data: { name: string; description: string; images: any[] }) => {
    setFormLoading(true);
    try {
      if (editingExercise) {
        await api.updateExercise(editingExercise.id, data);
      } else {
        await api.createExercise({ ...data, exercise: data.name }); // Pass 'exercise' as fallback for backend API mapping if needed
      }
      await loadExercises();
      setIsFormOpen(false);
    } catch (err) {
      if (err instanceof ApiError) alert(err.message);
      else alert("Failed to save exercise");
    } finally {
      setFormLoading(false);
    }
  };

  const handleArchive = (exercise: ApiExercise) => {
    setConfirmDialog({
      isOpen: true,
      title: "Archive Exercise",
      message: `Are you sure you want to archive "${exercise.name}"?`,
      isLoading: false,
      action: async () => {
        setConfirmDialog((prev) => ({ ...prev, isLoading: true }));
        try {
          await api.deleteExercise(exercise.id);
          await loadExercises();
        } catch (err) {
          if (err instanceof ApiError) alert(err.message);
          else alert("Operation failed");
        } finally {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false, isLoading: false }));
        }
      },
    });
  };

  const filteredExercises = exercises.filter((ex) =>
    (ex.name || ex.id).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 700, margin: "0 0 8px 0", color: "var(--color-text-primary)" }}>
            Exercises
          </h1>
          <p style={{ fontSize: "15px", color: "var(--color-text-secondary)", margin: 0 }}>
            Manage the platform's exercise catalog.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingExercise(undefined);
            setIsFormOpen(true);
          }}
        >
          <PlusIcon /> Add Exercise
        </button>
      </div>

      <div className="card" style={{ padding: "20px" }}>
        <div style={{ marginBottom: "20px" }}>
          <input
            type="text"
            className="input"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ maxWidth: "300px" }}
          />
        </div>

        {error && (
          <div style={{ padding: "16px", backgroundColor: "#FEF2F2", color: "var(--color-danger)", borderRadius: "var(--radius-md)", marginBottom: "20px" }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
            <div className="spinner"></div>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--color-border)", color: "var(--color-text-muted)", fontSize: "14px" }}>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>Name</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>Description</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>Images</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>Status</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExercises.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: "40px", textAlign: "center", color: "var(--color-text-muted)" }}>
                      No exercises found.
                    </td>
                  </tr>
                ) : (
                  filteredExercises.map((exercise) => (
                    <tr key={exercise.id} style={{ borderBottom: "1px solid var(--color-page-bg)", transition: "background-color 0.15s ease" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--color-primary-soft)"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
                      <td style={{ padding: "12px 16px", fontWeight: 500, color: "var(--color-text-primary)" }}>
                        {exercise.name || exercise.id}
                      </td>
                      <td style={{ padding: "12px 16px", color: "var(--color-text-secondary)", fontSize: "14px", maxWidth: "300px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {exercise.description || "-"}
                      </td>
                      <td style={{ padding: "12px 16px", color: "var(--color-text-secondary)", fontSize: "14px" }}>
                        {exercise.images?.length || 0}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <StatusBadge isActive={!exercise.archivedAt} archivedAt={exercise.archivedAt} />
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "right" }}>
                        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                          <button
                            title="Edit"
                            style={{ background: "none", border: "none", color: "var(--color-text-secondary)", cursor: "pointer", padding: "4px" }}
                            onClick={() => { setEditingExercise(exercise); setIsFormOpen(true); }}
                          >
                            <EditIcon />
                          </button>
                          {!exercise.archivedAt && (
                            <button
                              title="Archive"
                              style={{ background: "none", border: "none", color: "var(--color-danger)", cursor: "pointer", padding: "4px" }}
                              onClick={() => handleArchive(exercise)}
                            >
                              <ArchiveIcon />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ExerciseForm
        isOpen={isFormOpen}
        initialData={editingExercise}
        onSave={handleSaveExercise}
        onCancel={() => setIsFormOpen(false)}
        isLoading={formLoading}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        isDestructive={true}
        isLoading={confirmDialog.isLoading}
        onConfirm={confirmDialog.action}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
