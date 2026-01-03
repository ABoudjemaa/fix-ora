"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTablePagination } from "@/components/data-table-pagination"
import { MachinesColumns } from "@/components/columns/machines-columns"
import { useGetMachines } from "@/hooks/use-get-machines"
import DataTable from "@/components/data-table"

export default function MachinesPage() {
  const router = useRouter()
  const { machines, loading, error, refetch } = useGetMachines()
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})

  const columns = MachinesColumns(router)

  const table = useReactTable({
    data: machines,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 md:p-6 md:pt-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Machines</h1>
              <p className="text-muted-foreground text-sm">
                Gérez vos machines et leurs maintenances
              </p>
            </div>
            <Button onClick={() => router.push("/dashboard/machines/add")}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter une machine
            </Button>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Chargement...</p>
            </div>
          ) : (
            <div className="w-full">
              <div className="flex items-center py-4">
                <Input
                  placeholder="Filtrer par nom..."
                  value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                  onChange={(event) =>
                    table.getColumn("name")?.setFilterValue(event.target.value)
                  }
                  className="max-w-sm"
                />
              </div>
              <DataTable table={table} columns={columns} />
              <div className="py-4">
                <DataTablePagination table={table} />
              </div>
            </div>
          )}
        </div>
  )
}

