/*
  Warnings:

  - Added the required column `depositoId` to the `lotes` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "depositos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'PISO',
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- Depósito Central por defecto (para backfill de lotes existentes)
INSERT INTO "depositos" ("id", "nombre", "tipo", "descripcion", "activo", "createdAt", "updatedAt")
VALUES ('00000000-0000-0000-0000-000000000001', 'Farmacia Central', 'CENTRAL', 'Depósito central por defecto', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_lotes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numeroLote" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "depositoId" TEXT NOT NULL,
    "fechaVencimiento" DATETIME NOT NULL,
    "stockDisponible" INTEGER NOT NULL DEFAULT 0,
    "stockInicial" INTEGER NOT NULL DEFAULT 0,
    "estado" TEXT NOT NULL DEFAULT 'VIGENTE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "lotes_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "productos_inventario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "lotes_depositoId_fkey" FOREIGN KEY ("depositoId") REFERENCES "depositos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_lotes" ("createdAt", "estado", "fechaVencimiento", "id", "numeroLote", "productoId", "depositoId", "stockDisponible", "stockInicial", "updatedAt") SELECT "createdAt", "estado", "fechaVencimiento", "id", "numeroLote", "productoId", '00000000-0000-0000-0000-000000000001', "stockDisponible", "stockInicial", "updatedAt" FROM "lotes";
DROP TABLE "lotes";
ALTER TABLE "new_lotes" RENAME TO "lotes";
CREATE UNIQUE INDEX "lotes_productoId_numeroLote_depositoId_key" ON "lotes"("productoId", "numeroLote", "depositoId");
CREATE TABLE "new_movimientos_stock" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productoId" TEXT NOT NULL,
    "loteId" TEXT,
    "depositoId" TEXT,
    "depositoDestinoId" TEXT,
    "tipo" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "motivo" TEXT NOT NULL,
    "referencia" TEXT,
    "usuarioId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "movimientos_stock_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "productos_inventario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "movimientos_stock_loteId_fkey" FOREIGN KEY ("loteId") REFERENCES "lotes" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "movimientos_stock_depositoId_fkey" FOREIGN KEY ("depositoId") REFERENCES "depositos" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "movimientos_stock_depositoDestinoId_fkey" FOREIGN KEY ("depositoDestinoId") REFERENCES "depositos" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_movimientos_stock" ("cantidad", "createdAt", "id", "loteId", "motivo", "productoId", "referencia", "tipo", "usuarioId") SELECT "cantidad", "createdAt", "id", "loteId", "motivo", "productoId", "referencia", "tipo", "usuarioId" FROM "movimientos_stock";
DROP TABLE "movimientos_stock";
ALTER TABLE "new_movimientos_stock" RENAME TO "movimientos_stock";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
