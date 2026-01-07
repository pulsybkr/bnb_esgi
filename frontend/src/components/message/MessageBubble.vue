<template>
  <div
    class="flex mb-4"
    :class="isOwn ? 'justify-end' : 'justify-start'"
  >
    <div
      class="max-w-[70%] rounded-lg px-4 py-2"
      :class="isOwn ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-900'"
    >
      <p class="text-sm whitespace-pre-wrap">{{ message.content }}</p>
      <div class="flex items-center justify-end gap-2 mt-1">
        <span class="text-xs opacity-70">{{ formatTime(message.sentAt) }}</span>
        <Check
          v-if="isOwn && message.isRead"
          class="w-3 h-3"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Check } from 'lucide-vue-next'
import type { Message } from '@/types/message'

const props = defineProps<{
  message: Message
  isOwn: boolean
}>()

const formatTime = (date: Date) => {
  return new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}
</script>
