import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { machineSchema } from "@/lib/validations/machine";

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

    // Récupérer les machines avec leurs maintenances
    const machines = await prisma.machine.findMany({
      where: {
        companyId: user.company.userId,
      },
      include: {
        maintenances: true,
      },
      orderBy: {
        createdAtRecord: "desc",
      },
    });

    return NextResponse.json({ machines }, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la récupération des machines:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la récupération des machines" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
        { error: "Accès refusé. Seules les entreprises peuvent créer des machines." },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validation avec Zod
    const validatedData = machineSchema.parse(body);

    // Vérifier si le numéro de série existe déjà
    const existingMachine = await prisma.machine.findUnique({
      where: { serialNumber: validatedData.serialNumber },
    });

    if (existingMachine) {
      return NextResponse.json(
        { error: "Une machine avec ce numéro de série existe déjà" },
        { status: 400 }
      );
    }

    // Créer la machine avec ses maintenances
    const machine = await prisma.machine.create({
      data: {
        name: validatedData.name,
        serialNumber: validatedData.serialNumber,
        createdAt: validatedData.createdAt,
        notificationHours: validatedData.notificationHours,
        companyId: user.company.userId,
        maintenances: {
          create: validatedData.maintenances.map((maintenance) => ({
            name: maintenance.name,
            type: maintenance.type,
            lifespanHours: maintenance.lifespanHours,
            lastReplacementDate: maintenance.lastReplacementDate,
          })),
        },
      },
      include: {
        maintenances: true,
      },
    });

    return NextResponse.json(
      {
        message: "Machine créée avec succès",
        machine,
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

    // Erreur Prisma (contraintes uniques, etc.)
    if (error && typeof error === "object" && "code" in error) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "Une machine avec ce numéro de série existe déjà" },
          { status: 400 }
        );
      }
    }

    console.error("Erreur lors de la création de la machine:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la création de la machine" },
      { status: 500 }
    );
  }
}

