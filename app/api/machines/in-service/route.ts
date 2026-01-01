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
        { error: "Accès refusé. Seules les entreprises peuvent accéder aux machines en service." },
        { status: 403 }
      );
    }

    // Récupérer toutes les machines qui ont au moins une notification avec status = SERVICE_STARTED
    const machines = await prisma.machine.findMany({
      where: {
        companyId: companyId,
        notifications: {
          some: {
            status: "SERVICE_STARTED",
          },
        },
      },
      include: {
        maintenances: {
          include: {
            notifications: {
              where: {
                status: "SERVICE_STARTED",
              },
              orderBy: {
                triggeredAt: "desc",
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
    console.error("Erreur lors de la récupération des machines en service:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la récupération des machines en service" },
      { status: 500 }
    );
  }
}

