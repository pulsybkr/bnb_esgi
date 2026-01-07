<template>
  <div class="space-y-6 animate-slide-up">
    <div>
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Informations de base</h2>
      <p class="text-gray-600">Commencez par les informations essentielles de votre logement</p>
    </div>

    <!-- Titre -->
    <div>
      <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
        Titre du logement <span class="text-red-500">*</span>
      </label>
      <input
        id="title"
        v-model="formData.title"
        type="text"
        maxlength="200"
        placeholder="Ex: Magnifique villa avec piscine à Dakar"
        :class="[
          'w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-african-green focus:border-transparent transition-all',
          errors.title ? 'border-red-500' : 'border-gray-200'
        ]"
      />
      <div class="flex justify-between items-center mt-1">
        <p v-if="errors.title" class="text-sm text-red-600">{{ errors.title }}</p>
        <p class="text-xs text-gray-500 ml-auto">{{ formData.title.length }}/200</p>
      </div>
    </div>

    <!-- Description -->
    <div>
      <div class="flex items-center justify-between mb-2">
        <label for="description" class="block text-sm font-medium text-gray-700">
          Description <span class="text-red-500">*</span>
        </label>
        <button
          @click="isAiModalOpen = true"
          type="button"
          class="text-xs font-semibold text-african-green hover:text-african-green-dark flex items-center gap-1.5 px-3 py-1.5 bg-green-50 rounded-full border border-green-100 hover:border-green-200 transition-all shadow-sm group"
        >
          <Sparkles class="w-3.5 h-3.5 group-hover:animate-pulse" />
          <span>Générer avec l'IA</span>
        </button>
      </div>
      <textarea
        id="description"
        v-model="formData.description"
        rows="6"
        maxlength="5000"
        placeholder="Décrivez votre logement en détail : les espaces, l'ambiance, les points forts..."
        :class="[
          'w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-african-green focus:border-transparent transition-all resize-none',
          errors.description ? 'border-red-500' : 'border-gray-200'
        ]"
      ></textarea>
      <div class="flex justify-between items-center mt-1">
        <p v-if="errors.description" class="text-sm text-red-600">{{ errors.description }}</p>
        <p class="text-xs text-gray-500 ml-auto">{{ formData.description.length }}/5000</p>
      </div>
    </div>

    <!-- Type de propriété -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-3">
        Type de propriété <span class="text-red-500">*</span>
      </label>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          v-for="type in propertyTypes"
          :key="type.value"
          @click="() => formData.type = type.value as PropertyType"
          type="button"
          :class="[
            'p-4 border-2 rounded-xl transition-all duration-300 flex flex-col items-center gap-2',
            formData.type === type.value
              ? 'border-african-green bg-green-50 shadow-md'
              : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
          ]"
        >
          <component :is="type.icon" class="w-8 h-8" :class="formData.type === type.value ? 'text-african-green' : 'text-gray-400'" />
          <span :class="['text-sm font-medium', formData.type === type.value ? 'text-african-green' : 'text-gray-700']">
            {{ type.label }}
          </span>
        </button>
      </div>
      <p v-if="errors.type" class="text-sm text-red-600 mt-2">{{ errors.type }}</p>
    </div>

    <!-- AI Modal -->
    <AiDescriptionModal
      :is-open="isAiModalOpen"
      :current-description="formData.description"
      @close="isAiModalOpen = false"
      @accept="handleAiAccept"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Home, Building2, Hotel, DoorClosed, Sparkles } from 'lucide-vue-next'
import { usePropertyCreation } from '@/composables/usePropertyCreation'
import AiDescriptionModal from './AiDescriptionModal.vue'
import type { PropertyType } from '@/types/logement'

const { formData, stepValidations } = usePropertyCreation()

const errors = computed(() => stepValidations.value[1].errors)

const propertyTypes = [
  { value: 'maison', label: 'Maison', icon: Home },
  { value: 'appartement', label: 'Appartement', icon: Building2 },
  { value: 'chambre', label: 'Chambre', icon: DoorClosed },
  { value: 'hotel', label: 'Hôtel', icon: Hotel }
]

const isAiModalOpen = ref(false)

const handleAiAccept = (newDescription: string) => {
  formData.description = newDescription
}
</script>
