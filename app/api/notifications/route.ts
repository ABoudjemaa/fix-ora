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
        { error: "Accès refusé. Seules les entreprises peuvent accéder aux notifications." },
        { status: 403 }
      );
    }

    // Récupérer toutes les notifications actives pour les machines de l'entreprise
    const notifications = await prisma.notification.findMany({
      where: {
        status: "ACTIVE",
        machine: {
          companyId: companyId,
        },
      },
      include: {
        machine: {
          select: {
            id: true,
            name: true,
            serialNumber: true,
            operatingHours: true,
          },
        },
        maintenance: {
          select: {
            id: true,
            name: true,
            type: true,
            replacementIntervalHours: true,
            lastReplacementDate: true,
          },
        },
      },
      orderBy: [
        { urgency: "desc" }, // REQUIRED first
        { triggeredAt: "desc" },
      ],
    });

    return NextResponse.json({ notifications }, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la récupération des notifications:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la récupération des notifications" },
      { status: 500 }
    );
  }
}

