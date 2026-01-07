<template>
  <div class="space-y-6">
    <!-- Reviews Summary -->
    <div v-if="showSummary && reviewsData" class="bg-gray-50 rounded-xl p-4 sm:p-6 border border-gray-200">
      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-4">
        <div class="text-center w-full sm:w-auto">
          <div class="text-3xl sm:text-4xl font-bold text-gray-900">
            {{ reviewsData.averageRating.toFixed(1) }}
          </div>
          <StarRating :model-value="reviewsData.averageRating" readonly />
          <p class="text-sm text-gray-600 mt-1">
            {{ reviewsData.total }} avis
          </p>
        </div>
        
        <!-- Rating Distribution -->
        <div class="flex-1 space-y-2 w-full">
          <div v-for="star in [5, 4, 3, 2, 1]" :key="star" class="flex items-center gap-2 sm:gap-3">
            <span class="text-xs sm:text-sm text-gray-600 w-6 sm:w-8">{{ star }} ★</span>
            <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                class="h-full bg-yellow-400 transition-all duration-300"
                :style="{ width: `${getRatingPercentage(star)}%` }"
              />
            </div>
            <span class="text-xs sm:text-sm text-gray-600 w-8 sm:w-12 text-right">
              {{ reviewsData.ratingDistribution[star] || 0 }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <Loader2 class="w-8 h-8 animate-spin text-african-green" />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12">
      <AlertCircle class="w-12 h-12 text-red-500 mx-auto mb-3" />
      <p class="text-gray-600">{{ error }}</p>
    </div>

    <!-- Reviews List -->
    <div v-else-if="reviewsData && reviewsData.reviews.length > 0" class="space-y-4">
      <ReviewCard
        v-for="review in reviewsData.reviews"
        :key="review.id"
        :review="review"
        :show-stay-info="showStayInfo"
      />
      
      <!-- Pagination -->
      <div v-if="reviewsData.totalPages > 1" class="flex flex-wrap justify-center gap-2 pt-6">
        <button
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage === 1"
          class="px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span class="hidden sm:inline">Précédent</span>
          <span class="sm:hidden">‹</span>
        </button>
        
        <div class="flex gap-2">
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="goToPage(page)"
            :class="[
              'px-3 sm:px-4 py-2 text-sm rounded-lg transition-colors',
              page === currentPage
                ? 'bg-african-green text-white'
                : 'border border-gray-300 hover:bg-gray-50'
            ]"
          >
            {{ page }}
          </button>
        </div>
        
        <button
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage === reviewsData.totalPages"
          class="px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span class="hidden sm:inline">Suivant</span>
          <span class="sm:hidden">›</span>
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <MessageSquare class="w-12 h-12 text-gray-300 mx-auto mb-3" />
      <p class="text-gray-600">Aucun avis pour le moment</p>
      <p class="text-sm text-gray-500 mt-1">Soyez le premier à laisser un avis !</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Loader2, AlertCircle, MessageSquare } from 'lucide-vue-next'
import ReviewCard from './ReviewCard.vue'
import StarRating from './StarRating.vue'
import { reviewService, type ReviewsResponse } from '@/services/reviewService'

interface Props {
  accommodationId: string
  showSummary?: boolean
  showStayInfo?: boolean
  initialPage?: number
  pageSize?: number
}

const props = withDefaults(defineProps<Props>(), {
  showSummary: true,
  showStayInfo: false,
  initialPage: 1,
  pageSize: 10,
})

const reviewsData = ref<ReviewsResponse | null>(null)
const loading = ref(false)
const error = ref('')
const currentPage = ref(props.initialPage)

const visiblePages = computed(() => {
  if (!reviewsData.value) return []
  
  const total = reviewsData.value.totalPages
  const current = currentPage.value
  const pages: number[] = []
  
  // Always show first page
  pages.push(1)
  
  // Show pages around current
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    if (!pages.includes(i)) {
      pages.push(i)
    }
  }
  
  // Always show last page
  if (total > 1 && !pages.includes(total)) {
    pages.push(total)
  }
  
  return pages.sort((a, b) => a - b)
})

function getRatingPercentage(star: number): number {
  if (!reviewsData.value || reviewsData.value.total === 0) return 0
  const count = reviewsData.value.ratingDistribution[star] || 0
  return (count / reviewsData.value.total) * 100
}

async function loadReviews() {
  loading.value = true
  error.value = ''
  
  try {
    reviewsData.value = await reviewService.getAccommodationReviews(
      props.accommodationId,
      currentPage.value,
      props.pageSize
    )
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erreur lors du chargement des avis'
    console.error('Error loading reviews:', err)
  } finally {
    loading.value = false
  }
}

function goToPage(page: number) {
  if (page < 1 || (reviewsData.value && page > reviewsData.value.totalPages)) {
    return
  }
  currentPage.value = page
}

watch(currentPage, () => {
  loadReviews()
})

onMounted(() => {
  loadReviews()
})

defineExpose({
  refresh: loadReviews,
})
</script>
