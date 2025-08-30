/*
  Warnings:

  - You are about to drop the `Bitacora` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Usuario` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Bitacora";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Usuario";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "usuario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "avatar" TEXT,
    "carpetaRootId" INTEGER,
    "rol" TEXT NOT NULL DEFAULT 'USER',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "usuario_carpetaRootId_fkey" FOREIGN KEY ("carpetaRootId") REFERENCES "carpeta" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "bitacora" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "usuarioId" INTEGER NOT NULL,
    "accion" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "hora" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha" DATETIME NOT NULL,
    "mensaje" TEXT,
    CONSTRAINT "bitacora_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "carpeta" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "parentId" INTEGER,
    "icono" TEXT DEFAULT 'folder',
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "ruta" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "carpeta_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "carpeta" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "archivo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "carpetaId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "optimizado" BOOLEAN NOT NULL DEFAULT false,
    "size" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "archivo_carpetaId_fkey" FOREIGN KEY ("carpetaId") REFERENCES "carpeta" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ruta" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "archivoId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "url_base64" TEXT,
    "url_thumb" TEXT,
    "url_optima" TEXT,
    CONSTRAINT "ruta_archivoId_fkey" FOREIGN KEY ("archivoId") REFERENCES "archivo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "usuariocarpeta" (
    "usuarioId" INTEGER NOT NULL,
    "carpetaId" INTEGER NOT NULL,

    PRIMARY KEY ("usuarioId", "carpetaId"),
    CONSTRAINT "usuariocarpeta_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "usuariocarpeta_carpetaId_fkey" FOREIGN KEY ("carpetaId") REFERENCES "carpeta" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "usuarioarchivo" (
    "usuarioId" INTEGER NOT NULL,
    "archivoId" INTEGER NOT NULL,

    PRIMARY KEY ("usuarioId", "archivoId"),
    CONSTRAINT "usuarioarchivo_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "usuarioarchivo_archivoId_fkey" FOREIGN KEY ("archivoId") REFERENCES "archivo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "usuario_username_key" ON "usuario"("username");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_email_key" ON "usuario"("email");
