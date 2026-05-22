-- CreateTable
CREATE TABLE "proveedores" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "razonSocial" TEXT NOT NULL,
    "cuit" TEXT NOT NULL,
    "direccion" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "contacto" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "productos_inventario" (
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
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "productos_inventario_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "proveedores" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "lotes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numeroLote" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "fechaVencimiento" DATETIME NOT NULL,
    "stockDisponible" INTEGER NOT NULL DEFAULT 0,
    "stockInicial" INTEGER NOT NULL DEFAULT 0,
    "estado" TEXT NOT NULL DEFAULT 'VIGENTE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "lotes_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "productos_inventario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "movimientos_stock" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productoId" TEXT NOT NULL,
    "loteId" TEXT,
    "tipo" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "motivo" TEXT NOT NULL,
    "referencia" TEXT,
    "usuarioId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "movimientos_stock_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "productos_inventario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "movimientos_stock_loteId_fkey" FOREIGN KEY ("loteId") REFERENCES "lotes" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "recepciones" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "proveedorId" TEXT NOT NULL,
    "remito" TEXT,
    "fechaRecepcion" DATETIME NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'BORRADOR',
    "observaciones" TEXT,
    "usuarioId" TEXT,
    "totalItems" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "recepciones_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "proveedores" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "recepcion_detalles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recepcionId" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "ean" TEXT,
    "troquel" TEXT,
    "lote" TEXT NOT NULL,
    "fechaVencimiento" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "recepcion_detalles_recepcionId_fkey" FOREIGN KEY ("recepcionId") REFERENCES "recepciones" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "recepcion_detalles_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "productos_inventario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "solicitudes_compra" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "prioridad" TEXT NOT NULL DEFAULT 'NORMAL',
    "motivo" TEXT,
    "usuarioId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "solicitud_compra_detalles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "solicitudId" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "cantidadSolicitada" INTEGER NOT NULL,
    "cantidadAprobada" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "solicitud_compra_detalles_solicitudId_fkey" FOREIGN KEY ("solicitudId") REFERENCES "solicitudes_compra" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "solicitud_compra_detalles_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "productos_inventario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "proveedores_cuit_key" ON "proveedores"("cuit");

-- CreateIndex
CREATE UNIQUE INDEX "productos_inventario_ean_key" ON "productos_inventario"("ean");

-- CreateIndex
CREATE UNIQUE INDEX "productos_inventario_troquel_key" ON "productos_inventario"("troquel");

-- CreateIndex
CREATE UNIQUE INDEX "lotes_productoId_numeroLote_key" ON "lotes"("productoId", "numeroLote");
