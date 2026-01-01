import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(1, "Le nom de l'entreprise est requis"),
  ownerName: z.string().min(1, "Le nom du propriétaire est requis"),
  email: z.string().email("Email invalide"),
  crn: z
    .string()
    .min(4, "Le numéro de registre doit contenir au moins 4 caractères"),
  phone: z.string().min(1, "Le numéro de téléphone est requis"),
  location: z.string().min(1, "La localisation est requise"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

export type RegisterFormData = z.infer<typeof registerSchema>;

