import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { machineUpdateSchema } from "@/lib/validations/machine";

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

    // Récupérer la machine avec ses maintenances
    const machine = await prisma.machine.findFirst({
      where: {
        id,
        companyId: companyId,
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

export async function PUT(
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
        { error: "Accès refusé. Seules les entreprises peuvent modifier les machines." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Validation avec Zod
    const validatedData = machineUpdateSchema.parse(body);

    // Vérifier que la machine existe et appartient à l'entreprise
    const existingMachine = await prisma.machine.findFirst({
      where: {
        id,
        companyId: companyId,
      },
    });

    if (!existingMachine) {
      return NextResponse.json(
        { error: "Machine non trouvée" },
        { status: 404 }
      );
    }

    // Vérifier si le numéro de série est modifié et s'il existe déjà
    if (validatedData.serialNumber && validatedData.serialNumber !== existingMachine.serialNumber) {
      const serialNumberExists = await prisma.machine.findUnique({
        where: { serialNumber: validatedData.serialNumber },
      });

      if (serialNumberExists) {
        return NextResponse.json(
          { error: "Une machine avec ce numéro de série existe déjà" },
          { status: 400 }
        );
      }
    }

    // Préparer les données de mise à jour
    const updateData: any = {};
    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.serialNumber !== undefined) updateData.serialNumber = validatedData.serialNumber;
    if (validatedData.catalogLink !== undefined) updateData.catalogLink = validatedData.catalogLink || null;
    if (validatedData.operatingHours !== undefined) updateData.operatingHours = validatedData.operatingHours;
    if (validatedData.notificationAdvanceHours !== undefined) updateData.notificationAdvanceHours = validatedData.notificationAdvanceHours;

    // Mettre à jour la machine
    const machine = await prisma.machine.update({
      where: { id },
      data: updateData,
      include: {
        maintenances: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Machine mise à jour avec succès",
        machine,
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

    // Erreur Prisma (contraintes uniques, etc.)
    if (error && typeof error === "object" && "code" in error) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "Une machine avec ce numéro de série existe déjà" },
          { status: 400 }
        );
      }
    }

    console.error("Erreur lors de la mise à jour de la machine:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la mise à jour de la machine" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
        { error: "Accès refusé. Seules les entreprises peuvent supprimer les machines." },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Vérifier que la machine existe et appartient à l'entreprise
    const existingMachine = await prisma.machine.findFirst({
      where: {
        id,
        companyId: companyId,
      },
    });

    if (!existingMachine) {
      return NextResponse.json(
        { error: "Machine non trouvée" },
        { status: 404 }
      );
    }

    // Supprimer la machine (les maintenances seront supprimées en cascade)
    await prisma.machine.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Machine supprimée avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la suppression de la machine:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la suppression de la machine" },
      { status: 500 }
    );
  }
}

