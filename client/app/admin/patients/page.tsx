"use client";

import { useEffect, useMemo, useState } from "react";
import { api, ApiError, type ApiDoctor, type ApiPatient } from "@/lib/api";
import { StatusBadge } from "@/components/ui/status-badge";

function patientName(patient: ApiPatient) {
  return [patient.profile?.firstName, patient.profile?.lastName].filter(Boolean).join(" ") || "Unnamed patient";
}

function doctorName(doctor?: ApiDoctor) {
  return [doctor?.profile?.firstName, doctor?.profile?.lastName].filter(Boolean).join(" ") || doctor?.email || "";
}

function assignedDoctorName(patient: ApiPatient) {
  const assigned = patient.profile?.assignedDoctor;
  const name = [assigned?.firstName, assigned?.lastName].filter(Boolean).join(" ");
  return name || assigned?.user?.email || "Unassigned";
}

export default function AdminPatientsPage() {
  const [patients, setPatients] = useState<ApiPatient[]>([]);
  const [doctors, setDoctors] = useState<ApiDoctor[]>([]);
  const [selectedDoctors, setSelectedDoctors] = useState<Record<string, string>>({});
  const [savingPatientId, setSavingPatientId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const loadData = async () => {
    setError("");
    try {
      const [patientsRes, doctorsRes] = await Promise.all([
        api.getAdminPatients(),
        api.getDoctors(),
      ]);
      setPatients(patientsRes.patients);
      setDoctors(doctorsRes.doctors);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load patients.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, []);

  const activeDoctors = doctors.filter((doctor) => doctor.isActive && !doctor.archivedAt);
  const filteredPatients = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return patients;
    return patients.filter((patient) => {
      return (
        patient.email.toLowerCase().includes(query) ||
        patient.profile?.firstName?.toLowerCase().includes(query) ||
        patient.profile?.lastName?.toLowerCase().includes(query) ||
        patient.profile?.medicalCondition?.toLowerCase().includes(query)
      );
    });
  }, [patients, searchTerm]);

  const handleAssign = async (patient: ApiPatient) => {
    const doctorUserId = selectedDoctors[patient.id];
    if (!doctorUserId) {
      setError("Select a doctor before assigning.");
      return;
    }

    setSavingPatientId(patient.id);
    setError("");
    setSuccess("");
    try {
      await api.assignPatientToDoctor(patient.id, doctorUserId);
      setSuccess(`${patientName(patient)} assigned successfully.`);
      await loadData();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to assign patient.");
    } finally {
      setSavingPatientId("");
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h1 style={{ fontSize: "28px", fontWeight: 700, margin: "0 0 8px 0" }}>Patients</h1>
        <p style={{ color: "var(--color-text-secondary)", margin: 0 }}>
          Assign patient accounts to active doctors.
        </p>
      </div>

      <div className="card" style={{ padding: "20px" }}>
        <div className="doctor-toolbar" style={{ marginBottom: "20px" }}>
          <input
            className="input"
            type="text"
            placeholder="Search name, email, or condition"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            style={{ maxWidth: "340px" }}
          />
        </div>

        {error && (
          <div style={{ padding: "14px 16px", backgroundColor: "#FEF2F2", color: "var(--color-danger)", borderRadius: "var(--radius-md)", marginBottom: "16px" }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ padding: "14px 16px", backgroundColor: "#DCFCE7", color: "#166534", borderRadius: "var(--radius-md)", marginBottom: "16px" }}>
            {success}
          </div>
        )}

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "48px" }}><div className="spinner" /></div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--color-border)", color: "var(--color-text-muted)", fontSize: "14px" }}>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>Patient</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>Condition</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>Current Doctor</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>Status</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>Assign Doctor</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "var(--color-text-muted)" }}>
                      No patients found.
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((patient) => (
                    <tr key={patient.id} style={{ borderBottom: "1px solid var(--color-page-bg)" }}>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ fontWeight: 600 }}>{patientName(patient)}</div>
                        <div style={{ color: "var(--color-text-muted)", fontSize: "13px" }}>{patient.email}</div>
                      </td>
                      <td style={{ padding: "12px 16px", color: "var(--color-text-secondary)", fontSize: "14px" }}>
                        {patient.profile?.medicalCondition || "-"}
                      </td>
                      <td style={{ padding: "12px 16px", color: "var(--color-text-secondary)", fontSize: "14px" }}>
                        {assignedDoctorName(patient)}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <StatusBadge isActive={patient.isActive} archivedAt={patient.archivedAt} />
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <select
                          className="input"
                          value={selectedDoctors[patient.id] || ""}
                          onChange={(event) => setSelectedDoctors((prev) => ({ ...prev, [patient.id]: event.target.value }))}
                          style={{ minWidth: "220px" }}
                        >
                          <option value="">Select doctor</option>
                          {activeDoctors.map((doctor) => (
                            <option key={doctor.id} value={doctor.id}>
                              {doctorName(doctor)}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "right" }}>
                        <button
                          className="btn btn-primary"
                          onClick={() => handleAssign(patient)}
                          disabled={savingPatientId === patient.id || !selectedDoctors[patient.id]}
                          style={{ height: "36px", padding: "0 14px" }}
                        >
                          {savingPatientId === patient.id ? <div className="spinner spinner-white" style={{ width: "16px", height: "16px" }} /> : "Assign"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
