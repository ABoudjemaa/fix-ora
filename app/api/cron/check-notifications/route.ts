import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { evaluateMachineNotifications } from "@/lib/notifications";

/**
 * Route API pour vérifier automatiquement toutes les notifications
 * 
 * Cette route peut être appelée par :
 * - Un service cron externe (Vercel Cron, GitHub Actions, etc.)
 * - Un service de monitoring
 * - Un script planifié
 * 
 * Pour la sécurité, vous pouvez ajouter une clé API secrète :
 * GET /api/cron/check-notifications?secret=YOUR_SECRET_KEY
 */
export async function GET(request: NextRequest) {
  try {
    // Vérification de sécurité optionnelle avec une clé secrète
    const searchParams = request.nextUrl.searchParams;
    const secret = searchParams.get("secret");
    const expectedSecret = process.env.CRON_SECRET_KEY;

    if (expectedSecret && secret !== expectedSecret) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    console.log("🔍 Début de la vérification automatique des notifications...");

    // Récupérer toutes les machines avec leurs maintenances
    const machines = await prisma.machine.findMany({
      include: {
        maintenances: true,
      },
    });

    console.log(`📊 ${machines.length} machine(s) trouvée(s)`);

    let totalNotificationsCreated = 0;
    const results: Array<{
      machineId: string;
      machineName: string;
      notificationsCreated: number;
    }> = [];

    // Évaluer les notifications pour chaque machine
    for (const machine of machines) {
      if (machine.maintenances.length === 0) {
        continue; // Pas de maintenances, pas besoin de vérifier
      }

      const notificationsBefore = await prisma.notification.count({
        where: {
          machineId: machine.id,
          status: "ACTIVE",
        },
      });

      // Évaluer les notifications pour cette machine
      await evaluateMachineNotifications(machine.id);

      const notificationsAfter = await prisma.notification.count({
        where: {
          machineId: machine.id,
          status: "ACTIVE",
        },
      });

      const created = notificationsAfter - notificationsBefore;
      if (created > 0) {
        totalNotificationsCreated += created;
        results.push({
          machineId: machine.id,
          machineName: machine.name,
          notificationsCreated: created,
        });
      }
    }

    console.log(`✅ Vérification terminée. ${totalNotificationsCreated} notification(s) créée(s)`);

    return NextResponse.json(
      {
        success: true,
        timestamp: new Date().toISOString(),
        machinesChecked: machines.length,
        notificationsCreated: totalNotificationsCreated,
        details: results,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Erreur lors de la vérification des notifications:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Une erreur est survenue lors de la vérification",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

