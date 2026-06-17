const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  [key: string]: T | boolean | string | undefined;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  mustChangePassword: boolean;
  user: ApiUser;
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

export interface MeResponse {
  success: boolean;
  user: ApiUser;
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
  /** POST /api/auth/login */
  login(email: string, password: string) {
    return request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  /** POST /api/auth/logout */
  logout() {
    return request<ApiResponse>("/auth/logout", {
      method: "POST",
    });
  },

  /** GET /api/auth/me — restore session */
  me() {
    return request<MeResponse>("/auth/me");
  },

  /** PATCH /api/users/me/password */
  changePassword(currentPassword: string, newPassword: string) {
    return request<ApiResponse>("/users/me/password", {
      method: "PATCH",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },
};
