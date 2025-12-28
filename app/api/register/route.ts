import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { registerSchema } from "@/lib/validations/register";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation avec Zod
    const validatedData = registerSchema.parse(body);

    // Vérifier si l'email existe déjà dans User
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Un compte avec cet email existe déjà" },
        { status: 400 }
      );
    }

    // Vérifier si le numéro de registre existe déjà
    const existingCompanyByRegister = await prisma.company.findUnique({
      where: { crn: validatedData.crn },
    });

    if (existingCompanyByRegister) {
      return NextResponse.json(
        { error: "Un compte avec ce numéro de registre existe déjà" },
        { status: 400 }
      );
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Créer l'utilisateur (User)
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        status: "ACTIVE",
      },
    });

    // Créer l'entreprise (Company) qui hérite de User
    const company = await prisma.company.create({
      data: {
        userId: user.id,
        name: validatedData.name,
        crn: validatedData.crn,
      },
      include: {
        user: true,
      },
    });

    return NextResponse.json(
      {
        message: "Compte créé avec succès",
        company: {
          id: company.userId,
          name: company.name,
          email: company.user.email,
        },
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
          { error: "Un compte avec ces informations existe déjà" },
          { status: 400 }
        );
      }
    }

    console.error("Erreur lors de l'inscription:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'inscription" },
      { status: 500 }
    );
  }
}

