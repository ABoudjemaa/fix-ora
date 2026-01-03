"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  Hash,
  Wrench,
  AlertCircle,
  Edit,
  Play,
  History,
  ChevronRight,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import DeleteMachineDialog from "@/components/dialogs/delete-machine-dialog";
import { formatDateTime, formatDate } from "@/lib/utils";
import { getMaintenanceTypeLabel, getMaintenanceTypeVariant } from "@/lib/utils";

type Machine = {
  id: string;
  name: string;
  serialNumber: string;
  catalogLink: string | null;
  operatingHours: number;
  notificationAdvanceHours: number;
  createdAtRecord: string;
  updatedAt: string;
  maintenances: {
    id: string;
    name: string;
    type: "PART" | "OIL";
    replacementIntervalHours: number;
    lastReplacementDate: string;
    createdAt: string;
    updatedAt: string;
    notifications: {
      id: string;
      urgency: "APPROACHING" | "REQUIRED";
      status: "ACTIVE" | "MAINTENANCE_STARTED";
    }[];
  }[];
  maintenanceRecords?: {
    id: string;
    startedAt: string;
    completedAt: string | null;
    comment: string | null;
    status: "IN_PROGRESS" | "COMPLETED";
    maintenance: {
      id: string;
      name: string;
      type: "PART" | "OIL";
    };
  }[];
  company: {
    name: string;
    crn: string;
  };
};

export default function MachineDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const [machine, setMachine] = useState<Machine | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);


  useEffect(() => {
    async function fetchMachine() {
      try {
        const id = params.id as string;
        const response = await fetch(`/api/machines/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Machine non trouvée");
          }
          throw new Error("Erreur lors de la récupération de la machine");
        }
        const data = await response.json();
        setMachine(data.machine);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Une erreur est survenue"
        );
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchMachine();
    }
  }, [params.id]);


  const calculateNextMaintenance = (
    lastReplacementDate: string,
    replacementIntervalHours: number
  ) => {
    const lastDate = new Date(lastReplacementDate);
    const nextDate = new Date(
      lastDate.getTime() + replacementIntervalHours * 60 * 60 * 1000
    );
    return nextDate;
  };

  const handleStartMaintenance = async (notificationId: string) => {
    setProcessing(notificationId);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch(
        `/api/notifications/${notificationId}/start-maintenance`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        const result = await response.json();
        throw new Error(
          result.error || "Erreur lors du démarrage de la maintenance"
        );
      }

      setSuccess("Maintenance démarrée avec succès");
      // Refresh machine data
      const id = params.id as string;
      const machineResponse = await fetch(`/api/machines/${id}`);
      if (machineResponse.ok) {
        const data = await machineResponse.json();
        setMachine(data.machine);
      }
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setProcessing(null);
    }
  };


  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 md:p-6 md:pt-0">
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/dashboard/machines")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/dashboard/machines/${params.id}/edit`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer
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

      {success && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <p>{success}</p>
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
                      <p className="text-muted-foreground text-sm">
                        {machine.serialNumber}
                      </p>
                    </div>
                  </div>

                  {machine.catalogLink && (
                    <div className="flex items-start gap-3">
                      <Hash className="mt-0.5 h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Lien du catalogue</p>
                        <a
                          href={machine.catalogLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground text-sm hover:underline"
                        >
                          {machine.catalogLink}
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <Clock className="mt-0.5 h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        Heures d'exploitation
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {machine.operatingHours} heures
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="mt-0.5 h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        Heures d'avance de notification
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {machine.notificationAdvanceHours} heures
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-1">Entreprise</p>
                    <p className="text-muted-foreground text-sm">
                      {machine.company.name}
                    </p>
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
                      maintenance.replacementIntervalHours
                    );
                    const now = new Date();
                    const daysUntilMaintenance = Math.ceil(
                      (nextMaintenanceDate.getTime() - now.getTime()) /
                        (1000 * 60 * 60 * 24)
                    );
                    const isDueSoon = daysUntilMaintenance <= 30;

                    return (
                      <div
                        key={maintenance.id}
                        className="rounded-lg border p-4 space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold">
                                {maintenance.name}
                              </h4>
                              <Badge
                                variant={getMaintenanceTypeVariant(
                                  maintenance.type
                                )}
                              >
                                {getMaintenanceTypeLabel(maintenance.type)}
                              </Badge>
                            </div>
                            <div className="grid gap-2 text-sm md:grid-cols-2">
                              <div>
                                <p className="text-muted-foreground">
                                  Intervalle de remplacement
                                </p>
                                <p className="font-medium">
                                  {maintenance.replacementIntervalHours} heures
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">
                                  Dernier remplacement
                                </p>
                                <p className="font-medium">
                                  {formatDate(maintenance.lastReplacementDate)}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">
                                  Prochaine maintenance
                                </p>
                                <p
                                  className={`font-medium ${
                                    isDueSoon
                                      ? "text-orange-600 dark:text-orange-400"
                                      : ""
                                  }`}
                                >
                                  {formatDate(
                                    nextMaintenanceDate.toISOString()
                                  )}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">
                                  Jours restants
                                </p>
                                <p
                                  className={`font-medium ${
                                    isDueSoon
                                      ? "text-orange-600 dark:text-orange-400"
                                      : ""
                                  }`}
                                >
                                  {daysUntilMaintenance > 0
                                    ? `${daysUntilMaintenance} jours`
                                    : "Maintenance due"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        {maintenance.notifications &&
                          maintenance.notifications.length > 0 && (
                            <div className="flex items-center gap-2 rounded-md bg-red-50 p-2 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
                              <AlertCircle className="h-4 w-4" />
                              <span>Maintenance requise</span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleStartMaintenance(
                                    maintenance.notifications[0].id
                                  )
                                }
                                disabled={
                                  processing === maintenance.notifications[0].id
                                }
                                className="ml-auto"
                              >
                                <Play className="mr-2 h-3 w-3" />
                                {processing === maintenance.notifications[0].id
                                  ? "Traitement..."
                                  : "Démarrer la maintenance"}
                              </Button>
                            </div>
                          )}
                        {isDueSoon &&
                          maintenance.notifications &&
                          maintenance.notifications.length === 0 && (
                            <div className="flex items-center gap-2 rounded-md bg-orange-50 p-2 text-sm text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">
                              <AlertCircle className="h-4 w-4" />
                              <span>
                                Maintenance prévue dans moins de 30 jours
                              </span>
                            </div>
                          )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Historique des maintenances */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  <CardTitle>Historique des maintenances</CardTitle>
                </div>
                {machine.maintenanceRecords &&
                  machine.maintenanceRecords.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        router.push(`/dashboard/machines/${params.id}/history`)
                      }
                    >
                      Voir plus
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
              </div>
              <CardDescription>
                Les trois dernières maintenances effectuées
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!machine.maintenanceRecords ||
              machine.maintenanceRecords.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Aucun historique de maintenance disponible.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {machine.maintenanceRecords.map((record) => (
                    <div
                      key={record.id}
                      className="rounded-lg border p-4 space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">
                              {record.maintenance.name}
                            </h4>
                            <Badge
                              variant={
                                record.maintenance.type === "PART"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {getMaintenanceTypeLabel(record.maintenance.type)}
                            </Badge>
                            <Badge
                              variant={
                                record.status === "COMPLETED"
                                  ? "default"
                                  : "outline"
                              }
                            >
                              {record.status === "COMPLETED"
                                ? "Terminée"
                                : "En cours"}
                            </Badge>
                          </div>
                          <div className="grid gap-2 text-sm md:grid-cols-2">
                            <div>
                              <p className="text-muted-foreground">
                                Date de début
                              </p>
                              <p className="font-medium">
                                {formatDateTime(record.startedAt)}
                              </p>
                            </div>
                            {record.completedAt && (
                              <div>
                                <p className="text-muted-foreground">
                                  Date de fin
                                </p>
                                <p className="font-medium">
                                  {formatDateTime(record.completedAt)}
                                </p>
                              </div>
                            )}
                            {record.comment && (
                              <div className="md:col-span-2">
                                <p className="text-muted-foreground">
                                  Commentaire
                                </p>
                                <p className="font-medium italic">
                                  "{record.comment}"
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Dialogue de suppression */}
      {machine && (
      <DeleteMachineDialog
        deleteDialogOpen={deleteDialogOpen}
        setDeleteDialogOpen={setDeleteDialogOpen}
        machine={{
          id: machine.id,
          name: machine.name
        }}
      />)}
    </div>
  );
}
