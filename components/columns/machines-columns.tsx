import { type ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "@/components/data-table-column-header";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { Machine } from "@prisma/client";

export const MachinesColumns = (router: {
  push: (path: string) => void;
}): ColumnDef<Machine>[] => [
  {
    accessorKey: "name",
    enableColumnFilter: true,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nom" />
    ),
    cell: ({ row }) => {
      const machine = row.original;
      return (
        <button
          onClick={() => router.push(`/dashboard/machines/${machine.id}`)}
          className="font-medium text-left hover:underline"
        >
          {row.getValue("name")}
        </button>
      );
    },
  },
  {
    accessorKey: "serialNumber",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Numéro de série" />
    ),
  },
  {
    accessorKey: "operatingHours",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Heures d'exploitation" />
    ),
    cell: ({ row }) => {
      const hours = row.getValue("operatingHours") as number;
      return <div>{hours} h</div>;
    },
  },
  {
    accessorKey: "notificationAdvanceHours",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Heures d'avance notification"
      />
    ),
    cell: ({ row }) => {
      const hours = row.getValue("notificationAdvanceHours") as number;
      return <div>{hours} h</div>;
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const machine = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Ouvrir le menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(machine.id)}
            >
              Copier l'ID de la machine
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => router.push(`/dashboard/machines/${machine.id}`)}
            >
              Voir les détails
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                router.push(`/dashboard/machines/${machine.id}/edit`)
              }
            >
              Modifier
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
