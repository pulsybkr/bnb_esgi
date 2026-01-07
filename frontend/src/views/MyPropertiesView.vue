<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center space-x-4">
            <button 
              @click="$router.push('/')"
              class="text-2xl font-bold text-indigo-600 hover:text-indigo-700"
            >
              bnb
            </button>
            <h1 class="text-xl font-semibold text-gray-900">Mes logements</h1>
          </div>
          <router-link
            to="/accommodation/create"
            class="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            <Plus class="w-5 h-5" />
            <span>Ajouter un logement</span>
          </router-link>
        </div>
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Messages d'erreur -->
      <div v-if="error" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
        <p class="text-sm text-red-800">{{ error }}</p>
      </div>

      <!-- Statistiques -->
      <div v-if="!isLoading && properties.length > 0" class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-white rounded-lg shadow-sm p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Total</p>
              <p class="text-2xl font-bold text-gray-900">{{ properties.length }}</p>
            </div>
            <Home class="w-8 h-8 text-indigo-600" />
          </div>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Actifs</p>
              <p class="text-2xl font-bold text-green-600">{{ activeCount }}</p>
            </div>
            <CheckCircle class="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Suspendus</p>
              <p class="text-2xl font-bold text-yellow-600">{{ suspendedCount }}</p>
            </div>
            <AlertCircle class="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Archivés</p>
              <p class="text-2xl font-bold text-gray-600">{{ archivedCount }}</p>
            </div>
            <Archive class="w-8 h-8 text-gray-600" />
          </div>
        </div>
      </div>

      <!-- Liste des logements -->
      <div v-if="isLoading" class="text-center py-12">
        <Loader2 class="w-8 h-8 animate-spin mx-auto text-indigo-600" />
        <p class="mt-4 text-gray-600">Chargement de vos logements...</p>
      </div>

      <div v-else-if="properties.length === 0" class="text-center py-12">
        <Home class="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">Aucun logement</h3>
        <p class="text-gray-600 mb-4">Commencez par créer votre premier logement</p>
        <router-link
          to="/accommodation/create"
          class="inline-flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          <Plus class="w-5 h-5" />
          <span>Créer un logement</span>
        </router-link>
      </div>

      <div v-else class="grid grid-cols-1 gap-6">
        <div
          v-for="property in properties"
          :key="property.id"
          class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
        >
          <div class="flex flex-col md:flex-row">
            <!-- Image -->
            <div class="md:w-64 h-48 md:h-auto flex-shrink-0">
              <img
                v-if="property.images && property.images.length > 0"
                :src="property.images[0]"
                :alt="property.title"
                class="w-full h-full object-cover"
                @error="handleImageError"
              />
              <div v-else class="w-full h-full bg-gray-200 flex items-center justify-center">
                <Image class="w-12 h-12 text-gray-400" />
              </div>
            </div>

            <!-- Contenu -->
            <div class="flex-1 p-6">
              <div class="flex justify-between items-start mb-4">
                <div class="flex-1">
                  <div class="flex items-center space-x-2 mb-2">
                    <h3 class="text-xl font-semibold text-gray-900">{{ property.title }}</h3>
                    <span
                      :class="[
                        'px-2 py-1 text-xs font-medium rounded-full',
                        property.status === 'actif' ? 'bg-green-100 text-green-800' :
                        property.status === 'suspendu' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      ]"
                    >
                      {{ getStatusLabel(property.status || 'actif') }}
                    </span>
                  </div>
                  <p class="text-sm text-gray-600 mb-2">
                    <MapPin class="w-4 h-4 inline mr-1" />
                    {{ property.location.address }}, {{ property.location.city }}
                  </p>
                  <div class="flex items-center space-x-4 text-sm text-gray-600">
                    <span>{{ property.bedrooms }} chambre{{ property.bedrooms > 1 ? 's' : '' }}</span>
                    <span>{{ property.bathrooms }} salle{{ property.bathrooms > 1 ? 's' : '' }} de bain</span>
                    <span>{{ property.maxGuests }} voyageur{{ property.maxGuests > 1 ? 's' : '' }}</span>
                    <span class="font-semibold text-indigo-600">{{ property.price }}€ / nuit</span>
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                <router-link
                  :to="`/accommodation/${property.id}`"
                  class="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Voir
                </router-link>
                <router-link
                  :to="`/accommodation/${property.id}/calendar`"
                  class="px-3 py-1.5 text-sm text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors flex items-center space-x-1"
                >
                  <Calendar class="w-4 h-4" />
                  <span>Calendrier</span>
                </router-link>
                <router-link
                  :to="`/accommodation/${property.id}/edit`"
                  class="px-3 py-1.5 text-sm bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg hover:from-blue-100 hover:to-indigo-100 transition-colors inline-block"
                >
                  Modifier
                </router-link>
                <button
                  v-if="property.status === 'actif'"
                  @click="toggleStatus(property.id, 'suspendu')"
                  class="px-3 py-1.5 text-sm text-yellow-700 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
                >
                  Désactiver
                </button>
                <button
                  v-else-if="property.status === 'suspendu'"
                  @click="toggleStatus(property.id, 'actif')"
                  class="px-3 py-1.5 text-sm text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  Activer
                </button>
                <button
                  @click="confirmDelete(property.id, property.title)"
                  class="px-3 py-1.5 text-sm text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de confirmation de suppression -->
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="showDeleteModal = false"
    >
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Confirmer la suppression</h3>
        <p class="text-gray-600 mb-6">
          Êtes-vous sûr de vouloir supprimer le logement <strong>{{ propertyToDelete?.title }}</strong> ?
          Cette action est irréversible.
        </p>
        <div class="flex justify-end space-x-3">
          <button
            @click="showDeleteModal = false"
            class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Annuler
          </button>
          <button
            @click="deleteProperty"
            class="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { logementService } from '@/services/logement.service'
import { 
  Home, Plus, Calendar, MapPin, Image, Loader2, 
  CheckCircle, AlertCircle, Archive, Edit, Trash2 
} from 'lucide-vue-next'
import type { Accommodation } from '@/types/accommodation'

const router = useRouter()
const authStore = useAuthStore()

// État
const properties = ref<Accommodation[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)
const showDeleteModal = ref(false)
const propertyToDelete = ref<{ id: string; title: string } | null>(null)

// Computed
const activeCount = computed(() => 
  properties.value.filter(p => p.status === 'actif').length
)
const suspendedCount = computed(() => 
  properties.value.filter(p => p.status === 'suspendu').length
)
const archivedCount = computed(() => 
  properties.value.filter(p => p.status === 'archive').length
)

// Méthodes
const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    'actif': 'Actif',
    'suspendu': 'Suspendu',
    'archive': 'Archivé'
  }
  return labels[status] || status
}

const loadProperties = async () => {
  isLoading.value = true
  error.value = null
  
  try {
    properties.value = await logementService.getMyProperties()
  } catch (err: any) {
    console.error('Erreur lors du chargement des logements:', err)
    error.value = err.response?.data?.message || 'Erreur lors du chargement de vos logements'
  } finally {
    isLoading.value = false
  }
}


const toggleStatus = async (id: string, newStatus: 'actif' | 'suspendu' | 'archive') => {
  try {
    await logementService.update(id, { status: newStatus })
    await loadProperties() // Recharger la liste
  } catch (err: any) {
    console.error('Erreur lors du changement de statut:', err)
    error.value = err.response?.data?.message || 'Erreur lors du changement de statut'
  }
}

const confirmDelete = (id: string, title: string) => {
  propertyToDelete.value = { id, title }
  showDeleteModal.value = true
}

const deleteProperty = async () => {
  if (!propertyToDelete.value) return
  
  try {
    await logementService.delete(propertyToDelete.value.id)
    showDeleteModal.value = false
    propertyToDelete.value = null
    await loadProperties() // Recharger la liste
  } catch (err: any) {
    console.error('Erreur lors de la suppression:', err)
    error.value = err.response?.data?.message || 'Erreur lors de la suppression'
    showDeleteModal.value = false
  }
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = '/placeholder-image.jpg' // Image de fallback
}

onMounted(() => {
  loadProperties()
})
</script>

