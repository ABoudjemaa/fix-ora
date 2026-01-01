import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { maintenanceSchema } from "@/lib/validations/machine";

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
        { error: "Accès refusé. Seules les entreprises peuvent accéder aux maintenances." },
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

    // Récupérer les maintenances de la machine
    const maintenances = await prisma.maintenance.findMany({
      where: {
        machineId: id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ maintenances }, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la récupération des maintenances:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la récupération des maintenances" },
      { status: 500 }
    );
  }
}

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
        { error: "Accès refusé. Seules les entreprises peuvent créer des maintenances." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Validation avec Zod
    const validatedData = maintenanceSchema.parse(body);

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

    // Créer la maintenance
    const maintenance = await prisma.maintenance.create({
      data: {
        name: validatedData.name,
        type: validatedData.type,
        replacementIntervalHours: validatedData.replacementIntervalHours,
        lastReplacementDate: validatedData.lastReplacementDate,
        machineId: id,
      },
    });

    return NextResponse.json(
      {
        message: "Maintenance créée avec succès",
        maintenance,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Erreur lors de la création de la maintenance:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la création de la maintenance" },
      { status: 500 }
    );
  }
}

