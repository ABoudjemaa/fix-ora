import { prisma } from "@/lib/prisma";

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
  
  // Calculate when service is due (hours since replacement)
  const hoursUntilDue = replacementIntervalHours - hoursSinceLastReplacement;
  
  // Check if service is required (overdue)
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
  serviceType: "PART" | "OIL",
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
      serviceType,
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
            serviceType: maintenance.type,
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
      // If no notification needed, mark any existing active notification as SERVICE_STARTED
      // (operating hours may have decreased or maintenance was updated)
      await prisma.notification.updateMany({
        where: {
          maintenanceId: maintenance.id,
          status: "ACTIVE",
        },
        data: {
          status: "SERVICE_STARTED",
        },
      });
    }
  }

  // Send emails for newly created notifications
  for (const item of notificationsCreated) {
    await sendNotificationEmail(item.machine, item.maintenance, item.notification);
  }
}

/**
 * Send notification email (simple implementation - logs for now)
 */
async function sendNotificationEmail(
  machine: any,
  maintenance: any,
  notification: any
) {
  // TODO: Implement actual email sending
  // For now, just log the notification
  console.log("📧 Notification Email:", {
    to: machine.company?.user?.email || "company@example.com",
    subject: `Service ${notification.urgency === "REQUIRED" ? "Required" : "Approaching"}: ${machine.name} - ${maintenance.name}`,
    body: `
Machine: ${machine.name}
Maintenance: ${maintenance.name}
Service Type: ${notification.serviceType}
Urgency: ${notification.urgency}
Operating Hours: ${machine.operatingHours}
Replacement Interval: ${maintenance.replacementIntervalHours} hours
Last Replacement: ${maintenance.lastReplacementDate.toLocaleDateString()}
    `.trim(),
  });

  // In production, use an email service like:
  // - Resend
  // - SendGrid
  // - AWS SES
  // - Nodemailer with SMTP
}

