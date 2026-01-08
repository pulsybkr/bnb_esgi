import { PrismaClient, StatutVerification, TypeDocument } from '@prisma/client';

const prisma = new PrismaClient();

export interface SubmitVerificationData {
    userId: string;
    documentType: TypeDocument;
    documentNumber?: string;
    documentUrl: string;
    selfieUrl?: string;
}

export interface ReviewVerificationData {
    verificationId: string;
    reviewerId: string;
    approved: boolean;
    rejectionReason?: string;
}

export class VerificationService {
    /**
     * Soumettre une demande de vérification d'identité
     */
    async submitVerification(data: SubmitVerificationData) {
        // Vérifier s'il existe déjà une vérification en attente
        const existingPending = await prisma.identityVerification.findFirst({
            where: {
                userId: data.userId,
                status: StatutVerification.en_attente,
            },
        });

        if (existingPending) {
            throw new Error('Une demande de vérification est déjà en attente');
        }

        // Créer la nouvelle vérification
        const verification = await prisma.identityVerification.create({
            data: {
                userId: data.userId,
                documentType: data.documentType,
                documentNumber: data.documentNumber,
                documentUrl: data.documentUrl,
                selfieUrl: data.selfieUrl,
                status: StatutVerification.en_attente,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });

        return verification;
    }

    /**
     * Obtenir le statut de vérification d'un utilisateur
     */
    async getVerificationStatus(userId: string) {
        const verification = await prisma.identityVerification.findFirst({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: {
                reviewer: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });

        return verification;
    }

    /**
     * Obtenir l'historique des vérifications d'un utilisateur
     */
    async getVerificationHistory(userId: string) {
        const verifications = await prisma.identityVerification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: {
                reviewer: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });

        return verifications;
    }

    /**
     * Obtenir toutes les demandes de vérification (admin)
     */
    async getAllVerifications(filters: {
        status?: StatutVerification;
        page?: number;
        limit?: number;
    }) {
        const { status, page = 1, limit = 20 } = filters;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (status) {
            where.status = status;
        }

        const [verifications, total] = await Promise.all([
            prisma.identityVerification.findMany({
                where,
                skip,
                take: limit,
                orderBy: { submittedAt: 'desc' },
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            phone: true,
                        },
                    },
                    reviewer: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                        },
                    },
                },
            }),
            prisma.identityVerification.count({ where }),
        ]);

        return {
            verifications,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Obtenir une vérification par ID (admin)
     */
    async getVerificationById(verificationId: string) {
        const verification = await prisma.identityVerification.findUnique({
            where: { id: verificationId },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                        profilePhoto: true,
                    },
                },
                reviewer: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });

        if (!verification) {
            throw new Error('Vérification non trouvée');
        }

        return verification;
    }

    /**
     * Approuver une vérification (admin)
     */
    async approveVerification(data: ReviewVerificationData) {
        const { verificationId, reviewerId } = data;

        // Mettre à jour la vérification
        const verification = await prisma.identityVerification.update({
            where: { id: verificationId },
            data: {
                status: StatutVerification.approuve,
                reviewedBy: reviewerId,
                reviewedAt: new Date(),
            },
            include: {
                user: true,
            },
        });

        // Mettre à jour le statut de l'utilisateur
        await prisma.user.update({
            where: { id: verification.userId },
            data: {
                isVerified: true,
                verificationLevel: 1,
            },
        });

        return verification;
    }

    /**
     * Rejeter une vérification (admin)
     */
    async rejectVerification(data: ReviewVerificationData) {
        const { verificationId, reviewerId, rejectionReason } = data;

        if (!rejectionReason) {
            throw new Error('Le motif de rejet est requis');
        }

        const verification = await prisma.identityVerification.update({
            where: { id: verificationId },
            data: {
                status: StatutVerification.rejete,
                reviewedBy: reviewerId,
                reviewedAt: new Date(),
                rejectionReason,
            },
            include: {
                user: true,
            },
        });

        return verification;
    }

    /**
     * Obtenir les statistiques de vérification (admin)
     */
    async getVerificationStats() {
        const [total, pending, approved, rejected] = await Promise.all([
            prisma.identityVerification.count(),
            prisma.identityVerification.count({
                where: { status: StatutVerification.en_attente },
            }),
            prisma.identityVerification.count({
                where: { status: StatutVerification.approuve },
            }),
            prisma.identityVerification.count({
                where: { status: StatutVerification.rejete },
            }),
        ]);

        return {
            total,
            pending,
            approved,
            rejected,
            approvalRate: total > 0 ? ((approved / total) * 100).toFixed(2) : 0,
        };
    }
}

export default new VerificationService();
