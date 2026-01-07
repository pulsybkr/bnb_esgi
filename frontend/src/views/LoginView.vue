<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-african-cream via-green-50 to-african-sand px-4 py-12">
    <div class="w-full max-w-md">
      <!-- Card principale -->
      <div class="bg-white rounded-2xl shadow-2xl p-8 space-y-6 transform transition-all duration-300 hover:shadow-3xl border border-gray-100">
        <!-- Logo et titre -->
        <div class="text-center space-y-2">
          <div class="inline-flex items-center justify-center mb-4">
            <h1 class="text-4xl font-bold text-african-green flex items-center gap-2 transform transition-transform hover:scale-105">
              <Home class="w-10 h-10" />
              <span>bnb</span>
            </h1>
          </div>
          <h2 class="text-2xl font-bold text-gray-900">
            {{ isLogin ? 'Bon retour !' : 'Créer un compte' }}
          </h2>
          <p class="text-gray-600">
            {{ isLogin ? 'Connectez-vous pour continuer' : 'Rejoignez-nous dès aujourd\'hui' }}
          </p>
        </div>

        <!-- Formulaire -->
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Prénom et Nom (uniquement pour inscription) -->
          <div v-if="!isLogin" class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label for="firstName" class="block text-sm font-medium text-gray-700">
                Prénom
              </label>
              <input
                id="firstName"
                v-model="form.firstName"
                type="text"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-african-green focus:border-transparent transition-all duration-200 outline-none"
                placeholder="Jean"
              />
            </div>
            <div class="space-y-2">
              <label for="lastName" class="block text-sm font-medium text-gray-700">
                Nom
              </label>
              <input
                id="lastName"
                v-model="form.lastName"
                type="text"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-african-green focus:border-transparent transition-all duration-200 outline-none"
                placeholder="Dupont"
              />
            </div>
          </div>

          <!-- Email -->
          <div class="space-y-2">
            <label for="email" class="block text-sm font-medium text-gray-700">
              Email
            </label>
            <div class="relative">
              <Mail class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="email"
                v-model="form.email"
                type="email"
                required
                class="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-african-green focus:border-transparent transition-all duration-200 outline-none"
                placeholder="vous@exemple.com"
              />
            </div>
          </div>

          <!-- Mot de passe -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label for="password" class="block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <button 
                v-if="isLogin"
                type="button"
                @click="showForgotPassword"
                class="text-sm text-african-green hover:text-african-green-dark font-medium transition-colors"
              >
                Mot de passe oublié ?
              </button>
            </div>
            <div class="relative">
              <Lock class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                required
                class="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-african-green focus:border-transparent transition-all duration-200 outline-none"
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
          </div>

          <!-- Type d'utilisateur (uniquement pour inscription) -->
          <div v-if="!isLogin" class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">
              Je suis...
            </label>
            <div class="grid grid-cols-2 gap-3">
              <button
                type="button"
                @click="form.userType = 'locataire'"
                :class="[
                  'px-4 py-3 rounded-lg border-2 transition-all duration-200 font-medium flex flex-col items-center',
                  form.userType === 'locataire'
                    ? 'border-african-green bg-green-50 text-african-green'
                    : 'border-gray-300 hover:border-gray-400 text-gray-700'
                ]"
              >
                <User class="w-5 h-5 mb-1" />
                Locataire
              </button>
              <button
                type="button"
                @click="form.userType = 'proprietaire'"
                :class="[
                  'px-4 py-3 rounded-lg border-2 transition-all duration-200 font-medium flex flex-col items-center',
                  form.userType === 'proprietaire'
                    ? 'border-african-green bg-green-50 text-african-green'
                    : 'border-gray-300 hover:border-gray-400 text-gray-700'
                ]"
              >
                <Home class="w-5 h-5 mb-1" />
                Propriétaire
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
            class="w-full py-3 px-4 bg-african-green text-white font-semibold rounded-lg hover:bg-african-green-dark focus:outline-none focus:ring-2 focus:ring-african-green focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <span v-if="!isLoading">{{ isLogin ? 'Se connecter' : 'Créer mon compte' }}</span>
            <span v-else class="flex items-center justify-center">
              <Loader2 class="w-5 h-5 animate-spin mr-2" />
              Chargement...
            </span>
          </button>
        </form>

        <!-- Toggle login/register -->
        <div class="text-center pt-2">
          <p class="text-sm text-gray-600">
            {{ isLogin ? 'Pas encore de compte ?' : 'Vous avez déjà un compte ?' }}
            <button
              type="button"
              @click="toggleMode"
              class="text-african-green hover:text-african-green-dark font-semibold transition-colors ml-1"
            >
              {{ isLogin ? 'Créer un compte' : 'Se connecter' }}
            </button>
          </p>
        </div>
      </div>

      <!-- Footer -->
      <p class="mt-6 text-center text-sm text-gray-600">
        En continuant, vous acceptez nos
        <a href="#" class="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:underline">conditions d'utilisation</a>
        et notre
        <a href="#" class="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:underline">politique de confidentialité</a>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { authService } from '@/services/auth.service'
import { Mail, Lock, Eye, EyeOff, User, Home, AlertCircle, Loader2 } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// Rediriger si déjà authentifié
onMounted(() => {
  if (authStore.isAuthenticated) {
    const redirectPath = route.query.redirect as string || '/'
    router.push(redirectPath)
  }
})

// État
const isLogin = ref(true)
const showPassword = ref(false)
const isLoading = ref(false)
const error = ref<string | null>(null)

const form = ref({
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  userType: 'locataire' as 'locataire' | 'proprietaire'
})

// Méthodes
const toggleMode = () => {
  isLogin.value = !isLogin.value
  error.value = null
  // Reset form
  form.value = {
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    userType: 'locataire'
  }
}

const handleSubmit = async () => {
  error.value = null
  isLoading.value = true

  try {
    if (isLogin.value) {
      // Appeler l'API de connexion
      const response = await authService.login({
        email: form.value.email,
        password: form.value.password
      })

      if (response.success && response.data) {
        // Sauvegarder les tokens
        authStore.setTokens(response.data.accessToken, response.data.refreshToken)
        
        // Sauvegarder les informations utilisateur
        authStore.setUser({
          id: response.data.user.id,
          firstName: response.data.user.firstName,
          lastName: response.data.user.lastName,
          email: response.data.user.email,
          userType: response.data.user.userType as 'locataire' | 'proprietaire' | 'admin',
          emailVerified: response.data.user.emailVerified,
          phoneVerified: false,
          status: 'actif',
          registrationDate: new Date().toISOString()
        })
        
        console.log('Connexion réussie:', {
          isAuthenticated: authStore.isAuthenticated,
          user: authStore.user,
          hasAccessToken: !!authStore.accessToken
        })
        
        // Rediriger vers la page d'origine ou la page d'accueil
        const redirectPath = route.query.redirect as string || '/'
        router.push(redirectPath)
      }
    } else {
      // Appeler l'API d'inscription
      const response = await authService.register({
        email: form.value.email,
        password: form.value.password,
        firstName: form.value.firstName,
        lastName: form.value.lastName,
        userType: form.value.userType
      })

      if (response.success && response.data) {
        // Sauvegarder les tokens
        authStore.setTokens(response.data.accessToken, response.data.refreshToken)
        
        // Sauvegarder les informations utilisateur
        authStore.setUser({
          id: response.data.user.id,
          firstName: response.data.user.firstName,
          lastName: response.data.user.lastName,
          email: response.data.user.email,
          userType: response.data.user.userType as 'locataire' | 'proprietaire' | 'admin',
          emailVerified: response.data.user.emailVerified,
          phoneVerified: false,
          status: 'actif',
          registrationDate: new Date().toISOString()
        })
        
        // Rediriger vers la page d'accueil
        router.push('/')
      }
    }
  } catch (err: any) {
    console.error('Erreur de connexion:', err)
    
    // Gérer les erreurs de l'API
    if (err.response?.data?.type === 'already_authenticated' || err.response?.data?.message?.includes('already authenticated')) {
      // Si l'utilisateur est déjà authentifié, forcer la déconnexion et réessayer
      authStore.clearAuth()
      error.value = 'Vous étiez déjà connecté. Veuillez réessayer.'
      
      // Optionnel : réessayer automatiquement après nettoyage
      setTimeout(() => {
        error.value = null
      }, 3000)
    } else if (err.response?.data?.message) {
      error.value = err.response.data.message
    } else if (err.response?.data?.error) {
      error.value = err.response.data.error
    } else {
      error.value = isLogin.value 
        ? 'Email ou mot de passe incorrect' 
        : 'Une erreur est survenue lors de l\'inscription'
    }
  } finally {
    isLoading.value = false
  }
}

const showForgotPassword = () => {
  router.push('/forgot-password')
}
</script>

<style scoped>
/* Animation personnalisée pour les hover effects */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}

.shadow-3xl {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}
</style>
