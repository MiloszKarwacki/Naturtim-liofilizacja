/*
  Warnings:

  - You are about to drop the `Warehouse` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WarehouseFraction` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Warehouse";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "WarehouseFraction";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "warehouses" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "totalWeight" REAL NOT NULL DEFAULT 0,
    "lastInventoryDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "warehouse_fractions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "warehouseId" INTEGER NOT NULL,
    "fractionId" INTEGER NOT NULL,
    "weight" REAL NOT NULL DEFAULT 0,
    "productionBatchId" INTEGER,
    CONSTRAINT "warehouse_fractions_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "warehouse_fractions_fractionId_fkey" FOREIGN KEY ("fractionId") REFERENCES "Fraction" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "warehouse_fractions_productionBatchId_fkey" FOREIGN KEY ("productionBatchId") REFERENCES "ProductionBatch" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "warehouses_name_key" ON "warehouses"("name");

-- CreateIndex
CREATE UNIQUE INDEX "warehouse_fractions_warehouseId_fractionId_productionBatchId_key" ON "warehouse_fractions"("warehouseId", "fractionId", "productionBatchId");
