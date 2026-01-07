import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const routes = [
  {
    path: '/',
    name: 'home',
    component: AccommodationListView
  },
  {
    path: '/accommodation/create',
    name: 'accommodation-create',
    component: () => import('@/views/AccommodationCreateView.vue'),
    meta: { requiresAuth: true, requiresOwner: true }
  },
  {
    path: '/accommodation/:id',
    name: 'accommodation-detail',
    component: AccommodationDetailView
  },
  {
    path: '/accommodation/:id/calendar',
    name: 'accommodation-calendar',
    component: () => import('@/views/AccommodationCalendarView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/favorites',
    name: 'favorites',
    component: () => import('@/views/FavoritesView.vue')
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: ForgotPasswordView
  },
  {
    path: '/my-properties',
    name: 'my-properties',
    component: () => import('@/views/MyPropertiesView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/ProfileView.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard pour protéger les routes
router.beforeEach(async (to, from, next) => {
  const { isAuthenticated, isOwner, loadProfile } = useAuth()

  // Si la route nécessite une authentification
  if (to.meta.requiresAuth) {
    // Charger le profil si pas encore chargé
    if (!isAuthenticated.value) {
      await loadProfile()
    }

    // Vérifier si l'utilisateur est authentifié
    if (!isAuthenticated.value) {
      // Rediriger vers la page d'accueil avec un message
      alert('Vous devez être connecté pour accéder à cette page')
      next({ name: 'home' })
      return
    }

    // Si la route nécessite le rôle propriétaire
    if (to.meta.requiresOwner && !isOwner.value) {
      alert('Seuls les propriétaires peuvent accéder à cette page')
      next({ name: 'home' })
      return
    }
  }

  next()
})

export default router
