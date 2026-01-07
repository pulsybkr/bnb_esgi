<template>
  <div class="min-h-screen bg-gray-50">
    <SimpleHeader />
    <div class="max-w-4xl mx-auto px-4">
      <!-- Header -->
      <div class="mb-6">
        <button @click="$router.back()" class="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft class="w-5 h-5" />
          <span>Retour</span>
        </button>
        <h1 class="text-3xl font-bold">Détails de la réservation</h1>
      </div>

      <div v-if="loading" class="text-center py-12">
        <p class="text-gray-600">Chargement...</p>
      </div>

      <div v-else-if="!reservation" class="bg-white rounded-lg shadow p-12 text-center">
        <p class="text-gray-600">Réservation introuvable</p>
      </div>

      <div v-else class="space-y-6">
        <!-- Statut -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex justify-between items-center">
            <div>
              <span class="text-sm text-gray-600">Statut</span>
              <div class="flex items-center gap-3 mt-1">
                <span
                  class="px-4 py-2 rounded-full text-sm font-medium"
                  :class="getStatusClass(reservation.status)"
                >
                  {{ getStatusLabel(reservation.status) }}
                </span>
              </div>
            </div>
            <div class="text-right">
              <span class="text-sm text-gray-600">Réservation #</span>
              <p class="font-mono text-sm">{{ reservation.id.slice(0, 8) }}</p>
            </div>
          </div>
        </div>

        <!-- Logement -->
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <img
            v-if="reservation.accommodation.photos?.[0]"
            :src="reservation.accommodation.photos[0].url"
            :alt="reservation.accommodation.title"
            class="w-full h-64 object-cover"
          />
          <div class="p-6">
            <h2 class="text-2xl font-bold mb-2">{{ reservation.accommodation.title }}</h2>
            <p class="text-gray-600 flex items-center gap-2">
              <MapPin class="w-4 h-4" />
              {{ reservation.accommodation.city }}
            </p>
          </div>
        </div>

        <!-- Informations Réservation -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-xl font-semibold mb-4">Informations de séjour</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <span class="text-sm text-gray-600">Arrivée</span>
              <p class="font-semibold">{{ formatDate(reservation.startDate) }}</p>
            </div>
            <div>
              <span class="text-sm text-gray-600">Départ</span>
              <p class="font-semibold">{{ formatDate(reservation.endDate) }}</p>
            </div>
            <div>
              <span class="text-sm text-gray-600">Durée</span>
              <p class="font-semibold">{{ calculateNights(reservation.startDate, reservation.endDate) }} nuit(s)</p>
            </div>
            <div>
              <span class="text-sm text-gray-600">Voyageurs</span>
              <p class="font-semibold">{{ reservation.guestCount }} personne(s)</p>
            </div>
          </div>
        </div>

        <!-- Informations Client/Propriétaire -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-xl font-semibold mb-4">
            {{ isOwner ? 'Informations du voyageur' : 'Informations du propriétaire' }}
          </h3>
          <div v-if="otherUser" class="flex items-center gap-4">
            <HostAvatar
              :name="otherUser.firstName + ' ' + otherUser.lastName"
              :avatar="otherUser.profilePhoto"
              size="lg"
            />
            <div>
              <p class="font-semibold">{{ otherUser.firstName }} {{ otherUser.lastName }}</p>
              <p class="text-sm text-gray-600">{{ otherUser.email }}</p>
            </div>
          </div>
          <button
            @click="openConversation"
            class="mt-4 w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <MessageCircle class="w-5 h-5" />
            Envoyer un message
          </button>
        </div>

        <!-- Message du client -->
        <div v-if="reservation.tenantMessage && isOwner" class="bg-blue-50 rounded-lg p-6 border border-blue-200">
          <h3 class="text-lg font-semibold mb-2 flex items-center gap-2">
            <MessageSquare class="w-5 h-5 text-blue-600" />
            Message du voyageur
          </h3>
          <p class="text-gray-700">{{ reservation.tenantMessage }}</p>
        </div>

        <!-- Détails Prix -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-xl font-semibold mb-4">Détails du prix</h3>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-gray-600">Prix par nuit</span>
              <span class="font-semibold">{{ formatCFA(reservation.pricePerNight || 0) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Nombre de nuits</span>
              <span class="font-semibold">{{ calculateNights(reservation.startDate, reservation.endDate) }}</span>
            </div>
            <div v-if="reservation.negotiatedPrice" class="flex justify-between text-green-600">
              <span>Prix négocié</span>
              <span class="font-semibold">{{ formatCFA(reservation.negotiatedPrice) }}</span>
            </div>
            <div class="border-t pt-3 flex justify-between text-lg font-bold">
              <span>Total</span>
              <span class="text-green-600">{{ formatCFA(reservation.totalAmount) }}</span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div v-if="canTakeAction || (!isOwner && reservation.status === 'acceptee')" class="bg-white rounded-lg shadow p-6">
          <h3 class="text-xl font-semibold mb-4">Actions</h3>
          <div class="flex gap-3">
            <button
              v-if="!isOwner && reservation.status === 'acceptee'"
              @click="openPaymentModal"
              class="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold text-lg"
            >
              💳 Payer maintenant
            </button>
            <button
              v-if="isOwner && reservation.status === 'en_attente'"
              @click="acceptReservation"
              class="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
            >
              Accepter
            </button>
            <button
              v-if="isOwner && reservation.status === 'en_attente'"
              @click="rejectReservation"
              class="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
            >
              Refuser
            </button>
            <button
              v-if="!isOwner && (reservation.status === 'en_attente' || reservation.status === 'confirmee')"
              @click="cancelReservation"
              class="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
            >
              Annuler la réservation
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Conversation Panel -->
    <div v-if="showConversation" class="fixed bottom-4 right-4 w-96 h-[600px] shadow-2xl rounded-lg overflow-hidden z-50">
      <ConversationPanel
        :messages="messages"
        :other-user="(otherUser! as any)"
        :reservation="conversationReservation"
        :current-user-id="currentUserId"
        @close="showConversation = false"
        @send="sendMessage"
      />
    </div>

    <!-- Payment Modal -->
    <PaymentModal
      v-if="reservation"
      :show="showPaymentModal"
      :reservation-id="reservation.id"
      :amount="Number(reservation.totalAmount)"
      @close="showPaymentModal = false"
      @success="handlePaymentSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import apiClient from '@/services/api/client'
import { ArrowLeft, MapPin, MessageCircle, MessageSquare } from 'lucide-vue-next'
import { ReservationService } from '@/services/reservation/reservation.service'
import { messageService } from '@/services/message'
import ConversationPanel from '@/components/message/ConversationPanel.vue'
import PaymentModal from '@/components/payment/PaymentModal.vue'
import SimpleHeader from '@/components/layout/SimpleHeader.vue'
import HostAvatar from '@/components/ui/HostAvatar.vue'
import { formatCFA } from '@/utils/currency'
import { useAuthStore } from '@/stores/auth'
import type { Reservation } from '@/types/reservation'
import type { Message } from '@/types/message'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const reservation = ref<Reservation | null>(null)
const showConversation = ref(false)
const showPaymentModal = ref(false)
const messages = ref<Message[]>([])
const currentUserId = ref(authStore.user?.id || '')

const isOwner = computed(() => {
  if (!reservation.value || !authStore.user) return false
  return reservation.value.accommodation.owner?.id === authStore.user.id
})

const otherUser = computed(() => {
  if (!reservation.value) return null
  return isOwner.value ? reservation.value.tenant : reservation.value.accommodation.owner
})

const conversationReservation = computed(() => {
  if (!reservation.value) return undefined
  return {
    id: reservation.value.id,
    accommodation: {
      title: reservation.value.accommodation.title
    }
  }
})

const canTakeAction = computed(() => {
  if (!reservation.value) return false
  if (isOwner.value && reservation.value.status === 'en_attente') return true
  if (!isOwner.value && (reservation.value.status === 'en_attente' || reservation.value.status === 'confirmee')) return true
  return false
})

const loadReservation = async () => {
  loading.value = true
  try {
    const id = route.params.id as string
    reservation.value = await ReservationService.getReservationById(id)
  } catch (error) {
    console.error('Erreur chargement réservation:', error)
  } finally {
    loading.value = false
  }
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(date))
}

const calculateNights = (start: Date, end: Date) => {
  const diffTime = new Date(end).getTime() - new Date(start).getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    en_attente: 'bg-yellow-100 text-yellow-800',
    acceptee: 'bg-blue-100 text-blue-800',
    confirmee: 'bg-green-100 text-green-800',
    en_cours: 'bg-blue-100 text-blue-800',
    terminee: 'bg-gray-100 text-gray-800',
    annulee: 'bg-red-100 text-red-800',
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    en_attente: 'En attente',
    acceptee: 'Acceptée - Paiement requis',
    confirmee: 'Confirmée',
    en_cours: 'En cours',
    terminee: 'Terminée',
    annulee: 'Annulée',
  }
  return labels[status] || status
}

const openConversation = async () => {
  if (!reservation.value) return
  showConversation.value = true
  
  try {
    messages.value = await messageService.getReservationMessages(reservation.value.id)
  } catch (error) {
    console.error('Erreur chargement messages:', error)
  }
}

const sendMessage = async (content: string) => {
  if (!reservation.value || !otherUser.value) return
  
  try {
    await messageService.sendMessage({
      receiverId: otherUser.value.id,
      reservationId: reservation.value.id,
      content,
      type: 'reservation'
    })
    messages.value = await messageService.getReservationMessages(reservation.value.id)
  } catch (error) {
    console.error('Erreur envoi message:', error)
  }
}

const acceptReservation = async () => {
  if (!reservation.value) return
  
  try {
    await ReservationService.acceptReservation(reservation.value.id)
    await loadReservation()
  } catch (error) {
    console.error('Erreur acceptation:', error)
  }
}

const rejectReservation = async () => {
  if (!reservation.value) return
  if (!confirm('Êtes-vous sûr de vouloir refuser cette réservation ?')) return
  
  try {
    await ReservationService.rejectReservation(reservation.value.id)
    await loadReservation()
  } catch (error) {
    console.error('Erreur refus:', error)
  }
}

const cancelReservation = async () => {
  if (!reservation.value) return
  if (!confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) return
  
  try {
    await ReservationService.cancelReservation(reservation.value.id, 'Annulé par le client')
    await loadReservation()
  } catch (error) {
    console.error('Erreur annulation:', error)
  }
}

const openPaymentModal = () => {
  showPaymentModal.value = true
}

const handlePaymentSuccess = async () => {
  showPaymentModal.value = false
  
  if (!reservation.value) return
  
  try {
    // Call backend to update reservation status to 'confirmee'
    await apiClient.put(`/reservations/${reservation.value.id}/confirm-payment`)
    await loadReservation()
    alert('Paiement effectué avec succès ! Votre réservation est confirmée.')
  } catch (error) {
    console.error('Erreur confirmation paiement:', error)
    // Reload anyway to show updated status
    await loadReservation()
  }
}

onMounted(() => {
  loadReservation()
})
</script>
