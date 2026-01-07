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
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 outline-none"
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
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 outline-none"
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
                class="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 outline-none"
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
                class="text-sm bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-indigo-700 font-medium transition-colors"
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
                  'px-4 py-3 rounded-lg border-2 transition-all duration-200 font-medium',
                  form.userType === 'locataire'
                    ? 'border-indigo-600 bg-gradient-to-br from-blue-50 to-indigo-50'
                    : 'border-gray-300 hover:border-gray-400 text-gray-700'
                ]"
              >
                <User class="w-5 h-5 mx-auto mb-1" />
                Locataire
              </button>
              <button
                type="button"
                @click="form.userType = 'proprietaire'"
                :class="[
                  'px-4 py-3 rounded-lg border-2 transition-all duration-200 font-medium',
                  form.userType === 'proprietaire'
                    ? 'border-indigo-600 bg-gradient-to-br from-blue-50 to-indigo-50'
                    : 'border-gray-300 hover:border-gray-400 text-gray-700'
                ]"
              >
                <Home class="w-5 h-5 mx-auto mb-1" />
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
            class="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <span v-if="!isLoading">{{ isLogin ? 'Se connecter' : 'Créer mon compte' }}</span>
            <span v-else class="flex items-center justify-center">
              <Loader2 class="w-5 h-5 animate-spin mr-2" />
              Chargement...
            </span>
          </button>
        </form>

        <!-- Toggle login/register -->
        <div class="text-center">
          <p class="text-sm text-gray-600">
            {{ isLogin ? 'Pas encore de compte ?' : 'Vous avez déjà un compte ?' }}
            <button
              type="button"
              @click="toggleMode"
              class="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-indigo-700 font-semibold transition-colors ml-1"
            >
              {{ isLogin ? 'Créer un compte' : 'Se connecter' }}
            </button>
          </p>
        </div>

        <!-- Divider -->
        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-white text-gray-500">Ou continuer avec</span>
          </div>
        </div>

        <!-- Social login buttons -->
        <div class="grid grid-cols-2 gap-3">
          <button
            type="button"
            class="flex items-center justify-center px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </button>
          <button
            type="button"
            class="flex items-center justify-center px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Facebook
          </button>
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
import AppLogo from '@/components/AppLogo.vue'

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
