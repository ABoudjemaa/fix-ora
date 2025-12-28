import type { Metadata } from "next";
import { RegisterForm } from "@/components/register-form"

export const metadata: Metadata = {
  title: "Inscription",
  description: "Créez votre compte Fix-ora et commencez à gérer efficacement la maintenance de vos machines industrielles. Inscription gratuite et rapide.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Inscription - Fix-ora",
    description: "Créez votre compte Fix-ora et commencez à gérer efficacement la maintenance de vos machines industrielles.",
    url: "/register",
    type: "website",
  },
};

export default function RegisterPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <RegisterForm />
      </div>
    </div>
  )
}

