import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};


export const getMaintenanceTypeLabel = (type: "PART" | "OIL") => {
  return type === "PART" ? "Pièce" : "Huile";
};

export const getMaintenanceTypeVariant = (type: "PART" | "OIL") => {
  return type === "PART" ? "default" : "secondary";
};