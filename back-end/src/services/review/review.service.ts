import prisma from '../../prisma/client';
import { NotFoundError, ValidationError, AuthorizationError } from '../../types';
import { Prisma } from '@prisma/client';

export interface CreateReviewData {
    reservationId: string;
    rating: number;
    comment?: string;
    detailedRatings?: {
        cleanliness?: number;
        communication?: number;
        location?: number;
        value?: number;
    };
}

export interface ReviewFilters {
    page?: number;
    limit?: number;
    sortBy?: 'createdAt' | 'rating';
    sortOrder?: 'asc' | 'desc';
}

export class ReviewService {
    // Create a review for a completed stay
    static async createReview(
        authorId: string,
        reviewData: CreateReviewData
    ): Promise<any> {
        const { reservationId, rating, comment, detailedRatings } = reviewData;

        // Validate rating
        if (rating < 1 || rating > 5) {
            throw new ValidationError('La note doit être entre 1 et 5 étoiles');
        }

        // Get reservation with accommodation info
        const reservation = await prisma.reservation.findUnique({
            where: { id: reservationId },
            include: {
                accommodation: true,
                tenant: true,
            },
        });

        if (!reservation) {
            throw new NotFoundError('Réservation non trouvée');
        }

        // Check if user is the tenant of this reservation
        if (reservation.tenantId !== authorId) {
            throw new AuthorizationError(
                'Vous ne pouvez laisser un avis que pour vos propres réservations'
            );
        }

        // Check if reservation is completed
        if (reservation.status !== 'terminee') {
            throw new ValidationError(
                'Vous ne pouvez laisser un avis que pour les séjours terminés'
            );
        }

        // Check if review already exists for this reservation
        const existingReview = await prisma.avis.findFirst({
            where: {
                reservationId,
                authorId,
            },
        });

        if (existingReview) {
            throw new ValidationError('Vous avez déjà laissé un avis pour ce séjour');
        }

        // Validate detailed ratings if provided
        if (detailedRatings) {
            const ratings = Object.values(detailedRatings);
            for (const r of ratings) {
                if (r !== undefined && (r < 1 || r > 5)) {
                    throw new ValidationError(
                        'Toutes les notes détaillées doivent être entre 1 et 5'
                    );
                }
            }
        }

        // Create the review
        const review = await prisma.avis.create({
            data: {
                reservationId,
                authorId,
                targetId: reservation.accommodationId,
                targetType: 'logement',
                rating,
                comment: comment || null,
                detailedRatings: detailedRatings ? detailedRatings : Prisma.JsonNull,
                status: 'publie',
                publishedAt: new Date(),
            },
            include: {
                author: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        profilePhoto: true,
                    },
                },
                reservation: {
                    include: {
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

        // Update accommodation rating
        await this.updateAccommodationRating(reservation.accommodationId);

        return review;
    }

    // Get reviews for an accommodation
    static async getReviewsByAccommodation(
        accommodationId: string,
        filters: ReviewFilters = {}
    ): Promise<{
        reviews: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        averageRating: number;
        ratingDistribution: { [key: number]: number };
    }> {
        const page = filters.page || 1;
        const limit = filters.limit || 10;
        const sortBy = filters.sortBy || 'createdAt';
        const sortOrder = filters.sortOrder || 'desc';
        const skip = (page - 1) * limit;

        // Check if accommodation exists
        const accommodation = await prisma.logement.findUnique({
            where: { id: accommodationId },
        });

        if (!accommodation) {
            throw new NotFoundError('Logement non trouvé');
        }

        // Build where clause
        const where: Prisma.AvisWhereInput = {
            targetId: accommodationId,
            targetType: 'logement',
            status: 'publie',
        };

        // Get total count
        const total = await prisma.avis.count({ where });

        // Get reviews
        const reviews = await prisma.avis.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                [sortBy]: sortOrder,
            },
            include: {
                author: {
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
                    },
                },
            },
        });

        // Calculate rating distribution
        const allReviews = await prisma.avis.findMany({
            where,
            select: { rating: true },
        });

        const ratingDistribution: { [key: number]: number } = {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
        };

        allReviews.forEach((review) => {
            ratingDistribution[review.rating]++;
        });

        const totalPages = Math.ceil(total / limit);
        const averageRating = accommodation.averageRating || 0;

        return {
            reviews,
            total,
            page,
            limit,
            totalPages,
            averageRating,
            ratingDistribution,
        };
    }

    // Get a single review by ID
    static async getReviewById(reviewId: string): Promise<any> {
        const review = await prisma.avis.findUnique({
            where: { id: reviewId },
            include: {
                author: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        profilePhoto: true,
                    },
                },
                reservation: {
                    include: {
                        accommodation: {
                            select: {
                                id: true,
                                title: true,
                                city: true,
                                country: true,
                            },
                        },
                    },
                },
            },
        });

        if (!review) {
            throw new NotFoundError('Avis non trouvé');
        }

        return review;
    }

    // Update accommodation average rating
    static async updateAccommodationRating(
        accommodationId: string
    ): Promise<void> {
        // Get all published reviews for this accommodation
        const reviews = await prisma.avis.findMany({
            where: {
                targetId: accommodationId,
                targetType: 'logement',
                status: 'publie',
            },
            select: {
                rating: true,
            },
        });

        const reviewCount = reviews.length;
        const averageRating =
            reviewCount > 0
                ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
                : 0;

        // Update accommodation
        await prisma.logement.update({
            where: { id: accommodationId },
            data: {
                averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
                reviewCount,
            },
        });
    }

    // Check if a user can review a reservation
    static async canUserReview(
        reservationId: string,
        userId: string
    ): Promise<{
        canReview: boolean;
        reason?: string;
        reservation?: any;
    }> {
        const reservation = await prisma.reservation.findUnique({
            where: { id: reservationId },
            include: {
                accommodation: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
            },
        });

        if (!reservation) {
            return {
                canReview: false,
                reason: 'Réservation non trouvée',
            };
        }

        // Check if user is the tenant
        if (reservation.tenantId !== userId) {
            return {
                canReview: false,
                reason: 'Cette réservation ne vous appartient pas',
            };
        }

        // Check if reservation is completed
        if (reservation.status !== 'terminee') {
            return {
                canReview: false,
                reason: 'Le séjour doit être terminé pour laisser un avis',
            };
        }

        // Check if review already exists
        const existingReview = await prisma.avis.findFirst({
            where: {
                reservationId,
                authorId: userId,
            },
        });

        if (existingReview) {
            return {
                canReview: false,
                reason: 'Vous avez déjà laissé un avis pour ce séjour',
            };
        }

        return {
            canReview: true,
            reservation,
        };
    }

    // Get all reviews by a user
    static async getUserReviews(
        userId: string,
        filters: ReviewFilters = {}
    ): Promise<{
        reviews: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        const page = filters.page || 1;
        const limit = filters.limit || 10;
        const sortBy = filters.sortBy || 'createdAt';
        const sortOrder = filters.sortOrder || 'desc';
        const skip = (page - 1) * limit;

        const where: Prisma.AvisWhereInput = {
            authorId: userId,
            targetType: 'logement',
        };

        const total = await prisma.avis.count({ where });

        const reviews = await prisma.avis.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                [sortBy]: sortOrder,
            },
            include: {
                reservation: {
                    include: {
                        accommodation: {
                            select: {
                                id: true,
                                title: true,
                                city: true,
                                country: true,
                                photos: {
                                    where: { isMain: true },
                                    take: 1,
                                },
                            },
                        },
                    },
                },
            },
        });

        const totalPages = Math.ceil(total / limit);

        return {
            reviews,
            total,
            page,
            limit,
            totalPages,
        };
    }
}
