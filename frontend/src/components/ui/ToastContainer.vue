<template>
  <ToastProvider>
    <ToastRoot
      v-for="toast in toasts"
      :key="toast.id"
      :class="[
        'fixed bottom-4 right-4 z-[100] w-full max-w-sm rounded-xl shadow-2xl p-4 animate-slide-up',
        toastClasses[toast.type]
      ]"
      :duration="toast.duration"
      @update:open="(open) => !open && removeToast(toast.id)"
    >
      <div class="flex items-start gap-3">
        <div class="flex-shrink-0">
          <component :is="toastIcons[toast.type]" class="w-5 h-5" />
        </div>
        <div class="flex-1 min-w-0">
          <ToastTitle class="font-semibold text-sm mb-1">
            {{ toast.title }}
          </ToastTitle>
          <ToastDescription v-if="toast.description" class="text-sm opacity-90">
            {{ toast.description }}
          </ToastDescription>
        </div>
        <ToastClose class="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity">
          <X class="w-4 h-4" />
        </ToastClose>
      </div>
    </ToastRoot>
    <ToastViewport class="fixed bottom-0 right-0 flex flex-col p-4 gap-2 w-full max-w-sm z-[100]" />
  </ToastProvider>
</template>

<script setup lang="ts">
import { ToastProvider, ToastRoot, ToastTitle, ToastDescription, ToastClose, ToastViewport } from 'radix-vue'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-vue-next'
import { useToast } from '@/composables/useToast'

const { toasts, removeToast } = useToast()

const toastClasses = {
  success: 'bg-green-50 border-2 border-green-200 text-green-900',
  error: 'bg-red-50 border-2 border-red-200 text-red-900',
  warning: 'bg-yellow-50 border-2 border-yellow-200 text-yellow-900',
  info: 'bg-blue-50 border-2 border-blue-200 text-blue-900'
}

const toastIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info
}
</script>
