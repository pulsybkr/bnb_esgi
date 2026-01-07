<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        @click.self="handleBackdropClick"
      >
        <Transition
          enter-active-class="transition-all duration-200"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition-all duration-200"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="modelValue"
            :class="[
              'bg-white rounded-xl shadow-2xl overflow-hidden',
              maxWidthClass,
              maxHeightClass
            ]"
          >
            <!-- Header -->
            <div v-if="title || $slots.header" class="flex items-center justify-between p-6 border-b border-gray-200">
              <slot name="header">
                <h3 class="text-xl font-semibold text-gray-900">{{ title }}</h3>
              </slot>
              <button
                v-if="showClose"
                @click="close"
                class="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Fermer"
              >
                <X class="w-5 h-5" />
              </button>
            </div>

            <!-- Body -->
            <div :class="['p-6', bodyClass]">
              <slot></slot>
            </div>

            <!-- Footer -->
            <div v-if="$slots.footer" class="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
              <slot name="footer"></slot>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { X } from 'lucide-vue-next'

interface Props {
  modelValue: boolean
  title?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  maxHeight?: 'auto' | 'screen'
  showClose?: boolean
  closeOnBackdrop?: boolean
  bodyClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  maxWidth: 'md',
  maxHeight: 'auto',
  showClose: true,
  closeOnBackdrop: true,
  bodyClass: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'close': []
}>()

const maxWidthClass = computed(() => {
  const widths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full'
  }
  return `${widths[props.maxWidth]} w-full`
})

const maxHeightClass = computed(() => {
  return props.maxHeight === 'screen' ? 'max-h-[90vh] overflow-y-auto' : ''
})

const close = () => {
  emit('update:modelValue', false)
  emit('close')
}

const handleBackdropClick = () => {
  if (props.closeOnBackdrop) {
    close()
  }
}
</script>

