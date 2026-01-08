import { PrismaClient, StatutLogement, StatutUtilisateur } from '@prisma/client';

const prisma = new PrismaClient();

export class ModerationService {
    /**
     * Obtenir les annonces à modérer
     */
    async getAnnouncementsToModerate(filters: {
        status?: StatutLogement;
        page?: number;
        limit?: number;
    }) {
        const { status, page = 1, limit = 20 } = filters;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (status) {
            where.status = status;
        }

        const [logements, total] = await Promise.all([
            prisma.logement.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    owner: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            status: true,
                        },
                    },
                    photos: true,
                    _count: {
                        select: {
                            reservations: true,
                        },
                    },
                },
            }),
            prisma.logement.count({ where }),
        ]);

        return {
            logements,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Approuver une annonce
     */
    async approveAnnouncement(logementId: string) {
        return await prisma.logement.update({
            where: { id: logementId },
            data: { status: StatutLogement.actif },
        });
    }

    /**
     * Suspendre une annonce
     */
    async suspendAnnouncement(logementId: string, reason?: string) {
        // Mettre à jour le logement
        const logement = await prisma.logement.update({
            where: { id: logementId },
            data: { status: StatutLogement.suspendu },
            include: { owner: true },
        });

        // TODO: Envoyer une notification au propriétaire
        // await notificationService.sendNotification({
        //   userId: logement.ownerId,
        //   title: 'Annonce suspendue',
        //   body: `Votre annonce "${logement.title}" a été suspendue. ${reason || ''}`,
        // });

        return logement;
    }

    /**
     * Obtenir les signalements
     */
    async getReports(filters: {
        status?: string;
        contentType?: string;
        page?: number;
        limit?: number;
    }) {
        const { status, contentType, page = 1, limit = 20 } = filters;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (status) {
            where.status = status;
        }
        if (contentType) {
            where.contentType = contentType;
        }

        const [signalements, total] = await Promise.all([
            prisma.signalement.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                    moderator: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                        },
                    },
                },
            }),
            prisma.signalement.count({ where }),
        ]);

        return {
            signalements,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Traiter un signalement
     */
    async processReport(reportId: string, moderatorId: string, status: string, decision: string) {
        return await prisma.signalement.update({
            where: { id: reportId },
            data: {
                status: status as any,
                moderatorId,
                decision,
                processedAt: new Date(),
            },
        });
    }

    /**
     * Obtenir les utilisateurs à modérer
     */
    async getUsersToModerate(filters: {
        status?: StatutUtilisateur;
        verificationStatus?: boolean;
        page?: number;
        limit?: number;
    }) {
        const { status, verificationStatus, page = 1, limit = 20 } = filters;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (status) {
            where.status = status;
        }
        if (verificationStatus !== undefined) {
            where.isVerified = verificationStatus;
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { registrationDate: 'desc' },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    phone: true,
                    userType: true,
                    status: true,
                    isVerified: true,
                    verificationLevel: true,
                    registrationDate: true,
                    lastLogin: true,
                    _count: {
                        select: {
                            logements: true,
                            reservations: true,
                            signalementsCrees: true,
                        },
                    },
                },
            }),
            prisma.user.count({ where }),
        ]);

        return {
            users,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Suspendre un utilisateur
     */
    async suspendUser(userId: string, reason?: string) {
        return await prisma.user.update({
            where: { id: userId },
            data: { status: StatutUtilisateur.suspendu },
        });
    }

    /**
     * Activer un utilisateur
     */
    async activateUser(userId: string) {
        return await prisma.user.update({
            where: { id: userId },
            data: { status: StatutUtilisateur.actif },
        });
    }
}

export default new ModerationService();
