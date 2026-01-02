import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
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
        { error: "Accès refusé. Seules les entreprises peuvent accéder aux machines en maintenance." },
        { status: 403 }
      );
    }

    // Récupérer toutes les machines qui ont au moins un MaintenanceRecord avec status = IN_PROGRESS
    const machines = await prisma.machine.findMany({
      where: {
        companyId: companyId,
        maintenanceRecords: {
          some: {
            status: "IN_PROGRESS",
          },
        },
      },
      include: {
        maintenances: {
          include: {
            notifications: {
              where: {
                status: "MAINTENANCE_STARTED",
              },
              orderBy: {
                triggeredAt: "desc",
              },
            },
            maintenanceRecords: {
              orderBy: {
                startedAt: "desc",
              },
            },
          },
        },
        company: {
          select: {
            name: true,
            crn: true,
          },
        },
      },
      orderBy: {
        createdAtRecord: "desc",
      },
    });

    return NextResponse.json({ machines }, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la récupération des machines en maintenance:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la récupération des machines en maintenance" },
      { status: 500 }
    );
  }
}

