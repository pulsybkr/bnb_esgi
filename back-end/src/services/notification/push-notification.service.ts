import { PrismaClient, PlateformAppareil } from '@prisma/client';

const prisma = new PrismaClient();

export interface RegisterTokenData {
    userId: string;
    token: string;
    platform: PlateformAppareil;
    deviceId?: string;
}

export interface SendNotificationData {
    userId: string;
    title: string;
    body: string;
    data?: any;
}

export class PushNotificationService {
    /**
     * Enregistrer un token de notification push
     */
    async registerToken(data: RegisterTokenData) {
        const { userId, token, platform, deviceId } = data;

        // Vérifier si le token existe déjà
        const existingToken = await prisma.pushNotificationToken.findUnique({
            where: { token },
        });

        if (existingToken) {
            // Mettre à jour le token existant
            return await prisma.pushNotificationToken.update({
                where: { token },
                data: {
                    userId,
                    platform,
                    deviceId,
                    isActive: true,
                    updatedAt: new Date(),
                },
            });
        }

        // Créer un nouveau token
        return await prisma.pushNotificationToken.create({
            data: {
                userId,
                token,
                platform,
                deviceId,
                isActive: true,
            },
        });
    }

    /**
     * Supprimer un token
     */
    async deleteToken(tokenId: string, userId: string) {
        const token = await prisma.pushNotificationToken.findUnique({
            where: { id: tokenId },
        });

        if (!token) {
            throw new Error('Token non trouvé');
        }

        if (token.userId !== userId) {
            throw new Error('Non autorisé à supprimer ce token');
        }

        await prisma.pushNotificationToken.delete({
            where: { id: tokenId },
        });

        return { success: true, message: 'Token supprimé' };
    }

    /**
     * Désactiver un token
     */
    async deactivateToken(token: string) {
        return await prisma.pushNotificationToken.update({
            where: { token },
            data: { isActive: false },
        });
    }

    /**
     * Obtenir tous les tokens actifs d'un utilisateur
     */
    async getUserTokens(userId: string) {
        return await prisma.pushNotificationToken.findMany({
            where: {
                userId,
                isActive: true,
            },
        });
    }

    /**
     * Envoyer une notification push (simulation - à intégrer avec Firebase)
     * NOTE: Pour une vraie implémentation, utilisez Firebase Admin SDK
     */
    async sendNotification(data: SendNotificationData) {
        const { userId, title, body, data: notificationData } = data;

        // Récupérer les tokens actifs de l'utilisateur
        const tokens = await this.getUserTokens(userId);

        if (tokens.length === 0) {
            throw new Error('Aucun token de notification trouvé pour cet utilisateur');
        }

        // Logger la notification
        const log = await prisma.pushNotificationLog.create({
            data: {
                userId,
                title,
                body,
                data: notificationData,
                sentAt: new Date(),
            },
        });

        // TODO: Intégrer Firebase Cloud Messaging ici
        // Exemple avec Firebase Admin SDK:
        /*
        const admin = require('firebase-admin');
        const messages = tokens.map(token => ({
          notification: { title, body },
          data: notificationData,
          token: token.token,
        }));
        
        const response = await admin.messaging().sendAll(messages);
        */

        // Pour l'instant, on simule l'envoi réussi
        await prisma.pushNotificationLog.update({
            where: { id: log.id },
            data: { deliveredAt: new Date() },
        });

        return {
            success: true,
            message: `Notification envoyée à ${tokens.length} appareil(s)`,
            tokensCount: tokens.length,
            logId: log.id,
        };
    }

    /**
     * Envoyer une notification à plusieurs utilisateurs
     */
    async sendBulkNotification(userIds: string[], title: string, body: string, data?: any) {
        const results = await Promise.allSettled(
            userIds.map(userId =>
                this.sendNotification({ userId, title, body, data })
            )
        );

        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;

        return {
            total: userIds.length,
            successful,
            failed,
        };
    }

    /**
     * Obtenir l'historique des notifications d'un utilisateur
     */
    async getNotificationHistory(userId: string, page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;

        const [notifications, total] = await Promise.all([
            prisma.pushNotificationLog.findMany({
                where: { userId },
                skip,
                take: limit,
                orderBy: { sentAt: 'desc' },
            }),
            prisma.pushNotificationLog.count({ where: { userId } }),
        ]);

        return {
            notifications,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Nettoyer les tokens inactifs (à exécuter périodiquement)
     */
    async cleanupInactiveTokens(daysInactive: number = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysInactive);

        const result = await prisma.pushNotificationToken.deleteMany({
            where: {
                isActive: false,
                updatedAt: {
                    lt: cutoffDate,
                },
            },
        });

        return {
            deleted: result.count,
            message: `${result.count} token(s) inactif(s) supprimé(s)`,
        };
    }
}

export default new PushNotificationService();
