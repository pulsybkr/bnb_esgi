<template>
  <div 
    :class="[
      'animate-spin rounded-full border-b-2',
      sizeClasses,
      colorClasses,
      centered ? 'mx-auto' : ''
    ]"
  ></div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  size?: 'small' | 'medium' | 'large' | 'xl'
  color?: 'primary' | 'white' | 'gray'
  centered?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  color: 'primary',
  centered: false
})

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'small':
      return 'h-4 w-4'
    case 'medium':
      return 'h-8 w-8'
    case 'large':
      return 'h-12 w-12'
    case 'xl':
      return 'h-16 w-16'
    default:
      return 'h-8 w-8'
  }
})

const colorClasses = computed(() => {
  switch (props.color) {
    case 'primary':
      return 'border-indigo-600'
    case 'white':
      return 'border-white'
    case 'gray':
      return 'border-gray-400'
    default:
      return 'border-indigo-600'
  }
})
</script>

