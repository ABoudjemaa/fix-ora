import type { Metadata } from "next";
import { MachineForm } from "@/components/machine-form"

export const metadata: Metadata = {
  title: "Ajouter une machine",
  description: "Ajoutez une nouvelle machine à votre parc d'équipements industriels. Enregistrez les informations essentielles pour un suivi optimal de la maintenance.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AddMachinePage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 md:p-6 md:pt-0">
          <div className="max-w-4xl mx-auto w-full">
            <MachineForm />
          </div>
        </div>
  )
}

