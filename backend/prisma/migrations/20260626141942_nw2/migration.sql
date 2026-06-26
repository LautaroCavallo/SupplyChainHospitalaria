-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_notificaciones" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tipo" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "referencia" TEXT,
    "usuarioId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_notificaciones" ("createdAt", "descripcion", "id", "leida", "referencia", "tipo", "titulo", "updatedAt", "usuarioId") SELECT "createdAt", "descripcion", "id", "leida", "referencia", "tipo", "titulo", "updatedAt", "usuarioId" FROM "notificaciones";
DROP TABLE "notificaciones";
ALTER TABLE "new_notificaciones" RENAME TO "notificaciones";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
