import { createRouter, createWebHistory } from 'vue-router'
import AccommodationListView from '@/views/AccommodationListView.vue'
import AccommodationDetailView from '@/views/AccommodationDetailView.vue'
import LoginView from '@/views/LoginView.vue'
import ForgotPasswordView from '@/views/ForgotPasswordView.vue'
import { useAuthStore } from '@/stores/auth'

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
    component: AccommodationDetailView,
    props: true
  },
  {
    path: '/accommodation/:id/calendar',
    name: 'accommodation-calendar',
    component: () => import('@/views/AccommodationCalendarView.vue'),
    meta: { requiresAuth: true }
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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard pour vérifier l'authentification
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // Vérifier si la route nécessite une authentification
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // Rediriger vers la page de login avec l'URL de retour
    next({
      name: 'login',
      query: { redirect: to.fullPath }
    })
  } else {
    next()
  }
})

export default router
