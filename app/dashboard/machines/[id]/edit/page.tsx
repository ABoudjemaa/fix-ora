"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Save, Plus } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { machineUpdateSchema, maintenanceSchema } from "@/lib/validations/machine"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Select } from "@/components/ui/select"

type Machine = {
  id: string
  name: string
  serialNumber: string
  catalogLink: string | null
  operatingHours: number
  notificationAdvanceHours: number
}

type Maintenance = {
  id: string
  name: string
  type: "PART" | "OIL"
  replacementIntervalHours: number
  lastReplacementDate: string
  createdAt: string
  updatedAt: string
}

export default function EditMachinePage() {
  const router = useRouter()
  const params = useParams()
  const [machine, setMachine] = useState<Machine | null>(null)
  const [maintenances, setMaintenances] = useState<Maintenance[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(machineUpdateSchema),
  })

  // Load machine and maintenances
  useEffect(() => {
    async function fetchData() {
      try {
        const id = params.id as string
        const [machineResponse, maintenancesResponse] = await Promise.all([
          fetch(`/api/machines/${id}`),
          fetch(`/api/machines/${id}/maintenances`),
        ])

        if (!machineResponse.ok) {
          if (machineResponse.status === 404) {
            throw new Error("Machine non trouvée")
          }
          throw new Error("Erreur lors de la récupération de la machine")
        }

        if (!maintenancesResponse.ok) {
          throw new Error("Erreur lors de la récupération des maintenances")
        }

        const machineData = await machineResponse.json()
        const maintenancesData = await maintenancesResponse.json()

        setMachine(machineData.machine)
        setMaintenances(maintenancesData.maintenances || [])
        reset({
          name: machineData.machine.name,
          serialNumber: machineData.machine.serialNumber,
          catalogLink: machineData.machine.catalogLink || "",
          operatingHours: machineData.machine.operatingHours,
          notificationAdvanceHours: machineData.machine.notificationAdvanceHours,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : "Une erreur est survenue")
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchData()
    }
  }, [params.id, reset])

  // Refresh maintenances list
  const refreshMaintenances = async () => {
    try {
      const id = params.id as string
      const response = await fetch(`/api/machines/${id}/maintenances`)
      if (response.ok) {
        const data = await response.json()
        setMaintenances(data.maintenances || [])
      }
    } catch (err) {
      console.error("Erreur lors du rafraîchissement des maintenances:", err)
    }
  }

  // Save machine fields
  const onSaveMachine = async (data: any) => {
    setError(null)
    setSaving(true)
    setSuccess(false)

    try {
      const id = params.id as string
      const payload = {
        ...data,
        catalogLink: data.catalogLink || null,
      }

      const response = await fetch(`/api/machines/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || "Une erreur est survenue lors de la mise à jour")
        setSaving(false)
        return
      }

      setSuccess(true)
      setMachine(result.machine)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError("Une erreur est survenue lors de la mise à jour")
    } finally {
      setSaving(false)
    }
  }

  // Add maintenance
  const handleAddMaintenance = async (data: any) => {
    try {
      const id = params.id as string
      const payload = {
        ...data,
        lastReplacementDate: data.lastReplacementDate instanceof Date
          ? data.lastReplacementDate.toISOString().split('T')[0]
          : typeof data.lastReplacementDate === 'string'
          ? data.lastReplacementDate
          : new Date(data.lastReplacementDate).toISOString().split('T')[0],
      }

      const response = await fetch(`/api/machines/${id}/maintenances`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || "Erreur lors de l'ajout de la maintenance")
      }

      await refreshMaintenances()
      return true
    } catch (err) {
      throw err
    }
  }

  // Update maintenance
  const handleUpdateMaintenance = async (maintenanceId: string, data: any) => {
    try {
      const id = params.id as string
      const payload: any = {}
      if (data.name !== undefined) payload.name = data.name
      if (data.type !== undefined) payload.type = data.type
      if (data.replacementIntervalHours !== undefined) payload.replacementIntervalHours = data.replacementIntervalHours
      if (data.lastReplacementDate !== undefined) {
        payload.lastReplacementDate = data.lastReplacementDate instanceof Date
          ? data.lastReplacementDate.toISOString().split('T')[0]
          : typeof data.lastReplacementDate === 'string'
          ? data.lastReplacementDate
          : new Date(data.lastReplacementDate).toISOString().split('T')[0]
      }

      const response = await fetch(`/api/machines/${id}/maintenances/${maintenanceId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || "Erreur lors de la mise à jour de la maintenance")
      }

      await refreshMaintenances()
      return true
    } catch (err) {
      throw err
    }
  }

  // Delete maintenance
  const handleDeleteMaintenance = async (maintenanceId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette maintenance ?")) {
      return
    }

    try {
      const id = params.id as string
      const response = await fetch(`/api/machines/${id}/maintenances/${maintenanceId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || "Erreur lors de la suppression de la maintenance")
      }

      await refreshMaintenances()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 md:p-6 md:pt-0">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error && !machine) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 md:p-6 md:pt-0">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 md:p-6 md:pt-0">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/dashboard/machines/${params.id}`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-400">
          Machine mise à jour avec succès
        </div>
      )}

      {machine && (
        <form onSubmit={handleSubmit(onSaveMachine)}>
          <Card>
            <CardHeader>
              <CardTitle>Modifier la machine</CardTitle>
              <CardDescription>
                Modifiez les informations de la machine
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="name">Nom de la machine</FieldLabel>
                  <Input
                    id="name"
                    type="text"
                    {...register("name")}
                    disabled={saving}
                    aria-invalid={errors.name ? "true" : "false"}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      {errors.name.message as string}
                    </p>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="serialNumber">Numéro de série</FieldLabel>
                  <Input
                    id="serialNumber"
                    type="text"
                    {...register("serialNumber")}
                    disabled={saving}
                    aria-invalid={errors.serialNumber ? "true" : "false"}
                  />
                  {errors.serialNumber && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      {errors.serialNumber.message as string}
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
                    disabled={saving}
                    aria-invalid={errors.catalogLink ? "true" : "false"}
                  />
                  {errors.catalogLink && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      {errors.catalogLink.message as string}
                    </p>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="operatingHours">Heures d'exploitation</FieldLabel>
                  <Input
                    id="operatingHours"
                    type="number"
                    min="0"
                    {...register("operatingHours", { valueAsNumber: true })}
                    disabled={saving}
                    aria-invalid={errors.operatingHours ? "true" : "false"}
                  />
                  {errors.operatingHours && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      {errors.operatingHours.message as string}
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
                    min="1"
                    {...register("notificationAdvanceHours", { valueAsNumber: true })}
                    disabled={saving}
                    aria-invalid={errors.notificationAdvanceHours ? "true" : "false"}
                  />
                  {errors.notificationAdvanceHours && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      {errors.notificationAdvanceHours.message as string}
                    </p>
                  )}
                </Field>

                <Field>
                  <Button type="submit" disabled={saving}>
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? "Enregistrement..." : "Enregistrer les modifications"}
                  </Button>
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>
        </form>
      )}

      <MaintenancesManager
        maintenances={maintenances}
        onAdd={handleAddMaintenance}
        onUpdate={handleUpdateMaintenance}
        onDelete={handleDeleteMaintenance}
      />
    </div>
  )
}

// Maintenances Manager Component
function MaintenancesManager({
  maintenances,
  onAdd,
  onUpdate,
  onDelete,
}: {
  maintenances: Maintenance[]
  onAdd: (data: any) => Promise<boolean>
  onUpdate: (id: string, data: any) => Promise<boolean>
  onDelete: (id: string) => Promise<void>
}) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const {
    register: registerAdd,
    handleSubmit: handleSubmitAdd,
    reset: resetAdd,
    formState: { errors: errorsAdd },
  } = useForm({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      name: "",
      type: "PART" as const,
      replacementIntervalHours: 1000,
      lastReplacementDate: new Date().toISOString().split("T")[0],
    },
  })

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    formState: { errors: errorsEdit },
  } = useForm({
    resolver: zodResolver(maintenanceSchema.partial()),
  })

  const handleAdd = async (data: any) => {
    setError(null)
    setLoading(true)
    try {
      await onAdd(data)
      setShowAddForm(false)
      resetAdd()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'ajout")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (maintenance: Maintenance) => {
    setEditingId(maintenance.id)
    resetEdit({
      name: maintenance.name,
      type: maintenance.type,
      replacementIntervalHours: maintenance.replacementIntervalHours,
      lastReplacementDate: maintenance.lastReplacementDate.split("T")[0],
    })
  }

  const handleUpdate = async (data: any) => {
    if (!editingId) return
    setError(null)
    setLoading(true)
    try {
      await onUpdate(editingId, data)
      setEditingId(null)
      resetEdit()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la mise à jour")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setShowAddForm(false)
    setEditingId(null)
    resetAdd()
    resetEdit()
    setError(null)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Maintenances</CardTitle>
            <CardDescription>
              Gérez les maintenances de cette machine
            </CardDescription>
          </div>
          {!showAddForm && !editingId && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAddForm(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Ajouter une maintenance
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400 mb-4">
            {error}
          </div>
        )}

        {/* Add Form */}
        {showAddForm && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-lg">Ajouter une maintenance</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitAdd(handleAdd)}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="add-name">Nom de la maintenance</FieldLabel>
                    <Input
                      id="add-name"
                      type="text"
                      {...registerAdd("name")}
                      disabled={loading}
                    />
                    {errorsAdd.name && (
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                        {errorsAdd.name.message}
                      </p>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="add-type">Type</FieldLabel>
                    <Select
                      id="add-type"
                      {...registerAdd("type")}
                      disabled={loading}
                    >
                      <option value="PART">PART</option>
                      <option value="OIL">OIL</option>
                    </Select>
                    {errorsAdd.type && (
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                        {errorsAdd.type.message}
                      </p>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="add-interval">Intervalle de remplacement (heures)</FieldLabel>
                    <Input
                      id="add-interval"
                      type="number"
                      min="1"
                      {...registerAdd("replacementIntervalHours", { valueAsNumber: true })}
                      disabled={loading}
                    />
                    {errorsAdd.replacementIntervalHours && (
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                        {errorsAdd.replacementIntervalHours.message}
                      </p>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="add-date">Date du dernier remplacement</FieldLabel>
                    <Input
                      id="add-date"
                      type="date"
                      {...registerAdd("lastReplacementDate")}
                      disabled={loading}
                    />
                    {errorsAdd.lastReplacementDate && (
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                        {errorsAdd.lastReplacementDate.message}
                      </p>
                    )}
                  </Field>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={loading}>
                      {loading ? "Ajout..." : "Ajouter"}
                    </Button>
                    <Button type="button" variant="outline" onClick={handleCancel}>
                      Annuler
                    </Button>
                  </div>
                </FieldGroup>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Maintenances List */}
        {maintenances.length === 0 && !showAddForm && !editingId ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Aucune maintenance enregistrée. Cliquez sur "Ajouter une maintenance" pour commencer.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {maintenances.map((maintenance) => (
              <div key={maintenance.id}>
                {editingId === maintenance.id ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Modifier la maintenance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmitEdit(handleUpdate)}>
                        <FieldGroup>
                          <Field>
                            <FieldLabel htmlFor={`edit-name-${maintenance.id}`}>Nom</FieldLabel>
                            <Input
                              id={`edit-name-${maintenance.id}`}
                              type="text"
                              {...registerEdit("name")}
                              disabled={loading}
                            />
                            {errorsEdit.name && (
                              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                                {errorsEdit.name.message}
                              </p>
                            )}
                          </Field>

                          <Field>
                            <FieldLabel htmlFor={`edit-type-${maintenance.id}`}>Type</FieldLabel>
                            <Select
                              id={`edit-type-${maintenance.id}`}
                              {...registerEdit("type")}
                              disabled={loading}
                            >
                              <option value="PART">PART</option>
                              <option value="OIL">OIL</option>
                            </Select>
                            {errorsEdit.type && (
                              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                                {errorsEdit.type.message}
                              </p>
                            )}
                          </Field>

                          <Field>
                            <FieldLabel htmlFor={`edit-interval-${maintenance.id}`}>
                              Intervalle de remplacement (heures)
                            </FieldLabel>
                            <Input
                              id={`edit-interval-${maintenance.id}`}
                              type="number"
                              min="1"
                              {...registerEdit("replacementIntervalHours", { valueAsNumber: true })}
                              disabled={loading}
                            />
                            {errorsEdit.replacementIntervalHours && (
                              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                                {errorsEdit.replacementIntervalHours.message}
                              </p>
                            )}
                          </Field>

                          <Field>
                            <FieldLabel htmlFor={`edit-date-${maintenance.id}`}>
                              Date du dernier remplacement
                            </FieldLabel>
                            <Input
                              id={`edit-date-${maintenance.id}`}
                              type="date"
                              {...registerEdit("lastReplacementDate")}
                              disabled={loading}
                            />
                            {errorsEdit.lastReplacementDate && (
                              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                                {errorsEdit.lastReplacementDate.message}
                              </p>
                            )}
                          </Field>

                          <div className="flex gap-2">
                            <Button type="submit" disabled={loading}>
                              {loading ? "Enregistrement..." : "Enregistrer"}
                            </Button>
                            <Button type="button" variant="outline" onClick={handleCancel}>
                              Annuler
                            </Button>
                          </div>
                        </FieldGroup>
                      </form>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{maintenance.name}</h4>
                            <Badge variant={maintenance.type === "PART" ? "default" : "secondary"}>
                              {maintenance.type}
                            </Badge>
                          </div>
                          <div className="grid gap-2 text-sm md:grid-cols-2">
                            <div>
                              <p className="text-muted-foreground">Intervalle de remplacement</p>
                              <p className="font-medium">{maintenance.replacementIntervalHours} heures</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Dernier remplacement</p>
                              <p className="font-medium">
                                {new Date(maintenance.lastReplacementDate).toLocaleDateString("fr-FR")}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(maintenance)}
                          >
                            Modifier
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onDelete(maintenance.id)}
                            className="text-red-600 hover:text-red-700 dark:text-red-400"
                          >
                            Supprimer
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

