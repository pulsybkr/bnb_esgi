<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4 py-12">
    <div class="w-full max-w-md">
      <!-- Card principale -->
      <div class="bg-white rounded-2xl shadow-2xl p-8 space-y-6 transform transition-all duration-300 hover:shadow-3xl">
        <!-- Logo et titre -->
        <div class="text-center space-y-2">
          <div class="mb-4">
            <AppLogo size="large" color="primary" :clickable="false" />
          </div>
          <h2 class="text-2xl font-bold text-gray-900">
            {{ step === 'email' ? 'Mot de passe oublié ?' : 'Réinitialiser le mot de passe' }}
          </h2>
          <p class="text-gray-600">
            {{ step === 'email' 
              ? 'Entrez votre email pour recevoir un lien de réinitialisation' 
              : 'Entrez votre nouveau mot de passe' 
            }}
          </p>
        </div>

        <!-- Message de succès -->
        <div v-if="successMessage" class="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-2">
          <CheckCircle class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p class="text-sm font-medium text-green-800">{{ successMessage }}</p>
            <p class="text-xs text-green-600 mt-1">Vérifiez votre boîte de réception</p>
          </div>
        </div>

        <!-- Formulaire Email -->
        <form v-if="step === 'email'" @submit.prevent="handleSendResetLink" class="space-y-4">
          <!-- Email -->
          <div class="space-y-2">
            <label for="email" class="block text-sm font-medium text-gray-700">
              Adresse email
            </label>
            <div class="relative">
              <Mail class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="email"
                v-model="form.email"
                type="email"
                required
                class="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 outline-none"
                placeholder="vous@exemple.com"
              />
            </div>
          </div>

          <!-- Message d'erreur -->
          <div v-if="error" class="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
            <AlertCircle class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p class="text-sm text-red-600">{{ error }}</p>
          </div>

          <!-- Bouton de soumission -->
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <span v-if="!isLoading">Envoyer le lien de réinitialisation</span>
            <span v-else class="flex items-center justify-center">
              <Loader2 class="w-5 h-5 animate-spin mr-2" />
              Envoi en cours...
            </span>
          </button>
        </form>

        <!-- Formulaire Nouveau mot de passe -->
        <form v-else @submit.prevent="handleResetPassword" class="space-y-4">
          <!-- Nouveau mot de passe -->
          <div class="space-y-2">
            <label for="password" class="block text-sm font-medium text-gray-700">
              Nouveau mot de passe
            </label>
            <div class="relative">
              <Lock class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                required
                minlength="8"
                class="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 outline-none"
                placeholder="••••••••"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Eye v-if="!showPassword" class="w-5 h-5" />
                <EyeOff v-else class="w-5 h-5" />
              </button>
            </div>
            <p class="text-xs text-gray-500">Minimum 8 caractères</p>
          </div>

          <!-- Confirmation mot de passe -->
          <div class="space-y-2">
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700">
              Confirmer le mot de passe
            </label>
            <div class="relative">
              <Lock class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="confirmPassword"
                v-model="form.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                required
                class="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 outline-none"
                placeholder="••••••••"
              />
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Eye v-if="!showConfirmPassword" class="w-5 h-5" />
                <EyeOff v-else class="w-5 h-5" />
              </button>
            </div>
          </div>

          <!-- Message d'erreur -->
          <div v-if="error" class="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
            <AlertCircle class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p class="text-sm text-red-600">{{ error }}</p>
          </div>

          <!-- Bouton de soumission -->
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <span v-if="!isLoading">Réinitialiser le mot de passe</span>
            <span v-else class="flex items-center justify-center">
              <Loader2 class="w-5 h-5 animate-spin mr-2" />
              Réinitialisation...
            </span>
          </button>
        </form>

        <!-- Retour à la connexion -->
        <div class="text-center">
          <button
            type="button"
            @click="goToLogin"
            class="text-sm bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-indigo-700 font-medium transition-colors inline-flex items-center"
          >
            <ArrowLeft class="w-4 h-4 mr-1" />
            Retour à la connexion
          </button>
        </div>
      </div>

      <!-- Footer -->
      <p class="mt-6 text-center text-sm text-gray-600">
        Besoin d'aide ?
        <a href="#" class="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:underline">Contactez le support</a>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, CheckCircle, ArrowLeft } from 'lucide-vue-next'
import AppLogo from '@/components/AppLogo.vue'

const router = useRouter()
const route = useRoute()

// État
const step = ref<'email' | 'reset'>('email')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isLoading = ref(false)
const error = ref<string | null>(null)
const successMessage = ref<string | null>(null)

const form = ref({
  email: '',
  password: '',
  confirmPassword: '',
  token: ''
})

// Vérifier si on a un token dans l'URL (lien de réinitialisation)
onMounted(() => {
  const token = route.query.token as string
  if (token) {
    step.value = 'reset'
    form.value.token = token
  }
})

// Méthodes
const handleSendResetLink = async () => {
  error.value = null
  successMessage.value = null
  isLoading.value = true

  try {
    // TODO: Appeler l'API pour envoyer l'email de réinitialisation
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Simuler un succès
    successMessage.value = 'Un email de réinitialisation a été envoyé !'
    
    // Optionnel : rediriger après quelques secondes
    setTimeout(() => {
      router.push('/login')
    }, 3000)
  } catch (err) {
    error.value = 'Impossible d\'envoyer l\'email. Vérifiez votre adresse.'
  } finally {
    isLoading.value = false
  }
}

const handleResetPassword = async () => {
  error.value = null
  isLoading.value = true

  // Validation
  if (form.value.password.length < 8) {
    error.value = 'Le mot de passe doit contenir au moins 8 caractères'
    isLoading.value = false
    return
  }

  if (form.value.password !== form.value.confirmPassword) {
    error.value = 'Les mots de passe ne correspondent pas'
    isLoading.value = false
    return
  }

  try {
    // TODO: Appeler l'API pour réinitialiser le mot de passe
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Simuler un succès
    successMessage.value = 'Mot de passe réinitialisé avec succès !'
    
    // Rediriger vers la page de connexion
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } catch (err) {
    error.value = 'Impossible de réinitialiser le mot de passe. Le lien a peut-être expiré.'
  } finally {
    isLoading.value = false
  }
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.shadow-3xl {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}
</style>
