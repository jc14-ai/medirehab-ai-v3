import type { Metadata } from "next";
import LoginForm from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Patient Sign In — MediRehab AI",
  description:
    "Sign in as a patient to view your assigned exercises and track recovery.",
};

export default function PatientLoginPage() {
  return <LoginForm expectedRole="PATIENT" />;
}
