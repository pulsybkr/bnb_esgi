<template>
  <div class="space-y-6 animate-slide-up">
    <div>
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Localisation</h2>
      <p class="text-gray-600">Où se trouve votre logement ?</p>
    </div>

    <!-- Adresse -->
    <div>
      <label for="address" class="block text-sm font-medium text-gray-700 mb-2">
        Adresse complète <span class="text-red-500">*</span>
      </label>
      <input
        id="address"
        v-model="formData.address"
        type="text"
        placeholder="Ex: 15 Avenue de la République"
        :class="[
          'w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-african-green focus:border-transparent transition-all',
          errors.address ? 'border-red-500' : 'border-gray-200'
        ]"
      />
      <p v-if="errors.address" class="text-sm text-red-600 mt-1">{{ errors.address }}</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Ville -->
      <div>
        <label for="city" class="block text-sm font-medium text-gray-700 mb-2">
          Ville <span class="text-red-500">*</span>
        </label>
        <input
          id="city"
          v-model="formData.city"
          type="text"
          placeholder="Ex: Dakar"
          :class="[
            'w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-african-green focus:border-transparent transition-all',
            errors.city ? 'border-red-500' : 'border-gray-200'
          ]"
        />
        <p v-if="errors.city" class="text-sm text-red-600 mt-1">{{ errors.city }}</p>
      </div>

      <!-- Pays -->
      <div>
        <label for="country" class="block text-sm font-medium text-gray-700 mb-2">
          Pays <span class="text-red-500">*</span>
        </label>
        <input
          id="country"
          v-model="formData.country"
          type="text"
          placeholder="Ex: Sénégal"
          :class="[
            'w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-african-green focus:border-transparent transition-all',
            errors.country ? 'border-red-500' : 'border-gray-200'
          ]"
        />
        <p v-if="errors.country" class="text-sm text-red-600 mt-1">{{ errors.country }}</p>
      </div>
    </div>

    <!-- Coordonnées GPS (optionnel) -->
    <div class="bg-gray-50 rounded-xl p-4 border border-gray-200 hidden">
      <div class="flex items-start gap-3 mb-3">
        <MapPin class="w-5 h-5 text-african-green flex-shrink-0 mt-0.5" />
        <div class="flex-1">
          <h3 class="text-sm font-medium text-gray-900 mb-1">Coordonnées GPS (optionnel)</h3>
          <p class="text-xs text-gray-600">Ajoutez les coordonnées pour une localisation précise sur la carte</p>
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label for="latitude" class="block text-xs font-medium text-gray-700 mb-1">Latitude</label>
          <input
            id="latitude"
            v-model.number="formData.latitude"
            type="number"
            step="0.000001"
            placeholder="Ex: 14.6928"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-african-green focus:border-transparent text-sm"
          />
        </div>
        <div>
          <label for="longitude" class="block text-xs font-medium text-gray-700 mb-1">Longitude</label>
          <input
            id="longitude"
            v-model.number="formData.longitude"
            type="number"
            step="0.000001"
            placeholder="Ex: -17.4467"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-african-green focus:border-transparent text-sm"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { MapPin } from 'lucide-vue-next'
import { usePropertyCreation } from '@/composables/usePropertyCreation'

const { formData, stepValidations } = usePropertyCreation()

const errors = computed(() => stepValidations.value[2].errors)
</script>
