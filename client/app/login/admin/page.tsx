import type { Metadata } from "next";
import LoginForm from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Admin Sign In — MediRehab AI",
  description: "Administrator access for MediRehab AI.",
  robots: "noindex, nofollow",
};

export default function AdminLoginPage() {
  return <LoginForm expectedRole="ADMIN" />;
}
