<template>
  <div class="flex items-center gap-1">
    <button
      v-for="star in 5"
      :key="star"
      type="button"
      :disabled="readonly"
      @click="!readonly && setRating(star)"
      @mouseenter="!readonly && (hoverRating = star)"
      @mouseleave="!readonly && (hoverRating = 0)"
      :class="[
        'transition-all duration-200',
        readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110',
        getStarSize(),
      ]"
    >
      <Star
        :class="[
          'transition-colors duration-200',
          getStarColor(star),
        ]"
        :fill="shouldFillStar(star) ? 'currentColor' : 'none'"
      />
    </button>
    
    <span v-if="showCount && count !== undefined" class="ml-2 text-sm text-gray-600">
      ({{ count }})
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Star } from 'lucide-vue-next'

interface Props {
  modelValue?: number
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
  showCount?: boolean
  count?: number
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 0,
  readonly: false,
  size: 'md',
  showCount: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const hoverRating = ref(0)

const displayRating = computed(() => {
  return hoverRating.value || props.modelValue
})

function setRating(rating: number) {
  emit('update:modelValue', rating)
}

function shouldFillStar(star: number): boolean {
  const rating = displayRating.value
  return star <= rating
}

function getStarColor(star: number): string {
  if (shouldFillStar(star)) {
    return 'text-yellow-400'
  }
  return 'text-gray-300'
}

function getStarSize(): string {
  switch (props.size) {
    case 'sm':
      return 'w-4 h-4'
    case 'lg':
      return 'w-8 h-8'
    default:
      return 'w-5 h-5'
  }
}
</script>
