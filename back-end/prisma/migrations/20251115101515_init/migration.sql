/*
  Warnings:

  - You are about to drop the column `statut` on the `avis` table. All the data in the column will be lost.
  - You are about to drop the column `statut` on the `disponibilites` table. All the data in the column will be lost.
  - You are about to drop the column `statut` on the `logements` table. All the data in the column will be lost.
  - You are about to drop the column `statut` on the `paiements` table. All the data in the column will be lost.
  - You are about to drop the column `statut` on the `reservations` table. All the data in the column will be lost.
  - You are about to drop the column `statut` on the `signalements` table. All the data in the column will be lost.
  - You are about to drop the column `statut` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "avis" DROP COLUMN "statut",
ADD COLUMN     "status" "StatutAvis" NOT NULL DEFAULT 'publie';

-- AlterTable
ALTER TABLE "disponibilites" DROP COLUMN "statut",
ADD COLUMN     "status" "StatutDisponibilite" NOT NULL DEFAULT 'disponible';

-- AlterTable
ALTER TABLE "logements" DROP COLUMN "statut",
ADD COLUMN     "status" "StatutLogement" NOT NULL DEFAULT 'actif';

-- AlterTable
ALTER TABLE "paiements" DROP COLUMN "statut",
ADD COLUMN     "status" "StatutPaiement" NOT NULL DEFAULT 'en_attente';

-- AlterTable
ALTER TABLE "reservations" DROP COLUMN "statut",
ADD COLUMN     "status" "StatutReservation" NOT NULL DEFAULT 'en_attente';

-- AlterTable
ALTER TABLE "signalements" DROP COLUMN "statut",
ADD COLUMN     "status" "StatutSignalement" NOT NULL DEFAULT 'en_attente';

-- AlterTable
ALTER TABLE "users" DROP COLUMN "statut",
ADD COLUMN     "status" "StatutUtilisateur" NOT NULL DEFAULT 'actif';
