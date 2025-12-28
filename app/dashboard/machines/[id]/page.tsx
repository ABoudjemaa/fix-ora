"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Calendar, Clock, Hash, Wrench, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

type Machine = {
  id: string
  name: string
  serialNumber: string
  createdAt: string
  notificationHours: number
  createdAtRecord: string
  updatedAt: string
  maintenances: {
    id: string
    name: string
    type: "PIECE" | "VIDANGE"
    lifespanHours: number
    lastReplacementDate: string
    createdAt: string
    updatedAt: string
  }[]
  company: {
    name: string
    crn: string
  }
}

export default function MachineDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const [machine, setMachine] = useState<Machine | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMachine() {
      try {
        const id = params.id as string
        const response = await fetch(`/api/machines/${id}`)
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Machine non trouvée")
          }
          throw new Error("Erreur lors de la récupération de la machine")
        }
        const data = await response.json()
        setMachine(data.machine)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Une erreur est survenue")
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchMachine()
    }
  }, [params.id])

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

  const calculateNextMaintenance = (lastReplacementDate: string, lifespanHours: number) => {
    const lastDate = new Date(lastReplacementDate)
    const nextDate = new Date(lastDate.getTime() + lifespanHours * 60 * 60 * 1000)
    return nextDate
  }

  const getMaintenanceTypeLabel = (type: "PIECE" | "VIDANGE") => {
    return type === "PIECE" ? "Pièce" : "Vidange"
  }

  const getMaintenanceTypeVariant = (type: "PIECE" | "VIDANGE") => {
    return type === "PIECE" ? "default" : "secondary"
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 md:p-6 md:pt-0">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard/machines")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
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
              <Card>
                <CardHeader>
                  <Skeleton className="h-8 w-64" />
                  <Skeleton className="h-4 w-96" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : machine ? (
            <div className="space-y-6">
              {/* Informations principales */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl">{machine.name}</CardTitle>
                      <CardDescription className="mt-2">
                        Détails de la machine
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Hash className="mt-0.5 h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Numéro de série</p>
                          <p className="text-muted-foreground text-sm">{machine.serialNumber}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Calendar className="mt-0.5 h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Date de création</p>
                          <p className="text-muted-foreground text-sm">
                            {formatDate(machine.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Clock className="mt-0.5 h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Heures avant notification</p>
                          <p className="text-muted-foreground text-sm">
                            {machine.notificationHours} heures
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium mb-1">Entreprise</p>
                        <p className="text-muted-foreground text-sm">{machine.company.name}</p>
                        <p className="text-muted-foreground text-xs mt-1">
                          CRN: {machine.company.crn}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-1">Créé le</p>
                        <p className="text-muted-foreground text-sm">
                          {formatDateTime(machine.createdAtRecord)}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-1">Modifié le</p>
                        <p className="text-muted-foreground text-sm">
                          {formatDateTime(machine.updatedAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Maintenances */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Wrench className="h-5 w-5" />
                    <CardTitle>Maintenances</CardTitle>
                  </div>
                  <CardDescription>
                    Liste des maintenances associées à cette machine
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {machine.maintenances.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        Aucune maintenance enregistrée pour cette machine.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {machine.maintenances.map((maintenance) => {
                        const nextMaintenanceDate = calculateNextMaintenance(
                          maintenance.lastReplacementDate,
                          maintenance.lifespanHours
                        )
                        const now = new Date()
                        const daysUntilMaintenance = Math.ceil(
                          (nextMaintenanceDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
                        )
                        const isDueSoon = daysUntilMaintenance <= 30

                        return (
                          <div
                            key={maintenance.id}
                            className="rounded-lg border p-4 space-y-3"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-semibold">{maintenance.name}</h4>
                                  <Badge variant={getMaintenanceTypeVariant(maintenance.type)}>
                                    {getMaintenanceTypeLabel(maintenance.type)}
                                  </Badge>
                                </div>
                                <div className="grid gap-2 text-sm md:grid-cols-2">
                                  <div>
                                    <p className="text-muted-foreground">Durée de vie</p>
                                    <p className="font-medium">{maintenance.lifespanHours} heures</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Dernier remplacement</p>
                                    <p className="font-medium">
                                      {formatDate(maintenance.lastReplacementDate)}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Prochaine maintenance</p>
                                    <p className={`font-medium ${isDueSoon ? "text-orange-600 dark:text-orange-400" : ""}`}>
                                      {formatDate(nextMaintenanceDate.toISOString())}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Jours restants</p>
                                    <p className={`font-medium ${isDueSoon ? "text-orange-600 dark:text-orange-400" : ""}`}>
                                      {daysUntilMaintenance > 0 ? `${daysUntilMaintenance} jours` : "Maintenance due"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                            {isDueSoon && (
                              <div className="flex items-center gap-2 rounded-md bg-orange-50 p-2 text-sm text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">
                                <AlertCircle className="h-4 w-4" />
                                <span>Maintenance prévue dans moins de 30 jours</span>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : null}
        </div>
  )
}

