import prisma from '../../prisma/client';
import { NotFoundError, ValidationError, AuthorizationError } from '../../types';
import { Prisma } from '@prisma/client';

export interface SendMessageData {
    receiverId: string;
    reservationId?: string;
    content: string;
    type?: 'reservation' | 'support' | 'general';
}

export interface MessageFilters {
    reservationId?: string;
    unreadOnly?: boolean;
    page?: number;
    limit?: number;
}

export interface Conversation {
    reservationId: string | null;
    otherUser: {
        id: string;
        firstName: string;
        lastName: string;
        profilePhoto: string | null;
    };
    lastMessage: {
        id: string;
        content: string;
        sentAt: Date;
        isRead: boolean;
        senderId: string;
    };
    unreadCount: number;
    reservation?: {
        id: string;
        startDate: Date;
        endDate: Date;
        status: string;
        accommodation: {
            id: string;
            title: string;
        };
    };
}

export class MessageService {
    /**
     * Send a message
     */
    static async sendMessage(
        senderId: string,
        data: SendMessageData
    ): Promise<any> {
        const { receiverId, reservationId, content, type = 'general' } = data;

        // Validate receiver exists
        const receiver = await prisma.user.findUnique({
            where: { id: receiverId },
        });

        if (!receiver) {
            throw new NotFoundError('Receiver not found');
        }

        // If linked to a reservation, validate access
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
                throw new NotFoundError('Reservation not found');
            }

            // Only tenant or owner can send messages on a reservation
            const isAuthorized =
                senderId === reservation.tenantId ||
                senderId === reservation.accommodation.ownerId;

            if (!isAuthorized) {
                throw new AuthorizationError(
                    'You are not authorized to send messages on this reservation'
                );
            }
        }

        // Create the message
        const message = await prisma.message.create({
            data: {
                senderId,
                receiverId,
                reservationId,
                content,
                type,
            },
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
            },
        });

        return message;
    }

    /**
     * Get messages for a conversation (between two users or for a reservation)
     */
    static async getMessages(
        userId: string,
        filters: MessageFilters = {}
    ): Promise<{ messages: any[]; total: number; page: number; limit: number; totalPages: number }> {
        const { reservationId, unreadOnly = false, page = 1, limit = 50 } = filters;

        const where: any = {
            OR: [{ senderId: userId }, { receiverId: userId }],
        };

        if (reservationId) {
            where.reservationId = reservationId;
        }

        if (unreadOnly) {
            where.receiverId = userId;
            where.isRead = false;
        }

        const skip = (page - 1) * limit;
        const total = await prisma.message.count({ where });

        const messages = await prisma.message.findMany({
            where,
            skip,
            take: limit,
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
            },
        });

        return {
            messages,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    /**
     * Get all conversations for a user
     */
    static async getConversations(userId: string): Promise<Conversation[]> {
        // Get all messages involving the user, grouped by reservation or other user
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
                        startDate: true,
                        endDate: true,
                        status: true,
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

        // Group by conversation (reservation or direct user)
        const conversationsMap = new Map<string, Conversation>();

        for (const message of messages) {
            const otherUser =
                message.senderId === userId ? message.receiver : message.sender;
            const key = message.reservationId || `direct-${otherUser.id}`;

            if (!conversationsMap.has(key)) {
                // Count unread messages for this conversation
                const unreadCount = await prisma.message.count({
                    where: {
                        receiverId: userId,
                        isRead: false,
                        ...(message.reservationId
                            ? { reservationId: message.reservationId }
                            : {
                                senderId: otherUser.id,
                                reservationId: null,
                            }),
                    },
                });

                conversationsMap.set(key, {
                    reservationId: message.reservationId,
                    otherUser: {
                        id: otherUser.id,
                        firstName: otherUser.firstName,
                        lastName: otherUser.lastName,
                        profilePhoto: otherUser.profilePhoto,
                    },
                    lastMessage: {
                        id: message.id,
                        content: message.content,
                        sentAt: message.sentAt,
                        isRead: message.isRead,
                        senderId: message.senderId,
                    },
                    unreadCount,
                    reservation: message.reservation || undefined,
                });
            }
        }

        return Array.from(conversationsMap.values());
    }

    /**
     * Mark messages as read
     */
    static async markAsRead(
        userId: string,
        messageIds?: string[],
        reservationId?: string
    ): Promise<number> {
        const where: any = {
            receiverId: userId,
            isRead: false,
        };

        if (messageIds && messageIds.length > 0) {
            where.id = { in: messageIds };
        }

        if (reservationId) {
            where.reservationId = reservationId;
        }

        const result = await prisma.message.updateMany({
            where,
            data: {
                isRead: true,
                readAt: new Date(),
            },
        });

        return result.count;
    }

    /**
     * Get unread message count
     */
    static async getUnreadCount(userId: string): Promise<number> {
        return prisma.message.count({
            where: {
                receiverId: userId,
                isRead: false,
            },
        });
    }

    /**
     * Get messages for a specific reservation
     */
    static async getReservationMessages(
        reservationId: string,
        userId: string
    ): Promise<any[]> {
        // Verify user has access to this reservation
        const reservation = await prisma.reservation.findUnique({
            where: { id: reservationId },
            include: {
                accommodation: {
                    select: { ownerId: true },
                },
            },
        });

        if (!reservation) {
            throw new NotFoundError('Reservation not found');
        }

        const isAuthorized =
            userId === reservation.tenantId ||
            userId === reservation.accommodation.ownerId;

        if (!isAuthorized) {
            throw new AuthorizationError(
                'You are not authorized to view messages for this reservation'
            );
        }

        const messages = await prisma.message.findMany({
            where: { reservationId },
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
            },
        });

        // Mark messages as read
        await this.markAsRead(userId, undefined, reservationId);

        return messages;
    }
}
