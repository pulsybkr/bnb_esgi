<template>
  <div class="min-h-screen bg-gray-50">
    <SimpleHeader />

    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Messages d'erreur/succès -->
      <div v-if="error" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
        <p class="text-sm text-red-800">{{ error }}</p>
      </div>
      
      <div v-if="successMessage" class="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
        <p class="text-sm text-green-800">{{ successMessage }}</p>
      </div>

      <!-- Chargement -->
      <div v-if="isLoading" class="text-center py-12">
        <Loader2 class="w-8 h-8 animate-spin mx-auto text-indigo-600" />
        <p class="mt-4 text-gray-600">Chargement du profil...</p>
      </div>

      <!-- Contenu du profil -->
      <div v-else class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div class="p-6">
          <!-- Photo de profil -->
          <div class="flex items-center space-x-6 mb-8">
            <div class="relative">
              <div class="w-24 h-24 rounded-full bg-african-green flex items-center justify-center text-white text-2xl font-semibold shadow-md">
                {{ userInitials }}
              </div>
              <button 
                class="absolute bottom-0 right-0 bg-african-green text-white rounded-full p-2 hover:bg-african-green-dark transition-colors shadow-sm"
                title="Changer la photo de profil"
              >
                <Camera class="w-4 h-4" />
              </button>
            </div>
            <div>
              <h2 class="text-2xl font-bold text-gray-900">{{ fullName }}</h2>
              <p class="text-gray-600">{{ user?.email }}</p>
              <span 
                class="inline-block mt-2 px-3 py-1 text-sm font-medium rounded-full"
                :class="{
                  'bg-green-100 text-african-green-dark': user?.userType === 'locataire',
                  'bg-african-green text-white': user?.userType === 'proprietaire',
                  'bg-gray-100 text-gray-800': user?.userType === 'admin'
                }"
              >
                {{ getUserTypeLabel(user?.userType) }}
              </span>
            </div>
          </div>

          <!-- Informations personnelles -->
          <div class="border-t border-gray-200 pt-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Informations personnelles</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                <input
                  v-model="form.firstName"
                  type="text"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-african-green focus:border-african-green"
                  placeholder="Votre prénom"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                <input
                  v-model="form.lastName"
                  type="text"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-african-green focus:border-african-green"
                  placeholder="Votre nom"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  v-model="form.email"
                  type="email"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-african-green focus:border-african-green"
                  placeholder="votre@email.com"
                  disabled
                />
                <p class="mt-1 text-xs text-gray-500">L'email ne peut pas être modifié</p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                <input
                  v-model="form.phone"
                  type="tel"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-african-green focus:border-african-green"
                  placeholder="+33 6 12 34 56 78"
                />
              </div>
              
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
                <input
                  v-model="form.address"
                  type="text"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-african-green focus:border-african-green"
                  placeholder="Votre adresse"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Ville</label>
                <input
                  v-model="form.city"
                  type="text"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-african-green focus:border-african-green"
                  placeholder="Votre ville"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Pays</label>
                <input
                  v-model="form.country"
                  type="text"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-african-green focus:border-african-green"
                  placeholder="Votre pays"
                />
              </div>
            </div>
          </div>

          <!-- Espace Propriétaire (uniquement pour les propriétaires) -->
          <div v-if="isOwner" class="border-t border-gray-200 pt-6 mt-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900">Espace Propriétaire</h3>
              <button
                @click="$router.push('/accommodation/create')"
                class="inline-flex items-center space-x-2 px-4 py-2 bg-african-green text-white rounded-lg hover:bg-african-green-dark transition-colors shadow-sm"
              >
                <Plus class="w-4 h-4" />
                <span>Ajouter un logement</span>
              </button>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <p class="text-sm text-gray-600">Mes logements</p>
                <p class="text-2xl font-bold text-gray-900">{{ stats?.properties || 0 }}</p>
              </div>
              <div class="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <p class="text-sm text-gray-600">Réservations reçues</p>
                <p class="text-2xl font-bold text-gray-900">{{ stats?.reservations || 0 }}</p>
              </div>
              <div class="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <p class="text-sm text-gray-600">Note moyenne</p>
                <p class="text-2xl font-bold text-gray-900">{{ stats?.avgRating?.toFixed(1) || '0.0' }}/5</p>
              </div>
            </div>
          </div>

          <!-- Boutons d'action -->
          <div class="border-t border-gray-200 pt-6 mt-6 flex justify-end space-x-3">
            <button
              @click="$router.back()"
              class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
            <button
              @click="updateProfile"
              :disabled="isSaving"
              class="px-4 py-2 text-white bg-african-green rounded-lg hover:bg-african-green-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-sm"
            >
              <Loader2 v-if="isSaving" class="w-4 h-4 animate-spin" />
              <span>{{ isSaving ? 'Enregistrement...' : 'Enregistrer les modifications' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { authService } from '@/services/auth.service'
import { Loader2, Camera, Plus } from 'lucide-vue-next'
import SimpleHeader from '@/components/layout/SimpleHeader.vue'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

// État
const isLoading = ref(false)
const isSaving = ref(false)
const error = ref<string | null>(null)
const successMessage = ref<string | null>(null)
const stats = ref<any>(null)

// Formulaire
const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  country: ''
})

// Computed
const user = computed(() => authStore.user)
const fullName = computed(() => authStore.fullName)

const userInitials = computed(() => {
  if (!user.value) return ''
  return `${user.value.firstName[0]}${user.value.lastName[0]}`.toUpperCase()
})

const isOwner = computed(() => authStore.isOwner)

// Méthodes
const getUserTypeLabel = (userType?: string) => {
  const labels: Record<string, string> = {
    'locataire': 'Locataire',
    'proprietaire': 'Propriétaire',
    'admin': 'Administrateur'
  }
  return labels[userType || 'locataire'] || 'Utilisateur'
}

const loadProfile = () => {
  if (!user.value) return
  
  form.value = {
    firstName: user.value.firstName || '',
    lastName: user.value.lastName || '',
    email: user.value.email || '',
    phone: user.value.phone || '',
    address: user.value.address || '',
    city: user.value.city || '',
    country: user.value.country || ''
  }
}

const updateProfile = async () => {
  isSaving.value = true
  error.value = null
  successMessage.value = null
  
  try {
    // Appeler l'API pour mettre à jour le profil
    const response = await authService.updateProfile({
      firstName: form.value.firstName,
      lastName: form.value.lastName,
      phone: form.value.phone,
      address: form.value.address,
      city: form.value.city,
      country: form.value.country
    })
    
    // Mettre à jour le store avec les nouvelles données
    if (response.success && response.data?.user) {
      authStore.setUser({
        ...user.value!,
        firstName: response.data.user.firstName,
        lastName: response.data.user.lastName,
        phone: response.data.user.phone,
        address: response.data.user.address,
        city: response.data.user.city,
        country: response.data.user.country
      })
    }
    
    successMessage.value = 'Profil mis à jour avec succès'
    
    // Masquer le message de succès après 3 secondes
    setTimeout(() => {
      successMessage.value = null
    }, 3000)
  } catch (err: any) {
    console.error('Erreur lors de la mise à jour du profil:', err)
    error.value = err.response?.data?.message || 'Erreur lors de la mise à jour du profil'
  } finally {
    isSaving.value = false
  }
}

onMounted(() => {
  loadProfile()
})
</script>

