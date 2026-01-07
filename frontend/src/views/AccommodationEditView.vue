<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Loading -->
    <div v-if="isLoading" class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <LoadingSpinner size="large" centered />
        <p class="text-gray-600 mt-4">Chargement du logement...</p>
      </div>
    </div>

    <!-- Header -->
    <header v-else class="bg-white shadow-sm border-b sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center space-x-4">
            <AppLogo size="medium" color="primary" :clickable="true" />
            <h2 class="text-lg font-semibold text-gray-700">Modifier le logement</h2>
          </div>
          <router-link
            :to="`/accommodation/${accommodationId}`"
            class="text-gray-600 hover:text-gray-900 flex items-center space-x-2"
          >
            <X class="w-5 h-5" />
            <span>Annuler</span>
          </router-link>
        </div>
      </div>
    </header>

    <div v-if="!isLoading" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <form @submit.prevent="handleSubmit" class="space-y-8">
        <!-- Section Informations de base -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Informations de base</h3>
          
          <div class="space-y-4">
            <!-- Titre -->
            <div>
              <label for="title" class="block text-sm font-medium text-gray-700 mb-1">
                Titre du logement *
              </label>
              <input
                id="title"
                v-model="formData.title"
                type="text"
                required
                maxlength="100"
                placeholder="Ex: Magnifique appartement avec vue sur la Seine"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              <p class="text-xs text-gray-500 mt-1">{{ formData.title.length }}/100 caractères</p>
            </div>

            <!-- Description -->
            <div>
              <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                id="description"
                v-model="formData.description"
                required
                rows="6"
                maxlength="5000"
                placeholder="Décrivez votre logement en détail..."
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              ></textarea>
              <p class="text-xs text-gray-500 mt-1">{{ formData.description.length }}/5000 caractères</p>
            </div>

            <!-- Prix par nuit -->
            <div>
              <label for="price" class="block text-sm font-medium text-gray-700 mb-1">
                Prix par nuit (XOF) *
              </label>
              <input
                id="price"
                v-model.number="formData.price"
                type="number"
                required
                min="0"
                step="1"
                placeholder="Ex: 50000"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <!-- Capacité et chambres -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label for="maxGuests" class="block text-sm font-medium text-gray-700 mb-1">
                  Voyageurs max *
                </label>
                <input
                  id="maxGuests"
                  v-model.number="formData.maxGuests"
                  type="number"
                  required
                  min="1"
                  max="50"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label for="bedrooms" class="block text-sm font-medium text-gray-700 mb-1">
                  Chambres *
                </label>
                <input
                  id="bedrooms"
                  v-model.number="formData.bedrooms"
                  type="number"
                  required
                  min="0"
                  max="50"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label for="bathrooms" class="block text-sm font-medium text-gray-700 mb-1">
                  Salles de bain *
                </label>
                <input
                  id="bathrooms"
                  v-model.number="formData.bathrooms"
                  type="number"
                  required
                  min="0"
                  max="50"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Section Localisation -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Localisation</h3>
          
          <div class="space-y-4">
            <div>
              <label for="address" class="block text-sm font-medium text-gray-700 mb-1">
                Adresse *
              </label>
              <input
                id="address"
                v-model="formData.location.address"
                type="text"
                required
                placeholder="Ex: 12 Rue de Rivoli"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="city" class="block text-sm font-medium text-gray-700 mb-1">
                  Ville *
                </label>
                <input
                  id="city"
                  v-model="formData.location.city"
                  type="text"
                  required
                  placeholder="Ex: Paris"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label for="country" class="block text-sm font-medium text-gray-700 mb-1">
                  Pays *
                </label>
                <input
                  id="country"
                  v-model="formData.location.country"
                  type="text"
                  required
                  placeholder="Ex: France"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Messages d'erreur -->
        <div v-if="errorMessage" class="bg-red-50 border border-red-200 rounded-lg p-4">
          <p class="text-sm text-red-800">{{ errorMessage }}</p>
        </div>

        <!-- Boutons d'action -->
        <div class="flex justify-end space-x-4 pb-8">
          <router-link
            :to="`/accommodation/${accommodationId}`"
            class="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-200"
          >
            Annuler
          </router-link>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2"
          >
            <span v-if="isSubmitting">Enregistrement...</span>
            <span v-else>Enregistrer les modifications</span>
            <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" />
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { X, Loader2 } from 'lucide-vue-next'
import { logementService } from '@/services/logement.service'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import AppLogo from '@/components/AppLogo.vue'

const router = useRouter()
const route = useRoute()
const accommodationId = route.params.id as string

const isLoading = ref(true)
const isSubmitting = ref(false)
const errorMessage = ref('')

const formData = reactive({
  title: '',
  description: '',
  location: {
    address: '',
    city: '',
    country: '',
  },
  maxGuests: 1,
  bedrooms: 1,
  bathrooms: 1,
  price: 0,
})

const loadAccommodation = async () => {
  isLoading.value = true
  try {
    const accommodation = await logementService.getById(accommodationId)
    
    // Pré-remplir le formulaire
    formData.title = accommodation.title
    formData.description = accommodation.description || ''
    formData.location.address = accommodation.location?.address || ''
    formData.location.city = accommodation.location?.city || ''
    formData.location.country = accommodation.location?.country || ''
    formData.maxGuests = accommodation.capacity
    formData.bedrooms = accommodation.bedrooms || 1
    formData.bathrooms = accommodation.bathrooms || 1
    formData.price = accommodation.price
  } catch (err: any) {
    console.error('Erreur lors du chargement:', err)
    errorMessage.value = 'Impossible de charger le logement'
    setTimeout(() => {
      router.push('/my-properties')
    }, 2000)
  } finally {
    isLoading.value = false
  }
}

const handleSubmit = async () => {
  errorMessage.value = ''
  isSubmitting.value = true

  try {
    const updateData = {
      title: formData.title,
      description: formData.description,
      address: formData.location.address,
      city: formData.location.city,
      country: formData.location.country,
      maxGuests: formData.maxGuests,
      bedrooms: formData.bedrooms,
      bathrooms: formData.bathrooms,
      price: formData.price,
    }

    await logementService.update(accommodationId, updateData)

    // Rediriger vers la page de détail
    router.push({ name: 'accommodation-detail', params: { id: accommodationId } })
  } catch (err: any) {
    console.error('Erreur:', err)
    errorMessage.value = err.response?.data?.message || 'Une erreur est survenue lors de la mise à jour.'
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  loadAccommodation()
})
</script>

