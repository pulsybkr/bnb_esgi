<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center space-x-4">
            <AppLogo size="medium" color="primary" :clickable="true" />
            <h2 class="text-lg font-semibold text-gray-700">Messages</h2>
          </div>
        </div>
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
        <!-- Liste des conversations -->
        <div class="lg:col-span-1 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div class="p-4 border-b border-gray-200">
            <h3 class="font-semibold text-gray-900">Conversations</h3>
          </div>
          
          <div v-if="isLoadingConversations" class="p-8 text-center">
            <LoadingSpinner size="medium" centered />
            <p class="text-sm text-gray-600 mt-2">Chargement...</p>
          </div>

          <div v-else-if="conversations.length === 0" class="p-8 text-center">
            <MessageSquare class="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p class="text-gray-500">Aucune conversation</p>
          </div>

          <div v-else class="overflow-y-auto max-h-[calc(100vh-16rem)]">
            <button
              v-for="conv in conversations"
              :key="conv.userId"
              @click="selectConversation(conv.userId)"
              :class="[
                'w-full p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors text-left',
                selectedUserId === conv.userId ? 'bg-indigo-50' : ''
              ]"
            >
              <div class="flex items-start space-x-3">
                <!-- Avatar -->
                <UserAvatar 
                  :name="`${conv.user.firstName} ${conv.user.lastName}`"
                  :image-url="conv.user.profilePhoto"
                  size="large"
                />

                <div class="flex-1 min-w-0">
                  <div class="flex justify-between items-start mb-1">
                    <p class="font-medium text-gray-900 truncate">
                      {{ conv.user.firstName }} {{ conv.user.lastName }}
                    </p>
                    <span class="text-xs text-gray-500">
                      {{ formatDate(conv.lastMessage.sentAt) }}
                    </span>
                  </div>
                  <p class="text-sm text-gray-600 truncate">{{ conv.lastMessage.content }}</p>
                  <span v-if="conv.unreadCount > 0" class="inline-block mt-1 px-2 py-0.5 bg-indigo-600 text-white text-xs rounded-full">
                    {{ conv.unreadCount }}
                  </span>
                </div>
              </div>
            </button>
          </div>
        </div>

        <!-- Zone de conversation -->
        <div class="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
          <div v-if="!selectedUserId" class="flex-1 flex items-center justify-center">
            <div class="text-center">
              <MessageSquare class="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p class="text-gray-500">Sélectionnez une conversation pour commencer</p>
            </div>
          </div>

          <template v-else>
            <!-- En-tête conversation -->
            <div class="p-4 border-b border-gray-200 flex items-center space-x-3">
              <UserAvatar 
                v-if="selectedConversation"
                :name="`${selectedConversation.user.firstName} ${selectedConversation.user.lastName}`"
                :image-url="selectedConversation.user.profilePhoto"
                size="medium"
              />
              <div>
                <h3 class="font-semibold text-gray-900">
                  {{ selectedConversation?.user.firstName }} {{ selectedConversation?.user.lastName }}
                </h3>
                <p class="text-sm text-gray-500">{{ selectedConversation?.user.email }}</p>
              </div>
            </div>

            <!-- Messages -->
            <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-4">
              <div v-if="isLoadingMessages" class="text-center py-8">
                <LoadingSpinner size="medium" centered />
              </div>

              <div v-else-if="messages.length === 0" class="text-center py-8">
                <p class="text-gray-500">Aucun message</p>
              </div>

              <div
                v-for="message in messages"
                :key="message.id"
                :class="[
                  'flex',
                  message.senderId === authStore.user?.id ? 'justify-end' : 'justify-start'
                ]"
              >
                <div
                  :class="[
                    'max-w-[70%] rounded-lg px-4 py-2',
                    message.senderId === authStore.user?.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  ]"
                >
                  <p class="text-sm whitespace-pre-wrap">{{ message.content }}</p>
                  <p
                    :class="[
                      'text-xs mt-1',
                      message.senderId === authStore.user?.id ? 'text-indigo-100' : 'text-gray-500'
                    ]"
                  >
                    {{ formatTime(message.sentAt) }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Zone de saisie -->
            <form @submit.prevent="handleSendMessage" class="p-4 border-t border-gray-200">
              <div class="flex space-x-2">
                <input
                  v-model="newMessage"
                  type="text"
                  placeholder="Écrivez votre message..."
                  class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  :disabled="isSendingMessage"
                />
                <button
                  type="submit"
                  :disabled="!newMessage.trim() || isSendingMessage"
                  class="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  <span v-if="isSendingMessage">Envoi...</span>
                  <span v-else>Envoyer</span>
                  <Send class="w-4 h-4" />
                </button>
              </div>
            </form>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { MessageSquare, Send } from 'lucide-vue-next'
import { messageService, type Conversation, type Message } from '@/services/message.service'
import { useAuthStore } from '@/stores/auth'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import UserAvatar from '@/components/UserAvatar.vue'
import AppLogo from '@/components/AppLogo.vue'

const authStore = useAuthStore()

const conversations = ref<Conversation[]>([])
const messages = ref<Message[]>([])
const selectedUserId = ref<string | null>(null)
const newMessage = ref('')

const isLoadingConversations = ref(false)
const isLoadingMessages = ref(false)
const isSendingMessage = ref(false)

const messagesContainer = ref<HTMLElement>()

const selectedConversation = computed(() => {
  return conversations.value.find(c => c.userId === selectedUserId.value)
})

const loadConversations = async () => {
  isLoadingConversations.value = true
  try {
    conversations.value = await messageService.getConversations()
  } catch (err) {
    console.error('Erreur lors du chargement des conversations:', err)
  } finally {
    isLoadingConversations.value = false
  }
}

const selectConversation = async (userId: string) => {
  selectedUserId.value = userId
  await loadMessages(userId)
  
  // Marquer comme lu
  try {
    await messageService.markConversationAsRead(userId)
    // Mettre à jour le compteur local
    const conv = conversations.value.find(c => c.userId === userId)
    if (conv) {
      conv.unreadCount = 0
    }
  } catch (err) {
    console.error('Erreur marquage lu:', err)
  }
}

const loadMessages = async (userId: string) => {
  isLoadingMessages.value = true
  try {
    messages.value = await messageService.getConversation(userId)
    await nextTick()
    scrollToBottom()
  } catch (err) {
    console.error('Erreur lors du chargement des messages:', err)
  } finally {
    isLoadingMessages.value = false
  }
}

const handleSendMessage = async () => {
  if (!newMessage.value.trim() || !selectedUserId.value) return

  isSendingMessage.value = true
  try {
    const message = await messageService.sendMessage({
      receiverId: selectedUserId.value,
      content: newMessage.value.trim(),
      type: 'general',
    })

    messages.value.push(message)
    newMessage.value = ''
    
    await nextTick()
    scrollToBottom()
  } catch (err: any) {
    console.error('Erreur envoi message:', err)
    alert(err.response?.data?.message || 'Impossible d\'envoyer le message')
  } finally {
    isSendingMessage.value = false
  }
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Aujourd\'hui'
  if (diffDays === 1) return 'Hier'
  if (diffDays < 7) return `Il y a ${diffDays} jours`
  
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

const formatTime = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

// Rafraîchir les messages toutes les 10 secondes si une conversation est sélectionnée
let refreshInterval: any
watch(selectedUserId, (newVal) => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
  
  if (newVal) {
    refreshInterval = setInterval(() => {
      loadMessages(newVal)
    }, 10000)
  }
})

onMounted(() => {
  loadConversations()
})
</script>

