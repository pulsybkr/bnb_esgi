<template>
  <div class="relative">
    <!-- User button -->
    <button
      @click="toggleMenu"
      class="p-2.5 text-gray-600 hover:text-african-green hover:bg-gray-50 rounded-full transition-all relative"
      type="button"
    >
      <User class="w-6 h-6" />
      <span v-if="isAuthenticated" class="absolute top-0 right-0 w-3 h-3 bg-african-green rounded-full border-2 border-white"></span>
    </button>

    <!-- Dropdown menu -->
    <Transition name="dropdown">
      <div
        v-if="isMenuOpen"
        class="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-slide-down"
      >
        <!-- Guest Menu (Not logged in) -->
        <div v-if="!isAuthenticated" class="p-6">
          <!-- CTA Section -->
          <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 mb-4">
            <div class="flex items-start gap-3 mb-3">
              <div class="p-2 bg-african-green rounded-lg">
                <Home class="w-6 h-6 text-white" />
              </div>
              <div class="flex-1">
                <h3 class="font-bold text-gray-900 mb-1">Mettez votre logement en location</h3>
                <p class="text-sm text-gray-600">Gagnez un revenu passif et rejoignez notre communauté</p>
              </div>
            </div>
            <ul class="space-y-2 mb-4">
              <li class="flex items-center gap-2 text-sm text-gray-700">
                <Check class="w-4 h-4 text-african-green flex-shrink-0" />
                <span>Configuration simple et rapide</span>
              </li>
              <li class="flex items-center gap-2 text-sm text-gray-700">
                <Check class="w-4 h-4 text-african-green flex-shrink-0" />
                <span>Gestion facilitée des réservations</span>
              </li>
              <li class="flex items-center gap-2 text-sm text-gray-700">
                <Check class="w-4 h-4 text-african-green flex-shrink-0" />
                <span>Paiements sécurisés</span>
              </li>
            </ul>
            <button
              @click="openSignupAsOwner"
              class="w-full px-4 py-2.5 bg-african-green text-white rounded-lg hover:bg-african-green-dark transition-colors font-medium flex items-center justify-center gap-2"
            >
              <PlusCircle class="w-5 h-5" />
              <span>Ajouter mon logement</span>
            </button>
          </div>

          <!-- Auth buttons -->
          <div class="space-y-2">
            <button
              @click="openSignup"
              class="w-full px-4 py-2.5 bg-african-green text-white rounded-lg hover:bg-african-green-dark transition-colors font-medium"
            >
              S'inscrire
            </button>
            <button
              @click="openLogin"
              class="w-full px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Se connecter
            </button>
          </div>
        </div>

        <!-- User Menu (Logged in) -->
        <div v-else>
          <!-- User info -->
          <div class="p-4 border-b border-gray-200 bg-gray-50">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-african-green rounded-full flex items-center justify-center text-white font-bold text-lg">
                {{ userInitials }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-gray-900 truncate">{{ user?.firstName }} {{ user?.lastName }}</p>
                <p class="text-sm text-gray-600 truncate">{{ user?.email }}</p>
              </div>
            </div>
          </div>

          <!-- Menu items -->
          <div class="py-2">
            <!-- Profile -->
            <button
              @click="navigateTo('/profile')"
              class="w-full px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-3 text-left"
            >
              <User class="w-5 h-5 text-gray-600" />
              <span class="text-gray-700">Mon profil</span>
            </button>

            <!-- Owner-specific items -->
            <template v-if="isOwner">
              <div class="my-2 border-t border-gray-200"></div>
              
              <!-- Add property (prominent) -->
              <button
                @click="navigateTo('/accommodation/create')"
                class="w-full px-4 py-3 bg-green-50 hover:bg-green-100 transition-colors flex items-center gap-3 text-left"
              >
                <PlusCircle class="w-5 h-5 text-african-green" />
                <span class="font-semibold text-african-green">Ajouter un logement</span>
              </button>

              <!-- My properties -->
              <button
                @click="navigateTo('/my-properties')"
                class="w-full px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-3 text-left"
              >
                <Home class="w-5 h-5 text-gray-600" />
                <span class="text-gray-700">Mes logements</span>
              </button>

              <button
                @click="navigateTo('/owner/reservations')"
                class="w-full px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-3 text-left"
              >
                <Home class="w-5 h-5 text-gray-600" />
                <span class="text-gray-700">Reservations des logements</span>
              </button>
            </template>

            <div class="my-2 border-t border-gray-200"></div>

            <!-- Reservations -->
            <button
              @click="navigateTo('/reservations')"
              class="w-full px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-3 text-left"
            >
              <Calendar class="w-5 h-5 text-gray-600" />
              <span class="text-gray-700">Mes réservations</span>
            </button>

            <!-- Favorites -->
            <button
              @click="navigateTo('/favorites')"
              class="w-full px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-3 text-left"
            >
              <Heart class="w-5 h-5 text-gray-600" />
              <span class="text-gray-700">Mes favoris</span>
            </button>


            <!-- Conversations -->
            <button
              @click="navigateTo('/conversations')"
              class="w-full px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-3 text-left"
            >
              <MessageCircle class="w-5 h-5 text-gray-600" />
              <span class="text-gray-700">Conversations</span>
            </button>

            <div class="my-2 border-t border-gray-200"></div>

            <!-- Logout -->
            <button
              @click="handleLogout"
              class="w-full px-4 py-3 hover:bg-red-50 transition-colors flex items-center gap-3 text-left"
            >
              <LogOut class="w-5 h-5 text-red-600" />
              <span class="text-red-600 font-medium">Se déconnecter</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Backdrop -->
    <div
      v-if="isMenuOpen"
      @click="closeMenu"
      class="fixed inset-0 z-40"
    ></div>

    <!-- Modals -->
    <LoginModal
      :is-open="isLoginModalOpen"
      @close="closeLogin"
      @switch-to-signup="switchToSignup"
    />

    <SignupModal
      :is-open="isSignupModalOpen"
      @close="closeSignup"
      @switch-to-login="switchToLogin"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  User, Home, PlusCircle, Check, Calendar, Heart, MessageCircle, LogOut
} from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'
import LoginModal from './LoginModal.vue'
import SignupModal from './SignupModal.vue'

const router = useRouter()
const { user, isAuthenticated, isOwner, logout } = useAuth()

const isMenuOpen = ref(false)
const isLoginModalOpen = ref(false)
const isSignupModalOpen = ref(false)
const signupAsOwner = ref(false)

const userInitials = computed(() => {
  if (!user.value) return ''
  return `${user.value.firstName[0]}${user.value.lastName[0]}`.toUpperCase()
})

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  isMenuOpen.value = false
}

const openLogin = () => {
  closeMenu()
  isLoginModalOpen.value = true
}

const closeLogin = () => {
  isLoginModalOpen.value = false
}

const openSignup = () => {
  closeMenu()
  signupAsOwner.value = false
  isSignupModalOpen.value = true
}

const openSignupAsOwner = () => {
  closeMenu()
  signupAsOwner.value = true
  isSignupModalOpen.value = true
}

const closeSignup = () => {
  isSignupModalOpen.value = false
  signupAsOwner.value = false
}

const switchToSignup = () => {
  closeLogin()
  openSignup()
}

const switchToLogin = () => {
  closeSignup()
  openLogin()
}

const navigateTo = (path: string) => {
  closeMenu()
  router.push(path)
}

const handleLogout = async () => {
  closeMenu()
  await logout()
  router.push('/')
}
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
