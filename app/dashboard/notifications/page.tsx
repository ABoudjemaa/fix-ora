"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Bell, Wrench, AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

type Notification = {
  id: string
  serviceType: "PART" | "OIL"
  urgency: "APPROACHING" | "REQUIRED"
  status: "ACTIVE" | "SERVICE_STARTED"
  triggeredAt: string
  machine: {
    id: string
    name: string
    serialNumber: string
    operatingHours: number
  }
  maintenance: {
    id: string
    name: string
    type: "PART" | "OIL"
    replacementIntervalHours: number
    lastReplacementDate: string
  }
}

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/notifications")
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des notifications")
      }
      const data = await response.json()
      setNotifications(data.notifications || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
    } finally {
      setLoading(false)
    }
  }

  const handleStartService = async (notificationId: string) => {
    setProcessing(notificationId)
    try {
      const response = await fetch(`/api/notifications/${notificationId}/start-service`, {
        method: "POST",
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || "Erreur lors du démarrage du service")
      }

      // Remove notification from list
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
    } finally {
      setProcessing(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getUrgencyVariant = (urgency: "APPROACHING" | "REQUIRED") => {
    return urgency === "REQUIRED" ? "destructive" : "default"
  }

  const getUrgencyLabel = (urgency: "APPROACHING" | "REQUIRED") => {
    return urgency === "REQUIRED" ? "Requis" : "Approche"
  }

  const getServiceTypeLabel = (type: "PART" | "OIL") => {
    return type === "PART" ? "Pièce" : "Huile"
  }

  // Calculate hours until due
  const calculateHoursUntilDue = (notification: Notification) => {
    const lastReplacement = new Date(notification.maintenance.lastReplacementDate)
    const now = new Date()
    const hoursSinceLastReplacement = (now.getTime() - lastReplacement.getTime()) / (1000 * 60 * 60)
    const hoursUntilDue = notification.maintenance.replacementIntervalHours - hoursSinceLastReplacement
    return hoursUntilDue
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 md:p-6 md:pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground text-sm">
            Services de maintenance à effectuer
          </p>
        </div>
        <Button variant="outline" onClick={fetchNotifications}>
          Actualiser
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
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucune notification</h3>
              <p className="text-muted-foreground">
                Tous les services de maintenance sont à jour.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => {
            const hoursUntilDue = calculateHoursUntilDue(notification)
            const isOverdue = hoursUntilDue < 0

            return (
              <Card key={notification.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <Bell
                          className={`h-5 w-5 ${
                            notification.urgency === "REQUIRED"
                              ? "text-red-600 dark:text-red-400"
                              : "text-orange-600 dark:text-orange-400"
                          }`}
                        />
                        <h3 className="text-lg font-semibold">
                          {notification.machine.name}
                        </h3>
                        <Badge variant={getUrgencyVariant(notification.urgency)}>
                          {getUrgencyLabel(notification.urgency)}
                        </Badge>
                        <Badge variant="outline">
                          {getServiceTypeLabel(notification.serviceType)}
                        </Badge>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Maintenance: </span>
                          <span className="font-medium">{notification.maintenance.name}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Machine: </span>
                          <button
                            onClick={() =>
                              router.push(`/dashboard/machines/${notification.machine.id}`)
                            }
                            className="font-medium hover:underline"
                          >
                            {notification.machine.name} ({notification.machine.serialNumber})
                          </button>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Heures d'exploitation: </span>
                          <span className="font-medium">{notification.machine.operatingHours} h</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Intervalle de remplacement: </span>
                          <span className="font-medium">
                            {notification.maintenance.replacementIntervalHours} h
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Dernier remplacement: </span>
                          <span className="font-medium">
                            {new Date(
                              notification.maintenance.lastReplacementDate
                            ).toLocaleDateString("fr-FR")}
                          </span>
                        </div>
                        <div>
                          <span
                            className={`font-medium ${
                              isOverdue
                                ? "text-red-600 dark:text-red-400"
                                : "text-orange-600 dark:text-orange-400"
                            }`}
                          >
                            {isOverdue
                              ? `En retard de ${Math.abs(Math.round(hoursUntilDue))} heures`
                              : `Dans ${Math.round(hoursUntilDue)} heures`}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                          Notifié le: {formatDate(notification.triggeredAt)}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={() => handleStartService(notification.id)}
                        disabled={processing === notification.id}
                        variant={notification.urgency === "REQUIRED" ? "default" : "outline"}
                      >
                        {processing === notification.id ? "Traitement..." : "Démarrer le service"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          router.push(`/dashboard/machines/${notification.machine.id}`)
                        }
                      >
                        Voir la machine
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push("/dashboard/machines/in-service")}
                      >
                        Machines en service
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

