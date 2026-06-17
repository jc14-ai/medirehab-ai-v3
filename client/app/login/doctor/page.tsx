import type { Metadata } from "next";
import LoginForm from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Doctor Sign In — MediRehab AI",
  description:
    "Sign in as a doctor to manage patients and assign rehabilitation exercises.",
};

export default function DoctorLoginPage() {
  return <LoginForm expectedRole="DOCTOR" />;
}
