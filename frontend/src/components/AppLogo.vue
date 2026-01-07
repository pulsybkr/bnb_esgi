<template>
  <component
    :is="clickable ? 'router-link' : 'h1'"
    :to="clickable ? '/' : undefined"
    :class="[
      'font-bold',
      sizeClasses,
      colorClasses,
      clickable ? 'transition-opacity hover:opacity-80' : ''
    ]"
  >
    bnb
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  size?: 'medium' | 'large'
  color?: 'primary' | 'white'
  clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  color: 'primary',
  clickable: true
})

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'medium':
      return 'text-2xl'
    case 'large':
      return 'text-3xl'
    default:
      return 'text-2xl'
  }
})

const colorClasses = computed(() => {
  switch (props.color) {
    case 'primary':
      return 'text-indigo-600'
    case 'white':
      return 'text-white'
    default:
      return 'text-indigo-600'
  }
})
</script>

