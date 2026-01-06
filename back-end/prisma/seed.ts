import { PrismaClient, TypeLogement, StatutLogement, StatutDisponibilite, StatutReservation, TypeCibleAvis, StatutAvis } from '@prisma/client';
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
            userType: 'admin',
            emailVerified: true,
            phoneVerified: true,
            city: 'Dakar',
            country: 'Sénégal',
            status: StatutLogement.actif,
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
                userType: 'proprietaire',
                emailVerified: true,
                phoneVerified: true,
                status: StatutLogement.actif,
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
                userType: 'proprietaire',
                emailVerified: true,
                phoneVerified: true,
                status: StatutLogement.actif,
            },
        }),
        prisma.user.create({
            data: {
                firstName: 'Moussa',
                lastName: 'Traoré',
                email: 'moussa.traore@example.com',
                passwordHash: hashedPassword,
                phone: '+223761234567',
                address: 'Hippodrome, Bamako',
                city: 'Bamako',
                country: 'Mali',
                userType: 'proprietaire',
                emailVerified: true,
                phoneVerified: true,
                status: StatutLogement.actif,
            },
        }),
        prisma.user.create({
            data: {
                firstName: 'Aïcha',
                lastName: 'Touré',
                email: 'aicha.toure@example.com',
                passwordHash: hashedPassword,
                phone: '+237691234567',
                address: 'Bastos, Yaoundé',
                city: 'Yaoundé',
                country: 'Cameroun',
                userType: 'proprietaire',
                emailVerified: true,
                phoneVerified: true,
                status: StatutLogement.actif,
            },
        }),
        prisma.user.create({
            data: {
                firstName: 'Ibrahim',
                lastName: 'Koné',
                email: 'ibrahim.kone@example.com',
                passwordHash: hashedPassword,
                phone: '+226701234567',
                address: 'Ouaga 2000, Ouagadougou',
                city: 'Ouagadougou',
                country: 'Burkina Faso',
                userType: 'proprietaire',
                emailVerified: true,
                phoneVerified: true,
                status: StatutLogement.actif,
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
                userType: 'locataire',
                emailVerified: true,
                status: StatutLogement.actif,
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
                status: StatutLogement.actif,
            },
        }),
    ]);

    console.log('✅ Utilisateurs créés');

    // Créer des logements en Afrique francophone
    const logements = [
        // Sénégal - Dakar
        {
            ownerId: proprietaires[0].id,
            title: 'Villa luxueuse avec vue sur l\'océan - Almadies',
            description: 'Magnifique villa moderne située dans le quartier prisé des Almadies à Dakar. Vue imprenable sur l\'océan Atlantique, piscine privée, jardin tropical. Idéal pour des vacances en famille ou entre amis. Proche des plages, restaurants et centres commerciaux.',
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
            amenities: {
                wifi: true,
                piscine: true,
                climatisation: true,
                cuisine: true,
                parking: true,
                jardin: true,
                terrasse: true,
                vue_mer: true,
                securite: true,
            },
            houseRules: {
                animaux: false,
                fumeur: false,
                fetes: false,
                arrivee: '14:00',
                depart: '11:00',
            },
            status: StatutLogement.actif,
        },
        {
            ownerId: proprietaires[0].id,
            title: 'Appartement moderne au Plateau - Centre-ville',
            description: 'Bel appartement meublé au cœur du Plateau, quartier d\'affaires de Dakar. Parfait pour les voyageurs d\'affaires. Proche des ministères, banques et restaurants. Sécurisé avec gardien 24h/24.',
            address: 'Avenue Léopold Sédar Senghor',
            city: 'Dakar',
            country: 'Sénégal',
            latitude: 14.6928,
            longitude: -17.4467,
            type: TypeLogement.appartement,
            roomCount: 3,
            capacity: 4,
            pricePerNight: 45000,
            currency: 'XOF',
            amenities: {
                wifi: true,
                climatisation: true,
                cuisine: true,
                parking: true,
                ascenseur: true,
                balcon: true,
                securite: true,
            },
            houseRules: {
                animaux: false,
                fumeur: false,
                fetes: false,
                arrivee: '15:00',
                depart: '10:00',
            },
            status: StatutLogement.actif,
        },

        // Côte d'Ivoire - Abidjan
        {
            ownerId: proprietaires[1].id,
            title: 'Résidence standing à Cocody - Riviera Golf',
            description: 'Superbe résidence dans le quartier huppé de Riviera Golf à Cocody. Environnement calme et sécurisé, proche du golf et des centres commerciaux. Idéal pour expatriés et familles.',
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
            amenities: {
                wifi: true,
                piscine: true,
                climatisation: true,
                cuisine: true,
                parking: true,
                jardin: true,
                securite: true,
                generateur: true,
            },
            houseRules: {
                animaux: true,
                fumeur: false,
                fetes: false,
                arrivee: '14:00',
                depart: '12:00',
            },
            status: StatutLogement.actif,
        },
        {
            ownerId: proprietaires[1].id,
            title: 'Studio moderne à Marcory - Zone 4',
            description: 'Studio tout équipé dans un immeuble moderne à Marcory Zone 4. Parfait pour les courts séjours. Proche du pont, accès facile au Plateau et à la zone industrielle.',
            address: 'Marcory Zone 4',
            city: 'Abidjan',
            country: 'Côte d\'Ivoire',
            latitude: 5.2833,
            longitude: -3.9833,
            type: TypeLogement.appartement,
            roomCount: 1,
            capacity: 2,
            pricePerNight: 25000,
            currency: 'XOF',
            amenities: {
                wifi: true,
                climatisation: true,
                cuisine: true,
                parking: false,
                ascenseur: true,
                balcon: true,
            },
            houseRules: {
                animaux: false,
                fumeur: false,
                fetes: false,
                arrivee: '15:00',
                depart: '11:00',
            },
            status: StatutLogement.actif,
        },

        // Mali - Bamako
        {
            ownerId: proprietaires[2].id,
            title: 'Maison traditionnelle rénovée - Hippodrome',
            description: 'Charmante maison traditionnelle malienne entièrement rénovée dans le quartier de l\'Hippodrome. Architecture authentique avec tout le confort moderne. Jardin ombragé, terrasse. Proche des ambassades et du centre-ville.',
            address: 'Quartier Hippodrome',
            city: 'Bamako',
            country: 'Mali',
            latitude: 12.6392,
            longitude: -8.0029,
            type: TypeLogement.maison,
            roomCount: 4,
            capacity: 6,
            pricePerNight: 55000,
            currency: 'XOF',
            amenities: {
                wifi: true,
                climatisation: true,
                cuisine: true,
                parking: true,
                jardin: true,
                terrasse: true,
                ventilateurs: true,
            },
            houseRules: {
                animaux: true,
                fumeur: false,
                fetes: false,
                arrivee: '14:00',
                depart: '11:00',
            },
            status: StatutLogement.actif,
        },
        {
            ownerId: proprietaires[2].id,
            title: 'Chambre confortable à Badalabougou',
            description: 'Chambre spacieuse dans une maison familiale à Badalabougou. Ambiance chaleureuse et conviviale. Parfait pour découvrir la culture malienne. Petit-déjeuner inclus.',
            address: 'Badalabougou Est',
            city: 'Bamako',
            country: 'Mali',
            latitude: 12.6200,
            longitude: -7.9800,
            type: TypeLogement.chambre,
            roomCount: 1,
            capacity: 2,
            pricePerNight: 15000,
            currency: 'XOF',
            amenities: {
                wifi: true,
                climatisation: true,
                petit_dejeuner: true,
                ventilateurs: true,
            },
            houseRules: {
                animaux: false,
                fumeur: false,
                fetes: false,
                arrivee: '12:00',
                depart: '10:00',
            },
            status: StatutLogement.actif,
        },

        // Cameroun - Yaoundé
        {
            ownerId: proprietaires[3].id,
            title: 'Villa contemporaine à Bastos',
            description: 'Villa de standing dans le quartier diplomatique de Bastos. Architecture contemporaine, finitions haut de gamme. Piscine, jardin paysager, salle de sport. Sécurité maximale avec gardiennage 24h/24.',
            address: 'Bastos',
            city: 'Yaoundé',
            country: 'Cameroun',
            latitude: 3.8667,
            longitude: 11.5167,
            type: TypeLogement.maison,
            roomCount: 6,
            capacity: 12,
            pricePerNight: 95000,
            currency: 'XOF',
            amenities: {
                wifi: true,
                piscine: true,
                climatisation: true,
                cuisine: true,
                parking: true,
                jardin: true,
                salle_sport: true,
                securite: true,
                generateur: true,
            },
            houseRules: {
                animaux: false,
                fumeur: false,
                fetes: true,
                arrivee: '15:00',
                depart: '12:00',
            },
            status: StatutLogement.actif,
        },
        {
            ownerId: proprietaires[3].id,
            title: 'Appartement cosy au Centre-ville',
            description: 'Appartement chaleureux en plein centre-ville de Yaoundé. Idéal pour explorer la capitale. Proche des marchés, restaurants et sites touristiques. Bien desservi par les transports.',
            address: 'Avenue Kennedy',
            city: 'Yaoundé',
            country: 'Cameroun',
            latitude: 3.8480,
            longitude: 11.5021,
            type: TypeLogement.appartement,
            roomCount: 2,
            capacity: 4,
            pricePerNight: 35000,
            currency: 'XOF',
            amenities: {
                wifi: true,
                climatisation: true,
                cuisine: true,
                balcon: true,
                ventilateurs: true,
            },
            houseRules: {
                animaux: false,
                fumeur: false,
                fetes: false,
                arrivee: '14:00',
                depart: '11:00',
            },
            status: StatutLogement.actif,
        },

        // Burkina Faso - Ouagadougou
        {
            ownerId: proprietaires[4].id,
            title: 'Résidence moderne à Ouaga 2000',
            description: 'Belle résidence dans le quartier moderne de Ouaga 2000. Environnement calme et verdoyant. Proche du palais présidentiel et des institutions internationales. Parfait pour les missions professionnelles.',
            address: 'Ouaga 2000',
            city: 'Ouagadougou',
            country: 'Burkina Faso',
            latitude: 12.3569,
            longitude: -1.5339,
            type: TypeLogement.maison,
            roomCount: 4,
            capacity: 8,
            pricePerNight: 60000,
            currency: 'XOF',
            amenities: {
                wifi: true,
                climatisation: true,
                cuisine: true,
                parking: true,
                jardin: true,
                terrasse: true,
                securite: true,
                generateur: true,
            },
            houseRules: {
                animaux: true,
                fumeur: false,
                fetes: false,
                arrivee: '14:00',
                depart: '11:00',
            },
            status: StatutLogement.actif,
        },
        {
            ownerId: proprietaires[4].id,
            title: 'Appartement fonctionnel à Gounghin',
            description: 'Appartement pratique dans le quartier animé de Gounghin. Proche des commerces et du marché central. Bon rapport qualité-prix pour découvrir Ouagadougou.',
            address: 'Gounghin',
            city: 'Ouagadougou',
            country: 'Burkina Faso',
            latitude: 12.3714,
            longitude: -1.5197,
            type: TypeLogement.appartement,
            roomCount: 2,
            capacity: 3,
            pricePerNight: 28000,
            currency: 'XOF',
            amenities: {
                wifi: true,
                climatisation: true,
                cuisine: true,
                ventilateurs: true,
            },
            houseRules: {
                animaux: false,
                fumeur: false,
                fetes: false,
                arrivee: '13:00',
                depart: '10:00',
            },
            status: StatutLogement.actif,
        },

        // Sénégal - Saly (station balnéaire)
        {
            ownerId: proprietaires[0].id,
            title: 'Bungalow pieds dans l\'eau - Saly',
            description: 'Magnifique bungalow en bord de plage à Saly, la station balnéaire du Sénégal. Accès direct à la plage, vue panoramique sur l\'océan. Parfait pour des vacances relaxantes. Proche des restaurants de fruits de mer et activités nautiques.',
            address: 'Saly Portudal',
            city: 'Saly',
            country: 'Sénégal',
            latitude: 14.4500,
            longitude: -17.0833,
            type: TypeLogement.maison,
            roomCount: 3,
            capacity: 6,
            pricePerNight: 70000,
            currency: 'XOF',
            amenities: {
                wifi: true,
                climatisation: true,
                cuisine: true,
                parking: true,
                terrasse: true,
                vue_mer: true,
                acces_plage: true,
            },
            houseRules: {
                animaux: false,
                fumeur: false,
                fetes: false,
                arrivee: '15:00',
                depart: '11:00',
            },
            status: StatutLogement.actif,
        },
    ];

    const createdLogements = [];
    for (const logementData of logements) {
        const logement = await prisma.logement.create({
            data: logementData,
        });
        createdLogements.push(logement);
    }

    console.log('✅ Logements créés');

    // Ajouter des photos pour chaque logement
    const photosData = [];
    for (let i = 0; i < createdLogements.length; i++) {
        const logement = createdLogements[i];
        const photoCount = Math.floor(Math.random() * 3) + 3; // 3 à 5 photos par logement

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

    await prisma.photo.createMany({
        data: photosData,
    });

    console.log('✅ Photos ajoutées');

    // Ajouter des disponibilités pour les 3 prochains mois
    const disponibilitesData = [];
    const today = new Date();
    const threeMonthsLater = new Date();
    threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);

    for (const logement of createdLogements) {
        // Disponibilité générale
        disponibilitesData.push({
            accommodationId: logement.id,
            startDate: today,
            endDate: threeMonthsLater,
            status: StatutDisponibilite.disponible,
        });

        // Quelques périodes avec prix personnalisés (haute saison)
        const highSeasonStart = new Date();
        highSeasonStart.setMonth(highSeasonStart.getMonth() + 1);
        const highSeasonEnd = new Date(highSeasonStart);
        highSeasonEnd.setDate(highSeasonEnd.getDate() + 14);

        disponibilitesData.push({
            accommodationId: logement.id,
            startDate: highSeasonStart,
            endDate: highSeasonEnd,
            status: StatutDisponibilite.disponible,
            customPrice: Number(logement.pricePerNight) * 1.3, // +30% en haute saison
            note: 'Haute saison - Prix majoré',
        });
    }

    await prisma.disponibilite.createMany({
        data: disponibilitesData,
    });

    console.log('✅ Disponibilités créées');

    // Créer quelques réservations
    const reservations = [
        {
            accommodationId: createdLogements[0].id,
            tenantId: locataires[0].id,
            startDate: new Date('2026-02-15'),
            endDate: new Date('2026-02-22'),
            guestCount: 4,
            totalAmount: 595000, // 7 nuits × 85000
            currency: 'XOF',
            status: StatutReservation.confirmee,
            tenantMessage: 'Nous avons hâte de découvrir Dakar !',
        },
        {
            accommodationId: createdLogements[2].id,
            tenantId: locataires[1].id,
            startDate: new Date('2026-03-01'),
            endDate: new Date('2026-03-05'),
            guestCount: 2,
            totalAmount: 300000, // 4 nuits × 75000
            currency: 'XOF',
            status: StatutReservation.en_attente,
            tenantMessage: 'Voyage d\'affaires à Abidjan',
        },
    ];

    const createdReservations = [];
    for (const reservationData of reservations) {
        const reservation = await prisma.reservation.create({
            data: reservationData,
        });
        createdReservations.push(reservation);
    }

    console.log('✅ Réservations créées');

    // Créer des avis pour certains logements
    const avisData = [
        {
            reservationId: createdReservations[0].id,
            authorId: locataires[0].id,
            targetType: TypeCibleAvis.logement,
            rating: 5,
            comment: 'Villa magnifique avec une vue exceptionnelle ! Le propriétaire est très accueillant et disponible. Nous avons passé un séjour inoubliable à Dakar.',
            detailedRatings: {
                proprete: 5,
                communication: 5,
                emplacement: 5,
                rapport_qualite_prix: 5,
            },
            status: StatutAvis.publie,
            publishedAt: new Date(),
        },
    ];

    await prisma.avis.createMany({
        data: avisData,
    });

    // Mettre à jour les notes moyennes des logements
    await prisma.logement.update({
        where: { id: createdLogements[0].id },
        data: {
            averageRating: 5.0,
            reviewCount: 1,
        },
    });

    console.log('✅ Avis créés');

    console.log('\n🎉 Seeding terminé avec succès !');
    console.log(`\n📊 Résumé :`);
    console.log(`   - ${proprietaires.length + locataires.length + 1} utilisateurs créés`);
    console.log(`   - ${createdLogements.length} logements créés`);
    console.log(`   - ${photosData.length} photos ajoutées`);
    console.log(`   - ${disponibilitesData.length} disponibilités créées`);
    console.log(`   - ${createdReservations.length} réservations créées`);
    console.log(`   - ${avisData.length} avis créés`);
    console.log(`\n🔐 Compte admin :`);
    console.log(`   Email: admin@bnb-esgi.com`);
    console.log(`   Password: Password123!`);
    console.log(`\n🏠 Pays couverts :`);
    console.log(`   - Sénégal (Dakar, Saly)`);
    console.log(`   - Côte d'Ivoire (Abidjan)`);
    console.log(`   - Mali (Bamako)`);
    console.log(`   - Cameroun (Yaoundé)`);
    console.log(`   - Burkina Faso (Ouagadougou)`);
}

main()
    .catch((e) => {
        console.error('❌ Erreur lors du seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
