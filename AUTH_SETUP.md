# Configuration NextAuth avec Credentials et Prisma

Ce projet utilise NextAuth v5 avec le provider Credentials et Prisma pour la gestion de l'authentification.

## Configuration initiale

### 1. Variables d'environnement

Créez un fichier `.env` à la racine du projet avec les variables suivantes :

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dbname?schema=public"

# NextAuth
AUTH_SECRET="votre-secret-key-ici"
```

Pour générer un `AUTH_SECRET`, vous pouvez utiliser :
```bash
openssl rand -base64 32
```

### 2. Configuration de la base de données

1. Configurez votre `DATABASE_URL` dans le fichier `.env`
2. Générez le client Prisma :
```bash
npm run db:generate
```

3. Créez et appliquez les migrations :
```bash
npm run db:migrate
```

Ou poussez le schéma directement (développement uniquement) :
```bash
npm run db:push
```

### 3. Créer un utilisateur

Utilisez le script fourni pour créer un utilisateur :

```bash
npm run create-user <email> <password> [firstName] [lastName] [phone] [birthYear] [address]
```

Exemple :
```bash
npm run create-user user@example.com monMotDePasse123 "John" "Doe" "1234567890" 1990 "123 Main St"
```

Note : Les paramètres optionnels peuvent être omis, mais `email` et `password` sont requis.

## Utilisation

### Pages disponibles

- `/auth/signin` - Page de connexion
- `/dashboard` - Page protégée (exemple)

### Utilisation dans vos composants

#### Côté serveur

```typescript
import { getCurrentUser } from "@/lib/auth-helpers";

export default async function MyPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    // Rediriger vers la page de connexion
    redirect("/auth/signin");
  }
  
  return <div>Bonjour {user.email}</div>;
}
```

#### Côté client

```typescript
"use client";

import { useSession, signOut } from "next-auth/react";

export default function MyComponent() {
  const { data: session, status } = useSession();
  
  if (status === "loading") return <div>Chargement...</div>;
  if (!session) return <div>Non connecté</div>;
  
  return (
    <div>
      <p>Connecté en tant que {session.user.email}</p>
      <button onClick={() => signOut()}>Déconnexion</button>
    </div>
  );
}
```

### Protection de routes

Pour protéger une route, utilisez `getCurrentUser()` ou `auth()` dans votre composant serveur :

```typescript
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const session = await auth();
  
  if (!session) {
    redirect("/auth/signin");
  }
  
  return <div>Contenu protégé</div>;
}
```

## Structure des fichiers

- `lib/auth.ts` - Configuration NextAuth
- `lib/prisma.ts` - Client Prisma (singleton)
- `lib/auth-helpers.ts` - Helpers pour l'authentification
- `app/api/auth/[...nextauth]/route.ts` - Routes API NextAuth
- `components/providers.tsx` - Provider NextAuth pour le layout
- `app/auth/signin/page.tsx` - Page de connexion
- `prisma/schema.prisma` - Schéma Prisma

## Modèle User

Le modèle User dans Prisma contient :
- `id` (String, CUID)
- `email` (String, unique)
- `hashedPassword` (String, hashé avec bcrypt)
- `firstName` (String)
- `lastName` (String)
- `phone` (String)
- `birthYear` (Int)
- `address` (String)
- `skills` (String[])
- `otherSkills` (String, optionnel)
- `message` (String, optionnel)
- `emailVerified` (DateTime, optionnel)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

