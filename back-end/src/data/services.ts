/**
 * Services disponibles correspondant aux IDs du frontend
 */
export const SERVICE_MAP: Record<string, {
    name: string;
    description: string;
    price: number;
    priceType: 'fixed' | 'per_night' | 'per_guest' | 'per_guest_per_night';
}> = {
    cleaning: {
        name: 'Nettoyage',
        description: 'Service de nettoyage en fin de séjour',
        price: 50,
        priceType: 'fixed',
    },
    breakfast: {
        name: 'Petit-déjeuner',
        description: 'Petit-déjeuner servi chaque matin',
        price: 15,
        priceType: 'per_guest_per_night',
    },
    airport_transfer: {
        name: 'Transfert aéroport',
        description: 'Transfert aller-retour depuis l\'aéroport',
        price: 60,
        priceType: 'fixed',
    },
    concierge: {
        name: 'Service de conciergerie',
        description: 'Assistance pour réservations et recommandations',
        price: 25,
        priceType: 'per_night',
    },
    baby_equipment: {
        name: 'Équipement bébé',
        description: 'Lit bébé, chaise haute, etc.',
        price: 10,
        priceType: 'per_night',
    },
    late_checkout: {
        name: 'Check-out tardif',
        description: 'Départ jusqu\'à 18h (sous réserve de disponibilité)',
        price: 30,
        priceType: 'fixed',
    },
    early_checkin: {
        name: 'Check-in anticipé',
        description: 'Arrivée dès 12h (sous réserve de disponibilité)',
        price: 30,
        priceType: 'fixed',
    },
    parking: {
        name: 'Parking privé',
        description: 'Place de parking sécurisée',
        price: 10,
        priceType: 'per_night',
    },
    pet_fee: {
        name: 'Animaux de compagnie',
        description: 'Supplément pour animaux (max 2)',
        price: 20,
        priceType: 'per_night',
    },
    bike_rental: {
        name: 'Location de vélos',
        description: 'Location de vélos pour la durée du séjour',
        price: 15,
        priceType: 'per_night',
    },
};

