<template>
  <div class="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">Calculateur de prix</h3>
    
    <!-- Sélection des dates -->
    <div class="space-y-4 mb-6">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Dates de séjour</label>
        <DateRangePicker
          v-model="localDates"
          :min-date="minDate"
          :disabled-dates="disabledDates"
          placeholder="Sélectionnez vos dates"
          @change="handleDateChange"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Nombre de voyageurs</label>
        <select 
          v-model.number="localGuests"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          @change="updateCalculation"
        >
          <option v-for="i in maxGuests" :key="i" :value="i">
            {{ i }} voyageur{{ i > 1 ? 's' : '' }}
          </option>
        </select>
      </div>
    </div>

    <!-- Résultats du calcul -->
    <div v-if="finalCalculation" class="border-t pt-4 space-y-3">
      <div class="flex items-center justify-between text-sm text-gray-600">
        <span>Nombre de nuits</span>
        <span class="font-medium text-gray-900">{{ finalCalculation.nights }}</span>
      </div>

      <!-- Détail par nuit si tarification dynamique -->
      <div v-if="showNightlyBreakdown && calculationResult && calculationResult.nightlyPrices.length > 0" class="bg-gray-50 rounded-lg p-3 space-y-2">
        <div class="text-xs font-medium text-gray-700 mb-2">Détail par nuit</div>
        <div
          v-for="(nightly, index) in calculationResult.nightlyPrices.slice(0, 7)"
          :key="index"
          class="flex items-center justify-between text-xs"
        >
          <div class="flex items-center space-x-2">
            <span class="text-gray-600">
              {{ formatDateShort(nightly.date) }}
            </span>
            <span
              v-if="nightly.isWeekend"
              class="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded"
            >
              WE
            </span>
            <span
              v-if="nightly.appliedRules.length > 0"
              class="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs rounded"
            >
              {{ nightly.appliedRules[0] }}
            </span>
          </div>
          <span class="font-medium text-gray-900">
            €{{ nightly.adjustedPrice.toFixed(2) }}
          </span>
        </div>
        <div v-if="calculationResult.nightlyPrices.length > 7" class="text-xs text-gray-500 pt-1">
          + {{ calculationResult.nightlyPrices.length - 7 }} nuit{{ calculationResult.nightlyPrices.length - 7 > 1 ? 's' : '' }} supplémentaires
        </div>
      </div>

      <!-- Statistiques -->
      <div v-if="calculationResult && (calculationResult.weekendNights > 0 || calculationResult.weekNights > 0)" class="flex items-center space-x-4 text-xs text-gray-600 pt-2 border-t">
        <div>
          <span class="font-medium">{{ calculationResult.weekNights }}</span> nuit{{ calculationResult.weekNights > 1 ? 's' : '' }} semaine
        </div>
        <div v-if="calculationResult.weekendNights > 0">
          <span class="font-medium">{{ calculationResult.weekendNights }}</span> nuit{{ calculationResult.weekendNights > 1 ? 's' : '' }} week-end
        </div>
      </div>

      <!-- Résumé des prix -->
      <div class="space-y-2 pt-2 border-t">
        <div class="flex justify-between text-sm">
          <span class="text-gray-600">Sous-total hébergement</span>
          <span class="font-medium text-gray-900">
            €{{ finalCalculation.subtotal.toFixed(2) }}
          </span>
        </div>

        <div v-if="calculationResult && calculationResult.longStayDiscount > 0" class="flex justify-between text-sm text-green-600">
          <span>Réduction séjour long</span>
          <span class="font-medium">-€{{ calculationResult.longStayDiscount.toFixed(2) }}</span>
        </div>

        <div class="flex justify-between text-lg font-semibold pt-2 border-t">
          <span>Total hébergement</span>
          <span class="text-red-600">€{{ finalCalculation.total.toFixed(2) }}</span>
        </div>

        <div class="text-xs text-gray-500 pt-1">
          {{ averageNightlyPrice.toFixed(2) }}€ / nuit en moyenne
        </div>
      </div>

      <!-- Règles appliquées -->
      <div v-if="calculationResult && calculationResult.appliedRules.length > 0" class="pt-3 border-t">
        <div class="text-xs font-medium text-gray-700 mb-2">Règles de tarification appliquées</div>
        <div class="flex flex-wrap gap-1">
          <span
            v-for="rule in calculationResult.appliedRules"
            :key="rule"
            class="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
          >
            {{ rule }}
          </span>
        </div>
      </div>
    </div>

    <!-- Message si pas de dates -->
    <div v-else class="text-center py-8 text-gray-500 text-sm">
      Sélectionnez des dates pour voir le calcul automatique du prix
    </div>

    <!-- Bouton pour afficher/masquer le détail -->
    <button
      v-if="calculationResult && calculationResult.nightlyPrices.length > 0"
      @click="showNightlyBreakdown = !showNightlyBreakdown"
      class="mt-4 w-full text-sm text-gray-600 hover:text-gray-900 flex items-center justify-center space-x-1"
      type="button"
    >
      <ChevronDown class="w-4 h-4 transition-transform" :class="{ 'rotate-180': showNightlyBreakdown }" />
      <span>{{ showNightlyBreakdown ? 'Masquer' : 'Afficher' }} le détail par nuit</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ChevronDown } from 'lucide-vue-next'
import DateRangePicker from '@/components/DateRangePicker.vue'
import { calculatePrice, calculateAverageNightlyPrice } from '@/utils/pricing'
import type { PricingConfiguration, PriceCalculationResult } from '@/types/pricing'
import type { DateRange } from '@/utils/dateUtils'

interface Props {
  pricingConfig: PricingConfiguration | null
  basePrice: number
  maxGuests: number
  minDate?: Date
  disabledDates?: Date[]
  initialDates?: { start: Date | null; end: Date | null }
  initialGuests?: number
}

const props = withDefaults(defineProps<Props>(), {
  minDate: () => new Date(),
  disabledDates: () => [],
  initialDates: () => ({ start: null, end: null }),
  initialGuests: 1,
})

const emit = defineEmits<{
  'update:dates': [dates: { start: Date | null; end: Date | null }]
  'update:guests': [guests: number]
  'calculation-change': [result: PriceCalculationResult | null]
}>()

const localDates = ref<{ start: Date | null; end: Date | null }>(props.initialDates)
const localGuests = ref(props.initialGuests)
const showNightlyBreakdown = ref(false)

// Synchroniser avec les props initiales
watch(() => props.initialDates, (newVal) => {
  if (newVal) {
    localDates.value = { ...newVal }
  }
}, { deep: true })

watch(() => props.initialGuests, (newVal) => {
  localGuests.value = newVal
})

// Calcul automatique du prix
const calculationResult = computed<PriceCalculationResult | null>(() => {
  if (!localDates.value.start || !localDates.value.end) {
    return null
  }

  // Si pas de config de tarification, retourner null pour utiliser le calcul simple
  if (!props.pricingConfig) {
    return null
  }

  const dateRange: DateRange = {
    start: localDates.value.start,
    end: localDates.value.end
  }

  try {
    return calculatePrice(props.pricingConfig, dateRange)
  } catch (error) {
    console.error('Erreur lors du calcul du prix:', error)
    return null
  }
})

// Calcul sans règles de tarification (prix de base)
const simpleCalculation = computed(() => {
  if (!localDates.value.start || !localDates.value.end) {
    return null
  }

  const nights = Math.ceil(
    (localDates.value.end.getTime() - localDates.value.start.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (nights <= 0) return null

  const subtotal = props.basePrice * nights

  return {
    nights,
    subtotal,
    total: subtotal,
    longStayDiscount: 0,
    weekendNights: 0,
    weekNights: nights,
    nightlyPrices: [],
    appliedRules: []
  }
})

// Utiliser le calcul avec règles ou le calcul simple
const finalCalculation = computed(() => {
  return calculationResult.value || simpleCalculation.value
})

// Prix moyen par nuit
const averageNightlyPrice = computed(() => {
  if (!finalCalculation.value) return props.basePrice
  
  if (calculationResult.value) {
    return calculateAverageNightlyPrice(calculationResult.value)
  }
  
  return props.basePrice
})

// Handlers
const handleDateChange = (dates: { start: Date | null; end: Date | null }) => {
  localDates.value = dates
  emit('update:dates', dates)
  updateCalculation()
}

const updateCalculation = () => {
  emit('update:guests', localGuests.value)
  
  if (finalCalculation.value) {
    emit('calculation-change', finalCalculation.value as PriceCalculationResult | null)
  }
}

// Utilitaires
const formatDateShort = (date: Date): string => {
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short'
  })
}

// Émettre les changements
watch(() => finalCalculation.value, (newVal) => {
  if (newVal) {
    // Émettre le calcul avec règles si disponible, sinon émettre null
    if (calculationResult.value) {
      emit('calculation-change', calculationResult.value)
    } else {
      // Pour le calcul simple, on n'émet pas d'événement car AccommodationDetailView gère ça
      emit('calculation-change', null)
    }
  } else {
    emit('calculation-change', null)
  }
}, { immediate: true })
</script>

