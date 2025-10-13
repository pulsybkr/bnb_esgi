<template>
  <div v-if="accommodation" class="min-h-screen bg-white">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <button 
            @click="$router.back()"
            class="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft class="w-5 h-5" />
            <span>Retour</span>
          </button>
          <div class="flex items-center space-x-4">
            <button class="p-2 text-gray-600 hover:text-gray-900">
              <Share class="w-5 h-5" />
            </button>
            <button class="p-2 text-gray-600 hover:text-gray-900">
              <Heart class="w-5 h-5" />
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
              <p class="text-gray-700 leading-relaxed">{{ accommodation.description }}</p>
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
                <img 
                  :src="accommodation.host.avatar" 
                  :alt="accommodation.host.name"
                  class="w-16 h-16 rounded-full object-cover"
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
                  <p class="text-gray-600 mb-4">
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
                  <span class="text-2xl font-bold">€{{ accommodation.price }}</span>
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

              <!-- Formulaire de réservation -->
              <form @submit.prevent="handleReservation" class="space-y-4">
                <div class="grid grid-cols-2 gap-2">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Arrivée</label>
                    <input 
                      type="date" 
                      v-model="checkIn"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Départ</label>
                    <input 
                      type="date" 
                      v-model="checkOut"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Voyageurs</label>
                  <select 
                    v-model.number="guests"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option v-for="i in accommodation.maxGuests" :key="i" :value="i">
                      {{ i }} voyageur{{ i > 1 ? 's' : '' }}
                    </option>
                  </select>
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
    </div>
  </div>

  <!-- Loading ou erreur -->
  <div v-else class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p class="text-gray-600">Chargement du logement...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  ArrowLeft, Share, Heart, MapPin, Users, Bed, Bath, Star, Check 
} from 'lucide-vue-next'
import PhotoGallery from '@/components/PhotoGallery.vue'
import { accommodations } from '@/data/fixtures'
import type { Accommodation } from '@/types/accommodation'

const route = useRoute()
const router = useRouter()

// État réactif
const accommodation = ref<Accommodation | null>(null)
const checkIn = ref('')
const checkOut = ref('')
const guests = ref(1)

// Trouver le logement par ID
const findAccommodation = () => {
  const id = route.params.id as string
  const found = accommodations.find(acc => acc.id === id)
  if (found) {
    accommodation.value = found
    guests.value = Math.min(guests.value, found.maxGuests)
  } else {
    router.push('/')
  }
}

// Gestion de la réservation
const handleReservation = () => {
  if (!accommodation.value) return
  
  // Validation des dates
  if (!checkIn.value || !checkOut.value) {
    alert('Veuillez sélectionner les dates d\'arrivée et de départ')
    return
  }
  
  if (new Date(checkIn.value) >= new Date(checkOut.value)) {
    alert('La date de départ doit être après la date d\'arrivée')
    return
  }
  
  // Calcul du nombre de nuits
  const nights = Math.ceil((new Date(checkOut.value).getTime() - new Date(checkIn.value).getTime()) / (1000 * 60 * 60 * 24))
  const totalPrice = nights * accommodation.value.price
  
  // Simulation de la réservation
  alert(`Réservation confirmée !\n\nLogement: ${accommodation.value.title}\nDates: ${checkIn.value} au ${checkOut.value}\nNuits: ${nights}\nPrix total: €${totalPrice}`)
}

onMounted(() => {
  findAccommodation()
})
</script>

