"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Wrench, Clock, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useForm } from "react-hook-form"
import { Input } from "@/components/ui/input"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"

type Machine = {
  id: string
  name: string
  serialNumber: string
  operatingHours: number
  maintenances: {
    id: string
    name: string
    type: "PART" | "OIL"
    replacementIntervalHours: number
    lastReplacementDate: string
    notifications: {
      id: string
      urgency: "APPROACHING" | "REQUIRED"
      status: "SERVICE_STARTED"
      triggeredAt: string
    }[]
  }[]
  company: {
    name: string
    crn: string
  }
}

export default function MachinesInServicePage() {
  const router = useRouter()
  const [machines, setMachines] = useState<Machine[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedNotification, setSelectedNotification] = useState<{
    notificationId: string
    machineId: string
    maintenanceId: string
    maintenanceName: string
  } | null>(null)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchMachines()
  }, [])

  const fetchMachines = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/machines/in-service")
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des machines en service")
      }
      const data = await response.json()
      setMachines(data.machines || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
    } finally {
      setLoading(false)
    }
  }

  const handleServiceDone = async (data: { lastReplacementDate: string }) => {
    if (!selectedNotification) return

    setProcessing(true)
    setError(null)

    try {
      // Update maintenance lastReplacementDate
      // Convert date string to ISO format for API
      const dateValue = new Date(data.lastReplacementDate).toISOString()
      const response = await fetch(
        `/api/machines/${selectedNotification.machineId}/maintenances/${selectedNotification.maintenanceId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            lastReplacementDate: dateValue,
          }),
        }
      )

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || "Erreur lors de la finalisation du service")
      }

      // Close modal and refresh
      setSelectedNotification(null)
      await fetchMachines()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
    } finally {
      setProcessing(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getServiceTypeLabel = (type: "PART" | "OIL") => {
    return type === "PART" ? "Pièce" : "Huile"
  }

  const getUrgencyVariant = (urgency: "APPROACHING" | "REQUIRED") => {
    return urgency === "REQUIRED" ? "destructive" : "default"
  }

  const getUrgencyLabel = (urgency: "APPROACHING" | "REQUIRED") => {
    return urgency === "REQUIRED" ? "Requis" : "Approche"
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 md:p-6 md:pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Machines en service</h1>
          <p className="text-muted-foreground text-sm">
            Machines avec des services de maintenance en cours
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchMachines}>
            Actualiser
          </Button>
          <Button variant="ghost" onClick={() => router.push("/dashboard/machines")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
        </div>
      </div>

      {error && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-64 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : machines.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucune machine en service</h3>
              <p className="text-muted-foreground">
                Toutes les machines sont à jour.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {machines.map((machine) => {
            const servicesInProgress = machine.maintenances.filter(
              (m) => m.notifications && m.notifications.length > 0
            )

            return (
              <Card key={machine.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{machine.name}</CardTitle>
                      <CardDescription>
                        {machine.serialNumber} • {servicesInProgress.length} service(s) en cours
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/dashboard/machines/${machine.id}`)}
                    >
                      Voir les détails
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Machine Info */}
                    <div className="grid gap-4 text-sm md:grid-cols-2">
                      <div>
                        <p className="text-muted-foreground">Heures d'exploitation</p>
                        <p className="font-medium">{machine.operatingHours} h</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Entreprise</p>
                        <p className="font-medium">{machine.company.name}</p>
                      </div>
                    </div>

                    {/* Required Services */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Services requis</h3>
                      <div className="space-y-3">
                        {servicesInProgress.map((maintenance) => {
                          const notification = maintenance.notifications[0]
                          return (
                            <Card key={maintenance.id} className="border-l-4 border-l-orange-500">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <h4 className="font-semibold">{maintenance.name}</h4>
                                      <Badge variant="outline">
                                        {getServiceTypeLabel(maintenance.type)}
                                      </Badge>
                                      <Badge variant={getUrgencyVariant(notification.urgency)}>
                                        {getUrgencyLabel(notification.urgency)}
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
                                          {formatDate(maintenance.lastReplacementDate)}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-muted-foreground">Service démarré le</p>
                                        <p className="font-medium">
                                          {formatDateTime(notification.triggeredAt)}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                  <Button
                                    onClick={() =>
                                      setSelectedNotification({
                                        notificationId: notification.id,
                                        machineId: machine.id,
                                        maintenanceId: maintenance.id,
                                        maintenanceName: maintenance.name,
                                      })
                                    }
                                  >
                                    Service terminé
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          )
                        })}
                      </div>
                    </div>

                    {/* Service History (using maintenance.lastReplacementDate) */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Historique des services</h3>
                      <div className="space-y-2 text-sm">
                        {machine.maintenances.map((maintenance) => (
                          <div key={maintenance.id} className="flex items-center justify-between p-2 rounded border">
                            <div>
                              <p className="font-medium">{maintenance.name}</p>
                              <p className="text-muted-foreground text-xs">
                                Dernier remplacement: {formatDate(maintenance.lastReplacementDate)}
                              </p>
                            </div>
                            <Badge variant="outline">{getServiceTypeLabel(maintenance.type)}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Service Done Modal */}
      {selectedNotification && (
        <ServiceDoneModal
          maintenanceName={selectedNotification.maintenanceName}
          onClose={() => setSelectedNotification(null)}
          onSubmit={handleServiceDone}
          processing={processing}
        />
      )}
    </div>
  )
}

function ServiceDoneModal({
  maintenanceName,
  onClose,
  onSubmit,
  processing,
}: {
  maintenanceName: string
  onClose: () => void
  onSubmit: (data: { lastReplacementDate: string }) => void
  processing: boolean
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      lastReplacementDate: new Date().toISOString().split("T")[0],
    },
  })

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md m-4">
        <CardHeader>
          <CardTitle>Service terminé</CardTitle>
          <CardDescription>
            Marquer le service "{maintenanceName}" comme terminé
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="lastReplacementDate">Date du remplacement</FieldLabel>
                <Input
                  id="lastReplacementDate"
                  type="date"
                  {...register("lastReplacementDate", {
                    required: "La date est requise",
                  })}
                  disabled={processing}
                />
                {errors.lastReplacementDate && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    {errors.lastReplacementDate.message}
                  </p>
                )}
              </Field>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={onClose} disabled={processing}>
                  Annuler
                </Button>
                <Button type="submit" disabled={processing}>
                  {processing ? "Traitement..." : "Confirmer"}
                </Button>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

