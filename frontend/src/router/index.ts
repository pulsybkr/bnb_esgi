import { createRouter, createWebHistory } from 'vue-router'
import AccommodationListView from '@/views/AccommodationListView.vue'
import AccommodationDetailView from '@/views/AccommodationDetailView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: AccommodationListView
  },
  {
    path: '/accommodation/:id',
    name: 'accommodation-detail',
    component: AccommodationDetailView,
    props: true
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

