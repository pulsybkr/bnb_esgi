import { createRouter, createWebHistory } from 'vue-router'

// Imports dynamiques pour éviter les problèmes de circular dependencies
const AccommodationListView = () => import('@/views/AccommodationListView.vue')
const AccommodationDetailView = () => import('@/views/AccommodationDetailView.vue')
const LoginView = () => import('@/views/LoginView.vue')
const ForgotPasswordView = () => import('@/views/ForgotPasswordView.vue')

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
    meta: { requiresAuth: true }
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

// Navigation guard pour vérifier l'authentification
// Note: Le store doit être importé ici mais Pinia doit être initialisé avant dans main.ts
router.beforeEach((to, from, next) => {
  try {
    // Import dynamique pour éviter les problèmes d'initialisation
    import('@/stores/auth').then((module) => {
      const authStore = module.useAuthStore()
      
      // Si l'utilisateur essaie d'accéder au login et est déjà authentifié, rediriger vers l'accueil
      if ((to.name === 'login' || to.name === 'forgot-password') && authStore.isAuthenticated) {
        next({ name: 'home' })
        return
      }

      // Si la route nécessite une authentification
      if (to.meta.requiresAuth) {
        if (!authStore.isAuthenticated) {
          // Rediriger vers la page de login avec l'URL de retour
          next({
            name: 'login',
            query: { redirect: to.fullPath }
          })
        } else {
          next()
        }
      } else {
        // Route publique, continuer
        next()
      }
    }).catch((error) => {
      console.error('Erreur lors du chargement du store auth:', error)
      // En cas d'erreur, continuer la navigation (fallback)
      next()
    })
  } catch (error) {
    console.error('Erreur dans le router guard:', error)
    // En cas d'erreur, continuer la navigation
    next()
  }
})

export default router
