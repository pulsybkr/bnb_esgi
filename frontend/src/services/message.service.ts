import apiClient from './api'

export interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  isRead: boolean
  readAt: string | null
  type: 'reservation' | 'support' | 'general'
  sentAt: string
  createdAt: string
  sender?: {
    id: string
    firstName: string
    lastName: string
    profilePhoto?: string | null
  }
  receiver?: {
    id: string
    firstName: string
    lastName: string
    profilePhoto?: string | null
  }
  reservation?: {
    id: string
    accommodationId: string
    accommodation?: {
      id: string
      title: string
    }
  }
}

export interface Conversation {
  userId: string
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    profilePhoto?: string | null
  }
  lastMessage: Message
  unreadCount: number
}

export interface SendMessagePayload {
  receiverId: string
  content: string
  reservationId?: string
  type?: 'reservation' | 'support' | 'general'
}

export const messageService = {
  /**
   * Envoyer un message
   */
  async sendMessage(payload: SendMessagePayload): Promise<Message> {
    const response = await apiClient.post('/messages', payload)
    return response.data?.data?.message
  },

  /**
   * Récupérer toutes les conversations
   */
  async getConversations(): Promise<Conversation[]> {
    const response = await apiClient.get('/messages/conversations')
    return response.data?.data?.conversations || []
  },

  /**
   * Récupérer les messages d'une conversation
   */
  async getConversation(userId: string): Promise<Message[]> {
    const response = await apiClient.get(`/messages/conversation/${userId}`)
    return response.data?.data?.messages || []
  },

  /**
   * Marquer un message comme lu
   */
  async markAsRead(messageId: string): Promise<Message> {
    const response = await apiClient.patch(`/messages/${messageId}/mark-read`)
    return response.data?.data?.message
  },

  /**
   * Marquer toute une conversation comme lue
   */
  async markConversationAsRead(userId: string): Promise<number> {
    const response = await apiClient.patch(`/messages/conversation/${userId}/mark-read`)
    return response.data?.data?.count || 0
  },

  /**
   * Récupérer le nombre de messages non lus
   */
  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get('/messages/unread-count')
    return response.data?.data?.unreadCount || 0
  },

  /**
   * Récupérer un message par ID
   */
  async getMessageById(messageId: string): Promise<Message> {
    const response = await apiClient.get(`/messages/${messageId}`)
    return response.data?.data?.message
  },
}

