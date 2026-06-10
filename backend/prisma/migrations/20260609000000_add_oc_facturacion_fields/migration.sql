-- AlterTable: add OC fields to solicitudes_compra
ALTER TABLE "solicitudes_compra" ADD COLUMN "ordenCompraId" TEXT;
ALTER TABLE "solicitudes_compra" ADD COLUMN "ordenCompraExternaId" TEXT;
ALTER TABLE "solicitudes_compra" ADD COLUMN "referenciaExterna" TEXT;
ALTER TABLE "solicitudes_compra" ADD COLUMN "proveedorSugeridoId" TEXT;
ALTER TABLE "solicitudes_compra" ADD COLUMN "proveedorAdjudicadoRazonSocial" TEXT;
ALTER TABLE "solicitudes_compra" ADD COLUMN "fechaAprobacion" DATETIME;
ALTER TABLE "solicitudes_compra" ADD COLUMN "fechaEntregaEstimada" DATETIME;
ALTER TABLE "solicitudes_compra" ADD COLUMN "observaciones" TEXT;

-- AlterTable: add fields to solicitud_compra_detalles
ALTER TABLE "solicitud_compra_detalles" ADD COLUMN "unidad" TEXT NOT NULL DEFAULT 'unidad';
ALTER TABLE "solicitud_compra_detalles" ADD COLUMN "precioUnitario" REAL;
