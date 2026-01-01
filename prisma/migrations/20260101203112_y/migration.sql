-- CreateTable
CREATE TABLE "service_records" (
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

    CONSTRAINT "service_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "service_records_machineId_idx" ON "service_records"("machineId");

-- CreateIndex
CREATE INDEX "service_records_maintenanceId_idx" ON "service_records"("maintenanceId");

-- CreateIndex
CREATE INDEX "service_records_status_idx" ON "service_records"("status");

-- CreateIndex
CREATE INDEX "service_records_notificationId_idx" ON "service_records"("notificationId");

-- AddForeignKey
ALTER TABLE "service_records" ADD CONSTRAINT "service_records_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "machines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_records" ADD CONSTRAINT "service_records_maintenanceId_fkey" FOREIGN KEY ("maintenanceId") REFERENCES "maintenances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_records" ADD CONSTRAINT "service_records_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "notifications"("id") ON DELETE SET NULL ON UPDATE CASCADE;
