"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { cn } from "@/lib/utils"
import { machineSchema, type MachineFormData, type MaintenanceFormData } from "@/lib/validations/machine"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Trash2, Plus } from "lucide-react"

export function MachineForm({
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
    control,
    formState: { errors },
  } = useForm<MachineFormData>({
    resolver: zodResolver(machineSchema as any),
    defaultValues: {
      serialNumber: "",
      name: "",
      catalogLink: "",
      operatingHours: 0,
      notificationAdvanceHours: 24,
      maintenances: [
        {
          name: "",
          type: "PART",
          replacementIntervalHours: 1000,
          lastReplacementDate: new Date().toISOString().split("T")[0] as any,
        },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "maintenances",
  })

  const onSubmit = async (data: any) => {
    setError("")
    setLoading(true)

    try {
      // Transform dates to ISO date strings for API
      const payload = {
        ...data,
        maintenances: data.maintenances.map((m: any) => ({
          ...m,
          lastReplacementDate: m.lastReplacementDate instanceof Date
            ? m.lastReplacementDate.toISOString().split('T')[0]
            : typeof m.lastReplacementDate === 'string'
            ? m.lastReplacementDate
            : new Date(m.lastReplacementDate).toISOString().split('T')[0],
        })),
      }

      const response = await fetch("/api/machines", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || "Une erreur est survenue lors de la création de la machine")
        setLoading(false)
        return
      }

      setSuccess(true)
      // Redirection après 2 secondes
      setTimeout(() => {
        router.push("/dashboard/machines")
      }, 2000)
    } catch (err) {
      setError("Une erreur est survenue lors de la création de la machine")
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardContent className="p-6">
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
              <h2 className="text-2xl font-bold">Machine créée avec succès</h2>
              <p className="text-muted-foreground text-balance">
                Redirection vers la liste des machines...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Ajouter une machine</CardTitle>
          <CardDescription>
            Remplissez les informations de la machine et configurez ses maintenances
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              {error && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
                  {error}
                </div>
              )}

              {/* Informations de la machine */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Informations de la machine</h3>
                
                <Field>
                  <FieldLabel htmlFor="name">Nom de la machine</FieldLabel>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Machine de production #1"
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
                  <FieldLabel htmlFor="serialNumber">Numéro de série</FieldLabel>
                  <Input
                    id="serialNumber"
                    type="text"
                    placeholder="SN-2024-001"
                    {...register("serialNumber")}
                    disabled={loading}
                    aria-invalid={errors.serialNumber ? "true" : "false"}
                  />
                  {errors.serialNumber && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      {errors.serialNumber.message}
                    </p>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="catalogLink">Lien du catalogue (optionnel)</FieldLabel>
                  <Input
                    id="catalogLink"
                    type="url"
                    placeholder="https://example.com/catalog"
                    {...register("catalogLink")}
                    disabled={loading}
                    aria-invalid={errors.catalogLink ? "true" : "false"}
                  />
                  {errors.catalogLink && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      {errors.catalogLink.message}
                    </p>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="operatingHours">
                    Heures d'exploitation
                  </FieldLabel>
                  <Input
                    id="operatingHours"
                    type="number"
                    min="0"
                    placeholder="0"
                    {...register("operatingHours", { valueAsNumber: true })}
                    disabled={loading}
                    aria-invalid={errors.operatingHours ? "true" : "false"}
                  />
                  <FieldDescription>
                    Nombre total d'heures d'exploitation de la machine
                  </FieldDescription>
                  {errors.operatingHours && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      {errors.operatingHours.message}
                    </p>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="notificationAdvanceHours">
                    Heures d'avance de notification
                  </FieldLabel>
                  <Input
                    id="notificationAdvanceHours"
                    type="number"
                    min="0.001"
                    step="0.001"
                    placeholder="24"
                    {...register("notificationAdvanceHours", { valueAsNumber: true })}
                    disabled={loading}
                    aria-invalid={errors.notificationAdvanceHours ? "true" : "false"}
                  />
                  <FieldDescription>
                    Un e-mail sera envoyé lorsque le nombre d'heures restantes avant la prochaine maintenance sera inférieur à ce seuil
                  </FieldDescription>
                  {errors.notificationAdvanceHours && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      {errors.notificationAdvanceHours.message}
                    </p>
                  )}
                </Field>
              </div>

              <Separator />

              {/* Section Maintenances */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Maintenances</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      append({
                        name: "",
                        type: "PART",
                        replacementIntervalHours: 1000,
                        lastReplacementDate: new Date().toISOString().split("T")[0] as any,
                      })
                    }
                    disabled={loading}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter une maintenance
                  </Button>
                </div>

                {fields.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Aucune maintenance ajoutée. Cliquez sur "Ajouter une maintenance" pour commencer.
                  </p>
                )}

                {fields.map((field, index) => (
                  <Card key={field.id} className="relative">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-4">
                        <h4 className="font-medium">Maintenance #{index + 1}</h4>
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => remove(index)}
                            disabled={loading}
                            className="text-red-600 hover:text-red-700 dark:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <FieldGroup>
                        <Field>
                          <FieldLabel htmlFor={`maintenances.${index}.name`}>
                            Nom de la maintenance
                          </FieldLabel>
                          <Input
                            id={`maintenances.${index}.name`}
                            type="text"
                            placeholder="Filtre à huile"
                            {...register(`maintenances.${index}.name`)}
                            disabled={loading}
                            aria-invalid={errors.maintenances?.[index]?.name ? "true" : "false"}
                          />
                          {errors.maintenances?.[index]?.name && (
                            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                              {errors.maintenances[index]?.name?.message}
                            </p>
                          )}
                        </Field>

                        <Field>
                          <FieldLabel htmlFor={`maintenances.${index}.type`}>
                            Type de maintenance
                          </FieldLabel>
                          <Select
                            id={`maintenances.${index}.type`}
                            {...register(`maintenances.${index}.type`)}
                            disabled={loading}
                            aria-invalid={errors.maintenances?.[index]?.type ? "true" : "false"}
                          >
                            <option value="PART">PART</option>
                            <option value="OIL">OIL</option>
                          </Select>
                          {errors.maintenances?.[index]?.type && (
                            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                              {errors.maintenances[index]?.type?.message}
                            </p>
                          )}
                        </Field>

                        <Field>
                          <FieldLabel htmlFor={`maintenances.${index}.replacementIntervalHours`}>
                            Intervalle de remplacement (en heures)
                          </FieldLabel>
                          <Input
                            id={`maintenances.${index}.replacementIntervalHours`}
                            type="number"
                            min="0.001"
                            step="0.001"
                            placeholder="1000"
                            {...register(`maintenances.${index}.replacementIntervalHours`, {
                              valueAsNumber: true,
                            })}
                            disabled={loading}
                            aria-invalid={errors.maintenances?.[index]?.replacementIntervalHours ? "true" : "false"}
                          />
                          <FieldDescription>
                            Nombre d'heures avant le remplacement de cette maintenance
                          </FieldDescription>
                          {errors.maintenances?.[index]?.replacementIntervalHours && (
                            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                              {errors.maintenances[index]?.replacementIntervalHours?.message}
                            </p>
                          )}
                        </Field>

                        <Field>
                          <FieldLabel htmlFor={`maintenances.${index}.lastReplacementDate`}>
                            Date du dernier remplacement
                          </FieldLabel>
                          <Input
                            id={`maintenances.${index}.lastReplacementDate`}
                            type="date"
                            {...register(`maintenances.${index}.lastReplacementDate`)}
                            disabled={loading}
                            aria-invalid={errors.maintenances?.[index]?.lastReplacementDate ? "true" : "false"}
                          />
                          {errors.maintenances?.[index]?.lastReplacementDate && (
                            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                              {errors.maintenances[index]?.lastReplacementDate?.message}
                            </p>
                          )}
                        </Field>
                      </FieldGroup>
                    </CardContent>
                  </Card>
                ))}

                {errors.maintenances && typeof errors.maintenances === "object" && "message" in errors.maintenances && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.maintenances.message as string}
                  </p>
                )}
              </div>

              <Separator />

              <Field>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Création en cours..." : "Créer la machine"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

