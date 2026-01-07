<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div class="p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold">Confirmer la réservation</h2>
          <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
            <X class="w-6 h-6" />
          </button>
        </div>

        <!-- Résumé réservation -->
        <div class="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 class="font-semibold mb-2">{{ accommodation.title }}</h3>
          <div class="text-sm text-gray-600 space-y-1">
            <p>{{ formatDate(startDate) }} → {{ formatDate(endDate) }}</p>
            <p>{{ nights }} nuit{{ nights > 1 ? 's' : '' }} • {{ guests }} voyageur{{ guests > 1 ? 's' : '' }}</p>
            <p class="text-lg font-bold text-gray-900 mt-2">{{ formatCFA(totalAmount) }}</p>
          </div>
        </div>

        <!-- Message optionnel -->
        <div class="mb-6">
          <label class="block text-sm font-medium mb-2">Message au propriétaire (optionnel)</label>
          <textarea
            v-model="message"
            rows="3"
            class="w-full border border-gray-300 rounded-lg p-3"
            placeholder="Présentez-vous et expliquez votre séjour..."
          ></textarea>
        </div>

        <!-- Actions selon le mode -->
        <div v-if="bookingMode === 'instant'" class="space-y-3">
          <p class="text-sm text-gray-600">
            ✨ <strong>Réservation instantanée</strong> - Votre réservation sera confirmée après paiement
          </p>
          <button
            @click="handleInstantBooking"
            :disabled="loading"
            class="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
          >
            {{ loading ? 'Traitement...' : 'Payer et réserver' }}
          </button>
        </div>

        <div v-else class="space-y-3">
          <p class="text-sm text-gray-600">
            📋 <strong>Demande de réservation</strong> - Le propriétaire doit approuver votre demande
          </p>
          <button
            @click="handleRequestBooking"
            :disabled="loading"
            class="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {{ loading ? 'Envoi...' : 'Envoyer la demande' }}
          </button>
        </div>

        <p class="text-xs text-gray-500 text-center mt-4">
          En continuant, vous acceptez les conditions générales
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { X } from 'lucide-vue-next'
import { formatCFA } from '@/utils/currency'

const props = defineProps<{
  show: boolean
  accommodation: {
    id: string
    title: string
  }
  startDate: Date
  endDate: Date
  guests: number
  nights: number
  totalAmount: number
  bookingMode: 'instant' | 'request'
}>()

const emit = defineEmits<{
  close: []
  confirm: [message: string]
}>()

const message = ref('')
const loading = ref(false)

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('fr-FR', { 
    day: 'numeric', 
    month: 'short' 
  }).format(date)
}

const handleInstantBooking = () => {
  emit('confirm', message.value)
}

const handleRequestBooking = () => {
  emit('confirm', message.value)
}
</script>
