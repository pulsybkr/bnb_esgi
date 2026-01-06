import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/AccommodationListView.vue')
  },
  {
    path: '/accommodation/create',
    name: 'accommodation-create',
    component: () => import('@/views/AccommodationCreateView.vue')
  },
  {
    path: '/accommodation/:id',
    name: 'accommodation-detail',
    component: () => import('@/views/AccommodationDetailView.vue')
  },
  {
    path: '/accommodation/:id/calendar',
    name: 'accommodation-calendar',
    component: () => import('@/views/AccommodationCalendarView.vue')
  },
  {
    path: '/favorites',
    name: 'favorites',
    component: () => import('@/views/FavoritesView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
