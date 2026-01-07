<template>
  <div class="flex items-center gap-2">
    <!-- User Profile Button -->
    <button
      @click="handleUserClick"
      class="p-2.5 text-gray-600 hover:text-african-green hover:bg-gray-50 rounded-full transition-all relative"
      :title="authStore.isAuthenticated ? 'Mon profil' : 'Se connecter'"
      type="button"
    >
      <User class="w-6 h-6" />
      <span v-if="authStore.isAuthenticated" class="absolute top-0 right-0 w-3 h-3 bg-african-green rounded-full border-2 border-white"></span>
    </button>

    <!-- Logout Button (Only if authenticated) -->
    <button
      v-if="authStore.isAuthenticated"
      @click="handleLogout"
      class="p-2.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
      title="Se déconnecter"
      type="button"
    >
      <LogOut class="w-6 h-6" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { User, LogOut } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { authService } from '@/services/auth.service'

const router = useRouter()
const authStore = useAuthStore()

/**
 * Gère le clic sur le bouton utilisateur
 * - Si connecté : redirection vers le profil
 * - Si non connecté : redirection vers la page de connexion
 */
const handleUserClick = () => {
  if (authStore.isAuthenticated) {
    router.push('/profile')
  } else {
    router.push('/login')
  }
}

/**
 * Gère la déconnexion
 * - Invalide le token côté serveur
 * - Nettoye le store
 * - Redirige vers la page de connexion
 */
const handleLogout = async () => {
  try {
    await authService.logout()
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error)
  } finally {
    authStore.clearAuth()
    router.push('/login')
  }
}
</script>

<style scoped>
/* Styles simples pour les effets au survol */
button {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  outline: none;
}
</style>
