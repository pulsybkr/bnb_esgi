<template>
  <div class="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
    <button
      @click="decrement"
      :disabled="modelValue <= min"
      class="px-4 py-2 text-african-green hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      type="button"
    >
      <Minus class="w-4 h-4" />
    </button>
    
    <div class="px-4 py-2 min-w-[60px] text-center font-medium text-gray-900">
      {{ modelValue }}
    </div>
    
    <button
      @click="increment"
      :disabled="max !== undefined && modelValue >= max"
      class="px-4 py-2 text-african-green hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      type="button"
    >
      <Plus class="w-4 h-4" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { Minus, Plus } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  modelValue: number
  min?: number
  max?: number
  step?: number
}>(), {
  min: 0,
  step: 1
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const increment = () => {
  const newValue = props.modelValue + props.step
  if (props.max === undefined || newValue <= props.max) {
    emit('update:modelValue', newValue)
  }
}

const decrement = () => {
  const newValue = props.modelValue - props.step
  if (newValue >= props.min) {
    emit('update:modelValue', newValue)
  }
}
</script>
