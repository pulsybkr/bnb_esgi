import { Router } from 'express';
import { ReviewController } from '../controllers/review';
import { authenticateToken } from '../middlewares';

const router = Router();

// Create a review (protected)
router.post('/', authenticateToken, ReviewController.createReview);

// Get reviews for an accommodation (public)
router.get('/accommodation/:id', ReviewController.getAccommodationReviews);

// Get a single review by ID (public)
router.get('/:id', ReviewController.getReviewById);

// Check if user can review a reservation (protected)
router.get('/can-review/:reservationId', authenticateToken, ReviewController.canUserReview);

// Get current user's reviews (protected)
router.get('/my-reviews', authenticateToken, ReviewController.getMyReviews);

export default router;
