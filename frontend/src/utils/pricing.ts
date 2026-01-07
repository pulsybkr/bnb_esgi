/**
 * Utilitaires pour le calcul de prix avec tarification dynamique
 */

import type {
  PricingConfiguration,
  PriceCalculationResult,
  NightlyPrice,
  AnyPricingRule,
  SeasonPricingRule,
  WeekendPricingRule,
  LongStayPricingRule,
  CustomPeriodPricingRule,
} from '@/types/pricing'
import { PricingRuleType, SeasonType } from '@/types/pricing'
import { normalizeDate, getDatesInRange, type DateRange } from './dateUtils'

/**
 * Vérifie si une date est un week-end (samedi ou dimanche)
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay()
  return day === 0 || day === 6 // 0 = Dimanche, 6 = Samedi
}

/**
 * Vérifie si une date est dans une période de haute saison
 */
function isHighSeason(date: Date, rule: SeasonPricingRule): boolean {
  if (rule.season !== SeasonType.HIGH) return false
  
  const month = date.getMonth() + 1 // getMonth() retourne 0-11
  
  if (rule.startMonth <= rule.endMonth) {
    return month >= rule.startMonth && month <= rule.endMonth
  } else {
    // Période qui traverse l'année (ex: décembre à février)
    return month >= rule.startMonth || month <= rule.endMonth
  }
}

/**
 * Vérifie si une date est dans une période personnalisée
 */
function isInCustomPeriod(date: Date, rule: CustomPeriodPricingRule): boolean {
  const normalizedDate = normalizeDate(date)
  const start = normalizeDate(rule.startDate)
  const end = normalizeDate(rule.endDate)
  return normalizedDate >= start && normalizedDate <= end
}

/**
 * Calcule le prix pour une nuit donnée en appliquant les règles de tarification
 */
function calculateNightlyPrice(
  date: Date,
  basePrice: number,
  rules: AnyPricingRule[]
): { price: number; appliedRules: string[] } {
  let price = basePrice
  const appliedRules: string[] = []
  
  // Trier les règles par priorité (plus élevé = appliqué en premier)
  const sortedRules = [...rules]
    .filter(r => r.enabled)
    .sort((a, b) => b.priority - a.priority)
  
  // Multiplicateurs accumulés
  let multiplier = 1.0
  
  for (const rule of sortedRules) {
    switch (rule.type) {
      case PricingRuleType.SEASON: {
        const seasonRule = rule as SeasonPricingRule
        if (isHighSeason(date, seasonRule) || seasonRule.season === SeasonType.LOW) {
          multiplier *= seasonRule.priceMultiplier
          appliedRules.push(rule.name)
        }
        break
      }
      
      case PricingRuleType.WEEKEND: {
        const weekendRule = rule as WeekendPricingRule
        if (isWeekend(date)) {
          multiplier *= weekendRule.weekendMultiplier
          appliedRules.push(rule.name)
        } else {
          multiplier *= weekendRule.weekMultiplier
        }
        break
      }
      
      case PricingRuleType.CUSTOM: {
        const customRule = rule as CustomPeriodPricingRule
        if (isInCustomPeriod(date, customRule)) {
          multiplier *= customRule.priceMultiplier
          appliedRules.push(rule.name)
        }
        break
      }
      
      case PricingRuleType.LONG_STAY:
        // Les réductions de séjour long sont appliquées au total, pas par nuit
        break
    }
  }
  
  price = Math.round(basePrice * multiplier * 100) / 100 // Arrondir à 2 décimales
  
  return { price, appliedRules }
}

/**
 * Calcule la réduction pour séjour long
 */
function calculateLongStayDiscount(
  nights: number,
  baseTotal: number,
  rules: LongStayPricingRule[]
): { discount: number; appliedRule: string | null } {
  const enabledRules = rules.filter(r => r.enabled && nights >= r.minimumNights)
  
  if (enabledRules.length === 0) {
    return { discount: 0, appliedRule: null }
  }
  
  // Prendre la règle avec le plus grand nombre de nuits minimum (la plus avantageuse)
  const bestRule = enabledRules.reduce((best, current) => 
    current.minimumNights > best.minimumNights ? current : best
  )
  
  let discountPercentage = bestRule.discountPercentage
  
  // Appliquer la réduction maximale si définie
  if (bestRule.maximumDiscountPercentage !== undefined) {
    discountPercentage = Math.min(discountPercentage, bestRule.maximumDiscountPercentage)
  }
  
  const discount = Math.round((baseTotal * discountPercentage / 100) * 100) / 100
  
  return { discount, appliedRule: bestRule.name }
}

/**
 * Calcule le prix total pour une période donnée
 */
export function calculatePrice(
  config: PricingConfiguration,
  dateRange: DateRange
): PriceCalculationResult {
  const { basePrice, rules } = config
  
  // Séparer les règles par type
  const seasonRules = rules.filter(r => r.type === PricingRuleType.SEASON) as SeasonPricingRule[]
  const weekendRules = rules.filter(r => r.type === PricingRuleType.WEEKEND) as WeekendPricingRule[]
  const longStayRules = rules.filter(r => r.type === PricingRuleType.LONG_STAY) as LongStayPricingRule[]
  const customRules = rules.filter(r => r.type === PricingRuleType.CUSTOM) as CustomPeriodPricingRule[]
  
  // Obtenir toutes les dates de la plage (sans la date de départ)
  const dates = getDatesInRange({
    start: dateRange.start,
    end: new Date(dateRange.end.getTime() - 24 * 60 * 60 * 1000) // Exclure la date de fin
  })
  
  const nights = dates.length
  const nightlyPrices: NightlyPrice[] = []
  let weekendNights = 0
  let weekNights = 0
  
  // Calculer le prix pour chaque nuit
  for (const date of dates) {
    const isWeekendDate = isWeekend(date)
    if (isWeekendDate) {
      weekendNights++
    } else {
      weekNights++
    }
    
    const allRules = [...seasonRules, ...weekendRules, ...customRules] as AnyPricingRule[]
    const { price, appliedRules } = calculateNightlyPrice(date, basePrice, allRules)
    
    nightlyPrices.push({
      date: new Date(date),
      basePrice,
      adjustedPrice: price,
      appliedRules,
      isWeekend: isWeekendDate
    })
  }
  
  // Calculer le sous-total
  const subtotal = nightlyPrices.reduce((sum, np) => sum + np.adjustedPrice, 0)
  
  // Calculer la réduction pour séjour long
  const { discount: longStayDiscount, appliedRule: longStayRule } = 
    calculateLongStayDiscount(nights, subtotal, longStayRules)
  
  // Prix total
  const total = Math.round((subtotal - longStayDiscount) * 100) / 100
  
  // Règles appliquées
  const appliedRules = nightlyPrices
    .flatMap(np => np.appliedRules)
    .filter((value, index, self) => self.indexOf(value) === index) // Dédupliquer
  
  if (longStayRule) {
    appliedRules.push(longStayRule)
  }
  
  return {
    basePrice,
    nights,
    weekendNights,
    weekNights,
    nightlyPrices,
    subtotal,
    longStayDiscount,
    total,
    appliedRules
  }
}

/**
 * Calcule le prix moyen par nuit
 */
export function calculateAverageNightlyPrice(result: PriceCalculationResult): number {
  if (result.nights === 0) return 0
  return Math.round((result.total / result.nights) * 100) / 100
}

