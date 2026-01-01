import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { maintenanceUpdateSchema } from "@/lib/validations/machine";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; maintenanceId: string }> }
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

    const { id, maintenanceId } = await params;

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

    // Récupérer la maintenance
    const maintenance = await prisma.maintenance.findFirst({
      where: {
        id: maintenanceId,
        machineId: id,
      },
    });

    if (!maintenance) {
      return NextResponse.json(
        { error: "Maintenance non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json({ maintenance }, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la récupération de la maintenance:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la récupération de la maintenance" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; maintenanceId: string }> }
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
        { error: "Accès refusé. Seules les entreprises peuvent modifier les maintenances." },
        { status: 403 }
      );
    }

    const { id, maintenanceId } = await params;
    const body = await request.json();

    // Validation avec Zod
    const validatedData = maintenanceUpdateSchema.parse(body);

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

    // Vérifier que la maintenance existe et appartient à la machine
    const existingMaintenance = await prisma.maintenance.findFirst({
      where: {
        id: maintenanceId,
        machineId: id,
      },
    });

    if (!existingMaintenance) {
      return NextResponse.json(
        { error: "Maintenance non trouvée" },
        { status: 404 }
      );
    }

    // Préparer les données de mise à jour
    const updateData: any = {};
    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.type !== undefined) updateData.type = validatedData.type;
    if (validatedData.replacementIntervalHours !== undefined) updateData.replacementIntervalHours = validatedData.replacementIntervalHours;
    if (validatedData.lastReplacementDate !== undefined) updateData.lastReplacementDate = validatedData.lastReplacementDate;

    // Mettre à jour la maintenance
    const maintenance = await prisma.maintenance.update({
      where: { id: maintenanceId },
      data: updateData,
    });

    return NextResponse.json(
      {
        message: "Maintenance mise à jour avec succès",
        maintenance,
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

    console.error("Erreur lors de la mise à jour de la maintenance:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la mise à jour de la maintenance" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; maintenanceId: string }> }
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
        { error: "Accès refusé. Seules les entreprises peuvent supprimer les maintenances." },
        { status: 403 }
      );
    }

    const { id, maintenanceId } = await params;

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

    // Vérifier que la maintenance existe et appartient à la machine
    const existingMaintenance = await prisma.maintenance.findFirst({
      where: {
        id: maintenanceId,
        machineId: id,
      },
    });

    if (!existingMaintenance) {
      return NextResponse.json(
        { error: "Maintenance non trouvée" },
        { status: 404 }
      );
    }

    // Supprimer la maintenance
    await prisma.maintenance.delete({
      where: { id: maintenanceId },
    });

    return NextResponse.json(
      { message: "Maintenance supprimée avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la suppression de la maintenance:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la suppression de la maintenance" },
      { status: 500 }
    );
  }
}

