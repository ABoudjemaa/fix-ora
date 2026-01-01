/*
  Warnings:

  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "MaintenanceType" AS ENUM ('PIECE', 'VIDANGE');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "name",
ADD COLUMN     "emailVerified" TIMESTAMP(3),
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateTable
CREATE TABLE "companies" (
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ownerName" TEXT NOT NULL,
    "commercialRegisterNumber" TEXT NOT NULL,
    "phone" TEXT,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "machines" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "notificationHours" INTEGER NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdAtRecord" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "machines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenances" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "MaintenanceType" NOT NULL,
    "lifespanHours" INTEGER NOT NULL,
    "lastReplacementDate" TIMESTAMP(3) NOT NULL,
    "machineId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maintenances_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "companies_commercialRegisterNumber_key" ON "companies"("commercialRegisterNumber");

-- CreateIndex
CREATE INDEX "companies_commercialRegisterNumber_idx" ON "companies"("commercialRegisterNumber");

-- CreateIndex
CREATE UNIQUE INDEX "machines_serialNumber_key" ON "machines"("serialNumber");

-- CreateIndex
CREATE INDEX "machines_companyId_idx" ON "machines"("companyId");

-- CreateIndex
CREATE INDEX "machines_serialNumber_idx" ON "machines"("serialNumber");

-- CreateIndex
CREATE INDEX "maintenances_machineId_idx" ON "maintenances"("machineId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machines" ADD CONSTRAINT "machines_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenances" ADD CONSTRAINT "maintenances_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "machines"("id") ON DELETE CASCADE ON UPDATE CASCADE;
