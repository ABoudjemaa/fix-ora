import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
        { error: "Accès refusé. Seules les entreprises peuvent démarrer une maintenance." },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Vérifier que la notification existe et appartient à l'entreprise
    const notification = await prisma.notification.findFirst({
      where: {
        id,
        status: "ACTIVE",
        machine: {
          companyId: companyId,
        },
      },
    });

    if (!notification) {
      return NextResponse.json(
        { error: "Notification non trouvée ou déjà traitée" },
        { status: 404 }
      );
    }

    // Marquer la notification comme MAINTENANCE_STARTED
    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: {
        status: "MAINTENANCE_STARTED",
      },
    });

    // Créer un MaintenanceRecord pour l'historique
    const maintenanceRecord = await prisma.maintenanceRecord.create({
      data: {
        machineId: notification.machineId,
        maintenanceId: notification.maintenanceId,
        notificationId: id,
        status: "IN_PROGRESS",
        startedAt: new Date(),
      },
    });

    return NextResponse.json(
      {
        message: "Maintenance démarrée",
        notification: updatedNotification,
        maintenanceRecord: maintenanceRecord,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors du démarrage de la maintenance:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors du démarrage de la maintenance" },
      { status: 500 }
    );
  }
}

