import * as z from "zod";

export const maintenanceTypeEnum = z.enum(["PART", "OIL"]).refine(
  (val) => ["PART", "OIL"].includes(val),
  {
    message: "Le type doit être PART ou OIL",
  }
);

export const maintenanceSchema = z.object({
  name: z.string().min(1, "Le nom de la maintenance est requis"),
  type: maintenanceTypeEnum,
  replacementIntervalHours: z
    .number()
    .int("L'intervalle de remplacement doit être un nombre entier")
    .positive("L'intervalle de remplacement doit être positif"),
  lastReplacementDate: z
    .string()
    .min(1, "La date du dernier remplacement est requise")
    .transform((str) => new Date(str))
    .refine((date) => !isNaN(date.getTime()), {
      message: "Date invalide",
    })
    .refine((date) => {
      const today = new Date();
      today.setHours(23, 59, 59, 999); // Fin de la journée d'aujourd'hui
      return date <= today;
    }, {
      message: "La date du dernier remplacement ne peut pas être dans le futur",
    }),
});

export const machineSchema = z.object({
  name: z.string().min(1, "Le nom de la machine est requis"),
  serialNumber: z.string().min(1, "Le numéro de série est requis"),
  catalogLink: z
    .union([
      z.string().url("Lien du catalogue invalide"),
      z.literal(""),
      z.null(),
    ])
    .optional(),
  operatingHours: z
    .number()
    .int("Le nombre d'heures d'exploitation doit être un nombre entier")
    .nonnegative("Le nombre d'heures d'exploitation doit être positif ou nul"),
  notificationAdvanceHours: z
    .number()
    .int("Le nombre d'heures d'avance de notification doit être un nombre entier")
    .positive("Le nombre d'heures d'avance de notification doit être positif"),
  maintenances: z.array(maintenanceSchema).min(1, "Au moins une maintenance est requise"),
});

export type MachineFormData = z.infer<typeof machineSchema>;
export type MaintenanceFormData = z.infer<typeof maintenanceSchema>;

// Update schemas (all fields optional)
export const machineUpdateSchema = z.object({
  name: z.string().min(1, "Le nom de la machine est requis").optional(),
  serialNumber: z.string().min(1, "Le numéro de série est requis").optional(),
  catalogLink: z
    .union([
      z.string().url("Lien du catalogue invalide"),
      z.literal(""),
      z.null(),
    ])
    .optional(),
  operatingHours: z
    .number()
    .int("Le nombre d'heures d'exploitation doit être un nombre entier")
    .nonnegative("Le nombre d'heures d'exploitation doit être positif ou nul")
    .optional(),
  notificationAdvanceHours: z
    .number()
    .int("Le nombre d'heures d'avance de notification doit être un nombre entier")
    .positive("Le nombre d'heures d'avance de notification doit être positif")
    .optional(),
});

export const maintenanceUpdateSchema = z.object({
  name: z.string().min(1, "Le nom de la maintenance est requis").optional(),
  type: maintenanceTypeEnum.optional(),
  replacementIntervalHours: z
    .number()
    .int("L'intervalle de remplacement doit être un nombre entier")
    .positive("L'intervalle de remplacement doit être positif")
    .optional(),
  lastReplacementDate: z
    .string()
    .min(1, "La date du dernier remplacement est requise")
    .transform((str) => new Date(str))
    .refine((date) => !isNaN(date.getTime()), {
      message: "Date invalide",
    })
    .refine((date) => {
      const today = new Date();
      today.setHours(23, 59, 59, 999); // Fin de la journée d'aujourd'hui
      return date <= today;
    }, {
      message: "La date du dernier remplacement ne peut pas être dans le futur",
    })
    .optional(),
});

