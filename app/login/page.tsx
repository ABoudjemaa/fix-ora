import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/login-form"

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connectez-vous à votre compte Fix-ora pour accéder à votre tableau de bord de gestion de maintenance industrielle.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Connexion - Fix-ora",
    description: "Connectez-vous à votre compte Fix-ora pour accéder à votre tableau de bord de gestion de maintenance industrielle.",
    url: "/login",
    type: "website",
  },
};

export default function LoginPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <Suspense fallback={<div className="text-center">Chargement...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
