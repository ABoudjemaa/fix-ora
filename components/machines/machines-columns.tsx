import { type ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { DataTableColumnHeader } from "@/components/data-table-column-header"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import { Machine } from "@prisma/client"

export const MachinesColumns = (router: { push: (path: string) => void }): ColumnDef<Machine>[] => [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Sélectionner tout"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Sélectionner la ligne"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Nom" />
      ),
      cell: ({ row }) => {
        const machine = row.original
        return (
          <button
            onClick={() => router.push(`/dashboard/machines/${machine.id}`)}
            className="font-medium text-left hover:underline"
          >
            {row.getValue("name")}
          </button>
        )
      },
    },
    {
      accessorKey: "serialNumber",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Numéro de série" />
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date de création" />
      ),
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"))
        return <div>{date.toLocaleDateString("fr-FR")}</div>
      },
    },
    {
      accessorKey: "notificationHours",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Heures avant notification" />
      ),
      cell: ({ row }) => {
        const hours = row.getValue("notificationHours") as number
        return <div>{hours} h</div>
      },
    },
    {
      accessorKey: "maintenances",
      header: "Maintenances",
      cell: ({ row }) => {
        const maintenances = row.getValue("maintenances") as Machine["maintenances"]
        return (
          <div className="flex flex-wrap gap-1">
            {maintenances.length > 0 ? (
              maintenances.map((maintenance) => (
                <Badge key={maintenance.id} variant="outline">
                  {maintenance.name}
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground text-sm">Aucune</span>
            )}
          </div>
        )
      },
      enableSorting: false,
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const machine = row.original
  
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
              <DropdownMenuItem>Modifier</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">Supprimer</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]