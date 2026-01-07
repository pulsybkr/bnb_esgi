import prisma from '../../prisma/client';
import { NotFoundError, ValidationError, AuthorizationError } from '../../types';

export interface CreateMessageData {
    receiverId: string;
    content: string;
    reservationId?: string;
    type?: 'reservation' | 'support' | 'general';
}

export interface MessageFilters {
    isRead?: boolean;
    type?: 'reservation' | 'support' | 'general';
    conversationWith?: string; // userId de l'autre personne
}

export class MessageService {
    /**
     * Envoyer un message
     */
    static async sendMessage(senderId: string, messageData: CreateMessageData): Promise<any> {
        const { receiverId, content, reservationId, type = 'general' } = messageData;

        // Vérifier que le destinataire existe
        const receiver = await prisma.user.findUnique({
            where: { id: receiverId },
        });

        if (!receiver) {
            throw new NotFoundError('Destinataire non trouvé');
        }

        // Vérifier que l'utilisateur n'envoie pas un message à lui-même
        if (senderId === receiverId) {
            throw new ValidationError('Vous ne pouvez pas envoyer un message à vous-même');
        }

        // Si c'est lié à une réservation, vérifier qu'elle existe
        if (reservationId) {
            const reservation = await prisma.reservation.findUnique({
                where: { id: reservationId },
                include: {
                    accommodation: {
                        select: { ownerId: true },
                    },
                },
            });

            if (!reservation) {
                throw new NotFoundError('Réservation non trouvée');
            }

            // Vérifier que l'utilisateur est impliqué dans la réservation
            const isInvolved =
                reservation.tenantId === senderId ||
                reservation.accommodation.ownerId === senderId;

            if (!isInvolved) {
                throw new AuthorizationError('Vous n\'êtes pas autorisé à envoyer un message pour cette réservation');
            }
        }

        // Créer le message
        const message = await prisma.message.create({
            data: {
                senderId,
                receiverId,
                content,
                reservationId,
                type,
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        profilePhoto: true,
                    },
                },
                receiver: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        profilePhoto: true,
                    },
                },
                reservation: {
                    select: {
                        id: true,
                        accommodationId: true,
                        startDate: true,
                        endDate: true,
                        accommodation: {
                            select: {
                                id: true,
                                title: true,
                            },
                        },
                    },
                },
            },
        });

        return message;
    }

    /**
     * Récupérer les messages d'une conversation avec un utilisateur
     */
    static async getConversation(
        userId: string,
        otherUserId: string
    ): Promise<any[]> {
        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: userId, receiverId: otherUserId },
                    { senderId: otherUserId, receiverId: userId },
                ],
            },
            orderBy: { sentAt: 'asc' },
            include: {
                sender: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        profilePhoto: true,
                    },
                },
                receiver: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        profilePhoto: true,
                    },
                },
                reservation: {
                    select: {
                        id: true,
                        accommodationId: true,
                        accommodation: {
                            select: {
                                id: true,
                                title: true,
                            },
                        },
                    },
                },
            },
        });

        return messages;
    }

    /**
     * Récupérer toutes les conversations d'un utilisateur (liste des personnes avec qui il a échangé)
     */
    static async getConversations(userId: string): Promise<any[]> {
        // Récupérer tous les messages où l'utilisateur est impliqué
        const messages = await prisma.message.findMany({
            where: {
                OR: [{ senderId: userId }, { receiverId: userId }],
            },
            orderBy: { sentAt: 'desc' },
            include: {
                sender: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        profilePhoto: true,
                    },
                },
                receiver: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        profilePhoto: true,
                    },
                },
            },
        });

        // Grouper par conversation (userId de l'autre personne)
        const conversationsMap = new Map<string, any>();

        messages.forEach((message: any) => {
            const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;
            const otherUser = message.senderId === userId ? message.receiver : message.sender;

            if (!conversationsMap.has(otherUserId)) {
                conversationsMap.set(otherUserId, {
                    userId: otherUserId,
                    user: otherUser,
                    lastMessage: message,
                    unreadCount: 0,
                });
            }

            // Compter les messages non lus
            if (message.receiverId === userId && !message.isRead) {
                conversationsMap.get(otherUserId)!.unreadCount++;
            }
        });

        return Array.from(conversationsMap.values());
    }

    /**
     * Marquer un message comme lu
     */
    static async markAsRead(messageId: string, userId: string): Promise<any> {
        const message = await prisma.message.findUnique({
            where: { id: messageId },
        });

        if (!message) {
            throw new NotFoundError('Message non trouvé');
        }

        // Seul le destinataire peut marquer comme lu
        if (message.receiverId !== userId) {
            throw new AuthorizationError('Vous n\'êtes pas autorisé à marquer ce message comme lu');
        }

        const updated = await prisma.message.update({
            where: { id: messageId },
            data: {
                isRead: true,
                readAt: new Date(),
            },
        });

        return updated;
    }

    /**
     * Marquer tous les messages d'une conversation comme lus
     */
    static async markConversationAsRead(userId: string, otherUserId: string): Promise<number> {
        const result = await prisma.message.updateMany({
            where: {
                senderId: otherUserId,
                receiverId: userId,
                isRead: false,
            },
            data: {
                isRead: true,
                readAt: new Date(),
            },
        });

        return result.count;
    }

    /**
     * Compter les messages non lus
     */
    static async getUnreadCount(userId: string): Promise<number> {
        const count = await prisma.message.count({
            where: {
                receiverId: userId,
                isRead: false,
            },
        });

        return count;
    }

    /**
     * Récupérer un message par ID
     */
    static async getMessageById(messageId: string, userId: string): Promise<any> {
        const message = await prisma.message.findUnique({
            where: { id: messageId },
            include: {
                sender: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        profilePhoto: true,
                    },
                },
                receiver: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        profilePhoto: true,
                    },
                },
                reservation: true,
            },
        });

        if (!message) {
            throw new NotFoundError('Message non trouvé');
        }

        // Vérifier que l'utilisateur est impliqué
        if (message.senderId !== userId && message.receiverId !== userId) {
            throw new AuthorizationError('Vous n\'êtes pas autorisé à voir ce message');
        }

        return message;
    }
}

