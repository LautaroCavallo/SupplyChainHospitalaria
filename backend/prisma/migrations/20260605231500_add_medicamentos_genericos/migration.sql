-- CreateTable
CREATE TABLE "medicamentos_genericos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "principioActivo" TEXT NOT NULL,
    "dosis" TEXT,
    "formaFarmaceutica" TEXT,
    "nombreNormalizado" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- AlterTable
ALTER TABLE "productos_inventario" ADD COLUMN "genericoId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "medicamentos_genericos_nombreNormalizado_key" ON "medicamentos_genericos"("nombreNormalizado");
