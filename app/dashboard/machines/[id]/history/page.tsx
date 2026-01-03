"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { AlertCircle } from "lucide-react";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";

import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import DataTable from "@/components/data-table";
import { DataTablePagination } from "@/components/data-table-pagination";
import { HistoryColumns } from "@/components/columns/history-columns";
import { useGetMaintenanceHistory } from "@/hooks/use-get-maintenance-history";

export default function MaintenanceHistoryPage() {
  const params = useParams();
  const { maintenanceRecords, machineName, loading, error } =
    useGetMaintenanceHistory(params.id as string);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data: maintenanceRecords,
    columns: HistoryColumns,
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
  });


  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 md:p-6 md:pt-0">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Historique des maintenances</h1>
            {machineName && (
              <p className="text-muted-foreground text-sm">
                Machine: {machineName}
              </p>
            )}
          </div>
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
      ) : (
        <div className="w-full">
          <div className="flex items-center py-4">
            <Input
              placeholder="Filtrer par nom..."
              value={(table.getColumn("maintenance_name")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn("maintenance_name")?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
          </div>
          <DataTable table={table} columns={HistoryColumns} />
          <div className="py-4">
            <DataTablePagination table={table} />
          </div>
        </div>
      )}
    </div>
  );
}
