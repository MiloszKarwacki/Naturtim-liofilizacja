-- CreateTable
CREATE TABLE "Warehouse" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "totalWeight" REAL NOT NULL DEFAULT 0,
    "lastInventoryDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "WarehouseFraction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "warehouseId" INTEGER NOT NULL,
    "fractionId" INTEGER NOT NULL,
    "weight" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "WarehouseFraction_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "WarehouseFraction_fractionId_fkey" FOREIGN KEY ("fractionId") REFERENCES "Fraction" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Warehouse_name_key" ON "Warehouse"("name");

-- CreateIndex
CREATE UNIQUE INDEX "WarehouseFraction_warehouseId_fractionId_key" ON "WarehouseFraction"("warehouseId", "fractionId");
