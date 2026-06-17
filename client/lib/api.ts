const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  [key: string]: T | boolean | string | undefined;
}

export interface ApiUser {
  id: string;
  email: string;
  role: "ADMIN" | "DOCTOR" | "PATIENT";
  isActive: boolean;
  archivedAt: string | null;
  mustChangePassword: boolean;
  passwordChangedAt: string | null;
}

export interface DoctorProfile {
  firstName: string;
  lastName: string;
  specialization: string;
  licenseNumber: string;
  contactNumber: string;
  clinicSchedule: string;
}

export interface PatientProfile {
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: string;
  contactNumber: string;
  address: string;
  medicalCondition: string;
}

export interface ApiDoctor extends ApiUser {
  profile: DoctorProfile;
}

export interface ApiPatient extends ApiUser {
  profile: PatientProfile;
}

export interface ExerciseImage {
  imageName: string;
  filepath: string;
}

export interface ApiExercise {
  id: string;
  name: string;
  description: string;
  archivedAt: string | null;
  images: ExerciseImage[];
}

export interface LoginResponse {
  success: boolean;
  message: string;
  mustChangePassword: boolean;
  user: ApiUser;
}

export interface MeResponse {
  success: boolean;
  user: ApiUser & { profile?: DoctorProfile | PatientProfile };
}

export class ApiError extends Error {
  status: number;
  data: { success: boolean; message: string };

  constructor(status: number, data: { success: boolean; message: string }) {
    super(data.message || "An unexpected error occurred.");
    this.status = status;
    this.data = data;
    this.name = "ApiError";
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;

  const res = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new ApiError(res.status, data);
  }

  return data as T;
}

export const api = {
  // --- Auth & Session ---
  login(email: string, password: string) {
    return request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  logout() {
    return request<ApiResponse>("/auth/logout", {
      method: "POST",
    });
  },

  me() {
    return request<MeResponse>("/auth/me");
  },

  changePassword(currentPassword: string, newPassword: string) {
    return request<ApiResponse>("/users/me/password", {
      method: "PATCH",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  // --- Admin: Doctors ---
  getDoctors() {
    return request<{ success: boolean; doctors: ApiDoctor[] }>("/users/doctors");
  },

  getDoctor(userId: string) {
    return request<{ success: boolean; doctor: ApiDoctor }>(`/users/doctors/${userId}`);
  },

  createDoctor(data: Partial<ApiDoctor & DoctorProfile>) {
    return request<{ success: boolean; doctor: ApiDoctor; temporaryPassword?: string }>("/users/doctors", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateDoctor(userId: string, data: Partial<DoctorProfile>) {
    return request<{ success: boolean; doctor: ApiDoctor }>(`/users/doctors/${userId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  updateDoctorStatus(userId: string, isActive: boolean) {
    return request<{ success: boolean; doctor: ApiDoctor }>(`/users/doctors/${userId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ isActive }),
    });
  },

  resetDoctorPassword(userId: string, newPassword: string) {
    return request<ApiResponse>(`/users/doctors/${userId}/password`, {
      method: "PATCH",
      body: JSON.stringify({ newPassword }),
    });
  },

  deleteDoctor(userId: string) {
    return request<ApiResponse>(`/users/doctors/${userId}`, {
      method: "DELETE",
    });
  },

  // --- Admin: Exercises ---
  getExercises() {
    return request<{ success: boolean; exercises: ApiExercise[] }>("/exercises");
  },

  createExercise(data: { name?: string; exercise?: string; description: string; images: ExerciseImage[] }) {
    return request<{ success: boolean; exercise: ApiExercise }>("/exercises", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateExercise(exerciseId: string, data: Partial<{ name: string; exercise: string; description: string; images: ExerciseImage[] }>) {
    return request<{ success: boolean; exercise: ApiExercise }>(`/exercises/${exerciseId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  deleteExercise(exerciseId: string) {
    return request<ApiResponse>(`/exercises/${exerciseId}`, {
      method: "DELETE",
    });
  },

  // --- Profile ---
  getProfile() {
    return request<{ success: boolean; user: ApiUser & { profile?: DoctorProfile | PatientProfile } }>("/users/me/profile");
  },

  updateProfile(data: Partial<DoctorProfile | PatientProfile>) {
    return request<{ success: boolean; user: ApiUser & { profile?: DoctorProfile | PatientProfile } }>("/users/me/profile", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
};
