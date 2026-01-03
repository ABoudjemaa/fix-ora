import { useState, useEffect, useCallback } from "react";

export type MaintenanceRecord = {
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
};

type useGetMaintenanceHistoryReturn = {
  maintenanceRecords: MaintenanceRecord[];
  machineName: string;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useGetMaintenanceHistory(
  machineId: string | undefined
): useGetMaintenanceHistoryReturn {
  const [maintenanceRecords, setMaintenanceRecords] = useState<
    MaintenanceRecord[]
  >([]);
  const [machineName, setMachineName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!machineId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Récupérer le nom de la machine
      const machineResponse = await fetch(`/api/machines/${machineId}`);
      if (!machineResponse.ok) {
        throw new Error("Erreur lors de la récupération de la machine");
      }
      const machineData = await machineResponse.json();
      setMachineName(machineData.machine.name);

      // Récupérer l'historique complet
      const response = await fetch(
        `/api/machines/${machineId}/maintenance-records`
      );
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération de l'historique");
      }
      const data = await response.json();
      setMaintenanceRecords(data.maintenanceRecords || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Une erreur est survenue"
      );
      setMaintenanceRecords([]);
      setMachineName("");
    } finally {
      setLoading(false);
    }
  }, [machineId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    maintenanceRecords,
    machineName,
    loading,
    error,
    refetch: fetchData,
  };
}

