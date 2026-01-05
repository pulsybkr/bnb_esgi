/**
 * Types pour la tarification dynamique
 */

export interface PricingRule {
  id: string
  accommodationId: string
  type: PricingRuleType
  name: string
  priority: number // Plus le nombre est élevé, plus la règle a la priorité
  enabled: boolean
  createdAt: Date
  updatedAt: Date
}

export enum PricingRuleType {
  SEASON = 'season', // Haute/basse saison
  WEEKEND = 'weekend', // Week-end vs semaine
  LONG_STAY = 'long_stay', // Réduction séjours longs
  CUSTOM = 'custom' // Période personnalisée
}

export interface SeasonPricingRule extends PricingRule {
  type: PricingRuleType.SEASON
  season: SeasonType
  startMonth: number // 1-12
  endMonth: number // 1-12
  priceMultiplier: number // Multiplicateur (ex: 1.5 pour +50%, 0.8 pour -20%)
}

export enum SeasonType {
  HIGH = 'high', // Haute saison
  LOW = 'low' // Basse saison
}

export interface WeekendPricingRule extends PricingRule {
  type: PricingRuleType.WEEKEND
  weekendMultiplier: number // Multiplicateur pour le week-end (ex: 1.2 pour +20%)
  weekMultiplier: number // Multiplicateur pour la semaine (ex: 0.9 pour -10%, par défaut 1.0)
}

export interface LongStayPricingRule extends PricingRule {
  type: PricingRuleType.LONG_STAY
  minimumNights: number // Nombre minimum de nuits pour appliquer la réduction
  discountPercentage: number // Pourcentage de réduction (ex: 10 pour 10%)
  maximumDiscountPercentage?: number // Réduction maximale (optionnel)
}

export interface CustomPeriodPricingRule extends PricingRule {
  type: PricingRuleType.CUSTOM
  startDate: Date
  endDate: Date
  priceMultiplier: number
  name: string
}

export type AnyPricingRule = 
  | SeasonPricingRule 
  | WeekendPricingRule 
  | LongStayPricingRule 
  | CustomPeriodPricingRule

export interface PricingConfiguration {
  accommodationId: string
  basePrice: number // Prix de base par nuit
  rules: AnyPricingRule[]
  currency: string // 'EUR', 'USD', etc.
}

export interface PriceCalculationResult {
  basePrice: number
  nights: number
  weekendNights: number
  weekNights: number
  nightlyPrices: NightlyPrice[] // Prix par nuit
  subtotal: number
  longStayDiscount: number
  total: number
  appliedRules: string[] // Noms des règles appliquées
}

export interface NightlyPrice {
  date: Date
  basePrice: number
  adjustedPrice: number
  appliedRules: string[]
  isWeekend: boolean
}

