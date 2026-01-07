import { Request, Response, NextFunction } from 'express';
import { ReviewService, CreateReviewData, ReviewFilters } from '../../services/review';
import { AuthenticatedRequest } from '../../types';

export class ReviewController {
    // Create a new review
    static async createReview(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const authReq = req as AuthenticatedRequest;
            const userId = authReq.user?.id;

            if (!userId) {
                res.status(401).json({ error: 'Non authentifié' });
                return;
            }

            const reviewData: CreateReviewData = {
                reservationId: req.body.reservationId,
                rating: req.body.rating,
                comment: req.body.comment,
                detailedRatings: req.body.detailedRatings,
            };

            const review = await ReviewService.createReview(userId, reviewData);

            res.status(201).json(review);
        } catch (error) {
            next(error);
        }
    }

    // Get reviews for an accommodation
    static async getAccommodationReviews(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { id } = req.params;
            const filters: ReviewFilters = {
                page: req.query.page ? parseInt(req.query.page as string) : 1,
                limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
                sortBy: (req.query.sortBy as 'createdAt' | 'rating') || 'createdAt',
                sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
            };

            const result = await ReviewService.getReviewsByAccommodation(id, filters);

            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    // Get a single review by ID
    static async getReviewById(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { id } = req.params;
            const review = await ReviewService.getReviewById(id);

            res.json(review);
        } catch (error) {
            next(error);
        }
    }

    // Check if user can review a reservation
    static async canUserReview(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const authReq = req as AuthenticatedRequest;
            const userId = authReq.user?.id;

            if (!userId) {
                res.status(401).json({ error: 'Non authentifié' });
                return;
            }

            const { reservationId } = req.params;
            const result = await ReviewService.canUserReview(reservationId, userId);

            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    // Get current user's reviews
    static async getMyReviews(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const authReq = req as AuthenticatedRequest;
            const userId = authReq.user?.id;

            if (!userId) {
                res.status(401).json({ error: 'Non authentifié' });
                return;
            }

            const filters: ReviewFilters = {
                page: req.query.page ? parseInt(req.query.page as string) : 1,
                limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
                sortBy: (req.query.sortBy as 'createdAt' | 'rating') || 'createdAt',
                sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
            };

            const result = await ReviewService.getUserReviews(userId, filters);

            res.json(result);
        } catch (error) {
            next(error);
        }
    }
}
