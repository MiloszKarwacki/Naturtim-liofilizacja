-- CreateTable
CREATE TABLE "Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Recipient" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Machine" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Fraction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT
);

-- CreateTable
CREATE TABLE "BatchStatus" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT DEFAULT '#808080'
);

-- CreateTable
CREATE TABLE "ProductionBatch" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "batchNumber" TEXT NOT NULL,
    "productId" INTEGER,
    "supplierId" INTEGER,
    "statusId" INTEGER,
    "fractionId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scheduledDate" DATETIME,
    "freezerInDate" DATETIME,
    "freezerOutDate" DATETIME,
    "lyophilizationStartDate" DATETIME,
    "lyophilizationEndDate" DATETIME,
    "fractioningDate" DATETIME,
    "qualityControlDate" DATETIME,
    "finalProductDate" DATETIME,
    "initialWeight" REAL,
    "postLyophilizationWeight" REAL,
    "dryMassPercentage" REAL,
    "rejectedWeight" REAL,
    "finalWeight" REAL,
    "notes" TEXT,
    "recipientId" INTEGER,
    "machineId" INTEGER,
    CONSTRAINT "ProductionBatch_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ProductionBatch_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ProductionBatch_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "BatchStatus" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ProductionBatch_fractionId_fkey" FOREIGN KEY ("fractionId") REFERENCES "Fraction" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ProductionBatch_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "Recipient" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ProductionBatch_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machine" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StatusChange" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "batchId" INTEGER NOT NULL,
    "oldStatus" TEXT,
    "newStatus" TEXT NOT NULL,
    "changedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changedBy" TEXT NOT NULL,
    "notes" TEXT,
    CONSTRAINT "StatusChange_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "ProductionBatch" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InventoryMovement" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "batchId" INTEGER NOT NULL,
    "sourceLocation" TEXT NOT NULL,
    "targetLocation" TEXT NOT NULL,
    "weight" REAL NOT NULL,
    "movedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "movedBy" TEXT NOT NULL,
    "notes" TEXT,
    CONSTRAINT "InventoryMovement_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "ProductionBatch" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Fraction_name_key" ON "Fraction"("name");

-- CreateIndex
CREATE UNIQUE INDEX "BatchStatus_name_key" ON "BatchStatus"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ProductionBatch_batchNumber_key" ON "ProductionBatch"("batchNumber");
