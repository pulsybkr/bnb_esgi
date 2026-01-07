<template>
  <div v-if="accommodation" class="min-h-screen bg-white">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <button 
            @click="$router.push('/')"
            class="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft class="w-5 h-5" />
            <span>Retour</span>
          </button>
          <div class="flex items-center space-x-4">
            <button 
              @click="toggleFavorite"
              class="p-2 text-gray-600 hover:text-gray-900 transition-colors"
              :class="{ 'text-red-600': isFavorite }"
            >
              <Heart 
                class="w-5 h-5 transition-colors" 
                :class="{ 'fill-current': isFavorite }"
              />
            </button>
          </div>
        </div>
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Contenu principal -->
        <div class="lg:col-span-2">
          <!-- Galerie photos -->
          <PhotoGallery :images="accommodation.images" />

          <!-- Informations principales -->
          <div class="mt-8">
            <div class="flex justify-between items-start mb-4">
              <div>
                <h1 class="text-3xl font-bold text-gray-900 mb-2">
                  {{ accommodation.title }}
                </h1>
                <div class="flex items-center text-gray-600 mb-4">
                  <MapPin class="w-4 h-4 mr-1" />
                  <span>{{ accommodation.location.address }}</span>
                </div>
              </div>
              <div class="text-right">
                <div class="flex items-center justify-end mb-2">
                  <Star class="w-5 h-5 text-yellow-400 fill-current mr-1" />
                  <span class="text-lg font-semibold">{{ accommodation.rating }}</span>
                  <span class="text-gray-600 ml-1">({{ accommodation.reviewCount }} avis)</span>
                </div>
              </div>
            </div>

            <!-- Informations du logement -->
            <div class="flex items-center space-x-6 text-gray-600 mb-6">
              <div class="flex items-center">
                <Users class="w-5 h-5 mr-2" />
                <span>{{ accommodation.maxGuests }} voyageurs</span>
              </div>
              <div class="flex items-center">
                <Bed class="w-5 h-5 mr-2" />
                <span>{{ accommodation.bedrooms }} chambre{{ accommodation.bedrooms > 1 ? 's' : '' }}</span>
              </div>
              <div class="flex items-center">
                <Bath class="w-5 h-5 mr-2" />
                <span>{{ accommodation.bathrooms }} salle{{ accommodation.bathrooms > 1 ? 's' : '' }} de bain</span>
              </div>
            </div>

            <!-- Description -->
            <div class="mb-8">
              <h2 class="text-xl font-semibold mb-4">À propos de ce logement</h2>
              <MarkdownContent :content="accommodation.description" class="text-gray-700" />
            </div>

            <!-- Visualisation des disponibilités -->
            <div class="mb-8 hidden">
              <h2 class="text-xl font-semibold mb-4">Calendrier des disponibilités</h2>
              <AvailabilityCalendar
                :booked-ranges="bookedRanges"
                :blocked-ranges="blockedRanges"
              />
            </div>

            <!-- Tags -->
            <div v-if="accommodation.tags && accommodation.tags.length > 0" class="mb-8">
              <h2 class="text-xl font-semibold mb-4">Caractéristiques</h2>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="tag in accommodation.tags"
                  :key="tag"
                  class="px-3 py-1.5 text-sm font-medium bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                >
                  {{ tag }}
                </span>
              </div>
            </div>

            <!-- Équipements -->
            <div class="mb-8">
              <h2 class="text-xl font-semibold mb-4">Équipements</h2>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div 
                  v-for="amenity in accommodation.amenities" 
                  :key="amenity"
                  class="flex items-center space-x-2"
                >
                  <Check class="w-4 h-4 text-green-600" />
                  <span class="text-gray-700">{{ amenity }}</span>
                </div>
              </div>
            </div>

            <!-- Informations sur l'hôte -->
            <div class="border-t pt-8">
              <div class="flex items-start space-x-4">
                <HostAvatar 
                  :name="accommodation.host.name"
                  :avatar="accommodation.host.avatar"
                  size="lg"
                />
                <div class="flex-1">
                  <div class="flex items-center space-x-2 mb-2">
                    <h3 class="text-lg font-semibold">{{ accommodation.host.name }}</h3>
                    <span 
                      v-if="accommodation.host.isSuperhost"
                      class="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full"
                    >
                      Superhost
                    </span>
                  </div>
                  <p class="text-gray-600 mb-4 hidden">
                    Hôte depuis 2020 • Répond généralement en moins d'une heure
                  </p>
                  <button class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                    Contacter l'hôte
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar de réservation -->
        <div class="lg:col-span-1">
          <div class="sticky top-24">
            <div class="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
              <div class="flex justify-between items-start mb-4">
                <div>
                  <span class="text-2xl font-bold">{{ formatCFA(accommodation.price) }}</span>
                  <span class="text-gray-600"> / nuit</span>
                </div>
                <div class="text-right">
                  <div class="flex items-center">
                    <Star class="w-4 h-4 text-yellow-400 fill-current mr-1" />
                    <span class="font-medium">{{ accommodation.rating }}</span>
                    <span class="text-gray-600 ml-1">({{ accommodation.reviewCount }})</span>
                  </div>
                </div>
              </div>

              <!-- Calculateur de prix automatique -->
              <PriceCalculator
                :pricing-config="pricingConfig"
                :base-price="accommodation.price"
                :max-guests="accommodation.maxGuests"
                :min-date="minDate"
                :disabled-dates="disabledDates"
                :initial-dates="selectedDates"
                :initial-guests="guests"
                @update:dates="selectedDates = $event"
                @update:guests="guests = $event"
                @calculation-change="handlePriceCalculationChange"
              />

              <!-- Formulaire de réservation -->
              <form @submit.prevent="handleReservation" class="space-y-4 mt-6">

                <!-- Services supplémentaires -->
                <div v-if="accommodation.services && accommodation.services.length > 0" class="border-t pt-4">
                  <button
                    type="button"
                    @click="showServices = !showServices"
                    class="w-full flex items-center justify-between text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    <span>Services supplémentaires</span>
                    <span class="text-xs text-gray-500">
                      {{ selectedServices.length > 0 ? `${selectedServices.length} sélectionné${selectedServices.length > 1 ? 's' : ''}` : 'Ajouter' }}
                    </span>
                  </button>

                  <!-- Liste des services -->
                  <div v-if="showServices" class="mt-4 space-y-3 max-h-60 overflow-y-auto">
                    <label
                      v-for="service in accommodation.services"
                      :key="service.id"
                      class="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                    <input 
                        type="checkbox"
                        :value="service.id"
                        :checked="selectedServices.some(s => s.serviceId === service.id)"
                        @change="toggleService(service.id)"
                        class="mt-1 rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                      <div class="flex-1">
                        <div class="flex items-center justify-between">
                          <span class="text-sm font-medium text-gray-900">{{ service.name }}</span>
                          <span class="text-sm font-semibold text-gray-900">
                            {{ formatServicePrice(service) }}
                          </span>
                        </div>
                        <p v-if="service.description" class="text-xs text-gray-500 mt-1">
                          {{ service.description }}
                        </p>
                      </div>
                    </label>
                  </div>

                  <!-- Résumé des services sélectionnés -->
                  <div v-if="selectedServices.length > 0" class="mt-3 pt-3 border-t space-y-2">
                    <div
                      v-for="selected in selectedServices"
                      :key="selected.serviceId"
                      class="flex items-center justify-between text-sm"
                    >
                      <div class="flex items-center space-x-2">
                        <Check class="w-4 h-4 text-green-600" />
                        <span class="text-gray-700">
                          {{ getServiceName(selected.serviceId) }}
                        </span>
                      </div>
                      <span class="font-medium text-gray-900">
                        {{ formatSelectedServicePrice(selected.serviceId) }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Résumé du prix -->
                <div v-if="selectedDates.start && selectedDates.end" class="border-t pt-4 space-y-2">
                  <!-- Détails des nuits (avec tarification dynamique si applicable) -->
                  <template v-if="priceCalculation">
                    <!-- Prix par nuit (si différenciés) -->
                    <template v-if="priceCalculation.weekendNights > 0 && priceCalculation.weekNights > 0">
                      <div v-if="priceCalculation.weekNights > 0" class="flex justify-between text-sm">
                        <span class="text-gray-600">
                          {{ priceCalculation.weekNights }} nuit{{ priceCalculation.weekNights > 1 ? 's' : '' }} (semaine)
                        </span>
                        <span class="font-medium text-gray-900">
                            XOF {{ priceCalculation.nightlyPrices
                            .filter(np => !np.isWeekend)
                            .reduce((sum, np) => sum + np.adjustedPrice, 0)
                            .toFixed(2) }}
                        </span>
                      </div>
                      <div v-if="priceCalculation.weekendNights > 0" class="flex justify-between text-sm">
                        <span class="text-gray-600">
                          {{ priceCalculation.weekendNights }} nuit{{ priceCalculation.weekendNights > 1 ? 's' : '' }} (week-end)
                        </span>
                        <span class="font-medium text-gray-900">
                            XOF {{ priceCalculation.nightlyPrices
                            .filter(np => np.isWeekend)
                            .reduce((sum, np) => sum + np.adjustedPrice, 0)
                            .toFixed(2) }}
                        </span>
                      </div>
                    </template>
                    <div v-else class="flex justify-between text-sm">
                      <span class="text-gray-600">
                        {{ formatCFA(averageNightlyPrice) }} x {{ calculatedNights }} nuit{{ calculatedNights > 1 ? 's' : '' }}
                      </span>
                      <span class="font-medium text-gray-900">
                        {{ formatCFA(priceCalculation.subtotal) }}
                      </span>
                    </div>
                    
                    <!-- Réduction séjour long -->
                    <div v-if="longStayDiscount > 0" class="flex justify-between text-sm text-green-600">
                      <span>Réduction séjour long</span>
                      <span class="font-medium">-{{ formatCFA(longStayDiscount) }}</span>
                    </div>
                  </template>
                  <template v-else>
                    <div class="flex justify-between text-sm">
                      <span class="text-gray-600">
                        {{ formatCFA(accommodation.price) }} x {{ calculatedNights }} nuit{{ calculatedNights > 1 ? 's' : '' }}
                      </span>
                      <span class="font-medium text-gray-900">
                        {{ formatCFA(basePrice) }}
                      </span>
                    </div>
                  </template>
                  
                  <div v-if="selectedServices.length > 0" class="flex justify-between text-sm">
                    <span class="text-gray-600">Services supplémentaires</span>
                    <span class="font-medium text-gray-900">
                      {{ formatCFA(servicesPrice) }}
                    </span>
                  </div>
                  <div class="flex justify-between text-sm font-semibold text-lg border-t pt-2">
                    <span>Total</span>
                    <span>{{ formatCFA(totalPrice) }}</span>
                  </div>
                  
                  <!-- Indication du prix moyen par nuit -->
                  <div v-if="calculatedNights > 0" class="text-xs text-gray-500 pt-1">
                    {{ averageNightlyPrice.toFixed(2) }}  XOF  / nuit en moyenne
                  </div>
                </div>

                <button 
                  type="submit"
                  class="w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors duration-200"
                >
                  Réserver
                </button>
              </form>

              <p class="text-center text-sm text-gray-600 mt-4">
                Vous ne serez pas encore débité
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Logements similaires -->
      <SimilarAccommodations
        v-if="accommodation"
        :current-accommodation="accommodation"
        :all-accommodations="allAccommodations"
        :max-results="6"
        @accommodation-selected="goToSimilarAccommodation"
      />

      <!-- Recommandations personnalisées -->
      <RecommendationsAccommodations
        v-if="accommodation"
        :all-accommodations="allAccommodations"
        :exclude-accommodation-ids="[accommodation.id]"
        :max-results="6"
        recommendation-type="trending"
        @accommodation-selected="goToSimilarAccommodation"
      />
    </div>

    <!-- Reservation Modal -->
    <ReservationModal
      v-if="showReservationModal"
      :show="showReservationModal"
      :accommodation="{
        id: accommodation.id,
        title: accommodation.title
      }"
      :start-date="selectedDates.start!"
      :end-date="selectedDates.end!"
      :guests="guestCount"
      :nights="calculatedNights"
      :total-amount="totalPrice"
      :booking-mode="bookingMode"
      @close="showReservationModal = false"
      @confirm="handleReservationConfirm"
    />

    <!-- Payment Modal -->
    <PaymentModal
      v-if="showPaymentModal"
      :show="showPaymentModal"
      :amount="totalPrice"
      :reservation-id="currentReservationId"
      @close="showPaymentModal = false"
      @success="handlePaymentSuccess"
    />
  </div>

  <!-- Loading ou erreur -->
  <div v-else class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
      <p class="text-gray-600">Chargement du logement...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  ArrowLeft, Heart, MapPin, Users, Bed, Bath, Star
} from 'lucide-vue-next'
import PhotoGallery from '@/components/accommodation/PhotoGallery.vue'
import DateRangePicker from '@/components/ui/DateRangePicker.vue'
import AvailabilityCalendar from '@/components/accommodation/AvailabilityCalendar.vue'
import PriceCalculator from '@/components/accommodation/PriceCalculator.vue'
import SimilarAccommodations from '@/components/accommodation/SimilarAccommodations.vue'
import RecommendationsAccommodations from '@/components/accommodation/RecommendationsAccommodations.vue'
import MarkdownContent from '@/components/ui/MarkdownContent.vue'
import HostAvatar from '@/components/ui/HostAvatar.vue'
import ReservationModal from '@/components/reservation/ReservationModal.vue'
import PaymentModal from '@/components/payment/PaymentModal.vue'
import type { Accommodation, SelectedService, Service } from '@/types/accommodation'
import { hasDateConflict, getBookedDates, type DateRange } from '@/utils/dateUtils'
import { availableServices, calculateServicePrice, calculateTotalServicesPrice } from '@/data/services'
import { Check } from 'lucide-vue-next'
import { calculatePrice, calculateAverageNightlyPrice } from '@/utils/pricing'
import { getPricingConfig } from '@/data/pricingFixtures'
import type { PricingConfiguration, PriceCalculationResult } from '@/types/pricing'
import { useFavorites } from '@/composables/useFavorites'
import { useLogements } from '@/composables/useLogements'
import { useAuthStore } from '@/stores/auth'
import { mapLogementToAccommodation } from '@/utils/mappers/logementMapper'
import { formatCFA } from '@/utils/currency'
import { ReservationService } from '@/services/reservation/reservation.service'
import { paymentService } from '@/services/payment'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { toggleFavorite: toggleFavoriteAction, isFavorite: isFavoriteFn } = useFavorites()
const { currentProperty, isLoading: isLoadingProperty, error: apiError, loadPropertyById } = useLogements()

// État réactif
const accommodation = ref<Accommodation | null>(null)
const allAccommodations = ref<Accommodation[]>([]) // Pour les recommandations
const selectedDates = ref<{ start: Date | null; end: Date | null }>({
  start: null,
  end: null,
})
const guests = ref(1)
const selectedServices = ref<SelectedService[]>([])
const showServices = ref(false)
const priceCalculationFromCalculator = ref<PriceCalculationResult | null>(null)

// Dates minimum (aujourd'hui)
const minDate = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
})

// Plages de dates réservées (simulation - à remplacer par les vraies données de l'API)
// Dans la vraie app, cela viendrait de l'API : GET /api/accommodations/:id/bookings
const bookedRanges = computed<DateRange[]>(() => {
  // Exemple de réservations pour démonstration
  // Dans la vraie app, cela viendrait de l'API
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // Simuler quelques réservations
  const ranges: DateRange[] = [
    {
      start: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000), // +5 jours
      end: new Date(today.getTime() + 8 * 24 * 60 * 60 * 1000),   // +8 jours
    },
    {
      start: new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000), // +15 jours
      end: new Date(today.getTime() + 18 * 24 * 60 * 60 * 1000),   // +18 jours
    },
    {
      start: new Date(today.getTime() + 25 * 24 * 60 * 60 * 1000), // +25 jours
      end: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000),   // +30 jours
    },
  ]
  
  return ranges
})

// Dates désactivées (toutes les dates des plages réservées)
const disabledDates = computed(() => {
  return getBookedDates(bookedRanges.value)
})

// Plages de dates bloquées (pour l'affichage du calendrier)
// Dans la vraie app, cela viendrait de l'API : GET /api/accommodations/:id/blocked-dates
const blockedRanges = computed<DateRange[]>(() => {
  // Exemple de dates bloquées pour démonstration
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  return [
    {
      start: new Date(today.getTime() + 35 * 24 * 60 * 60 * 1000), // +35 jours
      end: new Date(today.getTime() + 37 * 24 * 60 * 60 * 1000),   // +37 jours
    },
  ]
})

const handleDateChange = (dates: { start: Date | null; end: Date | null }) => {
  // Les dates sont déjà mises à jour via v-model
  console.log('Dates sélectionnées:', dates)
}

// Configuration de tarification
const pricingConfig = computed<PricingConfiguration | null>(() => {
  if (!accommodation.value) return null
  return getPricingConfig(accommodation.value.id)
})

// Calculs de prix
const calculatedNights = computed(() => {
  if (!selectedDates.value.start || !selectedDates.value.end) return 0
  return Math.ceil((selectedDates.value.end.getTime() - selectedDates.value.start.getTime()) / (1000 * 60 * 60 * 24))
})

// Calcul de prix dynamique (avec règles de tarification)
const priceCalculation = computed<PriceCalculationResult | null>(() => {
  if (!selectedDates.value.start || !selectedDates.value.end || !accommodation.value) {
    return null
  }
  
  const config = pricingConfig.value
  if (!config) {
    // Pas de configuration de tarification, utiliser le prix de base
    return null
  }
  
  const dateRange: DateRange = {
    start: selectedDates.value.start,
    end: selectedDates.value.end
  }
  
  return calculatePrice(config, dateRange)
})

const basePrice = computed(() => {
  if (!accommodation.value) return 0
  
  if (priceCalculation.value) {
    // Utiliser le calcul de prix dynamique
    return priceCalculation.value.subtotal
  }
  
  // Prix de base simple (sans règles de tarification)
  return accommodation.value.price * calculatedNights.value
})

const longStayDiscount = computed(() => {
  return priceCalculation.value?.longStayDiscount || 0
})

const servicesPrice = computed(() => {
  if (!accommodation.value || !accommodation.value.services) return 0
  return calculateTotalServicesPrice(
    accommodation.value.services,
    selectedServices.value,
    calculatedNights.value,
    guests.value
  )
})

const totalPrice = computed(() => {
  // Utiliser le calcul du calculateur s'il existe, sinon utiliser le calcul local
  const accommodationTotal = priceCalculationFromCalculator.value?.total 
    || priceCalculation.value?.total 
    || basePrice.value
  
  return accommodationTotal + servicesPrice.value
})

// Handler pour le calculateur de prix
const handlePriceCalculationChange = (result: PriceCalculationResult | null) => {
  priceCalculationFromCalculator.value = result
}

const averageNightlyPrice = computed(() => {
  if (priceCalculation.value && calculatedNights.value > 0) {
    return calculateAverageNightlyPrice(priceCalculation.value)
  }
  if (!accommodation.value) return 0
  return accommodation.value.price
})

// Gestion des services
const toggleService = (serviceId: string) => {
  const index = selectedServices.value.findIndex(s => s.serviceId === serviceId)
  if (index >= 0) {
    selectedServices.value.splice(index, 1)
  } else {
    selectedServices.value.push({ serviceId })
  }
}

const getServiceName = (serviceId: string): string => {
  if (!accommodation.value || !accommodation.value.services) return ''
  const service = accommodation.value.services.find(s => s.id === serviceId)
  return service?.name || ''
}

const formatServicePrice = (service: Service): string => {
  const nights = calculatedNights.value || 1
  const price = calculateServicePrice(service, nights, guests.value)
  
  let suffix = ''
  switch (service.priceType) {
    case 'per_night':
      suffix = '/nuit'
      break
    case 'per_guest':
      suffix = '/personne'
      break
    case 'per_guest_per_night':
      suffix = '/personne/nuit'
      break
  }
  
  return `${formatCFA(price)}${suffix ? ' ' + suffix : ''}`
}

const formatSelectedServicePrice = (serviceId: string): string => {
  if (!accommodation.value || !accommodation.value.services) return formatCFA(0)
  const service = accommodation.value.services.find(s => s.id === serviceId)
  if (!service) return formatCFA(0)
  
  const price = calculateServicePrice(service, calculatedNights.value, guests.value)
  return formatCFA(price)
}

// Trouver le logement par ID
const findAccommodation = async () => {
  try {
    const id = route.params.id as string
    console.log('Recherche du logement avec ID:', id)
    
    // Charger le logement depuis l'API
    await loadPropertyById(id)
    
    if (currentProperty.value) {
      console.log('Logement trouvé:', currentProperty.value.title)
      // Mapper les données du backend vers le format frontend
      accommodation.value = mapLogementToAccommodation(currentProperty.value)
      guests.value = Math.min(guests.value, accommodation.value.maxGuests)
    } else {
      router.push('/')
    }
  } catch (error) {
    console.error('Erreur lors de la recherche du logement:', error)
    router.push('/')
  }
}


// Favoris
const isFavorite = computed(() => {
  return accommodation.value ? isFavoriteFn(accommodation.value.id) : false
})

const toggleFavorite = () => {
  if (accommodation.value) {
    toggleFavoriteAction(accommodation.value.id)
  }
}

// Modal states
const showReservationModal = ref(false)
const showPaymentModal = ref(false)
const currentReservationId = ref('')
const bookingMode = computed(() => accommodation.value?.bookingMode || 'instant')
const guestCount = computed(() => guests.value)

// Gestion de la réservation
const handleReservation = () => {
  if (!accommodation.value) return
  
  // Vérifier que l'utilisateur est connecté
  if (!authStore.isAuthenticated || !authStore.user) {
    alert('Vous devez être connecté pour effectuer une réservation')
    router.push({
      name: 'login',
      query: { redirect: route.fullPath }
    })
    return
  }
  
  // Vérifier les conflits de dates
  if (hasDateConflict(selectedDates.value as DateRange, bookedRanges.value)) {
    alert('Ces dates ne sont pas disponibles. Veuillez en choisir d\'autres.')
    return
  }
  
  // Ouvrir modal de confirmation
  showReservationModal.value = true
}

// Confirmer la réservation
const handleReservationConfirm = async (message: string) => {
  if (!accommodation.value || !selectedDates.value.start || !selectedDates.value.end) return
  
  try {
    const reservation = await ReservationService.createReservation({
      accommodationId: accommodation.value.id,
      startDate: selectedDates.value.start,
      endDate: selectedDates.value.end,
      guestCount: guests.value,
      tenantMessage: message
    })
    
    currentReservationId.value = reservation.id
    showReservationModal.value = false
    
    // Si instant booking, ouvrir modal paiement
    if (bookingMode.value === 'instant') {
      showPaymentModal.value = true
    } else {
      alert('Votre demande de réservation a été envoyée au propriétaire')
      router.push('/reservations')
    }
  } catch (error: any) {
    console.error('Erreur création réservation:', error)
    alert(error.message || 'Erreur lors de la création de la réservation')
  }
}

// Succès paiement
const handlePaymentSuccess = (paymentId: string) => {
  showPaymentModal.value = false
  alert('Paiement effectué avec succès ! Votre réservation est confirmée.')
  router.push('/reservations')
}

const goToSimilarAccommodation = (id: string) => {
  router.push(`/accommodation/${id}`)
}

onMounted(async () => {
  console.log('AccommodationDetailView monté')
  await findAccommodation()
})
</script>

