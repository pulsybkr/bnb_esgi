import prisma from '../../prisma/client';
import { NotFoundError } from '../../types';

export class FavoriService {
    /**
     * Add an accommodation to user's favorites
     */
    static async addFavorite(userId: string, accommodationId: string) {
        // Check if accommodation exists
        const accommodation = await prisma.logement.findUnique({
            where: { id: accommodationId }
        });

        if (!accommodation) {
            throw new NotFoundError('Accommodation not found');
        }

        // Create favorite (upsert-like behavior via unique constraint handling)
        // prisma.favori.upsert could also work, but we have a unique constraint on [userId, accommodationId]
        return await prisma.favori.upsert({
            where: {
                userId_accommodationId: {
                    userId,
                    accommodationId
                }
            },
            update: {}, // No change if already exists
            create: {
                userId,
                accommodationId
            },
            include: {
                accommodation: {
                    include: {
                        photos: {
                            where: { isMain: true },
                            take: 1
                        }
                    }
                }
            }
        });
    }

    /**
     * Remove an accommodation from user's favorites
     */
    static async removeFavorite(userId: string, accommodationId: string) {
        try {
            await prisma.favori.delete({
                where: {
                    userId_accommodationId: {
                        userId,
                        accommodationId
                    }
                }
            });
            return true;
        } catch (error) {
            // If it doesn't exist, we consider it "removed" anyway
            return true;
        }
    }

    /**
     * Get all favorites for a user
     */
    static async getUserFavorites(userId: string) {
        const favorites = await prisma.favori.findMany({
            where: { userId },
            include: {
                accommodation: {
                    include: {
                        photos: {
                            where: { isMain: true },
                            take: 1
                        },
                        owner: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                addedAt: 'desc'
            }
        });

        return favorites.map(f => f.accommodation);
    }
}
