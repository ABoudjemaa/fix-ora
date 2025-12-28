import { useState, useEffect } from "react"
import { Machine, Maintenance } from "@prisma/client"

type MachineWithMaintenances = Machine & {
  maintenances: Maintenance[]
}

type useGetMachinesReturn = {
  machines: MachineWithMaintenances[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useGetMachines(): useGetMachinesReturn {
  const [machines, setMachines] = useState<MachineWithMaintenances[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMachines = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/machines")
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des machines")
      }
      const data = await response.json()
      setMachines(data.machines || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
      setMachines([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMachines()
  }, [])

  return {
    machines,
    loading,
    error,
    refetch: fetchMachines,
  }
}

