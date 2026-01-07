import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Hash password for users
  const hashedPassword = await bcrypt.hash('password123', 12);

  // Create test users
  const owner1 = await prisma.user.upsert({
    where: { email: 'proprietaire1@test.com' },
    update: {},
    create: {
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'proprietaire1@test.com',
      passwordHash: hashedPassword,
      phone: '+33123456789',
      userType: 'proprietaire',
      emailVerified: true,
      phoneVerified: true,
      status: 'actif',
      address: '123 Rue de la Paix',
      city: 'Paris',
      country: 'France',
    },
  });

  const owner2 = await prisma.user.upsert({
    where: { email: 'proprietaire2@test.com' },
    update: {},
    create: {
      firstName: 'Marie',
      lastName: 'Martin',
      email: 'proprietaire2@test.com',
      passwordHash: hashedPassword,
      phone: '+33987654321',
      userType: 'proprietaire',
      emailVerified: true,
      phoneVerified: true,
      status: 'actif',
      address: '456 Avenue des Champs',
      city: 'Lyon',
      country: 'France',
    },
  });

  // Compte de test simple
  const testUser = await prisma.user.upsert({
    where: { email: 'test@test.com' },
    update: {
      passwordHash: hashedPassword, // Mettre à jour le mot de passe si le compte existe déjà
    },
    create: {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@test.com',
      passwordHash: hashedPassword,
      phone: '+33612345678',
      userType: 'locataire',
      emailVerified: true,
      phoneVerified: true,
      status: 'actif',
      city: 'Paris',
      country: 'France',
    },
  });

  // Compte propriétaire de test
  const testOwner = await prisma.user.upsert({
    where: { email: 'owner@test.com' },
    update: {
      passwordHash: hashedPassword, // Mettre à jour le mot de passe si le compte existe déjà
    },
    create: {
      firstName: 'Owner',
      lastName: 'Test',
      email: 'owner@test.com',
      passwordHash: hashedPassword,
      phone: '+33687654321',
      userType: 'proprietaire',
      emailVerified: true,
      phoneVerified: true,
      status: 'actif',
      city: 'Paris',
      country: 'France',
    },
  });

  const tenant = await prisma.user.upsert({
    where: { email: 'locataire@test.com' },
    update: {},
    create: {
      firstName: 'Pierre',
      lastName: 'Bernard',
      email: 'locataire@test.com',
      passwordHash: hashedPassword,
      phone: '+33555666777',
      userType: 'locataire',
      emailVerified: true,
      phoneVerified: true,
      status: 'actif',
      address: '789 Rue du Commerce',
      city: 'Marseille',
      country: 'France',
    },
  });

  console.log('Users created');

  // Create accommodations
  const accommodation1 = await prisma.logement.upsert({
    where: { id: 'logement-1' },
    update: {},
    create: {
      id: 'logement-1',
      ownerId: owner1.id,
      title: 'Appartement moderne au cœur de Paris',
      description: 'Magnifique appartement rénové avec vue sur la Seine. Parfait pour un séjour à Paris. Idéalement situé près des monuments historiques.',
      address: '10 Rue de Rivoli',
      city: 'Paris',
      country: 'France',
      latitude: new Prisma.Decimal(48.8566),
      longitude: new Prisma.Decimal(2.3522),
      type: 'appartement',
      roomCount: 3,
      bedrooms: 2,
      bathrooms: 1,
      capacity: 4,
      pricePerNight: new Prisma.Decimal(80.00),
      currency: 'EUR',
      amenities: {
        wifi: true,
        heating: true,
        kitchen: true,
        washingMachine: true,
        parking: false,
        airConditioning: true,
        tv: true,
      },
      houseRules: {
        smoking: false,
        pets: false,
        parties: false,
        checkInTime: '15:00',
        checkOutTime: '11:00',
      },
      tags: ['centrale', 'moderne', 'vue', 'paris'],
      checkIn: '15:00',
      checkOut: '11:00',
      status: 'actif',
      averageRating: 4.5,
      reviewCount: 12,
    },
  });

  const accommodation2 = await prisma.logement.upsert({
    where: { id: 'logement-2' },
    update: {},
    create: {
      id: 'logement-2',
      ownerId: owner1.id,
      title: 'Villa avec piscine à Cannes',
      description: 'Superbe villa avec piscine privée et jardin. Située à 5 minutes de la plage. Vue panoramique sur la mer Méditerranée.',
      address: '50 Boulevard de la Croisette',
      city: 'Cannes',
      country: 'France',
      latitude: new Prisma.Decimal(43.5528),
      longitude: new Prisma.Decimal(7.0174),
      type: 'villa',
      roomCount: 6,
      bedrooms: 4,
      bathrooms: 3,
      capacity: 8,
      pricePerNight: new Prisma.Decimal(250.00),
      currency: 'EUR',
      amenities: {
        wifi: true,
        heating: true,
        kitchen: true,
        washingMachine: true,
        parking: true,
        airConditioning: true,
        tv: true,
        pool: true,
        garden: true,
      },
      houseRules: {
        smoking: false,
        pets: true,
        parties: false,
        checkInTime: '16:00',
        checkOutTime: '10:00',
      },
      tags: ['villa', 'piscine', 'plage', 'luxe'],
      checkIn: '16:00',
      checkOut: '10:00',
      status: 'actif',
      averageRating: 4.8,
      reviewCount: 25,
    },
  });

  const accommodation3 = await prisma.logement.upsert({
    where: { id: 'logement-3' },
    update: {},
    create: {
      id: 'logement-3',
      ownerId: owner2.id,
      title: 'Studio cosy proche Lyon Part-Dieu',
      description: 'Studio moderne et fonctionnel, parfait pour un séjour professionnel ou touristique. À 5 minutes à pied de la gare Part-Dieu.',
      address: '25 Rue Garibaldi',
      city: 'Lyon',
      country: 'France',
      latitude: new Prisma.Decimal(45.7640),
      longitude: new Prisma.Decimal(4.8357),
      type: 'studio',
      roomCount: 1,
      bedrooms: 0,
      bathrooms: 1,
      capacity: 2,
      pricePerNight: new Prisma.Decimal(45.00),
      currency: 'EUR',
      amenities: {
        wifi: true,
        heating: true,
        kitchen: true,
        washingMachine: false,
        parking: false,
        airConditioning: false,
        tv: true,
      },
      houseRules: {
        smoking: false,
        pets: false,
        parties: false,
        checkInTime: '14:00',
        checkOutTime: '11:00',
      },
      tags: ['studio', 'central', 'proche-gare', 'moderne'],
      checkIn: '14:00',
      checkOut: '11:00',
      status: 'actif',
      averageRating: 4.2,
      reviewCount: 8,
    },
  });

  const accommodation4 = await prisma.logement.upsert({
    where: { id: 'logement-4' },
    update: {},
    create: {
      id: 'logement-4',
      ownerId: owner2.id,
      title: 'Maison traditionnelle avec jardin',
      description: 'Charmante maison traditionnelle avec grand jardin. Idéale pour les familles. Calme et paisible, à 15 minutes du centre-ville.',
      address: '15 Chemin des Vignes',
      city: 'Lyon',
      country: 'France',
      latitude: new Prisma.Decimal(45.7500),
      longitude: new Prisma.Decimal(4.8500),
      type: 'maison',
      roomCount: 5,
      bedrooms: 3,
      bathrooms: 2,
      capacity: 6,
      pricePerNight: new Prisma.Decimal(120.00),
      currency: 'EUR',
      amenities: {
        wifi: true,
        heating: true,
        kitchen: true,
        washingMachine: true,
        parking: true,
        airConditioning: false,
        tv: true,
        garden: true,
      },
      houseRules: {
        smoking: false,
        pets: true,
        parties: false,
        checkInTime: '15:00',
        checkOutTime: '11:00',
      },
      tags: ['maison', 'jardin', 'familial', 'calme'],
      checkIn: '15:00',
      checkOut: '11:00',
      status: 'actif',
      averageRating: 4.6,
      reviewCount: 15,
    },
  });

  const accommodation5 = await prisma.logement.upsert({
    where: { id: 'logement-5' },
    update: {},
    create: {
      id: 'logement-5',
      ownerId: owner1.id,
      title: 'Chambre confortable au centre de Bordeaux',
      description: 'Chambre spacieuse et confortable dans un appartement partagé. Parfait pour un court séjour. Accès à la cuisine et au salon.',
      address: '30 Rue Sainte-Catherine',
      city: 'Bordeaux',
      country: 'France',
      latitude: new Prisma.Decimal(44.8378),
      longitude: new Prisma.Decimal(-0.5792),
      type: 'chambre',
      roomCount: 1,
      bedrooms: 1,
      bathrooms: 1,
      capacity: 2,
      pricePerNight: new Prisma.Decimal(35.00),
      currency: 'EUR',
      amenities: {
        wifi: true,
        heating: true,
        kitchen: true,
        washingMachine: true,
        parking: false,
        airConditioning: false,
        tv: true,
      },
      houseRules: {
        smoking: false,
        pets: false,
        parties: false,
        checkInTime: '14:00',
        checkOutTime: '11:00',
      },
      tags: ['chambre', 'centrale', 'budget', 'bordeaux'],
      checkIn: '14:00',
      checkOut: '11:00',
      status: 'actif',
      averageRating: 4.0,
      reviewCount: 5,
    },
  });

  const accommodation6 = await prisma.logement.upsert({
    where: { id: 'logement-6' },
    update: {},
    create: {
      id: 'logement-6',
      ownerId: owner2.id,
      title: 'Loft design avec terrasse à Marseille',
      description: 'Loft moderne et lumineux avec grande terrasse offrant une vue magnifique. Décoration soignée et équipements haut de gamme.',
      address: '12 Rue de la République',
      city: 'Marseille',
      country: 'France',
      latitude: new Prisma.Decimal(43.2965),
      longitude: new Prisma.Decimal(5.3698),
      type: 'loft',
      roomCount: 2,
      bedrooms: 1,
      bathrooms: 1,
      capacity: 3,
      pricePerNight: new Prisma.Decimal(95.00),
      currency: 'EUR',
      amenities: {
        wifi: true,
        heating: true,
        kitchen: true,
        washingMachine: true,
        parking: false,
        airConditioning: true,
        tv: true,
        balcony: true,
      },
      houseRules: {
        smoking: false,
        pets: false,
        parties: false,
        checkInTime: '15:00',
        checkOutTime: '11:00',
      },
      tags: ['loft', 'design', 'terrasse', 'moderne'],
      checkIn: '15:00',
      checkOut: '11:00',
      status: 'actif',
      averageRating: 4.7,
      reviewCount: 18,
    },
  });

  const accommodation7 = await prisma.logement.upsert({
    where: { id: 'logement-7' },
    update: {},
    create: {
      id: 'logement-7',
      ownerId: owner1.id,
      title: 'Appartement avec vue mer à Nice',
      description: 'Magnifique appartement avec vue imprenable sur la baie des Anges. À deux pas de la promenade des Anglais et de la vieille ville.',
      address: '8 Promenade des Anglais',
      city: 'Nice',
      country: 'France',
      latitude: new Prisma.Decimal(43.6956),
      longitude: new Prisma.Decimal(7.2556),
      type: 'appartement',
      roomCount: 4,
      bedrooms: 2,
      bathrooms: 2,
      capacity: 5,
      pricePerNight: new Prisma.Decimal(150.00),
      currency: 'EUR',
      amenities: {
        wifi: true,
        heating: true,
        kitchen: true,
        washingMachine: true,
        parking: true,
        airConditioning: true,
        tv: true,
        balcony: true,
      },
      houseRules: {
        smoking: false,
        pets: true,
        parties: false,
        checkInTime: '16:00',
        checkOutTime: '10:00',
      },
      tags: ['appartement', 'vue-mer', 'nice', 'plage'],
      checkIn: '16:00',
      checkOut: '10:00',
      status: 'actif',
      averageRating: 4.9,
      reviewCount: 32,
    },
  });

  const accommodation8 = await prisma.logement.upsert({
    where: { id: 'logement-8' },
    update: {},
    create: {
      id: 'logement-8',
      ownerId: owner2.id,
      title: 'Maison de campagne avec jardin et barbecue',
      description: 'Charmante maison de campagne dans un cadre verdoyant. Grand jardin avec terrasse et barbecue. Idéale pour se ressourcer en famille.',
      address: '5 Route de la Forêt',
      city: 'Annecy',
      country: 'France',
      latitude: new Prisma.Decimal(45.8992),
      longitude: new Prisma.Decimal(6.1294),
      type: 'maison',
      roomCount: 6,
      bedrooms: 4,
      bathrooms: 2,
      capacity: 8,
      pricePerNight: new Prisma.Decimal(180.00),
      currency: 'EUR',
      amenities: {
        wifi: true,
        heating: true,
        kitchen: true,
        washingMachine: true,
        parking: true,
        airConditioning: false,
        tv: true,
        garden: true,
        bbq: true,
      },
      houseRules: {
        smoking: false,
        pets: true,
        parties: false,
        checkInTime: '15:00',
        checkOutTime: '11:00',
      },
      tags: ['maison', 'campagne', 'jardin', 'familial'],
      checkIn: '15:00',
      checkOut: '11:00',
      status: 'actif',
      averageRating: 4.8,
      reviewCount: 20,
    },
  });

  const accommodation9 = await prisma.logement.upsert({
    where: { id: 'logement-9' },
    update: {},
    create: {
      id: 'logement-9',
      ownerId: owner1.id,
      title: 'Studio moderne près de la gare',
      description: 'Studio rénové et entièrement équipé, situé à 5 minutes à pied de la gare. Parfait pour les déplacements professionnels.',
      address: '18 Avenue de la Gare',
      city: 'Lille',
      country: 'France',
      latitude: new Prisma.Decimal(50.6292),
      longitude: new Prisma.Decimal(3.0573),
      type: 'studio',
      roomCount: 1,
      bedrooms: 0,
      bathrooms: 1,
      capacity: 2,
      pricePerNight: new Prisma.Decimal(42.00),
      currency: 'EUR',
      amenities: {
        wifi: true,
        heating: true,
        kitchen: true,
        washingMachine: false,
        parking: false,
        airConditioning: false,
        tv: true,
      },
      houseRules: {
        smoking: false,
        pets: false,
        parties: false,
        checkInTime: '14:00',
        checkOutTime: '11:00',
      },
      tags: ['studio', 'proche-gare', 'moderne', 'budget'],
      checkIn: '14:00',
      checkOut: '11:00',
      status: 'actif',
      averageRating: 4.3,
      reviewCount: 10,
    },
  });

  const accommodation10 = await prisma.logement.upsert({
    where: { id: 'logement-10' },
    update: {},
    create: {
      id: 'logement-10',
      ownerId: owner2.id,
      title: 'Villa de luxe avec piscine et spa',
      description: 'Villa exceptionnelle avec piscine à débordement, spa et terrasse panoramique. Service de conciergerie disponible. Un vrai havre de paix.',
      address: '100 Chemin des Cimes',
      city: 'Cannes',
      country: 'France',
      latitude: new Prisma.Decimal(43.5528),
      longitude: new Prisma.Decimal(7.0174),
      type: 'villa',
      roomCount: 8,
      bedrooms: 5,
      bathrooms: 4,
      capacity: 10,
      pricePerNight: new Prisma.Decimal(450.00),
      currency: 'EUR',
      amenities: {
        wifi: true,
        heating: true,
        kitchen: true,
        washingMachine: true,
        parking: true,
        airConditioning: true,
        tv: true,
        pool: true,
        spa: true,
        garden: true,
        concierge: true,
      },
      houseRules: {
        smoking: false,
        pets: true,
        parties: false,
        checkInTime: '16:00',
        checkOutTime: '10:00',
      },
      tags: ['villa', 'luxe', 'piscine', 'spa'],
      checkIn: '16:00',
      checkOut: '10:00',
      status: 'actif',
      averageRating: 5.0,
      reviewCount: 45,
    },
  });

  const accommodation11 = await prisma.logement.upsert({
    where: { id: 'logement-11' },
    update: {},
    create: {
      id: 'logement-11',
      ownerId: owner1.id,
      title: 'Appartement cosy dans le Marais',
      description: 'Charmant appartement typique du quartier du Marais. Proche des musées et des boutiques. Parfait pour découvrir Paris.',
      address: '22 Rue des Rosiers',
      city: 'Paris',
      country: 'France',
      latitude: new Prisma.Decimal(48.8566),
      longitude: new Prisma.Decimal(2.3622),
      type: 'appartement',
      roomCount: 2,
      bedrooms: 1,
      bathrooms: 1,
      capacity: 3,
      pricePerNight: new Prisma.Decimal(110.00),
      currency: 'EUR',
      amenities: {
        wifi: true,
        heating: true,
        kitchen: true,
        washingMachine: false,
        parking: false,
        airConditioning: false,
        tv: true,
      },
      houseRules: {
        smoking: false,
        pets: false,
        parties: false,
        checkInTime: '15:00',
        checkOutTime: '11:00',
      },
      tags: ['appartement', 'marais', 'paris', 'historique'],
      checkIn: '15:00',
      checkOut: '11:00',
      status: 'actif',
      averageRating: 4.4,
      reviewCount: 14,
    },
  });

  const accommodation12 = await prisma.logement.upsert({
    where: { id: 'logement-12' },
    update: {},
    create: {
      id: 'logement-12',
      ownerId: owner2.id,
      title: 'Maison traditionnelle corse avec vue montagne',
      description: 'Authentique maison corse restaurée avec charme. Vue imprenable sur les montagnes. Jardin méditerranéen et piscine.',
      address: '15 Route de Calvi',
      city: 'Calvi',
      country: 'France',
      latitude: new Prisma.Decimal(42.5687),
      longitude: new Prisma.Decimal(8.7575),
      type: 'maison',
      roomCount: 5,
      bedrooms: 3,
      bathrooms: 2,
      capacity: 6,
      pricePerNight: new Prisma.Decimal(165.00),
      currency: 'EUR',
      amenities: {
        wifi: true,
        heating: true,
        kitchen: true,
        washingMachine: true,
        parking: true,
        airConditioning: false,
        tv: true,
        pool: true,
        garden: true,
      },
      houseRules: {
        smoking: false,
        pets: true,
        parties: false,
        checkInTime: '16:00',
        checkOutTime: '10:00',
      },
      tags: ['maison', 'corse', 'montagne', 'authentique'],
      checkIn: '16:00',
      checkOut: '10:00',
      status: 'actif',
      averageRating: 4.7,
      reviewCount: 22,
    },
  });

  console.log('Accommodations created');

  // Create photos for accommodations
  const photos1 = [
    { url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', isMain: true, order: 0 },
    { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800', isMain: false, order: 1 },
    { url: 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=800', isMain: false, order: 2 },
  ];

  for (const photo of photos1) {
    await prisma.photo.upsert({
      where: { id: `photo-${accommodation1.id}-${photo.order}` },
      update: {},
      create: {
        id: `photo-${accommodation1.id}-${photo.order}`,
        accommodationId: accommodation1.id,
        url: photo.url,
        thumbnailUrl: photo.url,
        isMain: photo.isMain,
        order: photo.order,
      },
    });
  }

  const photos2 = [
    { url: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800', isMain: true, order: 0 },
    { url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800', isMain: false, order: 1 },
    { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800', isMain: false, order: 2 },
  ];

  for (const photo of photos2) {
    await prisma.photo.upsert({
      where: { id: `photo-${accommodation2.id}-${photo.order}` },
      update: {},
      create: {
        id: `photo-${accommodation2.id}-${photo.order}`,
        accommodationId: accommodation2.id,
        url: photo.url,
        thumbnailUrl: photo.url,
        isMain: photo.isMain,
        order: photo.order,
      },
    });
  }

  const photos3 = [
    { url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800', isMain: true, order: 0 },
    { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800', isMain: false, order: 1 },
  ];

  for (const photo of photos3) {
    await prisma.photo.upsert({
      where: { id: `photo-${accommodation3.id}-${photo.order}` },
      update: {},
      create: {
        id: `photo-${accommodation3.id}-${photo.order}`,
        accommodationId: accommodation3.id,
        url: photo.url,
        thumbnailUrl: photo.url,
        isMain: photo.isMain,
        order: photo.order,
      },
    });
  }

  const photos4 = [
    { url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', isMain: true, order: 0 },
    { url: 'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800', isMain: false, order: 1 },
    { url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800', isMain: false, order: 2 },
  ];

  for (const photo of photos4) {
    await prisma.photo.upsert({
      where: { id: `photo-${accommodation4.id}-${photo.order}` },
      update: {},
      create: {
        id: `photo-${accommodation4.id}-${photo.order}`,
        accommodationId: accommodation4.id,
        url: photo.url,
        thumbnailUrl: photo.url,
        isMain: photo.isMain,
        order: photo.order,
      },
    });
  }

  // Photos pour les nouveaux logements (5-10)
  const photos5 = [
    { url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800', isMain: true, order: 0 },
  ];
  const photos6 = [
    { url: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800', isMain: true, order: 0 },
    { url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800', isMain: false, order: 1 },
  ];
  const photos7 = [
    { url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800', isMain: true, order: 0 },
    { url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800', isMain: false, order: 1 },
    { url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', isMain: false, order: 2 },
  ];
  const photos8 = [
    { url: 'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800', isMain: true, order: 0 },
    { url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800', isMain: false, order: 1 },
  ];
  const photos9 = [
    { url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', isMain: true, order: 0 },
    { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800', isMain: false, order: 1 },
  ];
  const photos10 = [
    { url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', isMain: true, order: 0 },
    { url: 'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800', isMain: false, order: 1 },
    { url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800', isMain: false, order: 2 },
    { url: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800', isMain: false, order: 3 },
  ];

  const photos11 = [
    { url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', isMain: true, order: 0 },
    { url: 'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800', isMain: false, order: 1 },
  ];
  const photos12 = [
    { url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800', isMain: true, order: 0 },
    { url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', isMain: false, order: 1 },
    { url: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800', isMain: false, order: 2 },
  ];

  const allPhotoSets = [
    { accommodation: accommodation5, photos: photos5 },
    { accommodation: accommodation6, photos: photos6 },
    { accommodation: accommodation7, photos: photos7 },
    { accommodation: accommodation8, photos: photos8 },
    { accommodation: accommodation9, photos: photos9 },
    { accommodation: accommodation10, photos: photos10 },
    { accommodation: accommodation11, photos: photos11 },
    { accommodation: accommodation12, photos: photos12 },
  ];

  for (const { accommodation, photos } of allPhotoSets) {
    for (const photo of photos) {
      await prisma.photo.upsert({
        where: { id: `photo-${accommodation.id}-${photo.order}` },
        update: {},
        create: {
          id: `photo-${accommodation.id}-${photo.order}`,
          accommodationId: accommodation.id,
          url: photo.url,
          thumbnailUrl: photo.url,
          isMain: photo.isMain,
          order: photo.order,
        },
      });
    }
  }

  console.log('Photos created');

  // Create some availabilities
  const today = new Date();
  const nextMonth = new Date(today);
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  for (const accommodation of [accommodation1, accommodation2, accommodation3, accommodation4, accommodation5, accommodation6, accommodation7, accommodation8, accommodation9, accommodation10, accommodation11, accommodation12]) {
    await prisma.disponibilite.createMany({
      data: [
        {
          accommodationId: accommodation.id,
          startDate: today,
          endDate: nextMonth,
          status: 'disponible',
        },
      ],
      skipDuplicates: true,
    });
  }

  console.log('Availabilities created');

  console.log('🎉 Seeding completed!');
  console.log('\n📋 Comptes de test disponibles :');
  console.log('   Locataire: test@test.com / password123');
  console.log('   Propriétaire: owner@test.com / password123');
  console.log('   Propriétaire 1: proprietaire1@test.com / password123');
  console.log('   Propriétaire 2: proprietaire2@test.com / password123');
  console.log('   Locataire: locataire@test.com / password123');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
