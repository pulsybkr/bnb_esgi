<template>
  <div class="space-y-6 animate-slide-up">
    <div>
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Tarification</h2>
      <p class="text-gray-600">Définissez le prix de votre logement par nuit</p>
    </div>

    <div class="max-w-md">
      <label for="pricePerNight" class="block text-sm font-medium text-gray-700 mb-2">
        Prix par nuit <span class="text-red-500">*</span>
      </label>
      <div class="relative">
        <input
          id="pricePerNight"
          v-model.number="formData.pricePerNight"
          type="number"
          min="0"
          step="1000"
          placeholder="50000"
          :class="[
            'w-full pl-20 pr-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-african-green focus:border-transparent transition-all text-lg font-semibold',
            errors.pricePerNight ? 'border-red-500' : 'border-gray-200'
          ]"
        />
        <div class="absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
          <span class="text-lg font-semibold text-gray-700">{{ formData.currency }}</span>
        </div>
      </div>
      <p v-if="errors.pricePerNight" class="text-sm text-red-600 mt-2">{{ errors.pricePerNight }}</p>
      
      <!-- Prix suggéré -->
      <div class="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
        <div class="flex items-start gap-3">
          <Info class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 class="text-sm font-medium text-blue-900 mb-1">Conseil de tarification</h4>
            <p class="text-xs text-blue-700">
              Les logements similaires dans votre région sont généralement proposés entre 
              <span class="font-semibold">30 000 - 80 000 XOF</span> par nuit.
            </p>
          </div>
        </div>
      </div>

      <!-- Aperçu des gains -->
      <div v-if="formData.pricePerNight > 0" class="mt-6 p-5 bg-green-50 rounded-xl border-2 border-african-green">
        <h4 class="text-sm font-semibold text-african-green-dark mb-3">Estimation de vos revenus</h4>
        <div class="space-y-2">
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-700">Par semaine (7 nuits)</span>
            <span class="text-lg font-bold text-african-green">{{ formatPrice(formData.pricePerNight * 7) }} XOF</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-700">Par mois (30 nuits)</span>
            <span class="text-lg font-bold text-african-green">{{ formatPrice(formData.pricePerNight * 30) }} XOF</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Info } from 'lucide-vue-next'
import { usePropertyCreation } from '@/composables/usePropertyCreation'

const { formData, stepValidations } = usePropertyCreation()

const errors = computed(() => stepValidations.value[4].errors)

function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR').format(price)
}
</script>
