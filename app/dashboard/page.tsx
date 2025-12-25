import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-helpers";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/signin");
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <div className="space-y-2">
        <p>
          <strong>ID:</strong> {user.id}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        {user.name && (
          <p>
            <strong>Nom:</strong> {user.name}
          </p>
        )}
      </div>
    </div>
  );
}

