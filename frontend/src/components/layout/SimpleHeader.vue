<template>
  <header class="bg-white shadow-sm border-b sticky top-0 z-40">
    <div class="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-20">
        <!-- Logo -->
        <button 
          @click="$router.push('/')"
          class="flex items-center hover:opacity-80 transition-opacity"
        >
          <h1 class="text-3xl font-bold text-african-green flex items-center gap-2">
            <Home class="w-8 h-8" />
            <span>bnb</span>
          </h1>
        </button>
        
        <!-- Search bar -->
        <div class="flex-1 max-w-2xl mx-8 relative hidden md:block">
          <div class="relative">
            <input 
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher une destination..."
              class="w-full px-6 py-3 pl-12 pr-12 border-2 border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-african-green focus:border-transparent transition-all shadow-sm hover:shadow-md"
              @focus="showHistoryDropdown = true"
              @blur="hideHistoryDropdown"
              @keyup.enter="handleSearch"
            />
            <Search class="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
            <button 
              v-if="searchQuery"
              @click="searchQuery = ''"
              class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              type="button"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Search history dropdown -->
          <Transition name="dropdown">
            <div 
              v-if="showHistoryDropdown && searchHistory.length > 0 && !searchQuery"
              class="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 max-h-80 overflow-y-auto custom-scrollbar animate-slide-down"
            >
              <div class="p-3">
                <div class="flex justify-between items-center px-3 py-2 mb-1">
                  <h3 class="text-sm font-semibold text-gray-700">Recherches récentes</h3>
                  <button 
                    @mousedown.prevent="clearHistory"
                    class="text-xs text-african-green hover:text-african-green-dark font-medium"
                    type="button"
                  >
                    Tout effacer
                  </button>
                </div>
                <div
                  v-for="(item, index) in searchHistory"
                  :key="index"
                  @mousedown.prevent="selectHistoryItem(item)"
                  class="w-full flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 rounded-lg group cursor-pointer transition-colors"
                >
                  <div class="flex items-center space-x-3">
                    <Search class="w-4 h-4 text-gray-400" />
                    <span class="text-sm text-gray-700">{{ item }}</span>
                  </div>
                  <button
                    @mousedown.prevent.stop="removeFromHistory(item)"
                    class="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 transition-all"
                    type="button"
                  >
                    <X class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </Transition>
        </div>

        <!-- User menu -->
        <div class="flex items-center space-x-4">
          <UserMenu />
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Home, Search, X } from 'lucide-vue-next'
import UserMenu from '@/components/auth/UserMenu.vue'
import { useSearchHistory } from '@/composables/useSearchHistory'

const router = useRouter()
const { searchHistory, addToHistory, removeFromHistory, clearHistory } = useSearchHistory()

const searchQuery = ref('')
const showHistoryDropdown = ref(false)

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    addToHistory(searchQuery.value)
    showHistoryDropdown.value = false
    router.push(`/?search=${encodeURIComponent(searchQuery.value)}`)
  }
}

const selectHistoryItem = (item: string) => {
  searchQuery.value = item
  showHistoryDropdown.value = false
  router.push(`/?search=${encodeURIComponent(item)}`)
}

const hideHistoryDropdown = () => {
  setTimeout(() => {
    showHistoryDropdown.value = false
  }, 200)
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
