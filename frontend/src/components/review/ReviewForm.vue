<template>
  <div class="space-y-6">
    <div>
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Laissez votre avis</h3>
      
      <!-- Overall Rating -->
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">
          Note globale <span class="text-red-500">*</span>
        </label>
        <StarRating v-model="formData.rating" size="lg" />
        <p v-if="errors.rating" class="text-sm text-red-600">{{ errors.rating }}</p>
      </div>
    </div>

    <!-- Detailed Ratings (Optional) -->
    <div v-if="showDetailedRatings" class="space-y-4">
      <h4 class="text-sm font-semibold text-gray-900">Notes détaillées (optionnel)</h4>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm text-gray-700 mb-1">Propreté</label>
          <StarRating v-model="formData.detailedRatings.cleanliness" />
        </div>
        
        <div>
          <label class="block text-sm text-gray-700 mb-1">Communication</label>
          <StarRating v-model="formData.detailedRatings.communication" />
        </div>
        
        <div>
          <label class="block text-sm text-gray-700 mb-1">Emplacement</label>
          <StarRating v-model="formData.detailedRatings.location" />
        </div>
        
        <div>
          <label class="block text-sm text-gray-700 mb-1">Rapport qualité/prix</label>
          <StarRating v-model="formData.detailedRatings.value" />
        </div>
      </div>
    </div>

    <!-- Comment -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Votre commentaire (optionnel)
      </label>
      <textarea
        v-model="formData.comment"
        rows="5"
        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-african-green focus:border-transparent resize-none"
        placeholder="Partagez votre expérience avec ce logement..."
      />
      <p class="mt-1 text-sm text-gray-500">
        {{ formData.comment?.length || 0 }} caractères
      </p>
    </div>

    <!-- Actions -->
    <div class="flex gap-3 justify-end pt-4 border-t">
      <button
        type="button"
        @click="emit('cancel')"
        class="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
      >
        Annuler
      </button>
      <button
        type="button"
        @click="handleSubmit"
        :disabled="isSubmitting || !isValid"
        class="px-6 py-2.5 bg-african-green text-white rounded-lg hover:bg-african-green-dark transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" />
        {{ isSubmitting ? 'Envoi...' : 'Publier l\'avis' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, ref } from 'vue'
import { Loader2 } from 'lucide-vue-next'
import StarRating from './StarRating.vue'

interface Props {
  reservationId: string
  showDetailedRatings?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showDetailedRatings: true,
})

const emit = defineEmits<{
  submit: [data: {
    rating: number
    comment?: string
    detailedRatings?: {
      cleanliness?: number
      communication?: number
      location?: number
      value?: number
    }
  }]
  cancel: []
}>()

const formData = reactive({
  rating: 0,
  comment: '',
  detailedRatings: {
    cleanliness: 0,
    communication: 0,
    location: 0,
    value: 0,
  },
})

const errors = reactive({
  rating: '',
})

const isSubmitting = ref(false)

const isValid = computed(() => {
  return formData.rating > 0
})

function validateForm(): boolean {
  errors.rating = ''
  
  if (formData.rating === 0) {
    errors.rating = 'Veuillez sélectionner une note'
    return false
  }
  
  return true
}

async function handleSubmit() {
  if (!validateForm()) {
    return
  }
  
  isSubmitting.value = true
  
  try {
    const submitData: any = {
      rating: formData.rating,
    }
    
    if (formData.comment.trim()) {
      submitData.comment = formData.comment.trim()
    }
    
    // Only include detailed ratings if at least one is set
    const hasDetailedRatings = Object.values(formData.detailedRatings).some(r => r > 0)
    if (hasDetailedRatings && props.showDetailedRatings) {
      submitData.detailedRatings = {}
      if (formData.detailedRatings.cleanliness > 0) {
        submitData.detailedRatings.cleanliness = formData.detailedRatings.cleanliness
      }
      if (formData.detailedRatings.communication > 0) {
        submitData.detailedRatings.communication = formData.detailedRatings.communication
      }
      if (formData.detailedRatings.location > 0) {
        submitData.detailedRatings.location = formData.detailedRatings.location
      }
      if (formData.detailedRatings.value > 0) {
        submitData.detailedRatings.value = formData.detailedRatings.value
      }
    }
    
    emit('submit', submitData)
  } finally {
    isSubmitting.value = false
  }
}
</script>
