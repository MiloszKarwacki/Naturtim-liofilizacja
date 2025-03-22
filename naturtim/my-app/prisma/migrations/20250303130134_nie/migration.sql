-- AlterTable
ALTER TABLE "ProductionBatch" ADD COLUMN "gotowyProdukt" REAL DEFAULT 0;
ALTER TABLE "ProductionBatch" ADD COLUMN "kartony" REAL DEFAULT 0;
ALTER TABLE "ProductionBatch" ADD COLUMN "lastInventoryAt" DATETIME;
ALTER TABLE "ProductionBatch" ADD COLUMN "mroznia" REAL DEFAULT 0;
ALTER TABLE "ProductionBatch" ADD COLUMN "polprodukt" REAL DEFAULT 0;
