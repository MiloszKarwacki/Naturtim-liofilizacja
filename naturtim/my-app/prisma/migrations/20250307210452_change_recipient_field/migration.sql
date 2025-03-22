/*
  Warnings:

  - You are about to drop the `BatchStatus` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `InventoryMovement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StatusChange` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `description` on the `Fraction` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `ProductionBatch` table. All the data in the column will be lost.
  - You are about to drop the column `dryMassPercentage` on the `ProductionBatch` table. All the data in the column will be lost.
  - You are about to drop the column `finalProductDate` on the `ProductionBatch` table. All the data in the column will be lost.
  - You are about to drop the column `finalWeight` on the `ProductionBatch` table. All the data in the column will be lost.
  - You are about to drop the column `fractionId` on the `ProductionBatch` table. All the data in the column will be lost.
  - You are about to drop the column `fractioningDate` on the `ProductionBatch` table. All the data in the column will be lost.
  - You are about to drop the column `freezerInDate` on the `ProductionBatch` table. All the data in the column will be lost.
  - You are about to drop the column `freezerOutDate` on the `ProductionBatch` table. All the data in the column will be lost.
  - You are about to drop the column `lastInventoryAt` on the `ProductionBatch` table. All the data in the column will be lost.
  - You are about to drop the column `lyophilizationEndDate` on the `ProductionBatch` table. All the data in the column will be lost.
  - You are about to drop the column `lyophilizationStartDate` on the `ProductionBatch` table. All the data in the column will be lost.
  - You are about to drop the column `postLyophilizationWeight` on the `ProductionBatch` table. All the data in the column will be lost.
  - You are about to drop the column `qualityControlDate` on the `ProductionBatch` table. All the data in the column will be lost.
  - You are about to drop the column `rejectedWeight` on the `ProductionBatch` table. All the data in the column will be lost.
  - You are about to drop the column `scheduledDate` on the `ProductionBatch` table. All the data in the column will be lost.
  - You are about to drop the column `statusId` on the `ProductionBatch` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "BatchStatus_name_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "BatchStatus";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "InventoryMovement";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "StatusChange";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "BatchFraction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "batchId" INTEGER NOT NULL,
    "fractionId" INTEGER NOT NULL,
    "polproduktWeight" REAL NOT NULL DEFAULT 0,
    "gotowyProduktWeight" REAL NOT NULL DEFAULT 0,
    "wasteWeight" REAL NOT NULL DEFAULT 0,
    "qualityControlDate" DATETIME,
    CONSTRAINT "BatchFraction_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "ProductionBatch" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BatchFraction_fractionId_fkey" FOREIGN KEY ("fractionId") REFERENCES "Fraction" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Fraction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);
INSERT INTO "new_Fraction" ("id", "name") SELECT "id", "name" FROM "Fraction";
DROP TABLE "Fraction";
ALTER TABLE "new_Fraction" RENAME TO "Fraction";
CREATE UNIQUE INDEX "Fraction_name_key" ON "Fraction"("name");
CREATE TABLE "new_ProductionBatch" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "batchNumber" TEXT NOT NULL,
    "productId" INTEGER,
    "supplierId" INTEGER,
    "recipientId" INTEGER,
    "machineId" INTEGER,
    "deliveryDate" DATETIME,
    "processStartDate" DATETIME,
    "processPlannedEndDate" DATETIME,
    "processEndDate" DATETIME,
    "initialWeight" REAL,
    "mroznia" REAL DEFAULT 0,
    "processInputWeight" REAL,
    "processOutputWeight" REAL,
    "polprodukt" REAL DEFAULT 0,
    "gotowyProdukt" REAL DEFAULT 0,
    "kartony" REAL DEFAULT 0,
    "suchaMasa" REAL DEFAULT 0,
    "notes" TEXT,
    CONSTRAINT "ProductionBatch_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ProductionBatch_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ProductionBatch_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "Recipient" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ProductionBatch_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machine" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ProductionBatch" ("batchNumber", "gotowyProdukt", "id", "initialWeight", "kartony", "machineId", "mroznia", "notes", "polprodukt", "productId", "recipientId", "supplierId") SELECT "batchNumber", "gotowyProdukt", "id", "initialWeight", "kartony", "machineId", "mroznia", "notes", "polprodukt", "productId", "recipientId", "supplierId" FROM "ProductionBatch";
DROP TABLE "ProductionBatch";
ALTER TABLE "new_ProductionBatch" RENAME TO "ProductionBatch";
CREATE UNIQUE INDEX "ProductionBatch_batchNumber_key" ON "ProductionBatch"("batchNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "BatchFraction_batchId_fractionId_key" ON "BatchFraction"("batchId", "fractionId");
