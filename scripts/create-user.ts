import "dotenv/config";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

async function createUser() {
  const email = process.argv[2];
  const password = process.argv[3];
  const firstName = process.argv[4] || "User";
  const lastName = process.argv[5] || "Name";
  const phone = process.argv[6] || "0000000000";
  const birthYear = parseInt(process.argv[7]) || 2000;
  const address = process.argv[8] || "";

  if (!email || !password) {
    console.error("Usage: npm run create-user <email> <password> [firstName] [lastName] [phone] [birthYear] [address]");
    console.error("\nExemple minimal:");
    console.error('  npm run create-user user@example.com password123');
    console.error("\nExemple complet:");
    console.error('  npm run create-user user@example.com password123 "John" "Doe" "1234567890" 1990 "123 Main St"');
    process.exit(1);
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        birthYear,
        address,
        skills: [],
      },
    });

    console.log("Utilisateur créé avec succès:", {
      id: user.id,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
    });
  } catch (error) {
    console.error("Erreur lors de la création de l'utilisateur:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createUser();

