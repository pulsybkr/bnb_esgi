<template>
  <div class="border border-gray-200 rounded-lg p-4">
    <label class="block text-sm font-medium mb-2">
      Négocier le prix par nuit
    </label>
    <div class="flex gap-2">
      <div class="flex-1">
        <input
          v-model.number="proposedPrice"
          type="number"
          :placeholder="`Prix actuel: ${formatCFA(currentPrice)}`"
          class="w-full border border-gray-300 rounded-lg px-4 py-2"
          :min="0"
        />
      </div>
      <button
        @click="handlePropose"
        :disabled="!proposedPrice || proposedPrice === currentPrice || loading"
        class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ loading ? 'Envoi...' : 'Proposer' }}
      </button>
    </div>
    <p v-if="proposedPrice && proposedPrice !== currentPrice" class="text-sm text-gray-600 mt-2">
      Nouveau total: {{ formatCFA(proposedPrice * nights) }} ({{ nights }} nuit{{ nights > 1 ? 's' : '' }})
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { formatCFA } from '@/utils/currency'

const props = defineProps<{
  currentPrice: number
  nights: number
  reservationId: string
}>()

const emit = defineEmits<{
  propose: [newPrice: number]
}>()

const proposedPrice = ref<number>()
const loading = ref(false)

const handlePropose = () => {
  if (proposedPrice.value && proposedPrice.value !== props.currentPrice) {
    emit('propose', proposedPrice.value)
  }
}
</script>
