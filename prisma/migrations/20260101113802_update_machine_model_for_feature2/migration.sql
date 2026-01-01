/*
  Warnings:

  - The values [PIECE,VIDANGE] on the enum `MaintenanceType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `createdAt` on the `machines` table. All the data in the column will be lost.
  - You are about to drop the column `notificationHours` on the `machines` table. All the data in the column will be lost.
  - You are about to drop the column `lifespanHours` on the `maintenances` table. All the data in the column will be lost.
  - Added the required column `notificationAdvanceHours` to the `machines` table without a default value. This is not possible if the table is not empty.
  - Added the required column `replacementIntervalHours` to the `maintenances` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "MaintenanceType_new" AS ENUM ('PART', 'OIL');
ALTER TABLE "maintenances" ALTER COLUMN "type" TYPE "MaintenanceType_new" USING ("type"::text::"MaintenanceType_new");
ALTER TYPE "MaintenanceType" RENAME TO "MaintenanceType_old";
ALTER TYPE "MaintenanceType_new" RENAME TO "MaintenanceType";
DROP TYPE "public"."MaintenanceType_old";
COMMIT;

-- AlterTable
ALTER TABLE "machines" DROP COLUMN "createdAt",
DROP COLUMN "notificationHours",
ADD COLUMN     "catalogLink" TEXT,
ADD COLUMN     "notificationAdvanceHours" INTEGER NOT NULL,
ADD COLUMN     "operatingHours" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "maintenances" DROP COLUMN "lifespanHours",
ADD COLUMN     "replacementIntervalHours" INTEGER NOT NULL;
