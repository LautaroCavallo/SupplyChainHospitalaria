PRAGMA foreign_keys=OFF;

CREATE TABLE "new_recepciones" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "proveedorId" TEXT NOT NULL,
  "solicitudCompraId" TEXT,
  "remito" TEXT,
  "fechaRecepcion" DATETIME NOT NULL,
  "estado" TEXT NOT NULL DEFAULT 'PROCESADA',
  "observaciones" TEXT,
  "usuarioId" TEXT,
  "totalItems" INTEGER NOT NULL DEFAULT 0,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "recepciones_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "proveedores" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "recepciones_solicitudCompraId_fkey" FOREIGN KEY ("solicitudCompraId") REFERENCES "solicitudes_compra" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

INSERT INTO "new_recepciones" (
  "id",
  "proveedorId",
  "remito",
  "fechaRecepcion",
  "estado",
  "observaciones",
  "usuarioId",
  "totalItems",
  "createdAt",
  "updatedAt"
)
SELECT
  "id",
  "proveedorId",
  "remito",
  "fechaRecepcion",
  "estado",
  "observaciones",
  "usuarioId",
  "totalItems",
  "createdAt",
  "updatedAt"
FROM "recepciones";

DROP TABLE "recepciones";
ALTER TABLE "new_recepciones" RENAME TO "recepciones";
CREATE UNIQUE INDEX "recepciones_solicitudCompraId_key" ON "recepciones"("solicitudCompraId");

CREATE TABLE "new_recepcion_detalles" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "recepcionId" TEXT NOT NULL,
  "productoId" TEXT NOT NULL,
  "cantidad" INTEGER NOT NULL,
  "ean" TEXT,
  "troquel" TEXT,
  "lote" TEXT,
  "fechaVencimiento" DATETIME,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "recepcion_detalles_recepcionId_fkey" FOREIGN KEY ("recepcionId") REFERENCES "recepciones" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "recepcion_detalles_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "productos_inventario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

INSERT INTO "new_recepcion_detalles" (
  "id",
  "recepcionId",
  "productoId",
  "cantidad",
  "ean",
  "troquel",
  "lote",
  "fechaVencimiento",
  "createdAt"
)
SELECT
  "id",
  "recepcionId",
  "productoId",
  "cantidad",
  "ean",
  "troquel",
  "lote",
  "fechaVencimiento",
  "createdAt"
FROM "recepcion_detalles";

DROP TABLE "recepcion_detalles";
ALTER TABLE "new_recepcion_detalles" RENAME TO "recepcion_detalles";

PRAGMA foreign_keys=ON;
