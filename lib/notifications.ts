import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

type NotificationEvaluationResult = {
  shouldNotify: boolean;
  urgency: "APPROACHING" | "REQUIRED";
  hoursUntilDue: number;
};

/**
 * Evaluate if a notification should be created for a maintenance
 * 
 * Note: This assumes operatingHours is cumulative and we need to track
 * the operatingHours value when maintenance was last replaced. Since we don't
 * have that field, we'll use a simplified approach based on time elapsed.
 */
export function evaluateNotification(
  operatingHours: number,
  lastReplacementDate: Date,
  replacementIntervalHours: number,
  notificationAdvanceHours: number
): NotificationEvaluationResult | null {
  // Calculate hours since last replacement (wall clock time)
  const now = new Date();
  const hoursSinceLastReplacement = (now.getTime() - lastReplacementDate.getTime()) / (1000 * 60 * 60);
  
  // Calculate when maintenance is due (hours since replacement)
  const hoursUntilDue = replacementIntervalHours - hoursSinceLastReplacement;
  
  // Check if maintenance is required (overdue)
  if (hoursSinceLastReplacement >= replacementIntervalHours) {
    const hoursOverdue = hoursSinceLastReplacement - replacementIntervalHours;
    return {
      shouldNotify: true,
      urgency: "REQUIRED",
      hoursUntilDue: -hoursOverdue, // Negative means overdue
    };
  }
  
  // Check if notification threshold is reached (approaching)
  if (hoursUntilDue <= notificationAdvanceHours && hoursUntilDue > 0) {
    return {
      shouldNotify: true,
      urgency: "APPROACHING",
      hoursUntilDue: hoursUntilDue,
    };
  }
  
  return null;
}

/**
 * Create or update notification for a maintenance
 */
export async function createOrUpdateNotification(
  machineId: string,
  maintenanceId: string,
  maintenanceType: "PART" | "OIL",
  urgency: "APPROACHING" | "REQUIRED"
) {
  // Check if active notification exists
  const existingNotification = await prisma.notification.findFirst({
    where: {
      maintenanceId,
      status: "ACTIVE",
    },
  });

  if (existingNotification) {
    // Update existing notification if urgency changed to REQUIRED
    if (urgency === "REQUIRED" && existingNotification.urgency === "APPROACHING") {
      return await prisma.notification.update({
        where: { id: existingNotification.id },
        data: {
          urgency: "REQUIRED",
        },
      });
    }
    // Don't create duplicate if already exists with same or higher urgency
    return existingNotification;
  }

  // Create new notification
  return await prisma.notification.create({
    data: {
      machineId,
      maintenanceId,
      maintenanceType,
      urgency,
      status: "ACTIVE",
    },
  });
}

/**
 * Evaluate and create notifications for all maintenances of a machine
 */
export async function evaluateMachineNotifications(machineId: string) {
  const machine = await prisma.machine.findUnique({
    where: { id: machineId },
    include: {
      maintenances: true,
      company: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!machine) {
    return;
  }

  const notificationsCreated: any[] = [];

  for (const maintenance of machine.maintenances) {
    const evaluation = evaluateNotification(
      machine.operatingHours,
      maintenance.lastReplacementDate,
      maintenance.replacementIntervalHours,
      machine.notificationAdvanceHours
    );

    if (evaluation && evaluation.shouldNotify) {
      // Check if notification already exists
      const existingNotification = await prisma.notification.findFirst({
        where: {
          maintenanceId: maintenance.id,
          status: "ACTIVE",
        },
      });

      let notification;
      let isNew = false;

      if (existingNotification) {
        // Update existing notification if urgency changed to REQUIRED
        if (evaluation.urgency === "REQUIRED" && existingNotification.urgency === "APPROACHING") {
          notification = await prisma.notification.update({
            where: { id: existingNotification.id },
            data: {
              urgency: "REQUIRED",
            },
          });
          // Don't send email on update
        } else {
          notification = existingNotification;
        }
      } else {
        // Create new notification
        notification = await prisma.notification.create({
          data: {
            machineId,
            maintenanceId: maintenance.id,
            maintenanceType: maintenance.type,
            urgency: evaluation.urgency,
            status: "ACTIVE",
          },
        });
        isNew = true;
        notificationsCreated.push({
          notification,
          machine,
          maintenance,
          evaluation,
        });
      }
    } else {
      // If no notification needed, mark any existing active notification as MAINTENANCE_STARTED
      // (operating hours may have decreased or maintenance was updated)
      await prisma.notification.updateMany({
        where: {
          maintenanceId: maintenance.id,
          status: "ACTIVE",
        },
        data: {
          status: "MAINTENANCE_STARTED",
        },
      });
      // When lastReplacementDate is updated (maintenance completed), delete MAINTENANCE_STARTED notifications
      // This is handled separately when maintenance is updated
    }
  }

  // Send emails for newly created notifications
  for (const item of notificationsCreated) {
    await sendNotificationEmail(item.machine, item.maintenance, item.notification, item.evaluation);
  }
}

/**
 * Send notification email using Resend
 */
async function sendNotificationEmail(
  machine: any,
  maintenance: any,
  notification: any,
  evaluation: NotificationEvaluationResult
) {
  const recipientEmail = "boudjemaa.amine.2003@gmail.com";
  
  if (!recipientEmail) {
    console.error("❌ No recipient email found for notification");
    return;
  }

  // Check if RESEND_API_KEY is configured
  if (!process.env.RESEND_API_KEY) {
    console.error("❌ RESEND_API_KEY is not configured in environment variables");
    console.error("   Veuillez ajouter RESEND_API_KEY dans votre fichier .env");
    return;
  }

  console.log(`📧 Tentative d'envoi d'email pour la notification ${notification.id}...`);
  console.log(`   Machine: ${machine.name}`);
  console.log(`   Maintenance: ${maintenance.name}`);
  console.log(`   Destinataire: ${recipientEmail}`);

  const urgencyText = notification.urgency === "REQUIRED" ? "Requis" : "Approche";
  const urgencyColor = notification.urgency === "REQUIRED" ? "#dc2626" : "#f59e0b";
  const maintenanceTypeText = notification.maintenanceType === "PART" ? "Pièce" : "Huile";
  
  // Use hoursUntilDue from evaluation (negative means overdue)
  const hoursUntilDue = Math.abs(evaluation.hoursUntilDue);

  const emailHtml = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Notification de Maintenance</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">🔧 Notification de Maintenance</h1>
  </div>
  
  <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
    <div style="background: ${urgencyColor}; color: white; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
      <h2 style="margin: 0; font-size: 20px;">Maintenance ${urgencyText}</h2>
    </div>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <h3 style="margin-top: 0; color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
        Informations de la Machine
      </h3>
      <p style="margin: 10px 0;"><strong>Nom:</strong> ${machine.name}</p>
      <p style="margin: 10px 0;"><strong>Numéro de série:</strong> ${machine.serialNumber}</p>
      <p style="margin: 10px 0;"><strong>Heures d'opération:</strong> ${machine.operatingHours.toLocaleString()} heures</p>
    </div>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <h3 style="margin-top: 0; color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
        Détails de la Maintenance
      </h3>
      <p style="margin: 10px 0;"><strong>Type de maintenance:</strong> ${maintenance.name}</p>
      <p style="margin: 10px 0;"><strong>Catégorie:</strong> ${maintenanceTypeText}</p>
      <p style="margin: 10px 0;"><strong>Intervalle de remplacement:</strong> ${maintenance.replacementIntervalHours.toLocaleString()} heures</p>
      <p style="margin: 10px 0;"><strong>Dernier remplacement:</strong> ${new Date(maintenance.lastReplacementDate).toLocaleDateString('fr-FR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}</p>
      ${notification.urgency === "REQUIRED" 
        ? `<p style="margin: 10px 0; color: #dc2626;"><strong>⚠️ En retard de:</strong> ${Math.round(hoursUntilDue)} heures</p>`
        : `<p style="margin: 10px 0; color: #f59e0b;"><strong>⏰ Maintenance due dans:</strong> ${Math.round(hoursUntilDue)} heures</p>`
      }
    </div>
    
    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin-top: 20px;">
      <p style="margin: 0; color: #92400e;">
        <strong>Action requise:</strong> 
        ${notification.urgency === "REQUIRED" 
          ? "Cette maintenance est maintenant en retard. Veuillez planifier le remplacement dès que possible."
          : "Cette maintenance approche. Veuillez planifier le remplacement prochainement."
        }
      </p>
    </div>
  </div>
  
  <div style="text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px;">
    <p>Cet email a été envoyé automatiquement par le système FixOra.</p>
    <p>© ${new Date().getFullYear()} FixOra - Gestion de Maintenance</p>
  </div>
</body>
</html>
  `.trim();

  const emailText = `
Notification de Maintenance - ${urgencyText}

Machine: ${machine.name}
Numéro de série: ${machine.serialNumber}
Heures d'opération: ${machine.operatingHours.toLocaleString()} heures

Type de maintenance: ${maintenance.name}
Catégorie: ${maintenanceTypeText}
Intervalle de remplacement: ${maintenance.replacementIntervalHours.toLocaleString()} heures
Dernier remplacement: ${new Date(maintenance.lastReplacementDate).toLocaleDateString('fr-FR')}

${notification.urgency === "REQUIRED" 
  ? `⚠️ EN RETARD: Cette maintenance est maintenant en retard de ${Math.round(hoursUntilDue)} heures.`
  : `⏰ APPROCHE: Cette maintenance est due dans ${Math.round(hoursUntilDue)} heures.`
}

Action requise: ${notification.urgency === "REQUIRED" 
  ? "Veuillez planifier le remplacement dès que possible."
  : "Veuillez planifier le remplacement prochainement."
}

---
Cet email a été envoyé automatiquement par le système FixOra.
  `.trim();

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Acme <onboarding@resend.dev>",
      to: [recipientEmail],
      subject: `🔧 Maintenance ${urgencyText}: ${machine.name} - ${maintenance.name}`,
      html: emailHtml,
      text: emailText,
    });

    if (error) {
      console.error("❌ Erreur lors de l'envoi de l'email:", error);
      console.error("   Détails de l'erreur:", JSON.stringify(error, null, 2));
      return;
    }

    console.log("✅ Email de notification envoyé avec succès!");
    console.log("   Email ID:", data?.id);
    console.log("   Destinataire:", recipientEmail);
    console.log("   Sujet:", `Maintenance ${urgencyText}: ${machine.name} - ${maintenance.name}`);
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi de l'email:", error);
    console.error("   Type d'erreur:", error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.stack) {
      console.error("   Stack trace:", error.stack);
    }
  }
}

