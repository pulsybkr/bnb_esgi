import { Request, Response, NextFunction } from 'express';
import { MessageService, CreateMessageData } from '../../services/message';
import { AuthenticatedRequest } from '../../types';

export class MessageController {
    /**
     * Envoyer un message
     */
    static async sendMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const authReq = req as AuthenticatedRequest;

            if (!authReq.user) {
                throw new Error('User not authenticated');
            }

            const messageData: CreateMessageData = req.body;

            const message = await MessageService.sendMessage(authReq.user.id, messageData);

            res.status(201).json({
                success: true,
                message: 'Message envoyé avec succès',
                data: { message },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Récupérer une conversation avec un utilisateur
     */
    static async getConversation(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const authReq = req as AuthenticatedRequest;

            if (!authReq.user) {
                throw new Error('User not authenticated');
            }

            const { userId } = req.params;

            const messages = await MessageService.getConversation(authReq.user.id, userId);

            res.json({
                success: true,
                data: { messages },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Récupérer toutes les conversations
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
     * Marquer un message comme lu
     */
    static async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const authReq = req as AuthenticatedRequest;

            if (!authReq.user) {
                throw new Error('User not authenticated');
            }

            const { id } = req.params;

            const message = await MessageService.markAsRead(id, authReq.user.id);

            res.json({
                success: true,
                message: 'Message marqué comme lu',
                data: { message },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Marquer toute une conversation comme lue
     */
    static async markConversationAsRead(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const authReq = req as AuthenticatedRequest;

            if (!authReq.user) {
                throw new Error('User not authenticated');
            }

            const { userId } = req.params;

            const count = await MessageService.markConversationAsRead(authReq.user.id, userId);

            res.json({
                success: true,
                message: `${count} message(s) marqué(s) comme lu(s)`,
                data: { count },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Compter les messages non lus
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

    /**
     * Récupérer un message par ID
     */
    static async getMessageById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const authReq = req as AuthenticatedRequest;

            if (!authReq.user) {
                throw new Error('User not authenticated');
            }

            const { id } = req.params;

            const message = await MessageService.getMessageById(id, authReq.user.id);

            res.json({
                success: true,
                data: { message },
            });
        } catch (error) {
            next(error);
        }
    }
}

