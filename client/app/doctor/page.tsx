import { redirect } from "next/navigation";

export default function DoctorRootPage() {
  redirect("/doctor/dashboard");
}
