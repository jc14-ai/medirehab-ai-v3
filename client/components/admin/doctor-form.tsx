import { useState, useEffect } from "react";
import { type ApiDoctor, type DoctorProfile } from "@/lib/api";

export function DoctorForm({
  isOpen,
  initialData,
  onSave,
  onCancel,
  isLoading,
}: {
  isOpen: boolean;
  initialData?: ApiDoctor;
  onSave: (data: Partial<ApiDoctor & DoctorProfile>) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState<Partial<ApiDoctor & DoctorProfile>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        email: initialData.email,
        firstName: initialData.profile?.firstName || "",
        lastName: initialData.profile?.lastName || "",
        specialization: initialData.profile?.specialization || "",
        licenseNumber: initialData.profile?.licenseNumber || "",
        contactNumber: initialData.profile?.contactNumber || "",
        clinicSchedule: initialData.profile?.clinicSchedule || "",
      });
    } else {
      setFormData({});
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
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
      onClick={onCancel}
    >
      <div
        className="card animate-slide-up"
        style={{ width: "100%", maxWidth: "500px", padding: "24px", maxHeight: "90vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ fontSize: "18px", fontWeight: 600, margin: "0 0 20px 0", color: "var(--color-text-primary)" }}>
          {initialData ? "Edit Doctor" : "Create Doctor"}
        </h3>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {!initialData && (
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "6px" }}>Email</label>
              <input type="email" name="email" className="input" value={formData.email || ""} onChange={handleChange} required />
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "6px" }}>First Name</label>
              <input type="text" name="firstName" className="input" value={formData.firstName || ""} onChange={handleChange} required />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "6px" }}>Last Name</label>
              <input type="text" name="lastName" className="input" value={formData.lastName || ""} onChange={handleChange} required />
            </div>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "6px" }}>Specialization</label>
            <input type="text" name="specialization" className="input" value={formData.specialization || ""} onChange={handleChange} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "6px" }}>License Number</label>
              <input type="text" name="licenseNumber" className="input" value={formData.licenseNumber || ""} onChange={handleChange} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "6px" }}>Contact Number</label>
              <input type="text" name="contactNumber" className="input" value={formData.contactNumber || ""} onChange={handleChange} />
            </div>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "6px" }}>Clinic Schedule</label>
            <input type="text" name="clinicSchedule" className="input" value={formData.clinicSchedule || ""} onChange={handleChange} />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "8px" }}>
            <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isLoading} style={{ minWidth: "100px" }}>
              {isLoading ? <div className="spinner spinner-white" style={{ width: "16px", height: "16px" }} /> : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
