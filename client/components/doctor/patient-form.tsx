"use client";

import { useEffect, useState } from "react";
import { type ApiPatient, type PatientProfile } from "@/lib/api";

type PatientFormData = Partial<ApiPatient & PatientProfile>;

export function PatientForm({
  isOpen,
  initialData,
  onSave,
  onCancel,
  isLoading,
}: {
  isOpen: boolean;
  initialData?: ApiPatient;
  onSave: (data: PatientFormData) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState<PatientFormData>({});

  useEffect(() => {
    if (initialData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        email: initialData.email,
        firstName: initialData.profile?.firstName || "",
        lastName: initialData.profile?.lastName || "",
        birthDate: initialData.profile?.birthDate ? initialData.profile.birthDate.slice(0, 10) : "",
        gender: initialData.profile?.gender || "",
        contactNumber: initialData.profile?.contactNumber || "",
        address: initialData.profile?.address || "",
        medicalCondition: initialData.profile?.medicalCondition || "",
      });
    } else {
      setFormData({});
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSave(formData);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
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
        style={{ width: "100%", maxWidth: "640px", padding: "24px", maxHeight: "90vh", overflowY: "auto" }}
        onClick={(event) => event.stopPropagation()}
      >
        <h3 style={{ fontSize: "18px", fontWeight: 600, margin: "0 0 20px 0" }}>
          {initialData ? "Edit Patient" : "Create Patient"}
        </h3>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {!initialData && (
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "6px" }}>Email</label>
              <input type="email" name="email" className="input" value={formData.email || ""} onChange={handleChange} required />
            </div>
          )}

          <div className="doctor-form-grid">
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "6px" }}>First Name</label>
              <input type="text" name="firstName" className="input" value={formData.firstName || ""} onChange={handleChange} required />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "6px" }}>Last Name</label>
              <input type="text" name="lastName" className="input" value={formData.lastName || ""} onChange={handleChange} required />
            </div>
          </div>

          <div className="doctor-form-grid">
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "6px" }}>Birth Date</label>
              <input type="date" name="birthDate" className="input" value={formData.birthDate || ""} onChange={handleChange} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "6px" }}>Gender</label>
              <select name="gender" className="input" value={formData.gender || ""} onChange={handleChange}>
                <option value="">Select gender</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "6px" }}>Contact Number</label>
            <input type="text" name="contactNumber" className="input" value={formData.contactNumber || ""} onChange={handleChange} />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "6px" }}>Address</label>
            <textarea name="address" className="input" value={formData.address || ""} onChange={handleChange} style={{ minHeight: "84px", paddingTop: "10px", resize: "vertical" }} />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "6px" }}>Medical Condition</label>
            <textarea name="medicalCondition" className="input" value={formData.medicalCondition || ""} onChange={handleChange} style={{ minHeight: "96px", paddingTop: "10px", resize: "vertical" }} />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "8px", flexWrap: "wrap" }}>
            <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isLoading} style={{ minWidth: "120px" }}>
              {isLoading ? <div className="spinner spinner-white" style={{ width: "16px", height: "16px" }} /> : "Save Patient"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
