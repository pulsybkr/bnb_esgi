import {
    Wifi,
    Wind,
    Utensils,
    Car,
    Waves,
    Trees,
    Home,
    Tv,
    Thermometer,
    ArrowUpCircle,
    ShieldCheck,
    Zap,
    Cigarette,
    Dog,
    Baby,
    PartyPopper
} from 'lucide-vue-next'
import type { Component } from 'vue'

export interface AmenityInfo {
    key: string
    label: string
    icon: Component
}

export const AMENITIES_MAP: Record<string, AmenityInfo> = {
    wifi: { key: 'wifi', label: 'WiFi', icon: Wifi },
    climatisation: { key: 'climatisation', label: 'Climatisation', icon: Wind },
    cuisine: { key: 'cuisine', label: 'Cuisine équipée', icon: Utensils },
    parking: { key: 'parking', label: 'Parking', icon: Car },
    piscine: { key: 'piscine', label: 'Piscine', icon: Waves },
    jardin: { key: 'jardin', label: 'Jardin', icon: Trees },
    balcon: { key: 'balcon', label: 'Balcon/Terrasse', icon: Home },
    machine_laver: { key: 'machine_laver', label: 'Machine à laver', icon: Zap }, // Lucide doesn't have WashingMachine in all versions, Zap as fallback or use another
    television: { key: 'television', label: 'Télévision', icon: Tv },
    chauffage: { key: 'chauffage', label: 'Chauffage', icon: Thermometer },
    ascenseur: { key: 'ascenseur', label: 'Ascenseur', icon: ArrowUpCircle },
    securite: { key: 'securite', label: 'Sécurité 24/7', icon: ShieldCheck }
}

export const HOUSE_RULES_MAP: Record<string, AmenityInfo> = {
    fumeur: { key: 'fumeur', label: 'Fumeurs acceptés', icon: Cigarette },
    animaux: { key: 'animaux', label: 'Animaux acceptés', icon: Dog },
    enfants: { key: 'enfants', label: 'Enfants bienvenus', icon: Baby },
    fetes: { key: 'fetes', label: 'Fêtes autorisées', icon: PartyPopper }
}

/**
 * Retourne les informations d'un équipement à partir de sa clé
 */
export function getAmenityInfo(key: string): AmenityInfo {
    return AMENITIES_MAP[key] || { key, label: key, icon: Wifi }
}

/**
 * Retourne les informations d'une règle à partir de sa clé
 */
export function getHouseRuleInfo(key: string): AmenityInfo {
    return HOUSE_RULES_MAP[key] || { key, label: key, icon: Wifi }
}
