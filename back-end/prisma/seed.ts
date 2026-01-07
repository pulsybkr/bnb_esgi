import { PrismaClient, TypeLogement, StatutLogement, StatutDisponibilite, StatutReservation, TypeCibleAvis, StatutAvis, StatutUtilisateur, TypeUtilisateur } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

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
      userType: 'admin',
      emailVerified: true,
      phoneVerified: true,
      city: 'Dakar',
      country: 'Sénégal',
      status: StatutUtilisateur.actif,
    },
  });

  // Propriétaires
  const ownersData = [
    { firstName: 'Amadou', lastName: 'Diallo', email: 'amadou.diallo@example.com', city: 'Dakar', country: 'Sénégal' },
    { firstName: 'Fatou', lastName: 'Sow', email: 'fatou.sow@example.com', city: 'Abidjan', country: 'Côte d\'Ivoire' },
    { firstName: 'Moussa', lastName: 'Traoré', email: 'moussa.traore@example.com', city: 'Bamako', country: 'Mali' },
    { firstName: 'Aïcha', lastName: 'Touré', email: 'aicha.toure@example.com', city: 'Yaoundé', country: 'Cameroun' },
    { firstName: 'Ibrahim', lastName: 'Koné', email: 'ibrahim.kone@example.com', city: 'Ouagadougou', country: 'Burkina Faso' },
    { firstName: 'Koffi', lastName: 'Mensah', email: 'koffi.mensah@example.com', city: 'Lomé', country: 'Togo' },
    { firstName: 'Zainab', lastName: 'Oumarou', email: 'zainab.oumarou@example.com', city: 'Niamey', country: 'Niger' },
    { firstName: 'Jean-Paul', lastName: 'Bongo', email: 'jp.bongo@example.com', city: 'Libreville', country: 'Gabon' },
  ];

  const proprietaires = await Promise.all(
    ownersData.map(owner =>
      prisma.user.create({
        data: {
          ...owner,
          passwordHash: hashedPassword,
          phone: `+${getRandomInt(221, 237)}${getRandomInt(600000000, 789999999)}`,
          userType: 'proprietaire',
          emailVerified: true,
          phoneVerified: true,
          status: StatutUtilisateur.actif,
        }
      })
    )
  );

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
        userType: 'locataire',
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
        userType: 'locataire',
        emailVerified: true,
        status: StatutUtilisateur.actif,
      },
    }),
  ]);

  console.log('✅ Utilisateurs créés');

  // Templates de logements par ville
  const cityTemplates = [
    {
      city: 'Dakar',
      country: 'Sénégal',
      neighborhoods: ['Almadies', 'Plateau', 'Ngor', 'Ouakam', 'Mermoz', 'Amitié', 'Fann Residence'],
      currency: 'XOF'
    },
    {
      city: 'Abidjan',
      country: 'Côte d\'Ivoire',
      neighborhoods: ['Cocody', 'Plateau', 'Marcory', 'Riviera', 'Zone 4', 'Angré'],
      currency: 'XOF'
    },
    {
      city: 'Bamako',
      country: 'Mali',
      neighborhoods: ['Hippodrome', 'Badalabougou', 'ACI 2000', 'Faladié', 'Kalaban Coro'],
      currency: 'XOF'
    },
    {
      city: 'Yaoundé',
      country: 'Cameroun',
      neighborhoods: ['Bastos', 'Centre-ville', 'Mendong', 'Emana', 'Santa Barbara'],
      currency: 'XAF'
    },
    {
      city: 'Douala',
      country: 'Cameroun',
      neighborhoods: ['Bonanjo', 'Akwa', 'Bonapriso', 'Bali', 'Logpom'],
      currency: 'XAF'
    },
    {
      city: 'Ouagadougou',
      country: 'Burkina Faso',
      neighborhoods: ['Ouaga 2000', 'Gounghin', 'Koulouba', 'Somgandé', 'Patte d\'Oie'],
      currency: 'XOF'
    },
    {
      city: 'Lomé',
      country: 'Togo',
      neighborhoods: ['Cité OUA', 'Nyékonakpoé', 'Kodjoviakopé', 'Bè'],
      currency: 'XOF'
    },
    {
      city: 'Niamey',
      country: 'Niger',
      neighborhoods: ['Plateau', 'Goudel', 'Kombo', 'Dar-es-Salam'],
      currency: 'XOF'
    },
    {
      city: 'Libreville',
      country: 'Gabon',
      neighborhoods: ['Akanda', 'Louis', 'Batterie IV', 'Glass', 'Sablière'],
      currency: 'XAF'
    },
    {
      city: 'Cotonou',
      country: 'Bénin',
      neighborhoods: ['Haie Vive', 'Ganhi', 'Cadjehoun', 'Fidjrossé'],
      currency: 'XOF'
    }
  ];

  const types = Object.values(TypeLogement);
  const titles = [
    'Superbe {type} moderne',
    '{type} de standing avec piscine',
    'Charmant {type} au calme',
    'Luxueuse {type} vue mer',
    'Studio cosy centre-ville',
    'Grand {type} familial',
    'Magnifique {type} tout confort',
    'Pied-à-terre idéal pour mission',
    'Hébergement authentique et chaleureux',
    'Résidence sécurisée haut de gamme'
  ];

  const amenitiesPool = [
    'wifi', 'climatisation', 'cuisine', 'parking', 'jardin', 'terrasse',
    'securite', 'piscine', 'generateur', 'ascenseur', 'balcon', 'vue_mer',
    'ventilateurs', 'salle_sport', 'canal_plus', 'chauffe_eau'
  ];

  const createdLogements = [];
  const TOTAL_LOGEMENTS = 60; // On en crée un peu plus de 50 pour être sûr

  for (let i = 0; i < TOTAL_LOGEMENTS; i++) {
    const template = getRandomElement(cityTemplates);
    const type = getRandomElement(types);
    const neighborhood = getRandomElement(template.neighborhoods);
    const titleTemplate = getRandomElement(titles);

    let title = titleTemplate.replace('{type}', type.charAt(0).toUpperCase() + type.slice(1));
    title += ` à ${neighborhood}`;

    const price = getRandomInt(20000, 150000);
    const rooms = getRandomInt(1, 6);

    // Équipements aléatoires
    const amenitiesCount = getRandomInt(5, 10);
    const amenities: Record<string, boolean> = {};
    for (let a = 0; a < amenitiesCount; a++) {
      amenities[getRandomElement(amenitiesPool)] = true;
    }

    const logement = await prisma.logement.create({
      data: {
        ownerId: getRandomElement(proprietaires).id,
        title,
        description: `Bienvenue dans cet établissement situé à ${neighborhood}, ${template.city}. Ce ${type} offre tout le confort nécessaire pour un séjour agréable. Profitez du cadre calme et sécurisé. Idéal pour vos vacances ou séjours professionnels.`,
        address: `Rue ${getRandomInt(10, 999)}, ${neighborhood}`,
        city: template.city,
        country: template.country,
        latitude: 0, // Simplifié
        longitude: 0,
        type,
        roomCount: rooms,
        bedrooms: Math.max(1, rooms - 1),
        bathrooms: getRandomInt(1, Math.ceil(rooms / 2)),
        capacity: getRandomInt(1, rooms * 2),
        pricePerNight: price,
        currency: template.currency,
        amenities,
        houseRules: {
          animaux: Math.random() > 0.5,
          fumeur: false,
          fetes: Math.random() > 0.8,
          arrivee: '14:00',
          depart: '11:00'
        },
        status: StatutLogement.actif,
      }
    });
    createdLogements.push(logement);
  }

  console.log(`✅ ${createdLogements.length} Logements créés`);

  // Ajouter des photos pour chaque logement
  const photosData = [];
  for (const logement of createdLogements) {
    const photoCount = getRandomInt(3, 6);
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

  // Insertion par paquets pour éviter les surcharges de mémoire si nécessaire
  const CHUNK_SIZE = 100;
  for (let i = 0; i < photosData.length; i += CHUNK_SIZE) {
    await prisma.photo.createMany({
      data: photosData.slice(i, i + CHUNK_SIZE),
    });
  }

  console.log(`✅ ${photosData.length} Photos ajoutées`);

  // Ajouter des disponibilités
  const disponibilitesData = [];
  const today = new Date();
  const sixMonthsLater = new Date();
  sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);

  for (const logement of createdLogements) {
    disponibilitesData.push({
      accommodationId: logement.id,
      startDate: today,
      endDate: sixMonthsLater,
      status: StatutDisponibilite.disponible,
    });
  }

  await prisma.disponibilite.createMany({
    data: disponibilitesData,
  });

  console.log('✅ Disponibilités créées');

  // Créer quelques réservations réelles
  for (let i = 0; i < 15; i++) {
    const logement = getRandomElement(createdLogements);
    const tenant = getRandomElement(locataires);
    const start = new Date();
    start.setDate(start.getDate() + getRandomInt(5, 30));
    const end = new Date(start);
    end.setDate(end.getDate() + getRandomInt(2, 10));

    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    await prisma.reservation.create({
      data: {
        accommodationId: logement.id,
        tenantId: tenant.id,
        startDate: start,
        endDate: end,
        guestCount: getRandomInt(1, logement.capacity),
        totalAmount: Number(logement.pricePerNight) * nights,
        currency: logement.currency,
        status: StatutReservation.confirmee,
        tenantMessage: 'Hâte de venir !',
      }
    });
  }

  console.log('✅ 15 Réservations créées');

  // Ajouter des avis
  const reservations = await prisma.reservation.findMany({ include: { accommodation: true } });
  for (const res of reservations) {
    if (Math.random() > 0.3) {
      await prisma.avis.create({
        data: {
          reservationId: res.id,
          authorId: res.tenantId,
          targetType: TypeCibleAvis.logement,
          targetId: res.accommodationId,
          rating: getRandomInt(3, 5),
          comment: getRandomElement([
            'Incroyable séjour !',
            'Très bon accueil, je recommande.',
            'Logement propre et bien situé.',
            'Conforme aux photos, top !',
            'Un peu bruyant mais superbe vue.',
            'Propriétaire réactif et très gentil.'
          ]),
          status: StatutAvis.publie,
          publishedAt: new Date(),
        }
      });
    }
  }

  // Mettre à jour les notes moyennes
  const allProperties = await prisma.logement.findMany({
    include: {
      owner: true,
      _count: {
        select: { reservations: true }
      }
    }
  });

  for (const p of allProperties) {
    const reviews = await prisma.avis.findMany({
      where: { targetId: p.id, targetType: TypeCibleAvis.logement }
    });

    if (reviews.length > 0) {
      const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      await prisma.logement.update({
        where: { id: p.id },
        data: {
          averageRating: avg,
          reviewCount: reviews.length
        }
      });
    }
  }

  console.log('✅ Avis et notes mis à jour');
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