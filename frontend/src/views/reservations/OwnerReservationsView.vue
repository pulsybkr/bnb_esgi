<template>
  <div class="min-h-screen bg-gray-50">
    <SimpleHeader />
    <div class="max-w-6xl mx-auto px-4">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold">Réservations de mes biens</h1>
        <div class="bg-white rounded-lg shadow px-6 py-3">
          <p class="text-sm text-gray-600">Revenus totaux</p>
          <p class="text-2xl font-bold text-green-600">{{ formatCFA(statistics?.totalRevenue || 0) }}</p>
        </div>
      </div>

      <!-- Statistiques -->
      <div class="grid grid-cols-4 gap-4 mb-6">
        <div class="bg-white rounded-lg shadow p-4">
          <p class="text-sm text-gray-600">En attente</p>
          <p class="text-2xl font-bold text-yellow-600">{{ statistics?.pendingReservations || 0 }}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-4">
          <p class="text-sm text-gray-600">Confirmées</p>
          <p class="text-2xl font-bold text-green-600">{{ statistics?.confirmedReservations || 0 }}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-4">
          <p class="text-sm text-gray-600">Terminées</p>
          <p class="text-2xl font-bold text-gray-600">{{ statistics?.completedReservations || 0 }}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-4">
          <p class="text-sm text-gray-600">Annulées</p>
          <p class="text-2xl font-bold text-red-600">{{ statistics?.cancelledReservations || 0 }}</p>
        </div>
      </div>

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
            <!-- Image logement -->
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
                  <div class="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <span class="flex items-center gap-1">
                      <User class="w-4 h-4" />
                      {{ reservation.tenant.firstName }} {{ reservation.tenant.lastName }}
                    </span>
                    <span class="flex items-center gap-1">
                      <Calendar class="w-4 h-4" />
                      {{ formatDate(reservation.startDate) }} - {{ formatDate(reservation.endDate) }}
                    </span>
                    <span class="flex items-center gap-1">
                      <Users class="w-4 h-4" />
                      {{ reservation.guestCount }} voyageur{{ reservation.guestCount > 1 ? 's' : '' }}
                    </span>
                  </div>
                </div>
                <span
                  class="px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ml-4"
                  :class="getStatusClass(reservation.status)"
                >
                  {{ getStatusLabel(reservation.status) }}
                </span>
              </div>

              <div v-if="reservation.tenantMessage" class="bg-gray-50 rounded-lg p-3 mb-4">
                <p class="text-sm text-gray-700 line-clamp-2">{{ reservation.tenantMessage }}</p>
              </div>

              <div class="flex justify-between items-center pt-4 border-t">
                <p class="text-xl font-bold text-green-600">{{ formatCFA(reservation.totalAmount) }}</p>
                <div class="flex gap-2">
                  <button
                    v-if="reservation.status === 'en_attente'"
                    @click.stop="acceptReservation(reservation.id)"
                    class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Accepter
                  </button>
                  <button
                    v-if="reservation.status === 'en_attente'"
                    @click.stop="rejectReservation(reservation.id)"
                    class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Refuser
                  </button>
                  <button
                    @click.stop="goToDetail(reservation.id)"
                    class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Détails
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { User, Calendar, Users, Home } from 'lucide-vue-next'
import { ReservationService } from '@/services/reservation/reservation.service'
import { formatCFA } from '@/utils/currency'
import SimpleHeader from '@/components/layout/SimpleHeader.vue'
import type { Reservation, ReservationStatistics } from '@/types/reservation'

const router = useRouter()

const statuses = [
  { value: null, label: 'Toutes' },
  { value: 'en_attente', label: 'En attente' },
  { value: 'confirmee', label: 'Confirmées' },
  { value: 'en_cours', label: 'En cours' },
  { value: 'terminee', label: 'Terminées' },
  { value: 'annulee', label: 'Annulées' },
]

const selectedStatus = ref<string | null>(null)
const currentPage = ref(1)
const reservations = ref<Reservation[]>([])
const statistics = ref<ReservationStatistics>()
const loading = ref(false)

const loadReservations = async () => {
  loading.value = true
  try {
    const result = await ReservationService.getOwnerReservations({
      status: selectedStatus.value as any,
      page: currentPage.value,
      limit: 10,
    })
    reservations.value = result.reservations
  } catch (error) {
    console.error('Erreur chargement réservations:', error)
  } finally {
    loading.value = false
  }
}

const loadStatistics = async () => {
  try {
    statistics.value = await ReservationService.getOwnerStatistics()
  } catch (error) {
    console.error('Erreur chargement statistiques:', error)
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
    acceptee: 'Acceptée - En attente de paiement',
    confirmee: 'Confirmée',
    en_cours: 'En cours',
    terminee: 'Terminée',
    annulee: 'Annulée',
  }
  return labels[status] || status
}

const acceptReservation = async (id: string) => {
  try {
    await ReservationService.acceptReservation(id)
    loadReservations()
    loadStatistics()
  } catch (error) {
    console.error('Erreur acceptation:', error)
  }
}

const rejectReservation = async (id: string) => {
  if (!confirm('Êtes-vous sûr de vouloir refuser cette réservation ?')) return
  
  try {
    await ReservationService.rejectReservation(id)
    loadReservations()
    loadStatistics()
  } catch (error) {
    console.error('Erreur refus:', error)
  }
}

const goToDetail = (id: string) => {
  router.push(`/reservations/${id}`)
}

watch(selectedStatus, () => {
  loadReservations()
})

onMounted(() => {
  loadReservations()
  loadStatistics()
})
</script>
