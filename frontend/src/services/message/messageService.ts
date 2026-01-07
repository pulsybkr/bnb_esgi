import api from '../api'
import type { Message, Conversation, SendMessageData, MessageFilters } from '@/types/message'

export const messageService = {
    /**
     * Send a message
     */
    async sendMessage(data: SendMessageData): Promise<Message> {
        const response = await api.post('/messages', data)
        return response.data.data.message
    },

    /**
     * Get all conversations
     */
    async getConversations(): Promise<Conversation[]> {
        const response = await api.get('/messages/conversations')
        return response.data.data.conversations
    },

    /**
     * Get messages for a reservation
     */
    async getReservationMessages(reservationId: string): Promise<Message[]> {
        const response = await api.get(`/messages/reservation/${reservationId}`)
        return response.data.data.messages
    },

    /**
     * Mark messages as read
     */
    async markAsRead(data: { messageIds?: string[]; reservationId?: string }): Promise<number> {
        const response = await api.put('/messages/mark-read', data)
        return response.data.data.count
    },

    /**
     * Get unread message count
     */
    async getUnreadCount(): Promise<number> {
        const response = await api.get('/messages/unread-count')
        return response.data.data.unreadCount
    },
}
