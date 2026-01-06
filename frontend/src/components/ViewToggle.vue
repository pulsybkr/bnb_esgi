<template>
  <div class="flex items-center gap-2 bg-white rounded-lg border border-gray-300 p-1">
    <button
      @click="setView('list')"
      :class="[
        'flex items-center gap-2 px-4 py-2 rounded-md transition-all',
        currentView === 'list'
          ? 'bg-african-green text-white shadow-sm'
          : 'text-gray-600 hover:bg-gray-100'
      ]"
      type="button"
    >
      <LayoutGrid class="w-4 h-4" />
      <span class="text-sm font-medium">Liste</span>
    </button>
    
    <button
      @click="setView('map')"
      :class="[
        'flex items-center gap-2 px-4 py-2 rounded-md transition-all',
        currentView === 'map'
          ? 'bg-african-green text-white shadow-sm'
          : 'text-gray-600 hover:bg-gray-100'
      ]"
      type="button"
    >
      <Map class="w-4 h-4" />
      <span class="text-sm font-medium">Carte</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { LayoutGrid, Map } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: 'list' | 'map'
}>()

const emit = defineEmits<{
  'update:modelValue': [value: 'list' | 'map']
}>()

const currentView = computed(() => props.modelValue)

const setView = (view: 'list' | 'map') => {
  emit('update:modelValue', view)
}
</script>

