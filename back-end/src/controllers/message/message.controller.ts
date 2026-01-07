import { Request, Response, NextFunction } from 'express';
import { MessageService, SendMessageData } from '../../services/message';
import { AuthenticatedRequest } from '../../types';

export class MessageController {
    /**
     * Send a message
     */
    static async sendMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const authReq = req as AuthenticatedRequest;

            if (!authReq.user) {
                throw new Error('User not authenticated');
            }

            const messageData: SendMessageData = {
                receiverId: req.body.receiverId,
                reservationId: req.body.reservationId,
                content: req.body.content,
                type: req.body.type || 'general',
            };

            const message = await MessageService.sendMessage(authReq.user.id, messageData);

            res.status(201).json({
                success: true,
                message: 'Message sent successfully',
                data: { message },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get all conversations for the authenticated user
     */
    static async getConversations(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const authReq = req as AuthenticatedRequest;

            if (!authReq.user) {
                throw new Error('User not authenticated');
            }

            const conversations = await MessageService.getConversations(authReq.user.id);

            res.json({
                success: true,
                data: { conversations },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get messages for a specific reservation
     */
    static async getReservationMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const authReq = req as AuthenticatedRequest;

            if (!authReq.user) {
                throw new Error('User not authenticated');
            }

            const { reservationId } = req.params;
            const messages = await MessageService.getReservationMessages(reservationId, authReq.user.id);

            res.json({
                success: true,
                data: { messages },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Mark messages as read
     */
    static async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const authReq = req as AuthenticatedRequest;

            if (!authReq.user) {
                throw new Error('User not authenticated');
            }

            const { messageIds, reservationId } = req.body;
            const count = await MessageService.markAsRead(authReq.user.id, messageIds, reservationId);

            res.json({
                success: true,
                message: `${count} message(s) marked as read`,
                data: { count },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get unread message count
     */
    static async getUnreadCount(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const authReq = req as AuthenticatedRequest;

            if (!authReq.user) {
                throw new Error('User not authenticated');
            }

            const count = await MessageService.getUnreadCount(authReq.user.id);

            res.json({
                success: true,
                data: { unreadCount: count },
            });
        } catch (error) {
            next(error);
        }
    }
}
