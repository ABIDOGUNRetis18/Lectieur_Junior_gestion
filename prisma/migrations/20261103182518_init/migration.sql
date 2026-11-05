-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'RESPONSABLE');

-- CreateEnum
CREATE TYPE "StatutEnfant" AS ENUM ('ACTIF', 'INACTIF');

-- CreateEnum
CREATE TYPE "RoleEnfant" AS ENUM ('ENFANT', 'RESPONSABLE');

-- CreateEnum
CREATE TYPE "EtatPresence" AS ENUM ('PRESENT', 'PERMISSION', 'ABSENT');

-- CreateEnum
CREATE TYPE "ClasseEcole" AS ENUM ('AVANT_CM1', 'CM1', 'CM2', 'SIXIEME', 'CINQUIEME', 'QUATRIEME', 'TROISIEME', 'SECONDE', 'PREMIERE', 'TERMINALE', 'SUPERIEUR', 'TERMINEE');

-- CreateEnum
CREATE TYPE "ClasseCatechisme" AS ENUM ('ANNEE_1', 'ANNEE_2', 'ANNEE_3', 'ANNEE_4', 'ANNEE_5', 'TERMINE');

-- CreateTable
CREATE TABLE "Groupe" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "moisDebutAnnee" INTEGER NOT NULL DEFAULT 10,
    "moisSansReunion" INTEGER[] DEFAULT ARRAY[7, 8, 9]::INTEGER[],
    "premierDimanche" TIMESTAMP(3) NOT NULL,
    "montantCotisation" INTEGER NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Groupe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fraternite" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "groupeId" TEXT NOT NULL,

    CONSTRAINT "Fraternite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "groupeId" TEXT NOT NULL,
    "fraterniteId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Enfant" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenoms" TEXT NOT NULL,
    "dateNaissance" TIMESTAMP(3) NOT NULL,
    "cleDoublon" TEXT NOT NULL,
    "classeEcole" "ClasseEcole" NOT NULL,
    "serie" TEXT,
    "classeCatechisme" "ClasseCatechisme" NOT NULL,
    "telephoneParent" TEXT,
    "statut" "StatutEnfant" NOT NULL DEFAULT 'ACTIF',
    "role" "RoleEnfant" NOT NULL DEFAULT 'ENFANT',
    "fraterniteId" TEXT NOT NULL,
    "groupeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Enfant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Presence" (
    "id" TEXT NOT NULL,
    "enfantId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "etat" "EtatPresence" NOT NULL DEFAULT 'ABSENT',
    "groupeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Presence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cotisation" (
    "id" TEXT NOT NULL,
    "enfantId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "montant" INTEGER NOT NULL DEFAULT 0,
    "groupeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cotisation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Historique" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "utilisateurId" TEXT,
    "groupeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Historique_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Groupe_slug_key" ON "Groupe"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Fraternite_groupeId_nom_key" ON "Fraternite"("groupeId", "nom");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Enfant_groupeId_fraterniteId_statut_idx" ON "Enfant"("groupeId", "fraterniteId", "statut");

-- CreateIndex
CREATE UNIQUE INDEX "Enfant_groupeId_cleDoublon_key" ON "Enfant"("groupeId", "cleDoublon");

-- CreateIndex
CREATE INDEX "Presence_groupeId_date_idx" ON "Presence"("groupeId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Presence_enfantId_date_key" ON "Presence"("enfantId", "date");

-- CreateIndex
CREATE INDEX "Cotisation_groupeId_date_idx" ON "Cotisation"("groupeId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Cotisation_enfantId_date_key" ON "Cotisation"("enfantId", "date");

-- CreateIndex
CREATE INDEX "Historique_groupeId_createdAt_idx" ON "Historique"("groupeId", "createdAt");

-- AddForeignKey
ALTER TABLE "Fraternite" ADD CONSTRAINT "Fraternite_groupeId_fkey" FOREIGN KEY ("groupeId") REFERENCES "Groupe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_groupeId_fkey" FOREIGN KEY ("groupeId") REFERENCES "Groupe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_fraterniteId_fkey" FOREIGN KEY ("fraterniteId") REFERENCES "Fraternite"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enfant" ADD CONSTRAINT "Enfant_fraterniteId_fkey" FOREIGN KEY ("fraterniteId") REFERENCES "Fraternite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enfant" ADD CONSTRAINT "Enfant_groupeId_fkey" FOREIGN KEY ("groupeId") REFERENCES "Groupe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Presence" ADD CONSTRAINT "Presence_enfantId_fkey" FOREIGN KEY ("enfantId") REFERENCES "Enfant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Presence" ADD CONSTRAINT "Presence_groupeId_fkey" FOREIGN KEY ("groupeId") REFERENCES "Groupe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cotisation" ADD CONSTRAINT "Cotisation_enfantId_fkey" FOREIGN KEY ("enfantId") REFERENCES "Enfant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cotisation" ADD CONSTRAINT "Cotisation_groupeId_fkey" FOREIGN KEY ("groupeId") REFERENCES "Groupe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Historique" ADD CONSTRAINT "Historique_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Historique" ADD CONSTRAINT "Historique_groupeId_fkey" FOREIGN KEY ("groupeId") REFERENCES "Groupe"("id") ON DELETE CASCADE ON UPDATE CASCADE;
