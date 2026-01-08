import { Request, Response } from 'express';
import { pushNotificationService } from '../services/notification';
import { PlateformAppareil } from '@prisma/client';

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Gestion des notifications push
 */

export class NotificationController {
    /**
     * @swagger
     * /notifications/register-token:
     *   post:
     *     summary: Enregistrer un token de notification
     *     tags: [Notifications]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - token
     *               - platform
     *             properties:
     *               token:
     *                 type: string
     *               platform:
     *                 type: string
     *                 enum: [ios, android, web]
     *               deviceId:
     *                 type: string
     *     responses:
     *       201:
     *         description: Token enregistré
     */
    async registerToken(req: Request, res: Response): Promise<void> {
        try {
            // @ts-ignore
            const userId = req.user.id;
            const { token, platform, deviceId } = req.body;

            const result = await pushNotificationService.registerToken({
                userId,
                token,
                platform: platform as PlateformAppareil,
                deviceId,
            });

            res.status(201).json({
                success: true,
                message: 'Token enregistré avec succès',
                data: result,
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }

    /**
     * @swagger
     * /notifications/token/{tokenId}:
     *   delete:
     *     summary: Supprimer un token
     *     tags: [Notifications]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: tokenId
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Token supprimé
     */
    async deleteToken(req: Request, res: Response): Promise<void> {
        try {
            // @ts-ignore
            const userId = req.user.id;
            const { tokenId } = req.params;

            const result = await pushNotificationService.deleteToken(tokenId, userId);

            res.json({
                success: true,
                message: result.message,
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }

    /**
     * @swagger
     * /notifications:
     *   get:
     *     summary: Obtenir l'historique des notifications
     *     tags: [Notifications]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: page
     *         schema:
     *           type: integer
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *     responses:
     *       200:
     *         description: Liste des notifications
     */
    async getNotifications(req: Request, res: Response): Promise<void> {
        try {
            // @ts-ignore
            const userId = req.user.id;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;

            const result = await pushNotificationService.getNotificationHistory(userId, page, limit);

            res.json({
                success: true,
                data: result.notifications,
                pagination: result.pagination,
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    /**
     * @swagger
     * /notifications/test:
     *   post:
     *     summary: Envoyer une notification de test
     *     tags: [Notifications]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               title:
     *                 type: string
     *               body:
     *                 type: string
     *     responses:
     *       200:
     *         description: Notification envoyée
     */
    async sendTestNotification(req: Request, res: Response): Promise<void> {
        try {
            // @ts-ignore
            const userId = req.user.id;
            const { title = 'Test', body = 'Ceci est une notification de test' } = req.body;

            const result = await pushNotificationService.sendNotification({
                userId,
                title,
                body,
            });

            res.json({
                success: true,
                message: result.message,
                data: result,
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }
}

export default new NotificationController();
