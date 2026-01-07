<template>
  <div 
    :class="[
      'rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold overflow-hidden',
      sizeClasses,
      border ? 'border-2 border-gray-200' : '',
      'flex-shrink-0'
    ]"
  >
    <img
      v-if="imageUrl"
      :src="imageUrl"
      :alt="name"
      class="w-full h-full object-cover"
      @error="handleImageError"
    />
    <span v-else :class="textSizeClasses">{{ initials }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
  name: string
  imageUrl?: string | null
  size?: 'small' | 'medium' | 'large' | 'xl'
  border?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  border: false,
  imageUrl: null
})

const imageLoadError = ref(false)

const initials = computed(() => {
  if (!props.name) return '?'
  
  const parts = props.name.trim().split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return props.name.charAt(0).toUpperCase()
})

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'small':
      return 'w-8 h-8'
    case 'medium':
      return 'w-10 h-10'
    case 'large':
      return 'w-12 h-12'
    case 'xl':
      return 'w-16 h-16'
    default:
      return 'w-10 h-10'
  }
})

const textSizeClasses = computed(() => {
  switch (props.size) {
    case 'small':
      return 'text-xs'
    case 'medium':
      return 'text-sm'
    case 'large':
      return 'text-lg'
    case 'xl':
      return 'text-xl'
    default:
      return 'text-sm'
  }
})

const handleImageError = (e: Event) => {
  imageLoadError.value = true
  const target = e.target as HTMLImageElement
  target.style.display = 'none'
}
</script>

