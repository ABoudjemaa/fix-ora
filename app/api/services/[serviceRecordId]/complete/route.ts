import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { evaluateMachineNotifications } from "@/lib/notifications";

const completeServiceSchema = z.object({
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
  { params }: { params: Promise<{ serviceRecordId: string }> }
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
        { error: "Accès refusé. Seules les entreprises peuvent compléter un service." },
        { status: 403 }
      );
    }

    const { serviceRecordId } = await params;
    const body = await request.json();

    // Validation
    const validatedData = completeServiceSchema.parse(body);

    // Vérifier que le ServiceRecord existe et appartient à l'entreprise
    const serviceRecord = await prisma.serviceRecord.findFirst({
      where: {
        id: serviceRecordId,
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

    if (!serviceRecord) {
      return NextResponse.json(
        { error: "Service non trouvé ou déjà complété" },
        { status: 404 }
      );
    }

    // Mettre à jour la maintenance avec la nouvelle date de remplacement
    await prisma.maintenance.update({
      where: { id: serviceRecord.maintenanceId },
      data: {
        lastReplacementDate: validatedData.lastReplacementDate,
      },
    });

    // Marquer le ServiceRecord comme complété
    const completedServiceRecord = await prisma.serviceRecord.update({
      where: { id: serviceRecordId },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        comment: validatedData.comment || null,
      },
    });

    // Supprimer la notification associée si elle existe
    if (serviceRecord.notificationId) {
      await prisma.notification.deleteMany({
        where: {
          id: serviceRecord.notificationId,
          status: "SERVICE_STARTED",
        },
      });
    }

    // Ré-évaluer les notifications pour cette machine
    await evaluateMachineNotifications(serviceRecord.machineId);

    return NextResponse.json(
      {
        message: "Service complété avec succès",
        serviceRecord: completedServiceRecord,
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

    console.error("Erreur lors de la complétion du service:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la complétion du service" },
      { status: 500 }
    );
  }
}

