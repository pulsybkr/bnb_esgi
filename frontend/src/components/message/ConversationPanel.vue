<template>
  <div class="flex flex-col h-full bg-white rounded-lg shadow-lg">
    <!-- Header -->
    <div class="p-4 border-b flex items-center justify-between">
      <div class="flex items-center gap-3">
        <HostAvatar
          :name="otherUser.firstName + ' ' + otherUser.lastName"
          :avatar="otherUser.profilePhoto"
          size="md"
        />
        <div>
          <h3 class="font-semibold">{{ otherUser.firstName }} {{ otherUser.lastName }}</h3>
          <p v-if="reservation" class="text-sm text-gray-600">{{ reservation.accommodation.title }}</p>
        </div>
      </div>
      <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
        <X class="w-5 h-5" />
      </button>
    </div>

    <!-- Messages -->
    <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-2">
      <MessageBubble
        v-for="msg in localMessages"
        :key="msg.id"
        :message="msg"
        :is-own="msg.senderId === currentUserId"
      />
      <div v-if="isTyping" class="text-sm text-gray-500 italic">
        {{ otherUser.firstName }} est en train d'écrire...
      </div>
    </div>

    <!-- Input -->
    <div class="p-4 border-t">
      <div class="flex gap-2">
        <input
          v-model="newMessage"
          @keyup.enter="sendMessage"
          @input="handleTyping"
          type="text"
          placeholder="Écrivez votre message..."
          class="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          @click="sendMessage"
          :disabled="!newMessage.trim()"
          class="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send class="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { X, Send } from 'lucide-vue-next'
import MessageBubble from './MessageBubble.vue'
import HostAvatar from '../ui/HostAvatar.vue'
import { useSocket } from '@/composables/useSocket'
import { useAuthStore } from '@/stores/auth'
import type { Message } from '@/types/message'

const props = defineProps<{
  messages: Message[]
  otherUser: {
    id: string
    firstName: string
    lastName: string
    profilePhoto: string | null
  }
  reservation?: {
    id: string
    accommodation: {
      title: string
    }
  }
  currentUserId: string
  typing?: boolean
}>()

const emit = defineEmits<{
  close: []
  send: [content: string]
  typing: []
  stopTyping: []
}>()

const authStore = useAuthStore()
const socket = useSocket()
const newMessage = ref('')
const messagesContainer = ref<HTMLElement>()
const localMessages = ref<Message[]>([...props.messages])
const isTyping = ref(false)
let typingTimeout: NodeJS.Timeout | null = null

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const sendMessage = () => {
  if (newMessage.value.trim()) {
    const content = newMessage.value.trim()
    
    // Ajouter le message localement immédiatement pour feedback instantané
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      senderId: props.currentUserId,
      receiverId: props.otherUser.id,
      content,
      isRead: false,
      type: props.reservation ? 'reservation' : 'general',
      sentAt: new Date(),
      createdAt: new Date(),
      reservationId: props.reservation?.id || null,
    }
    
    localMessages.value.push(tempMessage)
    scrollToBottom()
    
    // Envoyer via Socket.IO pour temps réel
    if (socket.isConnected.value) {
      socket.sendMessage({
        reservationId: props.reservation?.id,
        receiverId: props.otherUser.id,
        message: tempMessage
      })
    }
    
    // Envoyer via API
    emit('send', content)
    newMessage.value = ''
    
    if (props.reservation?.id) {
      socket.emitStopTyping(props.reservation.id, props.currentUserId)
    }
  }
}

const handleTyping = () => {
  if (props.reservation?.id) {
    socket.emitTyping(props.reservation.id, props.currentUserId)
  }
  
  if (typingTimeout) {
    clearTimeout(typingTimeout)
  }
  
  typingTimeout = setTimeout(() => {
    if (props.reservation?.id) {
      socket.emitStopTyping(props.reservation.id, props.currentUserId)
    }
  }, 2000)
}

// Écouter les nouveaux messages en temps réel
const handleNewMessage = (message: Message) => {
  // Vérifier que le message est pour cette conversation
  if (message.senderId === props.otherUser.id || message.receiverId === props.otherUser.id) {
    // Éviter les doublons
    const exists = localMessages.value.some(m => m.id === message.id)
    if (!exists) {
      localMessages.value.push(message)
      scrollToBottom()
    }
  }
}

// Écouter les indicateurs de frappe
const handleUserTyping = (userId: string) => {
  if (userId === props.otherUser.id) {
    isTyping.value = true
  }
}

const handleUserStoppedTyping = (userId: string) => {
  if (userId === props.otherUser.id) {
    isTyping.value = false
  }
}

// Synchroniser avec les props
watch(() => props.messages, (newMessages) => {
  localMessages.value = [...newMessages]
  scrollToBottom()
}, { deep: true })

onMounted(() => {
  // Connecter Socket.IO si pas déjà connecté
  if (authStore.user?.id && !socket.isConnected.value) {
    socket.connect(authStore.user.id)
  }
  
  // Rejoindre la conversation si c'est une réservation
  if (props.reservation?.id) {
    socket.joinReservation(props.reservation.id)
  }
  
  // Écouter les événements
  socket.onNewMessage(handleNewMessage)
  socket.onUserTyping(handleUserTyping)
  socket.onUserStoppedTyping(handleUserStoppedTyping)
  
  scrollToBottom()
})

onUnmounted(() => {
  // Quitter la conversation
  if (props.reservation?.id) {
    socket.leaveReservation(props.reservation.id)
  }
  
  // Nettoyer les écouteurs
  socket.offNewMessage()
})
</script>
