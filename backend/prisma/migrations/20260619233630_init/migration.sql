-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_productos_inventario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "principioActivo" TEXT,
    "presentacion" TEXT,
    "categoria" TEXT NOT NULL,
    "ean" TEXT,
    "troquel" TEXT,
    "stockActual" INTEGER NOT NULL DEFAULT 0,
    "stockMinimo" INTEGER NOT NULL DEFAULT 10,
    "stockCritico" INTEGER NOT NULL DEFAULT 5,
    "unidad" TEXT NOT NULL DEFAULT 'unidad',
    "proveedorId" TEXT,
    "genericoId" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "productos_inventario_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "proveedores" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "productos_inventario_genericoId_fkey" FOREIGN KEY ("genericoId") REFERENCES "medicamentos_genericos" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_productos_inventario" ("activo", "categoria", "createdAt", "descripcion", "ean", "genericoId", "id", "nombre", "presentacion", "principioActivo", "proveedorId", "stockActual", "stockCritico", "stockMinimo", "troquel", "unidad", "updatedAt") SELECT "activo", "categoria", "createdAt", "descripcion", "ean", "genericoId", "id", "nombre", "presentacion", "principioActivo", "proveedorId", "stockActual", "stockCritico", "stockMinimo", "troquel", "unidad", "updatedAt" FROM "productos_inventario";
DROP TABLE "productos_inventario";
ALTER TABLE "new_productos_inventario" RENAME TO "productos_inventario";
CREATE UNIQUE INDEX "productos_inventario_ean_key" ON "productos_inventario"("ean");
CREATE UNIQUE INDEX "productos_inventario_troquel_key" ON "productos_inventario"("troquel");
CREATE TABLE "new_solicitudes_compra" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "prioridad" TEXT NOT NULL DEFAULT 'NORMAL',
    "motivo" TEXT,
    "usuarioId" TEXT,
    "ordenCompraId" TEXT,
    "ordenCompraExternaId" TEXT,
    "referenciaExterna" TEXT,
    "proveedorSugeridoId" TEXT,
    "proveedorAdjudicadoRazonSocial" TEXT,
    "fechaAprobacion" DATETIME,
    "fechaEntregaEstimada" DATETIME,
    "observaciones" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "solicitudes_compra_proveedorSugeridoId_fkey" FOREIGN KEY ("proveedorSugeridoId") REFERENCES "proveedores" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_solicitudes_compra" ("createdAt", "estado", "fechaAprobacion", "fechaEntregaEstimada", "id", "motivo", "observaciones", "ordenCompraExternaId", "ordenCompraId", "prioridad", "proveedorAdjudicadoRazonSocial", "proveedorSugeridoId", "referenciaExterna", "updatedAt", "usuarioId") SELECT "createdAt", "estado", "fechaAprobacion", "fechaEntregaEstimada", "id", "motivo", "observaciones", "ordenCompraExternaId", "ordenCompraId", "prioridad", "proveedorAdjudicadoRazonSocial", "proveedorSugeridoId", "referenciaExterna", "updatedAt", "usuarioId" FROM "solicitudes_compra";
DROP TABLE "solicitudes_compra";
ALTER TABLE "new_solicitudes_compra" RENAME TO "solicitudes_compra";
CREATE UNIQUE INDEX "solicitudes_compra_ordenCompraId_key" ON "solicitudes_compra"("ordenCompraId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
