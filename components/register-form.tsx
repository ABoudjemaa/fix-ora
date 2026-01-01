"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { cn } from "@/lib/utils"
import { registerSchema, type RegisterFormData } from "@/lib/validations/register"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import Link from "next/link"

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || "Une erreur est survenue lors de l'inscription")
        setLoading(false)
        return
      }

      setSuccess(true)
      // Redirection après 2 secondes pour laisser le temps de voir le message
      setTimeout(() => {
        router.push("/login?registered=true")
      }, 2000)
    } catch (err) {
      setError("Une erreur est survenue lors de l'inscription")
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card className="overflow-hidden p-0">
          <CardContent className="grid p-0 md:grid-cols-2">
            <div className="p-6 md:p-8">
              <FieldGroup>
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="rounded-full bg-green-100 p-4 dark:bg-green-900/20">
                    <svg
                      className="h-8 w-8 text-green-600 dark:text-green-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h1 className="text-2xl font-bold">Compte créé avec succès</h1>
                  <p className="text-muted-foreground text-balance">
                    Bienvenue sur Fix-ora. Redirection vers la page de connexion...
                  </p>
                </div>
              </FieldGroup>
            </div>
            <div className="bg-muted relative hidden md:block">
              <Image
                src="/placeholder.svg"
                alt="Image"
                width={1000}
                height={1000}
                className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8">
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Créer un compte</h1>
                <p className="text-muted-foreground text-balance">
                  Inscrivez votre entreprise sur Fix-ora
                </p>
              </div>
              {error && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
                  {error}
                </div>
              )}
              <Field>
                <FieldLabel htmlFor="name">Nom de l'entreprise</FieldLabel>
                <Input
                  id="name"
                  type="text"
                  placeholder="Acme Inc"
                  {...register("name")}
                  disabled={loading}
                  aria-invalid={errors.name ? "true" : "false"}
                />
                {errors.name && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    {errors.name.message}
                  </p>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="ownerName">Nom du propriétaire</FieldLabel>
                <Input
                  id="ownerName"
                  type="text"
                  placeholder="Jean Dupont"
                  {...register("ownerName")}
                  disabled={loading}
                  aria-invalid={errors.ownerName ? "true" : "false"}
                />
                {errors.ownerName && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    {errors.ownerName.message}
                  </p>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="contact@example.com"
                  {...register("email")}
                  disabled={loading}
                  aria-invalid={errors.email ? "true" : "false"}
                />
                {errors.email && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    {errors.email.message}
                  </p>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="crn">
                  Numéro de registre du commerce (CRN)
                </FieldLabel>
                <Input
                  id="crn"
                  type="text"
                  placeholder="RC123456"
                  {...register("crn")}
                  disabled={loading}
                  aria-invalid={errors.crn ? "true" : "false"}
                />
                {errors.crn && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    {errors.crn.message}
                  </p>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="phone">Téléphone</FieldLabel>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+33 1 23 45 67 89"
                  {...register("phone")}
                  disabled={loading}
                  aria-invalid={errors.phone ? "true" : "false"}
                />
                {errors.phone && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    {errors.phone.message}
                  </p>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="location">Localisation</FieldLabel>
                <Input
                  id="location"
                  type="text"
                  placeholder="Paris, France"
                  {...register("location")}
                  disabled={loading}
                  aria-invalid={errors.location ? "true" : "false"}
                />
                {errors.location && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    {errors.location.message}
                  </p>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Mot de passe</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimum 8 caractères"
                  {...register("password")}
                  disabled={loading}
                  aria-invalid={errors.password ? "true" : "false"}
                />
                {errors.password && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    {errors.password.message}
                  </p>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="confirmPassword">
                  Confirmation du mot de passe
                </FieldLabel>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Répétez le mot de passe"
                  {...register("confirmPassword")}
                  disabled={loading}
                  aria-invalid={errors.confirmPassword ? "true" : "false"}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </Field>
              <Field>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Création du compte..." : "Créer le compte"}
                </Button>
              </Field>
              <FieldDescription className="text-center">
                Vous avez déjà un compte ?{" "}
                <Link href="/login" className="underline-offset-2 hover:underline">
                  Se connecter
                </Link>
              </FieldDescription>
            </FieldGroup>
          </form>
          <div className="bg-muted relative hidden md:block">
            <Image
              src="/placeholder.svg"
              alt="Image"
              width={1000}
              height={1000}
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        En créant un compte, vous acceptez nos{" "}
        <a href="#" className="underline-offset-2 hover:underline">
          Conditions d'utilisation
        </a>{" "}
        et notre{" "}
        <a href="#" className="underline-offset-2 hover:underline">
          Politique de confidentialité
        </a>
        .
      </FieldDescription>
    </div>
  )
}

