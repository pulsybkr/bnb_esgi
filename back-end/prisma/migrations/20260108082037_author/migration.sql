-- CreateEnum
CREATE TYPE "StatutVerification" AS ENUM ('en_attente', 'approuve', 'rejete', 'expire');

-- CreateEnum
CREATE TYPE "TypeDocument" AS ENUM ('passeport', 'carte_identite', 'permis_conduire', 'titre_sejour');

-- CreateEnum
CREATE TYPE "PlateformAppareil" AS ENUM ('ios', 'android', 'web');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "identite_verifiee" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "niveau_verification" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "identity_verifications" (
    "id" TEXT NOT NULL,
    "id_utilisateur" TEXT NOT NULL,
    "type_document" "TypeDocument" NOT NULL,
    "numero_document" TEXT,
    "url_document" TEXT NOT NULL,
    "url_selfie" TEXT,
    "status" "StatutVerification" NOT NULL DEFAULT 'en_attente',
    "date_soumission" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_verification" TIMESTAMP(3),
    "verifie_par" TEXT,
    "motif_rejet" TEXT,
    "date_expiration" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "identity_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "push_notification_tokens" (
    "id" TEXT NOT NULL,
    "id_utilisateur" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "platform" "PlateformAppareil" NOT NULL,
    "id_appareil" TEXT,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "push_notification_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "push_notification_logs" (
    "id" TEXT NOT NULL,
    "id_utilisateur" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "data" JSONB,
    "date_envoi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_livraison" TIMESTAMP(3),
    "date_echec" TIMESTAMP(3),
    "message_erreur" TEXT,

    CONSTRAINT "push_notification_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "push_notification_tokens_token_key" ON "push_notification_tokens"("token");

-- AddForeignKey
ALTER TABLE "identity_verifications" ADD CONSTRAINT "identity_verifications_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "identity_verifications" ADD CONSTRAINT "identity_verifications_verifie_par_fkey" FOREIGN KEY ("verifie_par") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "push_notification_tokens" ADD CONSTRAINT "push_notification_tokens_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
