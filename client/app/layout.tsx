import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth-context";
import SketchDoodles from "@/components/ui/sketch-doodles";
import "./globals.css";

export const metadata: Metadata = {
  title: "MediRehab AI — Smarter Rehab, Faster Recovery",
  description:
    "Connect with your healthcare provider and track rehabilitation exercises with AI-powered motion analysis.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <SketchDoodles />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
