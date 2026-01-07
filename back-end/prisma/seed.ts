import { PrismaClient, TypeLogement, StatutLogement, StatutDisponibilite, StatutReservation, TypeCibleAvis, StatutAvis, StatutUtilisateur, TypeUtilisateur } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seeding...');

  // Nettoyer la base de données
  await prisma.signalement.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.favori.deleteMany();
  await prisma.avis.deleteMany();
  await prisma.message.deleteMany();
  await prisma.paiement.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.disponibilite.deleteMany();
  await prisma.photo.deleteMany();
  await prisma.logement.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Base de données nettoyée');

  // Créer des utilisateurs
  const hashedPassword = await bcrypt.hash('Password123!', 10);

  // Admin
  const admin = await prisma.user.create({
    data: {
      firstName: 'Admin',
      lastName: 'Système',
      email: 'admin@bnb-esgi.com',
      passwordHash: hashedPassword,
      phone: '+221771234567',
      userType: TypeUtilisateur.admin,
      emailVerified: true,
      phoneVerified: true,
      city: 'Dakar',
      country: 'Sénégal',
      status: StatutUtilisateur.actif,
    },
  });

  // Propriétaires
  const proprietaires = await Promise.all([
    prisma.user.create({
      data: {
        firstName: 'Amadou',
        lastName: 'Diallo',
        email: 'amadou.diallo@example.com',
        passwordHash: hashedPassword,
        phone: '+221776543210',
        address: 'Almadies, Dakar',
        city: 'Dakar',
        country: 'Sénégal',
        userType: TypeUtilisateur.proprietaire,
        emailVerified: true,
        phoneVerified: true,
        status: StatutUtilisateur.actif,
      },
    }),
    prisma.user.create({
      data: {
        firstName: 'Fatou',
        lastName: 'Sow',
        email: 'fatou.sow@example.com',
        passwordHash: hashedPassword,
        phone: '+225070123456',
        address: 'Cocody, Abidjan',
        city: 'Abidjan',
        country: 'Côte d\'Ivoire',
        userType: TypeUtilisateur.proprietaire,
        emailVerified: true,
        phoneVerified: true,
        status: StatutUtilisateur.actif,
      },
    }),
    prisma.user.create({
      data: {
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'proprietaire1@test.com',
        passwordHash: hashedPassword,
        phone: '+33123456711',
        userType: TypeUtilisateur.proprietaire,
        emailVerified: true,
        phoneVerified: true,
        status: StatutUtilisateur.actif,
        address: '123 Rue de la Paix',
        city: 'Paris',
        country: 'France',
      },
    }),
    prisma.user.create({
      data: {
        firstName: 'Marie',
        lastName: 'Martin',
        email: 'proprietaire2@test.com',
        passwordHash: hashedPassword,
        phone: '+33987654322',
        userType: TypeUtilisateur.proprietaire,
        emailVerified: true,
        phoneVerified: true,
        status: StatutUtilisateur.actif,
        address: '456 Avenue des Champs',
        city: 'Lyon',
        country: 'France',
      },
    }),
  ]);

  // Locataires
  const locataires = await Promise.all([
    prisma.user.create({
      data: {
        firstName: 'Marie',
        lastName: 'Dupont',
        email: 'marie.dupont@example.com',
        passwordHash: hashedPassword,
        phone: '+33612345678',
        city: 'Paris',
        country: 'France',
        userType: TypeUtilisateur.locataire,
        emailVerified: true,
        status: StatutUtilisateur.actif,
      },
    }),
    prisma.user.create({
      data: {
        firstName: 'Youssef',
        lastName: 'Ben Ali',
        email: 'youssef.benali@example.com',
        passwordHash: hashedPassword,
        phone: '+212612345678',
        city: 'Casablanca',
        country: 'Maroc',
        userType: TypeUtilisateur.locataire,
        emailVerified: true,
        status: StatutUtilisateur.actif,
      },
    }),
    prisma.user.create({
      data: {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@test.com',
        passwordHash: hashedPassword,
        phone: '+33600000005',
        userType: TypeUtilisateur.locataire,
        emailVerified: true,
        phoneVerified: true,
        status: StatutUtilisateur.actif,
        city: 'Paris',
        country: 'France',
      },
    }),
  ]);

  console.log('✅ Utilisateurs créés');

  // Logements
  const logements = [
    // Sénégal
    {
      ownerId: proprietaires[0].id,
      title: 'Villa luxueuse avec vue sur l\'océan - Almadies',
      description: 'Magnifique villa moderne située dans le quartier prisé des Almadies à Dakar.',
      address: 'Route des Almadies',
      city: 'Dakar',
      country: 'Sénégal',
      latitude: 14.7167,
      longitude: -17.4677,
      type: TypeLogement.maison,
      roomCount: 5,
      capacity: 10,
      pricePerNight: 85000,
      currency: 'XOF',
      amenities: { wifi: true, piscine: true, climatisation: true },
      houseRules: { animaux: false },
      status: StatutLogement.actif,
    },
    // Côte d'Ivoire
    {
      ownerId: proprietaires[1].id,
      title: 'Résidence standing à Cocody - Riviera Golf',
      description: 'Superbe résidence dans le quartier huppé de Riviera Golf à Cocody.',
      address: 'Riviera Golf, Cocody',
      city: 'Abidjan',
      country: 'Côte d\'Ivoire',
      latitude: 5.3600,
      longitude: -3.9800,
      type: TypeLogement.maison,
      roomCount: 4,
      capacity: 8,
      pricePerNight: 75000,
      currency: 'XOF',
      amenities: { wifi: true, piscine: true, generateur: true },
      houseRules: { animaux: true },
      status: StatutLogement.actif,
    },
    // France
    {
      ownerId: proprietaires[2].id,
      title: 'Appartement moderne au cœur de Paris',
      description: 'Magnifique appartement rénové avec vue sur la Seine.',
      address: '10 Rue de Rivoli',
      city: 'Paris',
      country: 'France',
      latitude: 48.8566,
      longitude: 2.3522,
      type: TypeLogement.appartement,
      roomCount: 3,
      capacity: 4,
      pricePerNight: 52000, // Approx 80 EUR
      currency: 'XOF',
      amenities: { wifi: true, heating: true },
      houseRules: { smoking: false },
      status: StatutLogement.actif,
    },
    {
      ownerId: proprietaires[3].id,
      title: 'Villa avec piscine à Cannes',
      description: 'Superbe villa avec piscine privée et jardin.',
      address: '50 Boulevard de la Croisette',
      city: 'Cannes',
      country: 'France',
      latitude: 43.5528,
      longitude: 7.0174,
      type: TypeLogement.villa,
      roomCount: 6,
      capacity: 8,
      pricePerNight: 164000, // Approx 250 EUR
      currency: 'XOF',
      amenities: { wifi: true, pool: true, garden: true },
      houseRules: { parties: false },
      status: StatutLogement.actif,
    }
  ];

  const createdLogements = [];
  for (const logementData of logements) {
    const logement = await prisma.logement.create({
      data: logementData,
    });
    createdLogements.push(logement);
  }

  console.log('✅ Logements créés');

  // Photos
  const photosData = [];
  for (const logement of createdLogements) {
    const photoCount = 3;
    for (let j = 0; j < photoCount; j++) {
      photosData.push({
        accommodationId: logement.id,
        url: `https://picsum.photos/seed/${logement.id}-${j}/800/600`,
        thumbnailUrl: `https://picsum.photos/seed/${logement.id}-${j}/200/150`,
        isMain: j === 0,
        order: j,
      });
    }
  }
  await prisma.photo.createMany({ data: photosData });

  console.log('✅ Photos ajoutées');

  // Disponibilités
  const today = new Date();
  const threeMonthsLater = new Date();
  threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);

  const disponibilitesData = createdLogements.map(logement => ({
    accommodationId: logement.id,
    startDate: today,
    endDate: threeMonthsLater,
    status: StatutDisponibilite.disponible,
  }));

  await prisma.disponibilite.createMany({ data: disponibilitesData });

  console.log('✅ Disponibilités créées');

  // Réservations
  const reservation = await prisma.reservation.create({
    data: {
      accommodationId: createdLogements[0].id,
      tenantId: locataires[0].id,
      startDate: new Date('2026-02-15'),
      endDate: new Date('2026-02-22'),
      guestCount: 4,
      totalAmount: 595000,
      currency: 'XOF',
      status: StatutReservation.confirmee,
      tenantMessage: 'Hâte de découvrir Dakar !',
    },
  });

  console.log('✅ Réservations créées');

  console.log('\n🎉 Seeding terminé avec succès !');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
