-- CreateEnum
CREATE TYPE "BookingMode" AS ENUM ('instant', 'request');

-- AlterTable
ALTER TABLE "logements" ADD COLUMN     "mode_reservation" "BookingMode" NOT NULL DEFAULT 'instant';

-- AlterTable
ALTER TABLE "reservations" ADD COLUMN     "prix_negocie" DECIMAL(10,2),
ADD COLUMN     "prix_par_nuit" DECIMAL(10,2);
