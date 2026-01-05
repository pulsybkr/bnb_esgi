/**
 * Données de démonstration pour la tarification
 */

import type { PricingConfiguration, SeasonPricingRule, WeekendPricingRule, LongStayPricingRule } from '@/types/pricing'
import { PricingRuleType, SeasonType } from '@/types/pricing'

export const samplePricingConfigs: Record<string, PricingConfiguration> = {
  '1': {
    accommodationId: '1',
    basePrice: 120,
    currency: 'EUR',
    rules: [
      {
        id: 'season-high-1',
        accommodationId: '1',
        type: PricingRuleType.SEASON,
        name: 'Haute saison (juillet-août)',
        priority: 100,
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        season: SeasonType.HIGH,
        startMonth: 7, // Juillet
        endMonth: 8, // Août
        priceMultiplier: 1.5, // +50%
      } as SeasonPricingRule,
      {
        id: 'season-low-1',
        accommodationId: '1',
        type: PricingRuleType.SEASON,
        name: 'Basse saison (novembre-mars)',
        priority: 80,
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        season: SeasonType.LOW,
        startMonth: 11, // Novembre
        endMonth: 3, // Mars
        priceMultiplier: 0.8, // -20%
      } as SeasonPricingRule,
      {
        id: 'weekend-1',
        accommodationId: '1',
        type: PricingRuleType.WEEKEND,
        name: 'Tarification week-end',
        priority: 50,
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        weekendMultiplier: 1.2, // +20% le week-end
        weekMultiplier: 1.0, // Prix normal en semaine
      } as WeekendPricingRule,
      {
        id: 'long-stay-1',
        accommodationId: '1',
        type: PricingRuleType.LONG_STAY,
        name: 'Réduction séjour long (7+ nuits)',
        priority: 10,
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        minimumNights: 7,
        discountPercentage: 10, // 10% de réduction
      } as LongStayPricingRule,
      {
        id: 'long-stay-14-1',
        accommodationId: '1',
        type: PricingRuleType.LONG_STAY,
        name: 'Réduction séjour long (14+ nuits)',
        priority: 20,
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        minimumNights: 14,
        discountPercentage: 15, // 15% de réduction
      } as LongStayPricingRule,
    ],
  },
  '2': {
    accommodationId: '2',
    basePrice: 80,
    currency: 'EUR',
    rules: [
      {
        id: 'weekend-2',
        accommodationId: '2',
        type: PricingRuleType.WEEKEND,
        name: 'Tarification week-end',
        priority: 50,
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        weekendMultiplier: 1.15, // +15% le week-end
        weekMultiplier: 1.0,
      } as WeekendPricingRule,
      {
        id: 'long-stay-2',
        accommodationId: '2',
        type: PricingRuleType.LONG_STAY,
        name: 'Réduction séjour long (5+ nuits)',
        priority: 10,
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        minimumNights: 5,
        discountPercentage: 8,
      } as LongStayPricingRule,
    ],
  },
}

/**
 * Obtient la configuration de tarification pour un logement
 */
export function getPricingConfig(accommodationId: string): PricingConfiguration | null {
  return samplePricingConfigs[accommodationId] || null
}

