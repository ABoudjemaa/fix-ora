import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
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
        { error: "Accès refusé. Seules les entreprises peuvent accéder aux machines." },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Vérifier que la machine existe et appartient à l'entreprise
    const machine = await prisma.machine.findFirst({
      where: {
        id,
        companyId: companyId,
      },
    });

    if (!machine) {
      return NextResponse.json(
        { error: "Machine non trouvée" },
        { status: 404 }
      );
    }

    // Récupérer tous les maintenanceRecords de la machine
    const maintenanceRecords = await prisma.maintenanceRecord.findMany({
      where: {
        machineId: id,
      },
      include: {
        maintenance: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
      orderBy: {
        startedAt: "desc",
      },
    });

    return NextResponse.json({ maintenanceRecords }, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'historique:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la récupération de l'historique" },
      { status: 500 }
    );
  }
}

