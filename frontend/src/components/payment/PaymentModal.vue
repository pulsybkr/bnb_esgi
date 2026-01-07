<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-xl max-w-md w-full">
      <div class="p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold">Paiement</h2>
          <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
            <X class="w-6 h-6" />
          </button>
        </div>

        <div class="mb-6">
          <p class="text-2xl font-bold text-center">{{ formatCFA(amount) }}</p>
          <p class="text-sm text-gray-600 text-center">Montant à payer</p>
        </div>

        <!-- Choix méthode -->
        <div v-if="!selectedMethod" class="space-y-3">
          <button
            @click="selectedMethod = 'carte'"
            class="w-full border-2 border-gray-200 rounded-lg p-4 hover:border-green-500 transition-colors text-left"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="font-semibold">Carte bancaire</p>
                <p class="text-sm text-gray-600">Visa, Mastercard</p>
              </div>
              <CreditCard class="w-6 h-6 text-gray-400" />
            </div>
          </button>

          <button
            @click="selectedMethod = 'mobile_money'"
            class="w-full border-2 border-gray-200 rounded-lg p-4 hover:border-green-500 transition-colors text-left"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="font-semibold">Mobile Money</p>
                <p class="text-sm text-gray-600">Orange, MTN, Wave...</p>
              </div>
              <Smartphone class="w-6 h-6 text-gray-400" />
            </div>
          </button>
        </div>

        <!-- Formulaire carte -->
        <div v-else-if="selectedMethod === 'carte' && !showOtp" class="space-y-4">
          <button @click="selectedMethod = null" class="text-sm text-gray-600 hover:text-gray-900 mb-4">
            ← Retour
          </button>
          <div>
            <label class="block text-sm font-medium mb-2">Numéro de carte</label>
            <input
              v-model="cardNumber"
              type="text"
              placeholder="4242 4242 4242 4242"
              class="w-full border border-gray-300 rounded-lg p-3"
              maxlength="19"
            />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-2">Expiration</label>
              <input
                v-model="cardExpiry"
                type="text"
                placeholder="MM/AA"
                class="w-full border border-gray-300 rounded-lg p-3"
                maxlength="5"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">CVV</label>
              <input
                v-model="cardCvv"
                type="text"
                placeholder="123"
                class="w-full border border-gray-300 rounded-lg p-3"
                maxlength="3"
              />
            </div>
          </div>
          <button
            @click="handleCardPayment"
            :disabled="processing"
            class="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
          >
            {{ processing ? 'Traitement...' : 'Payer maintenant' }}
          </button>
        </div>

        <!-- Sélection opérateur Mobile Money -->
        <div v-else-if="selectedMethod === 'mobile_money' && !showOtp" class="space-y-4">
          <button @click="selectedMethod = null" class="text-sm text-gray-600 hover:text-gray-900 mb-4">
            ← Retour
          </button>
          <div>
            <label class="block text-sm font-medium mb-2">Opérateur</label>
            <select
              v-model="mobileOperator"
              class="w-full border border-gray-300 rounded-lg p-3"
            >
              <option value="">Sélectionner un opérateur</option>
              <option value="orange_money">Orange Money</option>
              <option value="mtn_momo">MTN Mobile Money</option>
              <option value="wave">Wave</option>
              <option value="moov_money">Moov Money</option>
              <option value="m_pesa">M-Pesa</option>
            </select>
          </div>
          <button
            @click="handleMobileMoneyPayment"
            :disabled="!mobileOperator || processing"
            class="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
          >
            {{ processing ? 'Envoi...' : 'Continuer' }}
          </button>
        </div>

        <!-- Confirmation OTP -->
        <div v-else-if="showOtp" class="space-y-4">
          <p class="text-sm text-gray-600 text-center">
            Un code de confirmation a été envoyé sur votre numéro
          </p>
          <div>
            <label class="block text-sm font-medium mb-2 text-center">Code OTP</label>
            <input
              v-model="otpCode"
              type="text"
              placeholder="123456"
              class="w-full border border-gray-300 rounded-lg p-3 text-center text-2xl tracking-widest"
              maxlength="6"
            />
          </div>
          <button
            @click="handleOtpConfirm"
            :disabled="otpCode.length < 4 || processing"
            class="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
          >
            {{ processing ? 'Vérification...' : 'Confirmer' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { X, CreditCard, Smartphone } from 'lucide-vue-next'
import { formatCFA } from '@/utils/currency'

const props = defineProps<{
  show: boolean
  amount: number
  reservationId: string
}>()

const emit = defineEmits<{
  close: []
  success: [paymentId: string]
}>()

const selectedMethod = ref<'carte' | 'mobile_money' | null>(null)
const processing = ref(false)
const showOtp = ref(false)
const paymentId = ref('')

// Carte
const cardNumber = ref('')
const cardExpiry = ref('')
const cardCvv = ref('')

// Mobile Money
const mobileOperator = ref('')
const otpCode = ref('')

const handleCardPayment = () => {
  emit('success', 'mock-payment-id')
}

const handleMobileMoneyPayment = () => {
  showOtp.value = true
  paymentId.value = 'mock-payment-id'
}

const handleOtpConfirm = () => {
  emit('success', paymentId.value)
}
</script>
