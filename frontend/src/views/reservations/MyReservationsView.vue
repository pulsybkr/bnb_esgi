<template>
  <div class="min-h-screen bg-gray-50">
    <SimpleHeader />
    <div class="max-w-6xl mx-auto px-4">
      <h1 class="text-3xl font-bold mb-8">Mes réservations</h1>

      <!-- Filtres -->
      <div class="bg-white rounded-lg shadow p-4 mb-6">
        <div class="flex gap-4">
          <button
            v-for="status in statuses"
            :key="status.value"
            @click="selectedStatus = status.value"
            class="px-4 py-2 rounded-lg transition-colors"
            :class="selectedStatus === status.value 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
          >
            {{ status.label }}
          </button>
        </div>
      </div>

      <!-- Liste réservations -->
      <div v-if="loading" class="text-center py-12">
        <p class="text-gray-600">Chargement...</p>
      </div>

      <div v-else-if="reservations.length === 0" class="bg-white rounded-lg shadow p-12 text-center">
        <p class="text-gray-600">Aucune réservation trouvée</p>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="reservation in reservations"
          :key="reservation.id"
          class="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
        >
          <div class="flex flex-col md:flex-row">
            <!-- Image -->
            <div class="md:w-64 h-48 md:h-auto flex-shrink-0">
              <img
                v-if="reservation.accommodation.photos?.[0]"
                :src="reservation.accommodation.photos[0].url"
                :alt="reservation.accommodation.title"
                class="w-full h-full object-cover cursor-pointer"
                @click="goToDetail(reservation.id)"
              />
              <div v-else class="w-full h-full bg-gray-200 flex items-center justify-center cursor-pointer" @click="goToDetail(reservation.id)">
                <Home class="w-16 h-16 text-gray-400" />
              </div>
            </div>

            <!-- Détails -->
            <div class="flex-1 p-6">
              <div class="flex justify-between items-start mb-3">
                <div class="flex-1 cursor-pointer" @click="goToDetail(reservation.id)">
                  <h3 class="text-xl font-semibold hover:text-green-600 transition-colors">{{ reservation.accommodation.title }}</h3>
                  <p class="text-gray-600 flex items-center gap-1 mt-1">
                    <MapPin class="w-4 h-4" />
                    {{ reservation.accommodation.city }}
                  </p>
                </div>
                <span
                  class="px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ml-4"
                  :class="getStatusClass(reservation.status)"
                >
                  {{ getStatusLabel(reservation.status) }}
                </span>
              </div>

              <div class="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                <div class="flex items-center gap-2">
                  <Calendar class="w-4 h-4" />
                  {{ formatDate(reservation.startDate) }} - {{ formatDate(reservation.endDate) }}
                </div>
                <div class="flex items-center gap-2">
                  <Users class="w-4 h-4" />
                  {{ reservation.guestCount }} voyageur{{ reservation.guestCount > 1 ? 's' : '' }}
                </div>
              </div>

              <div class="flex justify-between items-center pt-4 border-t">
                <p class="text-xl font-bold text-green-600">{{ formatCFA(reservation.totalAmount) }}</p>
                <div class="flex gap-2">
                  <button
                    v-if="reservation.status === 'acceptee'"
                    @click.stop="goToDetail(reservation.id)"
                    class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 font-semibold"
                  >
                    💳 Payer maintenant
                  </button>
                  <button
                    v-if="reservation.status === 'confirmee'"
                    @click.stop="openConversation(reservation)"
                    class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <MessageCircle class="w-4 h-4" />
                    <span class="hidden sm:inline">Message</span>
                  </button>
                  <button
                    @click.stop="goToDetail(reservation.id)"
                    class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Voir détails
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex justify-center gap-2 mt-6">
        <button
          v-for="page in totalPages"
          :key="page"
          @click="currentPage = page"
          class="px-4 py-2 rounded-lg"
          :class="currentPage === page 
            ? 'bg-green-600 text-white' 
            : 'bg-white text-gray-700 hover:bg-gray-100'"
        >
          {{ page }}
        </button>
      </div>
    </div>

    <!-- Conversation Panel -->
    <div v-if="showConversation" class="fixed bottom-4 right-4 w-96 h-[600px] shadow-2xl rounded-lg overflow-hidden">
      <ConversationPanel
        :messages="messages"
        :other-user="conversationUser!"
        :reservation="activeReservation"
        :current-user-id="currentUserId"
        @close="showConversation = false"
        @send="sendMessage"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Home, Calendar, Users, MessageCircle, MapPin } from 'lucide-vue-next'
import { ReservationService } from '@/services/reservation/reservation.service'
import { messageService } from '@/services/message'
import ConversationPanel from '@/components/message/ConversationPanel.vue'
import SimpleHeader from '@/components/layout/SimpleHeader.vue'
import { formatCFA } from '@/utils/currency'
import type { Reservation } from '@/types/reservation'
import type { Message } from '@/types/message'

const router = useRouter()

const statuses = [
  { value: 'all', label: 'Toutes' },
  { value: 'en_attente', label: 'En attente' },
  { value: 'acceptee', label: 'Acceptées' },
  { value: 'confirmee', label: 'Confirmées' },
  { value: 'en_cours', label: 'En cours' },
  { value: 'terminee', label: 'Terminées' },
  { value: 'annulee', label: 'Annulées' },
]

const selectedStatus = ref<string>('all')
const currentPage = ref(1)
const reservations = ref<Reservation[]>([])
const totalPages = ref(1)
const loading = ref(false)
const showConversation = ref(false)
const messages = ref<Message[]>([])
const conversationUser = ref<any>(null)
const activeReservation = ref<any>(null)
const currentUserId = ref('') // À récupérer du store auth

const loadReservations = async () => {
  loading.value = true
  try {
    const result = await ReservationService.getMyReservations({
      status: selectedStatus.value === 'all' ? undefined : selectedStatus.value as any,
      page: currentPage.value,
      limit: 10,
    })
    reservations.value = result.reservations
    totalPages.value = result.totalPages
  } catch (error) {
    console.error('Erreur chargement réservations:', error)
  } finally {
    loading.value = false
  }
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('fr-FR', { 
    day: 'numeric', 
    month: 'short',
    year: 'numeric'
  }).format(new Date(date))
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

const goToDetail = (id: string) => {
  router.push(`/reservations/${id}`)
}

const openConversation = async (reservation: Reservation) => {
  // Vérifier que le propriétaire existe
  if (!reservation.accommodation.owner) {
    alert('Impossible d\'ouvrir la conversation : informations du propriétaire manquantes')
    return
  }
  
  showConversation.value = true
  conversationUser.value = reservation.accommodation.owner
  activeReservation.value = {
    id: reservation.id,
    accommodation: {
      title: reservation.accommodation.title
    }
  }
  
  // Charger les messages
  try {
    messages.value = await messageService.getReservationMessages(reservation.id)
  } catch (error) {
    console.error('Erreur chargement messages:', error)
  }
}

const sendMessage = async (content: string) => {
  if (!activeReservation.value || !conversationUser.value) return
  
  try {
    await messageService.sendMessage({
      receiverId: conversationUser.value.id,
      reservationId: activeReservation.value.id,
      content,
      type: 'reservation'
    })
    // Recharger les messages
    messages.value = await messageService.getReservationMessages(activeReservation.value.id)
  } catch (error) {
    console.error('Erreur envoi message:', error)
  }
}

const cancelReservation = async (id: string) => {
  if (!confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) return
  
  try {
    await ReservationService.cancelReservation(id, 'Annulé par le client')
    loadReservations()
  } catch (error) {
    console.error('Erreur annulation:', error)
  }
}

watch([selectedStatus, currentPage], () => {
  loadReservations()
})

onMounted(() => {
  loadReservations()
})
</script>
