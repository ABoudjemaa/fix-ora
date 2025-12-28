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

    // Vérifier que c'est une entreprise
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { company: true },
    });

    if (!user?.company) {
      return NextResponse.json(
        { error: "Accès refusé. Seules les entreprises peuvent accéder aux machines." },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Récupérer la machine avec ses maintenances
    const machine = await prisma.machine.findFirst({
      where: {
        id,
        companyId: user.company.userId,
      },
      include: {
        maintenances: {
          orderBy: {
            createdAt: "desc",
          },
        },
        company: {
          select: {
            name: true,
            crn: true,
          },
        },
      },
    });

    if (!machine) {
      return NextResponse.json(
        { error: "Machine non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json({ machine }, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la récupération de la machine:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la récupération de la machine" },
      { status: 500 }
    );
  }
}

