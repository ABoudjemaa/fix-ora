import * as z from "zod";

export const maintenanceTypeEnum = z.enum(["PIECE", "VIDANGE"]).refine(
  (val) => ["PIECE", "VIDANGE"].includes(val),
  {
    message: "Le type doit être PIECE ou VIDANGE",
  }
);

export const maintenanceSchema = z.object({
  name: z.string().min(1, "Le nom de la maintenance est requis"),
  type: maintenanceTypeEnum,
  lifespanHours: z
    .number()
    .int("La durée de vie doit être un nombre entier")
    .positive("La durée de vie doit être positive"),
  lastReplacementDate: z
    .string()
    .min(1, "La date du dernier remplacement est requise")
    .transform((str) => new Date(str))
    .refine((date) => !isNaN(date.getTime()), {
      message: "Date invalide",
    }),
});

export const machineSchema = z.object({
  name: z.string().min(1, "Le nom de la machine est requis"),
  serialNumber: z.string().min(1, "Le numéro de série est requis"),
  createdAt: z
    .string()
    .min(1, "La date de création est requise")
    .transform((str) => new Date(str))
    .refine((date) => !isNaN(date.getTime()), {
      message: "Date invalide",
    }),
  notificationHours: z
    .number()
    .int("Le nombre d'heures doit être un nombre entier")
    .positive("Le nombre d'heures doit être positif"),
  maintenances: z.array(maintenanceSchema).min(1, "Au moins une maintenance est requise"),
});

export type MachineFormData = z.infer<typeof machineSchema>;
export type MaintenanceFormData = z.infer<typeof maintenanceSchema>;

