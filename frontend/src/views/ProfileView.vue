<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center space-x-4">
            <AppLogo size="medium" color="primary" :clickable="true" />
            <h1 class="text-xl font-semibold text-gray-900">Mon profil</h1>
          </div>
        </div>
      </div>
    </header>

    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <div class="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-semibold">
                {{ userInitials }}
              </div>
              <button 
                class="absolute bottom-0 right-0 bg-indigo-600 text-white rounded-full p-2 hover:bg-indigo-700 transition-colors"
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
                  'bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-800': user?.userType === 'locataire',
                  'bg-purple-100 text-purple-800': user?.userType === 'proprietaire',
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
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Votre prénom"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                <input
                  v-model="form.lastName"
                  type="text"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Votre nom"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  v-model="form.email"
                  type="email"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="+33 6 12 34 56 78"
                />
              </div>
              
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
                <input
                  v-model="form.address"
                  type="text"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Votre adresse"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Ville</label>
                <input
                  v-model="form.city"
                  type="text"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Votre ville"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Pays</label>
                <input
                  v-model="form.country"
                  type="text"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Votre pays"
                />
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
              class="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Loader2 v-if="isSaving" class="w-4 h-4 animate-spin" />
              <span>{{ isSaving ? 'Enregistrement...' : 'Enregistrer les modifications' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast notifications (popup en bas de l'écran) -->
    <Teleport to="body">
      <Transition name="toast">
        <div 
          v-if="successMessage" 
          class="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[100] px-6 py-4 bg-green-600 text-white rounded-xl shadow-2xl flex items-center space-x-3 max-w-md"
        >
          <div class="flex-shrink-0">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
          </div>
          <p class="font-medium">{{ successMessage }}</p>
          <button 
            @click="successMessage = null"
            class="ml-2 text-green-200 hover:text-white transition-colors"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
          </button>
        </div>
      </Transition>

      <Transition name="toast">
        <div 
          v-if="error" 
          class="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[100] px-6 py-4 bg-red-600 text-white rounded-xl shadow-2xl flex items-center space-x-3 max-w-md"
        >
          <div class="flex-shrink-0">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
            </svg>
          </div>
          <p class="font-medium">{{ error }}</p>
          <button 
            @click="error = null"
            class="ml-2 text-red-200 hover:text-white transition-colors"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
          </button>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { authService } from '@/services/auth.service'
import { Loader2, Camera } from 'lucide-vue-next'
import AppLogo from '@/components/AppLogo.vue'

const authStore = useAuthStore()

// État
const isLoading = ref(false)
const isSaving = ref(false)
const error = ref<string | null>(null)
const successMessage = ref<string | null>(null)

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
    console.log('📤 Envoi des données:', form.value)
    
    // Appeler l'API pour mettre à jour le profil
    const response = await authService.updateProfile({
      firstName: form.value.firstName,
      lastName: form.value.lastName,
      phone: form.value.phone,
      address: form.value.address,
      city: form.value.city,
      country: form.value.country
    })
    
    console.log('📥 Réponse reçue:', response)
    
    // Mettre à jour le store avec les nouvelles données
    if (response.success && response.data?.user) {
      console.log('✅ Mise à jour du store avec:', response.data.user)
      
      // Créer un nouvel objet utilisateur complet en fusionnant l'ancien avec le nouveau
      const updatedUserData = {
        ...(user.value || {}),
        ...response.data.user
      }
      
      authStore.setUser(updatedUserData)
      console.log('✅ Store mis à jour, nouvel utilisateur:', user.value)
      
      // Recharger le formulaire avec les nouvelles données
      loadProfile()
    } else {
      console.warn('⚠️ Réponse inattendue:', response)
    }
    
    successMessage.value = '✓ Profil mis à jour avec succès !'
    
    // Masquer le message de succès après 5 secondes
    setTimeout(() => {
      successMessage.value = null
    }, 5000)
  } catch (err: any) {
    console.error('❌ Erreur lors de la mise à jour du profil:', err)
    console.error('Détails:', err.response)
    error.value = err.response?.data?.message || 'Erreur lors de la mise à jour du profil'
  } finally {
    isSaving.value = false
  }
}

onMounted(() => {
  loadProfile()
})

// Recharger le profil quand l'utilisateur change dans le store
watch(user, () => {
  loadProfile()
}, { deep: true })
</script>

<style scoped>
/* Animation pour les toasts */
.toast-enter-active {
  animation: toastIn 0.4s ease-out;
}

.toast-leave-active {
  animation: toastOut 0.3s ease-in;
}

@keyframes toastIn {
  from {
    opacity: 0;
    transform: translate(-50%, 100%);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

@keyframes toastOut {
  from {
    opacity: 1;
    transform: translate(-50%, 0);
  }
  to {
    opacity: 0;
    transform: translate(-50%, 100%);
  }
}
</style>
