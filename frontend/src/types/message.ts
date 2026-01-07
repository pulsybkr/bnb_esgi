/**
 * Types pour les messages (synchronisés avec le backend)
 */

export type MessageType = 'reservation' | 'support' | 'general'

export interface User {
    id: string
    firstName: string
    lastName: string
    profilePhoto?: string | null
}

export interface Message {
    id: string
    senderId: string
    receiverId: string
    reservationId?: string | null
    content: string
    isRead: boolean
    readAt?: Date | null
    type: MessageType
    sentAt: Date
    createdAt: Date
    sender?: User
    receiver?: User
}

export interface Conversation {
    reservationId: string | null
    otherUser: {
        id: string
        firstName: string
        lastName: string
        profilePhoto: string | null
    }
    lastMessage: {
        id: string
        content: string
        sentAt: Date
        isRead: boolean
        senderId: string
    }
    unreadCount: number
    reservation?: {
        id: string
        startDate: Date
        endDate: Date
        status: string
        accommodation: {
            id: string
            title: string
        }
    }
}

export interface SendMessageData {
    receiverId: string
    reservationId?: string
    content: string
    type?: MessageType
}

export interface MessageFilters {
    reservationId?: string
    unreadOnly?: boolean
    page?: number
    limit?: number
}
