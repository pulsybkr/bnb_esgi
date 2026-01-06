<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center space-x-4">
            <router-link to="/" class="text-2xl font-bold text-gray-900">bnb</router-link>
            <h2 class="text-lg font-semibold text-gray-700">Calendrier de disponibilité</h2>
          </div>
          <router-link
            to="/"
            class="text-gray-600 hover:text-gray-900 flex items-center space-x-2"
          >
            <X class="w-5 h-5" />
            <span>Fermer</span>
          </router-link>
        </div>
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Informations du logement -->
      <div v-if="accommodation" class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <h1 class="text-2xl font-bold text-gray-900 mb-2">{{ accommodation.title }}</h1>
            <p class="text-gray-600">
              {{ accommodation.location.address }}, {{ accommodation.location.city }}
            </p>
          </div>
          <div class="text-right">
            <p class="text-sm text-gray-500">Prix par nuit</p>
            <p class="text-2xl font-bold text-gray-900">{{ formatCFA(accommodation.price) }}</p>
          </div>
        </div>
      </div>

      <!-- Statistiques -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white rounded-lg shadow-sm p-4">
          <p class="text-sm text-gray-500 mb-1">Réservations</p>
          <p class="text-2xl font-bold text-gray-900">{{ bookings.length }}</p>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-4">
          <p class="text-sm text-gray-500 mb-1">Taux d'occupation</p>
          <p class="text-2xl font-bold text-gray-900">{{ occupancyRate }}%</p>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-4">
          <p class="text-sm text-gray-500 mb-1">Revenus ce mois</p>
          <p class="text-2xl font-bold text-green-600">{{ formatCFA(monthlyRevenue) }}</p>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-4">
          <p class="text-sm text-gray-500 mb-1">Dates bloquées</p>
          <p class="text-2xl font-bold text-orange-600">{{ blockedDates.length }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Calendrier -->
        <div class="lg:col-span-2">
          <HostCalendar
            :bookings="bookings"
            :blocked-dates="blockedDates"
            @date-selected="handleDateSelected"
            @date-blocked="handleDateBlocked"
            @date-unblocked="handleDateUnblocked"
          />
        </div>

        <!-- Liste des réservations -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Réservations à venir</h3>
            
            <div v-if="upcomingBookings.length === 0" class="text-center py-8">
              <p class="text-gray-500 text-sm">Aucune réservation à venir</p>
            </div>
            
            <div v-else class="space-y-4 max-h-[600px] overflow-y-auto">
              <div
                v-for="booking in upcomingBookings"
                :key="booking.id"
                class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div class="flex items-start justify-between mb-2">
                  <div>
                    <p class="font-medium text-gray-900">{{ booking.guestName }}</p>
                    <p class="text-sm text-gray-500">{{ booking.guestEmail }}</p>
                  </div>
                  <span
                    :class="[
                      'px-2 py-1 text-xs font-medium rounded-full',
                      getStatusClass(booking.status)
                    ]"
                  >
                    {{ getStatusLabel(booking.status) }}
                  </span>
                </div>
                
                <div class="space-y-1 text-sm">
                  <div class="flex items-center text-gray-600">
                    <Calendar class="w-4 h-4 mr-2" />
                    <span>{{ formatDate(booking.checkIn) }} - {{ formatDate(booking.checkOut) }}</span>
                  </div>
                  <div class="flex items-center text-gray-600">
                    <Users class="w-4 h-4 mr-2" />
                    <span>{{ booking.guests }} {{ booking.guests > 1 ? 'voyageurs' : 'voyageur' }}</span>
                  </div>
                  <div class="flex items-center text-gray-900 font-medium pt-2 border-t border-gray-100">
                    <span>Total: {{ formatCFA(booking.totalPrice) }}</span>
                  </div>
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
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { X, Calendar, Users } from 'lucide-vue-next'
import HostCalendar from '@/components/HostCalendar.vue'
import type { Booking, BlockedDate } from '@/types/booking'
import { BookingStatus, BlockType } from '@/types/booking'
import type { Accommodation } from '@/types/accommodation'
import { normalizeDate } from '@/utils/dateUtils'
import { useLogements } from '@/composables/useLogements'
import { mapLogementToAccommodation } from '@/utils/mappers/logementMapper'
import { formatCFA } from '@/utils/currency'

const route = useRoute()
const router = useRouter()
const { currentProperty, isLoading, error: apiError, loadPropertyById } = useLogements()

const accommodation = ref<Accommodation | null>(null)
const bookings = ref<Booking[]>([])
const blockedDates = ref<BlockedDate[]>([])

// Charger les données du logement
onMounted(async () => {
  const accommodationId = route.params.id as string
  
  try {
    // Charger le logement depuis l'API
    await loadPropertyById(accommodationId)
    
    if (currentProperty.value) {
      accommodation.value = mapLogementToAccommodation(currentProperty.value)
      // Simuler des réservations (dans la vraie app, cela viendrait de l'API)
      loadBookings(accommodationId)
      loadBlockedDates(accommodationId)
    } else {
      router.push('/')
    }
  } catch (error) {
    console.error('Erreur lors du chargement du logement:', error)
    router.push('/')
  }
})

// Simuler le chargement des réservations
const loadBookings = (accommodationId: string) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  bookings.value = [
    {
      id: '1',
      accommodationId,
      guestId: 'guest1',
      guestName: 'Marie Dupont',
      guestEmail: 'marie.dupont@example.com',
      checkIn: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000),
      checkOut: new Date(today.getTime() + 8 * 24 * 60 * 60 * 1000),
      guests: 2,
      totalPrice: accommodation.value?.price ? accommodation.value.price * 3 : 0,
      status: BookingStatus.CONFIRMED,
      createdAt: new Date(),
    },
    {
      id: '2',
      accommodationId,
      guestId: 'guest2',
      guestName: 'Jean Martin',
      guestEmail: 'jean.martin@example.com',
      checkIn: new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000),
      checkOut: new Date(today.getTime() + 18 * 24 * 60 * 60 * 1000),
      guests: 4,
      totalPrice: accommodation.value?.price ? accommodation.value.price * 3 : 0,
      status: BookingStatus.CONFIRMED,
      createdAt: new Date(),
    },
    {
      id: '3',
      accommodationId,
      guestId: 'guest3',
      guestName: 'Sophie Laurent',
      guestEmail: 'sophie.laurent@example.com',
      checkIn: new Date(today.getTime() + 25 * 24 * 60 * 60 * 1000),
      checkOut: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000),
      guests: 2,
      totalPrice: accommodation.value?.price ? accommodation.value.price * 5 : 0,
      status: BookingStatus.PENDING,
      createdAt: new Date(),
    },
  ]
}

// Simuler le chargement des dates bloquées
const loadBlockedDates = (accommodationId: string) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  blockedDates.value = [
    {
      id: 'block1',
      accommodationId,
      startDate: new Date(today.getTime() + 35 * 24 * 60 * 60 * 1000),
      endDate: new Date(today.getTime() + 37 * 24 * 60 * 60 * 1000),
      reason: 'Maintenance',
      type: BlockType.MAINTENANCE,
      createdAt: new Date(),
    },
  ]
}

// Réservations à venir (non annulées)
const upcomingBookings = computed(() => {
  const today = normalizeDate(new Date())
  return bookings.value
    .filter(booking => {
      const checkIn = normalizeDate(booking.checkIn)
      return checkIn >= today && booking.status !== BookingStatus.CANCELLED
    })
    .sort((a, b) => a.checkIn.getTime() - b.checkIn.getTime())
})

// Taux d'occupation (simplifié)
const occupancyRate = computed(() => {
  // Calcul simplifié : nombre de jours réservés sur les 30 prochains jours
  const today = normalizeDate(new Date())
  const thirtyDaysLater = new Date(today)
  thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30)
  
  let bookedDays = 0
  bookings.value.forEach(booking => {
      if (booking.status === BookingStatus.CANCELLED) return
    
    const checkIn = normalizeDate(booking.checkIn)
    const checkOut = normalizeDate(booking.checkOut)
    
    if (checkOut > today && checkIn < thirtyDaysLater) {
      const start = checkIn > today ? checkIn : today
      const end = checkOut < thirtyDaysLater ? checkOut : thirtyDaysLater
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      bookedDays += days
    }
  })
  
  return Math.round((bookedDays / 30) * 100)
})

// Revenus du mois (simplifié)
const monthlyRevenue = computed(() => {
  const today = new Date()
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
  
  return bookings.value
    .filter(booking => {
      const checkIn = normalizeDate(booking.checkIn)
      return (
        booking.status !== BookingStatus.CANCELLED &&
        checkIn >= firstDayOfMonth &&
        checkIn <= lastDayOfMonth
      )
    })
    .reduce((sum, booking) => sum + booking.totalPrice, 0)
})

// Handlers
const handleDateSelected = (date: Date) => {
  console.log('Date sélectionnée:', date)
}

const handleDateBlocked = (startDate: Date, endDate: Date, reason?: string) => {
  if (!accommodation.value) return
  
  const newBlock: BlockedDate = {
    id: `block-${Date.now()}`,
    accommodationId: accommodation.value.id,
    startDate,
    endDate,
    reason,
    type: reason?.toLowerCase().includes('maintenance') ? BlockType.MAINTENANCE : BlockType.OTHER,
    createdAt: new Date(),
  }
  
  blockedDates.value.push(newBlock)
  
  // Dans la vraie app, faire un appel API
  console.log('Date bloquée:', newBlock)
  alert(`Période bloquée du ${formatDate(startDate)} au ${formatDate(endDate)}`)
}

const handleDateUnblocked = (blockedDateId: string) => {
  blockedDates.value = blockedDates.value.filter(block => block.id !== blockedDateId)
  
  // Dans la vraie app, faire un appel API
  console.log('Date débloquée:', blockedDateId)
}

// Utilitaires
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const getStatusLabel = (status: BookingStatus): string => {
  const labels: Record<BookingStatus, string> = {
    [BookingStatus.PENDING]: 'En attente',
    [BookingStatus.CONFIRMED]: 'Confirmée',
    [BookingStatus.CANCELLED]: 'Annulée',
    [BookingStatus.COMPLETED]: 'Terminée',
  }
  return labels[status] || status
}

const getStatusClass = (status: BookingStatus): string => {
  const classes: Record<BookingStatus, string> = {
    [BookingStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
    [BookingStatus.CONFIRMED]: 'bg-green-100 text-green-800',
    [BookingStatus.CANCELLED]: 'bg-red-100 text-red-800',
    [BookingStatus.COMPLETED]: 'bg-gray-100 text-gray-800',
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}
</script>

