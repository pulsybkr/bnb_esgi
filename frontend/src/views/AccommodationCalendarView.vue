<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center space-x-4">
            <AppLogo size="medium" color="primary" :clickable="true" />
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
            <p class="text-2xl font-bold text-gray-900">€{{ accommodation.price }}</p>
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
          <p class="text-2xl font-bold text-green-600">€{{ monthlyRevenue }}</p>
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
                    <span>Total: €{{ booking.totalPrice.toFixed(2) }}</span>
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
import AppLogo from '@/components/AppLogo.vue'
import type { Booking, BlockedDate } from '@/types/booking'
import { BookingStatus, BlockType } from '@/types/booking'
import { accommodations } from '@/data/fixtures'
import type { Accommodation } from '@/types/accommodation'
import { normalizeDate } from '@/utils/dateUtils'
import { logementService } from '@/services/logement.service'
import { availabilityService } from '@/services/availability.service'
import { reservationService, type BackendReservation } from '@/services/reservation.service'

const route = useRoute()
const router = useRouter()

const accommodation = ref<Accommodation | null>(null)
const bookings = ref<Booking[]>([])
const blockedDates = ref<BlockedDate[]>([])
const isLoading = ref(false)

// Charger les données du logement
const loadAccommodation = async () => {
  const accommodationId = route.params.id as string
  if (!accommodationId) {
    router.push('/')
    return
  }

  isLoading.value = true
  try {
    const found = await logementService.getById(accommodationId)
    accommodation.value = found
    
    // Charger les disponibilités et réservations
    await loadAvailabilities(accommodationId)
  } catch (err) {
    console.error('Erreur lors du chargement:', err)
    // Fallback vers les données mockées
    const found = accommodations.find(acc => acc.id === accommodationId)
    if (found) {
      accommodation.value = found
      loadBookings(accommodationId)
      loadBlockedDates(accommodationId)
    } else {
      router.push('/')
    }
  } finally {
    isLoading.value = false
  }
}

const loadAvailabilities = async (accommodationId: string) => {
  try {
    const [availabilities, reservations] = await Promise.all([
      availabilityService.getByProperty(accommodationId),
      reservationService.getPropertyReservations(accommodationId),
    ])
    
    // Séparer les réservations et les blocages
    const blocked = availabilities.filter(a => a.status === 'bloque')
    
    // Convertir les réservations backend en format Booking (avec infos locataire)
    const mapStatus = (s: BackendReservation['status']): BookingStatus => {
      switch (s) {
        case 'en_attente':
          return BookingStatus.PENDING
        case 'confirmee':
        case 'en_cours':
          return BookingStatus.CONFIRMED
        case 'annulee':
          return BookingStatus.CANCELLED
        case 'terminee':
          return BookingStatus.COMPLETED
        default:
          return BookingStatus.PENDING
      }
    }

    bookings.value = (reservations || []).map(r => ({
      id: r.id,
      accommodationId: r.accommodationId,
      guestId: r.tenant?.id || r.tenantId,
      guestName: r.tenant ? `${r.tenant.firstName} ${r.tenant.lastName}` : 'Locataire',
      guestEmail: r.tenant?.email || '',
      checkIn: new Date(r.startDate),
      checkOut: new Date(r.endDate),
      guests: r.guestCount || 0,
      totalPrice: typeof r.totalAmount === 'string' ? parseFloat(r.totalAmount) : Number(r.totalAmount || 0),
      status: mapStatus(r.status),
      createdAt: new Date(r.createdAt),
      notes: r.tenantMessage || undefined,
    }))
    
    // Convertir en format BlockedDate
    blockedDates.value = blocked.map(a => ({
      id: a.id,
      accommodationId: a.accommodationId,
      startDate: new Date(a.startDate),
      endDate: new Date(a.endDate),
      reason: a.note || 'Bloqué',
      type: BlockType.MAINTENANCE,
      createdAt: new Date(a.createdAt),
    }))
  } catch (err) {
    console.error('Erreur lors du chargement des disponibilités:', err)
    // Fallback vers les données mockées
    loadBookings(accommodationId)
    loadBlockedDates(accommodationId)
  }
}

onMounted(() => {
  loadAccommodation()
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

const handleDateBlocked = async (startDate: Date, endDate: Date, reason?: string) => {
  if (!accommodation.value) return
  
  try {
    const startDateStr = startDate.toISOString().split('T')[0]
    const endDateStr = endDate.toISOString().split('T')[0]
    
    const availability = await availabilityService.blockDates(
      accommodation.value.id,
      startDateStr,
      endDateStr,
      reason
    )
    
    // Ajouter à la liste locale
    const newBlock: BlockedDate = {
      id: availability.id,
      accommodationId: accommodation.value.id,
      startDate: new Date(availability.startDate),
      endDate: new Date(availability.endDate),
      reason: availability.note || reason,
      type: reason?.toLowerCase().includes('maintenance') ? BlockType.MAINTENANCE : BlockType.OTHER,
      createdAt: new Date(availability.createdAt),
    }
    
    blockedDates.value.push(newBlock)
    alert(`Période bloquée du ${formatDate(startDate)} au ${formatDate(endDate)}`)
  } catch (err: any) {
    console.error('Erreur lors du blocage des dates:', err)
    alert('Erreur lors du blocage des dates: ' + (err.message || 'Erreur inconnue'))
  }
}

const handleDateUnblocked = async (blockedDateId: string) => {
  try {
    await availabilityService.delete(blockedDateId)
    blockedDates.value = blockedDates.value.filter(block => block.id !== blockedDateId)
  } catch (err: any) {
    console.error('Erreur lors du déblocage:', err)
    alert('Erreur lors du déblocage: ' + (err.message || 'Erreur inconnue'))
  }
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

