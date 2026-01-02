/*
  Warnings:

  - The values [SERVICE_STARTED] on the enum `NotificationStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `serviceType` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the `service_records` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `maintenanceType` to the `notifications` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "NotificationStatus_new" AS ENUM ('ACTIVE', 'MAINTENANCE_STARTED');
ALTER TABLE "public"."notifications" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "notifications" ALTER COLUMN "status" TYPE "NotificationStatus_new" USING ("status"::text::"NotificationStatus_new");
ALTER TYPE "NotificationStatus" RENAME TO "NotificationStatus_old";
ALTER TYPE "NotificationStatus_new" RENAME TO "NotificationStatus";
DROP TYPE "public"."NotificationStatus_old";
ALTER TABLE "notifications" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
COMMIT;

-- DropForeignKey
ALTER TABLE "service_records" DROP CONSTRAINT "service_records_machineId_fkey";

-- DropForeignKey
ALTER TABLE "service_records" DROP CONSTRAINT "service_records_maintenanceId_fkey";

-- DropForeignKey
ALTER TABLE "service_records" DROP CONSTRAINT "service_records_notificationId_fkey";

-- AlterTable
ALTER TABLE "notifications" DROP COLUMN "serviceType",
ADD COLUMN     "maintenanceType" "MaintenanceType" NOT NULL;

-- DropTable
DROP TABLE "service_records";

-- CreateTable
CREATE TABLE "maintenance_records" (
    "id" TEXT NOT NULL,
    "machineId" TEXT NOT NULL,
    "maintenanceId" TEXT NOT NULL,
    "notificationId" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "comment" TEXT,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maintenance_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "maintenance_records_machineId_idx" ON "maintenance_records"("machineId");

-- CreateIndex
CREATE INDEX "maintenance_records_maintenanceId_idx" ON "maintenance_records"("maintenanceId");

-- CreateIndex
CREATE INDEX "maintenance_records_status_idx" ON "maintenance_records"("status");

-- CreateIndex
CREATE INDEX "maintenance_records_notificationId_idx" ON "maintenance_records"("notificationId");

-- AddForeignKey
ALTER TABLE "maintenance_records" ADD CONSTRAINT "maintenance_records_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "machines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_records" ADD CONSTRAINT "maintenance_records_maintenanceId_fkey" FOREIGN KEY ("maintenanceId") REFERENCES "maintenances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_records" ADD CONSTRAINT "maintenance_records_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "notifications"("id") ON DELETE SET NULL ON UPDATE CASCADE;
