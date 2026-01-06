-- CreateEnum
CREATE TYPE "TypeUtilisateur" AS ENUM ('locataire', 'proprietaire', 'admin');

-- CreateEnum
CREATE TYPE "StatutUtilisateur" AS ENUM ('actif', 'suspendu', 'inactif');

-- CreateEnum
CREATE TYPE "TypeLogement" AS ENUM ('maison', 'appartement', 'chambre', 'hotel', 'villa', 'studio', 'loft');

-- CreateEnum
CREATE TYPE "StatutLogement" AS ENUM ('actif', 'suspendu', 'archive');

-- CreateEnum
CREATE TYPE "StatutDisponibilite" AS ENUM ('disponible', 'reserve', 'bloque');

-- CreateEnum
CREATE TYPE "StatutReservation" AS ENUM ('en_attente', 'confirmee', 'annulee', 'terminee', 'en_cours');

-- CreateEnum
CREATE TYPE "StatutPaiement" AS ENUM ('en_attente', 'reussi', 'echec', 'rembourse', 'annule');

-- CreateEnum
CREATE TYPE "MoyenPaiement" AS ENUM ('mobile_money', 'carte', 'paypal');

-- CreateEnum
CREATE TYPE "TypeMessage" AS ENUM ('reservation', 'support', 'general');

-- CreateEnum
CREATE TYPE "TypeCibleAvis" AS ENUM ('logement', 'voyageur', 'proprietaire');

-- CreateEnum
CREATE TYPE "StatutAvis" AS ENUM ('publie', 'masque', 'modere');

-- CreateEnum
CREATE TYPE "TypeNotification" AS ENUM ('reservation', 'paiement', 'message', 'avis', 'systeme');

-- CreateEnum
CREATE TYPE "TypeContenuSignalement" AS ENUM ('logement', 'avis', 'utilisateur', 'message');

-- CreateEnum
CREATE TYPE "MotifSignalement" AS ENUM ('contenu_inapproprie', 'faux', 'spam', 'autre');

-- CreateEnum
CREATE TYPE "StatutSignalement" AS ENUM ('en_attente', 'traite', 'rejete');

-- CreateEnum
CREATE TYPE "TypeService" AS ENUM ('fixed', 'per_night', 'per_guest', 'per_guest_per_night');

-- CreateEnum
CREATE TYPE "TypeRegleTarification" AS ENUM ('season', 'weekend', 'long_stay', 'custom');

-- CreateEnum
CREATE TYPE "TypeSaison" AS ENUM ('high', 'low');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telephone" TEXT,
    "password_hash" TEXT NOT NULL,
    "adresse" TEXT,
    "ville" TEXT,
    "pays" TEXT,
    "type_utilisateur" "TypeUtilisateur" NOT NULL DEFAULT 'locataire',
    "email_verifie" BOOLEAN NOT NULL DEFAULT false,
    "telephone_verifie" BOOLEAN NOT NULL DEFAULT false,
    "photo_profil" TEXT,
    "preferences" JSONB,
    "statut" "StatutUtilisateur" NOT NULL DEFAULT 'actif',
    "date_inscription" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "derniere_connexion" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logements" (
    "id" TEXT NOT NULL,
    "id_proprietaire" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT,
    "adresse" TEXT NOT NULL,
    "ville" TEXT NOT NULL,
    "pays" TEXT NOT NULL,
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "type" "TypeLogement" NOT NULL,
    "nombre_pieces" INTEGER NOT NULL,
    "nombre_chambres" INTEGER NOT NULL DEFAULT 0,
    "nombre_salles_bain" INTEGER NOT NULL DEFAULT 0,
    "capacite_accueil" INTEGER NOT NULL,
    "prix_par_nuit" DECIMAL(10,2) NOT NULL,
    "devise" TEXT NOT NULL DEFAULT 'XOF',
    "equipements" JSONB,
    "regles_maison" JSONB,
    "tags" JSONB,
    "heure_arrivee" TEXT DEFAULT '15:00',
    "heure_depart" TEXT DEFAULT '11:00',
    "statut" "StatutLogement" NOT NULL DEFAULT 'actif',
    "note_moyenne" DOUBLE PRECISION DEFAULT 0,
    "nombre_avis" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "logements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "photos" (
    "id" TEXT NOT NULL,
    "id_logement" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "url_miniature" TEXT,
    "est_principale" BOOLEAN NOT NULL DEFAULT false,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disponibilites" (
    "id" TEXT NOT NULL,
    "id_logement" TEXT NOT NULL,
    "date_debut" DATE NOT NULL,
    "date_fin" DATE NOT NULL,
    "statut" "StatutDisponibilite" NOT NULL DEFAULT 'disponible',
    "prix_personnalise" DECIMAL(10,2),
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "disponibilites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservations" (
    "id" TEXT NOT NULL,
    "id_logement" TEXT NOT NULL,
    "id_locataire" TEXT NOT NULL,
    "date_debut" DATE NOT NULL,
    "date_fin" DATE NOT NULL,
    "nombre_voyageurs" INTEGER NOT NULL,
    "montant_total" DECIMAL(10,2) NOT NULL,
    "devise" TEXT NOT NULL DEFAULT 'XOF',
    "statut" "StatutReservation" NOT NULL DEFAULT 'en_attente',
    "message_locataire" TEXT,
    "motif_annulation" TEXT,
    "date_annulation" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paiements" (
    "id" TEXT NOT NULL,
    "id_reservation" TEXT NOT NULL,
    "id_utilisateur" TEXT NOT NULL,
    "montant" DECIMAL(10,2) NOT NULL,
    "devise" TEXT NOT NULL DEFAULT 'XOF',
    "statut" "StatutPaiement" NOT NULL DEFAULT 'en_attente',
    "moyen_paiement" "MoyenPaiement" NOT NULL,
    "operateur_mobile_money" TEXT,
    "reference_transaction" TEXT,
    "reference_externe" TEXT,
    "details_paiement" JSONB,
    "message_erreur" TEXT,
    "date_transaction" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "paiements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "expediteur_id" TEXT NOT NULL,
    "destinataire_id" TEXT NOT NULL,
    "id_reservation" TEXT,
    "contenu" TEXT NOT NULL,
    "lu" BOOLEAN NOT NULL DEFAULT false,
    "date_lecture" TIMESTAMP(3),
    "type" "TypeMessage" NOT NULL DEFAULT 'general',
    "date_envoi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avis" (
    "id" TEXT NOT NULL,
    "id_reservation" TEXT NOT NULL,
    "id_auteur" TEXT NOT NULL,
    "id_cible" TEXT,
    "type_cible" "TypeCibleAvis" NOT NULL,
    "note" INTEGER NOT NULL,
    "commentaire" TEXT,
    "notes_detaillees" JSONB,
    "reponse_proprietaire" TEXT,
    "date_reponse" TIMESTAMP(3),
    "signale" BOOLEAN NOT NULL DEFAULT false,
    "motif_signalement" TEXT,
    "statut" "StatutAvis" NOT NULL DEFAULT 'publie',
    "date_publication" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "avis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favoris" (
    "id" TEXT NOT NULL,
    "id_utilisateur" TEXT NOT NULL,
    "id_logement" TEXT NOT NULL,
    "note_privee" TEXT,
    "date_ajout" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favoris_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "id_utilisateur" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "contenu" TEXT NOT NULL,
    "type" "TypeNotification" NOT NULL,
    "data" JSONB,
    "lu" BOOLEAN NOT NULL DEFAULT false,
    "date_lecture" TIMESTAMP(3),
    "date_envoi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "signalements" (
    "id" TEXT NOT NULL,
    "id_utilisateur" TEXT NOT NULL,
    "type_contenu" "TypeContenuSignalement" NOT NULL,
    "id_contenu" TEXT NOT NULL,
    "motif" "MotifSignalement" NOT NULL,
    "description" TEXT,
    "statut" "StatutSignalement" NOT NULL DEFAULT 'en_attente',
    "id_moderateur" TEXT,
    "decision" TEXT,
    "date_traitement" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "signalements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_telephone_key" ON "users"("telephone");

-- CreateIndex
CREATE UNIQUE INDEX "favoris_id_utilisateur_id_logement_key" ON "favoris"("id_utilisateur", "id_logement");

-- AddForeignKey
ALTER TABLE "logements" ADD CONSTRAINT "logements_id_proprietaire_fkey" FOREIGN KEY ("id_proprietaire") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photos" ADD CONSTRAINT "photos_id_logement_fkey" FOREIGN KEY ("id_logement") REFERENCES "logements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disponibilites" ADD CONSTRAINT "disponibilites_id_logement_fkey" FOREIGN KEY ("id_logement") REFERENCES "logements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_id_logement_fkey" FOREIGN KEY ("id_logement") REFERENCES "logements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_id_locataire_fkey" FOREIGN KEY ("id_locataire") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paiements" ADD CONSTRAINT "paiements_id_reservation_fkey" FOREIGN KEY ("id_reservation") REFERENCES "reservations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paiements" ADD CONSTRAINT "paiements_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_expediteur_id_fkey" FOREIGN KEY ("expediteur_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_destinataire_id_fkey" FOREIGN KEY ("destinataire_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_id_reservation_fkey" FOREIGN KEY ("id_reservation") REFERENCES "reservations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avis" ADD CONSTRAINT "avis_id_reservation_fkey" FOREIGN KEY ("id_reservation") REFERENCES "reservations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avis" ADD CONSTRAINT "avis_id_auteur_fkey" FOREIGN KEY ("id_auteur") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favoris" ADD CONSTRAINT "favoris_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favoris" ADD CONSTRAINT "favoris_id_logement_fkey" FOREIGN KEY ("id_logement") REFERENCES "logements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signalements" ADD CONSTRAINT "signalements_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signalements" ADD CONSTRAINT "signalements_id_moderateur_fkey" FOREIGN KEY ("id_moderateur") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "services" (
    "id" TEXT NOT NULL,
    "id_logement" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "type_prix" "TypeService" NOT NULL,
    "icone" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configurations_tarification" (
    "id" TEXT NOT NULL,
    "id_logement" TEXT NOT NULL,
    "prix_base" DECIMAL(10,2) NOT NULL,
    "devise" TEXT NOT NULL DEFAULT 'EUR',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configurations_tarification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "regles_tarification" (
    "id" TEXT NOT NULL,
    "id_configuration" TEXT NOT NULL,
    "type" "TypeRegleTarification" NOT NULL,
    "name" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "season" "TypeSaison",
    "mois_debut" INTEGER,
    "mois_fin" INTEGER,
    "multiplicateur_prix" DECIMAL(5,2),
    "multiplicateur_weekend" DECIMAL(5,2),
    "multiplicateur_semaine" DECIMAL(5,2),
    "nuits_minimum" INTEGER,
    "pourcentage_reduction" DECIMAL(5,2),
    "reduction_maximale" DECIMAL(5,2),
    "date_debut" DATE,
    "date_fin" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "regles_tarification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "configurations_tarification_id_logement_key" ON "configurations_tarification"("id_logement");

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_id_logement_fkey" FOREIGN KEY ("id_logement") REFERENCES "logements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "configurations_tarification" ADD CONSTRAINT "configurations_tarification_id_logement_fkey" FOREIGN KEY ("id_logement") REFERENCES "logements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "regles_tarification" ADD CONSTRAINT "regles_tarification_id_configuration_fkey" FOREIGN KEY ("id_configuration") REFERENCES "configurations_tarification"("id") ON DELETE CASCADE ON UPDATE CASCADE;
