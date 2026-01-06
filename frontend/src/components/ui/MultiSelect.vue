<template>
  <div class="relative">
    <button
      @click="toggleDropdown"
      type="button"
      class="w-full px-4 py-2.5 text-left bg-white border border-gray-300 rounded-lg hover:border-african-green focus:outline-none focus:ring-2 focus:ring-african-green focus:border-transparent transition-colors"
    >
      <div class="flex items-center justify-between">
        <span v-if="selectedItems.length === 0" class="text-gray-500">{{ placeholder }}</span>
        <span v-else class="text-gray-900">{{ selectedItems.length }} sélectionné{{ selectedItems.length > 1 ? 's' : '' }}</span>
        <ChevronDown class="w-4 h-4 text-gray-400" :class="{ 'rotate-180': isOpen }" />
      </div>
    </button>

    <!-- Dropdown -->
    <Transition name="dropdown">
      <div
        v-if="isOpen"
        class="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-hidden animate-slide-down"
      >
        <!-- Search -->
        <div v-if="searchable" class="p-2 border-b">
          <div class="relative">
            <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher..."
              class="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-african-green focus:border-transparent"
            />
          </div>
        </div>

        <!-- Options -->
        <div class="overflow-y-auto max-h-48 custom-scrollbar">
          <label
            v-for="option in filteredOptions"
            :key="option.value"
            class="flex items-center px-4 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <input
              type="checkbox"
              :value="option.value"
              :checked="isSelected(option.value)"
              @change="toggleOption(option.value)"
              class="rounded border-gray-300 text-african-green focus:ring-african-green"
            />
            <span class="ml-3 text-sm text-gray-700">{{ option.label }}</span>
          </label>
          
          <div v-if="filteredOptions.length === 0" class="px-4 py-8 text-center text-sm text-gray-500">
            Aucun résultat
          </div>
        </div>

        <!-- Actions -->
        <div v-if="selectedItems.length > 0" class="p-2 border-t bg-gray-50">
          <button
            @click="clearAll"
            type="button"
            class="w-full px-3 py-1.5 text-sm text-african-green hover:text-african-green-dark transition-colors"
          >
            Tout effacer
          </button>
        </div>
      </div>
    </Transition>

    <!-- Backdrop -->
    <div
      v-if="isOpen"
      @click="closeDropdown"
      class="fixed inset-0 z-40"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ChevronDown, Search } from 'lucide-vue-next'

export interface MultiSelectOption {
  value: string
  label: string
}

const props = withDefaults(defineProps<{
  modelValue: string[]
  options: MultiSelectOption[]
  placeholder?: string
  searchable?: boolean
}>(), {
  placeholder: 'Sélectionner...',
  searchable: true
})

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const isOpen = ref(false)
const searchQuery = ref('')

const selectedItems = computed(() => props.modelValue)

const filteredOptions = computed(() => {
  if (!searchQuery.value) return props.options
  
  const query = searchQuery.value.toLowerCase()
  return props.options.filter(option => 
    option.label.toLowerCase().includes(query)
  )
})

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
  if (!isOpen.value) {
    searchQuery.value = ''
  }
}

const closeDropdown = () => {
  isOpen.value = false
  searchQuery.value = ''
}

const isSelected = (value: string) => {
  return selectedItems.value.includes(value)
}

const toggleOption = (value: string) => {
  const newValue = [...selectedItems.value]
  const index = newValue.indexOf(value)
  
  if (index > -1) {
    newValue.splice(index, 1)
  } else {
    newValue.push(value)
  }
  
  emit('update:modelValue', newValue)
}

const clearAll = () => {
  emit('update:modelValue', [])
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
