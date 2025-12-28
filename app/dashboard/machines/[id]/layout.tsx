import type { Metadata } from "next";

export function generateMetadata(): Metadata {
  return {
    title: "Détails de la machine",
    description: "Consultez les détails complets d'une machine : informations générales, historique des maintenances, pièces à remplacer et prochaines interventions planifiées.",
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function MachineDetailsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

