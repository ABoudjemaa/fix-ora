import { Dialog, DialogFooter, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { AlertTriangle } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Machine } from "@prisma/client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface DeleteMachineDialogProps {
    deleteDialogOpen: boolean;
    setDeleteDialogOpen: (open: boolean) => void;
    machine: {
        id: string;
        name: string;
    };
}

const DeleteMachineDialog = ({ deleteDialogOpen, setDeleteDialogOpen, machine }: DeleteMachineDialogProps) => {
   
    const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [machineName, setMachineName] = useState("");
  
    const handleDeleteMachine = async () => {
        if (machineName !== machine?.name) {
          setDeleteError("Le nom ne correspond pas");
          return;
        }
    
        setIsDeleting(true);
        setDeleteError(null);
    
        try {
          const id = machine.id;
          const response = await fetch(`/api/machines/${id}`, {
            method: "DELETE",
          });
    
          if (!response.ok) {
            const result = await response.json();
            throw new Error(
              result.error || "Erreur lors de la suppression de la machine"
            );
          }
    
          setDeleteDialogOpen(false);
          setMachineName("");
          setDeleteError(null);
          router.push("/dashboard/machines");
        } catch (err) {
          setDeleteError(
            err instanceof Error ? err.message : "Une erreur est survenue"
          );
        } finally {
          setIsDeleting(false);
        }
      };
    
   
    return (
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <DialogTitle>Supprimer la machine</DialogTitle>
            </div>
            <DialogDescription>
              Cette action est irréversible. Toutes les données associées à cette machine seront
              définitivement supprimées.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="machine-name" className="flex justify-start items-start flex-col gap-2">
                <span className="font-bold">Pour confirmer, veuillez saisir le nom de la machine :</span> 
                <span className="">{machine?.name}</span>
              </Label>
              <Input
                id="machine-name"
                value={machineName}
                onChange={(e) => {
                  setMachineName(e.target.value);
                }}
                placeholder="Nom de la machine"
                disabled={isDeleting}
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    machineName === machine?.name &&
                    !isDeleting
                  ) {
                    handleDeleteMachine();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setMachineName("");
              }}
              disabled={isDeleting}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteMachine}
              disabled={machineName !== machine?.name || isDeleting}
            >
              {isDeleting ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog> )
}

export default DeleteMachineDialog;