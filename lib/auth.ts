import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email et mot de passe requis");
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        // Chercher dans User (tous les comptes sont dans User maintenant)
        const user = await prisma.user.findUnique({
          where: { email },
          include: { company: true },
        });

        if (!user) {
          throw new Error("Email ou mot de passe incorrect");
        }

        // Vérifier le statut
        if (user.status !== "ACTIVE") {
          throw new Error("Votre compte est désactivé. Veuillez contacter l'administrateur.");
        }

        // Vérifier le mot de passe
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
          throw new Error("Email ou mot de passe incorrect");
        }

        // Si c'est une entreprise (a une Company associée), retourner les infos de Company
        if (user.company) {
          return {
            id: user.id,
            email: user.email,
            name: user.company.name,
            role: "COMPANY",
            accountType: "company",
            companyId: user.company.userId, // Stocker le companyId dans le token
          };
        }

        // Sinon, c'est un utilisateur normal
        return {
          id: user.id,
          email: user.email,
          name: user.email,
          role: "USER",
          accountType: "user",
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.AUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = (user as any).role;
        token.accountType = (user as any).accountType;
        token.companyId = (user as any).companyId; // Stocker le companyId dans le token
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string | null | undefined;
        (session.user as any).role = token.role;
        (session.user as any).accountType = token.accountType;
        (session.user as any).companyId = token.companyId; // Passer le companyId à la session
      }
      return session;
    },
  },
});

