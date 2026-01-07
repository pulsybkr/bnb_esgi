<template>
  <div class="space-y-6 animate-slide-up">
    <div>
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Détails du logement</h2>
      <p class="text-gray-600">Précisez les caractéristiques de votre propriété</p>
    </div>

    <!-- Capacité -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label for="roomCount" class="block text-sm font-medium text-gray-700 mb-2">
          Nombre de pièces <span class="text-red-500">*</span>
        </label>
        <input
          id="roomCount"
          v-model.number="formData.roomCount"
          type="number"
          min="1"
          max="50"
          :class="[
            'w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-african-green focus:border-transparent transition-all',
            errors.roomCount ? 'border-red-500' : 'border-gray-200'
          ]"
        />
        <p v-if="errors.roomCount" class="text-sm text-red-600 mt-1">{{ errors.roomCount }}</p>
      </div>

      <div>
        <label for="capacity" class="block text-sm font-medium text-gray-700 mb-2">
          Capacité d'accueil <span class="text-red-500">*</span>
        </label>
        <input
          id="capacity"
          v-model.number="formData.capacity"
          type="number"
          min="1"
          max="100"
          :class="[
            'w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-african-green focus:border-transparent transition-all',
            errors.capacity ? 'border-red-500' : 'border-gray-200'
          ]"
        />
        <p v-if="errors.capacity" class="text-sm text-red-600 mt-1">{{ errors.capacity }}</p>
      </div>
    </div>

    <!-- Équipements -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-3">Équipements disponibles</label>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
        <label
          v-for="amenity in amenitiesList"
          :key="amenity.key"
          class="flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all hover:border-gray-300"
          :class="formData.amenities[amenity.key] ? 'border-african-green bg-green-50' : 'border-gray-200'"
        >
          <input
            type="checkbox"
            v-model="formData.amenities[amenity.key]"
            class="w-5 h-5 text-african-green border-gray-300 rounded focus:ring-african-green"
          />
          <span class="text-sm font-medium text-gray-700">{{ amenity.label }}</span>
        </label>
      </div>
    </div>

    <!-- Règles de la maison -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-3">Règles de la maison</label>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label
          v-for="rule in houseRulesList"
          :key="rule.key"
          class="flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all hover:border-gray-300"
          :class="formData.houseRules[rule.key] ? 'border-african-green bg-green-50' : 'border-gray-200'"
        >
          <input
            type="checkbox"
            v-model="formData.houseRules[rule.key]"
            class="w-5 h-5 text-african-green border-gray-300 rounded focus:ring-african-green"
          />
          <span class="text-sm font-medium text-gray-700">{{ rule.label }}</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePropertyCreation } from '@/composables/usePropertyCreation'

const { formData, stepValidations } = usePropertyCreation()

const errors = computed(() => stepValidations.value[3].errors)

const amenitiesList = [
  { key: 'wifi', label: 'WiFi' },
  { key: 'climatisation', label: 'Climatisation' },
  { key: 'cuisine', label: 'Cuisine équipée' },
  { key: 'parking', label: 'Parking' },
  { key: 'piscine', label: 'Piscine' },
  { key: 'jardin', label: 'Jardin' },
  { key: 'balcon', label: 'Balcon/Terrasse' },
  { key: 'machine_laver', label: 'Machine à laver' },
  { key: 'television', label: 'Télévision' },
  { key: 'chauffage', label: 'Chauffage' },
  { key: 'ascenseur', label: 'Ascenseur' },
  { key: 'securite', label: 'Sécurité 24/7' }
]

const houseRulesList = [
  { key: 'fumeur', label: 'Fumeurs acceptés' },
  { key: 'animaux', label: 'Animaux acceptés' },
  { key: 'enfants', label: 'Enfants bienvenus' },
  { key: 'fetes', label: 'Fêtes autorisées' }
]
</script>
