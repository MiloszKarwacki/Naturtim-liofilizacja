/*
  Warnings:

  - Added the required column `color` to the `Machine` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Machine" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL
);
INSERT INTO "new_Machine" ("id", "name") SELECT "id", "name" FROM "Machine";
DROP TABLE "Machine";
ALTER TABLE "new_Machine" RENAME TO "Machine";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
