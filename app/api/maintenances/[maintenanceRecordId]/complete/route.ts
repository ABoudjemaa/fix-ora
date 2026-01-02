import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { evaluateMachineNotifications } from "@/lib/notifications";

const completeMaintenanceSchema = z.object({
  lastReplacementDate: z
    .string()
    .min(1, "La date du dernier remplacement est requise")
    .transform((str) => new Date(str))
    .refine((date) => !isNaN(date.getTime()), {
      message: "Date invalide",
    }),
  comment: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ maintenanceRecordId: string }> }
) {
  try {
    // Vérifier l'authentification
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    // Récupérer le companyId depuis le token JWT
    const companyId = (session.user as any).companyId;
    
    if (!companyId) {
      return NextResponse.json(
        { error: "Accès refusé. Seules les entreprises peuvent compléter une maintenance." },
        { status: 403 }
      );
    }

    const { maintenanceRecordId } = await params;
    const body = await request.json();

    // Validation
    const validatedData = completeMaintenanceSchema.parse(body);

    // Vérifier que le MaintenanceRecord existe et appartient à l'entreprise
    const maintenanceRecord = await prisma.maintenanceRecord.findFirst({
      where: {
        id: maintenanceRecordId,
        status: "IN_PROGRESS",
        machine: {
          companyId: companyId,
        },
      },
      include: {
        machine: true,
        maintenance: true,
      },
    });

    if (!maintenanceRecord) {
      return NextResponse.json(
        { error: "Maintenance non trouvée ou déjà complétée" },
        { status: 404 }
      );
    }

    // Mettre à jour la maintenance avec la nouvelle date de remplacement
    await prisma.maintenance.update({
      where: { id: maintenanceRecord.maintenanceId },
      data: {
        lastReplacementDate: validatedData.lastReplacementDate,
      },
    });

    // Marquer le MaintenanceRecord comme complété
    const completedMaintenanceRecord = await prisma.maintenanceRecord.update({
      where: { id: maintenanceRecordId },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        comment: validatedData.comment || null,
      },
    });

    // Supprimer la notification associée si elle existe
    if (maintenanceRecord.notificationId) {
      await prisma.notification.deleteMany({
        where: {
          id: maintenanceRecord.notificationId,
          status: "MAINTENANCE_STARTED",
        },
      });
    }

    // Ré-évaluer les notifications pour cette machine
    await evaluateMachineNotifications(maintenanceRecord.machineId);

    return NextResponse.json(
      {
        message: "Maintenance complétée avec succès",
        maintenanceRecord: completedMaintenanceRecord,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Erreur lors de la complétion de la maintenance:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la complétion de la maintenance" },
      { status: 500 }
    );
  }
}

