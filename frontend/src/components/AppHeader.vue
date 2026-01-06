<template>
  <header class="bg-white shadow-sm border-b sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo -->
        <div class="flex items-center cursor-pointer" @click="goHome">
          <h1 class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            bnb
          </h1>
        </div>

        <!-- Navigation et profil -->
        <div class="flex items-center space-x-4">
          <button class="p-2 text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100">
            <Search class="w-5 h-5" />
          </button>

          <!-- Utilisateur connecté -->
          <div v-if="isAuthenticated" class="relative">
            <button 
              @click="toggleUserMenu"
              class="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100"
            >
              <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold">
                {{ userInitials }}
              </div>
            </button>

            <!-- Menu déroulant -->
            <div 
              v-if="showUserMenu"
              class="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 transform origin-top-right transition-all duration-200"
            >
              <!-- Profil utilisateur -->
              <div class="px-4 py-3 border-b border-gray-100">
                <p class="text-sm font-semibold text-gray-900">{{ fullName }}</p>
                <p class="text-xs text-gray-500 truncate">{{ user?.email }}</p>
              </div>

              <!-- Menu items -->
              <button 
                @click="goToProfile"
                class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2 transition-colors"
              >
                <User class="w-4 h-4" />
                <span>Mon profil</span>
              </button>

              <button 
                v-if="isOwner"
                @click="goToMyProperties"
                class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2 transition-colors"
              >
                <Home class="w-4 h-4" />
                <span>Mes logements</span>
              </button>

              <button 
                @click="goToBookings"
                class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2 transition-colors"
              >
                <Calendar class="w-4 h-4" />
                <span>Mes réservations</span>
              </button>

              <button 
                @click="goToSettings"
                class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2 transition-colors"
              >
                <Settings class="w-4 h-4" />
                <span>Paramètres</span>
              </button>

              <div class="border-t border-gray-100 mt-2 pt-2">
                <button 
                  @click="handleLogout"
                  class="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 transition-colors"
                >
                  <LogOut class="w-4 h-4" />
                  <span>Se déconnecter</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Utilisateur non connecté -->
          <button 
            v-else
            @click="goToLogin"
            class="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
            title="Se connecter"
          >
            <User class="w-5 h-5" />
            <span class="hidden sm:inline text-sm font-medium">Se connecter</span>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Search, User, Home, Calendar, Settings, LogOut } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

// State
const showUserMenu = ref(false)

// Computed
const isAuthenticated = computed(() => authStore.isAuthenticated)
const user = computed(() => authStore.user)
const fullName = computed(() => authStore.fullName)
const isOwner = computed(() => authStore.isOwner)

const userInitials = computed(() => {
  if (!user.value) return ''
  return `${user.value.firstName[0]}${user.value.lastName[0]}`.toUpperCase()
})

// Methods
const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const goHome = () => {
  router.push('/')
  showUserMenu.value = false
}

const goToLogin = () => {
  router.push('/login')
}

const goToProfile = () => {
  router.push('/profile')
  showUserMenu.value = false
}

const goToMyProperties = () => {
  router.push('/my-properties')
  showUserMenu.value = false
}

const goToBookings = () => {
  router.push('/bookings')
  showUserMenu.value = false
}

const goToSettings = () => {
  router.push('/settings')
  showUserMenu.value = false
}

const handleLogout = () => {
  authStore.clearAuth()
  showUserMenu.value = false
  router.push('/')
}

// Fermer le menu si on clique ailleurs
if (typeof window !== 'undefined') {
  window.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (!target.closest('.relative')) {
      showUserMenu.value = false
    }
  })
}
</script>

<style scoped>
/* Animation pour le menu déroulant */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.absolute {
  animation: slideDown 0.2s ease-out;
}
</style>
