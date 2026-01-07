<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-6xl mx-auto px-4">
      <h1 class="text-3xl font-bold mb-8">Mes conversations</h1>

      <div v-if="loading" class="text-center py-12">
        <p class="text-gray-600">Chargement...</p>
      </div>

      <div v-else-if="conversations.length === 0" class="bg-white rounded-lg shadow p-12 text-center">
        <MessageCircle class="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p class="text-gray-600">Aucune conversation</p>
      </div>

      <div v-else class="grid grid-cols-1 gap-4">
        <div
          v-for="conversation in conversations"
          :key="conversation.reservationId || conversation.otherUser.id"
          class="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer p-6"
          @click="openConversation(conversation)"
        >
          <div class="flex items-start gap-4">
            <HostAvatar
              :name="conversation.otherUser.firstName + ' ' + conversation.otherUser.lastName"
              :avatar="conversation.otherUser.profilePhoto"
              size="lg"
            />
            <div class="flex-1">
              <div class="flex justify-between items-start mb-2">
                <div>
                  <h3 class="font-semibold">
                    {{ conversation.otherUser.firstName }} {{ conversation.otherUser.lastName }}
                  </h3>
                  <p v-if="conversation.reservation" class="text-sm text-gray-600">
                    {{ conversation.reservation.accommodation.title }}
                  </p>
                </div>
                <span v-if="conversation.unreadCount > 0" class="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                  {{ conversation.unreadCount }}
                </span>
              </div>
              <p class="text-sm text-gray-700 line-clamp-2">{{ conversation.lastMessage.content }}</p>
              <p class="text-xs text-gray-500 mt-1">{{ formatDate(conversation.lastMessage.sentAt) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Conversation Panel -->
    <div v-if="showConversation" class="fixed bottom-4 right-4 w-96 h-[600px] shadow-2xl rounded-lg overflow-hidden">
      <ConversationPanel
        :messages="messages"
        :other-user="activeConversation!.otherUser"
        :reservation="activeConversation?.reservation"
        :current-user-id="currentUserId"
        @close="showConversation = false"
        @send="sendMessage"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { MessageCircle } from 'lucide-vue-next'
import { messageService } from '@/services/message'
import ConversationPanel from '@/components/message/ConversationPanel.vue'
import HostAvatar from '@/components/ui/HostAvatar.vue'
import type { Conversation, Message } from '@/types/message'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const loading = ref(false)
const conversations = ref<Conversation[]>([])
const showConversation = ref(false)
const activeConversation = ref<Conversation | null>(null)
const messages = ref<Message[]>([])
const currentUserId = ref(authStore.user?.id || '')

const loadConversations = async () => {
  loading.value = true
  try {
    conversations.value = await messageService.getConversations()
  } catch (error) {
    console.error('Erreur chargement conversations:', error)
  } finally {
    loading.value = false
  }
}

const openConversation = async (conversation: Conversation) => {
  activeConversation.value = conversation
  showConversation.value = true
  
  if (conversation.reservationId) {
    try {
      messages.value = await messageService.getReservationMessages(conversation.reservationId)
    } catch (error) {
      console.error('Erreur chargement messages:', error)
    }
  }
}

const sendMessage = async (content: string) => {
  if (!activeConversation.value) return
  
  try {
    await messageService.sendMessage({
      receiverId: activeConversation.value.otherUser.id,
      reservationId: activeConversation.value.reservationId || undefined,
      content,
      type: activeConversation.value.reservationId ? 'reservation' : 'general'
    })
    
    if (activeConversation.value.reservationId) {
      messages.value = await messageService.getReservationMessages(activeConversation.value.reservationId)
    }
  } catch (error) {
    console.error('Erreur envoi message:', error)
  }
}

const formatDate = (date: Date) => {
  const now = new Date()
  const messageDate = new Date(date)
  const diffMs = now.getTime() - messageDate.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffMins < 1) return 'À l\'instant'
  if (diffMins < 60) return `Il y a ${diffMins} min`
  if (diffHours < 24) return `Il y a ${diffHours}h`
  if (diffDays < 7) return `Il y a ${diffDays}j`
  
  return new Intl.DateTimeFormat('fr-FR', { 
    day: 'numeric', 
    month: 'short' 
  }).format(messageDate)
}

onMounted(() => {
  loadConversations()
})
</script>
