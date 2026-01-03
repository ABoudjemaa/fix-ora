import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle2 } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import {
  getMaintenanceTypeLabel,
  getMaintenanceTypeVariant,
} from "@/lib/utils";
import { MaintenanceRecord } from "@/hooks/use-get-maintenance-history";

export const HistoryColumns: ColumnDef<MaintenanceRecord>[] = [
  {
    id: "maintenance_name",
    accessorFn: (row) => row.maintenance?.name ?? "",
    enableColumnFilter: true,
    filterFn: (row, columnId, filterValue) => {
      // Utiliser directement row.original car accessorFn peut ne pas être accessible via getValue
      const value = row.original.maintenance?.name ?? "";
      if (!filterValue || filterValue === "") return true;
      if (!value) return false;
      return value.toLowerCase().includes(String(filterValue).toLowerCase());
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Maintenance" />
    ),
    cell: ({ row }) => {
      const record = row.original;
      return (
        <div className="flex items-center gap-2">
          <span className="font-medium">{record.maintenance?.name}</span>
          <Badge variant={getMaintenanceTypeVariant(record.maintenance?.type)}>
            {getMaintenanceTypeLabel(record.maintenance?.type)}
          </Badge>
        </div>
      );
    },
  }
  ,
  {
    accessorKey: "startedAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date de début" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{formatDateTime(row.getValue("startedAt"))}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "completedAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date de fin" />
    ),
    cell: ({ row }) => {
      const completedAt = row.getValue("completedAt") as string | null;
      return completedAt ? (
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <span>{formatDateTime(completedAt)}</span>
        </div>
      ) : (
        <span className="text-muted-foreground">En cours</span>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Statut" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge variant={status === "COMPLETED" ? "default" : "outline"}>
          {status === "COMPLETED" ? "Terminée" : "En cours"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "comment",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Commentaire" />
    ),
    cell: ({ row }) => {
      const comment = row.getValue("comment") as string | null;
      return comment ? (
        <p className="max-w-md text-sm italic">{comment}</p>
      ) : (
        <span className="text-muted-foreground">-</span>
      );
    },
  },
];
