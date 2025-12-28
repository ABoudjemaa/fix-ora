import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Machines",
  description: "Gérez vos machines et leurs maintenances. Consultez l'historique, planifiez les interventions et suivez les heures d'utilisation de vos équipements industriels.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function MachinesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

