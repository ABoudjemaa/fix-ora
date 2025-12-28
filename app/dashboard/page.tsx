import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tableau de bord",
  description: "Accédez à votre tableau de bord Fix-ora pour gérer vos machines, suivre les maintenances et recevoir des notifications automatiques.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  redirect("/dashboard/machines");
}
