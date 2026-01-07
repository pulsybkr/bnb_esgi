import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333';

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

export interface Review {
    id: string;
    reservationId: string;
    authorId: string;
    targetId: string;
    targetType: string;
    rating: number;
    comment?: string;
    detailedRatings?: {
        cleanliness?: number;
        communication?: number;
        location?: number;
        value?: number;
    };
    ownerResponse?: string;
    responseDate?: string;
    status: string;
    publishedAt: string;
    createdAt: string;
    author: {
        id: string;
        firstName: string;
        lastName: string;
        profilePhoto?: string;
    };
    reservation?: {
        id: string;
        startDate: string;
        endDate: string;
        accommodation?: {
            id: string;
            title: string;
            city: string;
            country: string;
        };
    };
}

export interface ReviewsResponse {
    reviews: Review[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    averageRating: number;
    ratingDistribution: {
        [key: number]: number;
    };
}

export const reviewService = {
    async createReview(data: CreateReviewData): Promise<Review> {
        const response = await axios.post(`${API_URL}/reviews`, data, {
            withCredentials: true,
        });
        return response.data;
    },

    async getAccommodationReviews(
        accommodationId: string,
        page = 1,
        limit = 10,
        sortBy: 'createdAt' | 'rating' = 'createdAt',
        sortOrder: 'asc' | 'desc' = 'desc'
    ): Promise<ReviewsResponse> {
        const response = await axios.get(
            `${API_URL}/reviews/accommodation/${accommodationId}`,
            {
                params: { page, limit, sortBy, sortOrder },
                withCredentials: true,
            }
        );
        return response.data;
    },

    async getReviewById(reviewId: string): Promise<Review> {
        const response = await axios.get(`${API_URL}/reviews/${reviewId}`, {
            withCredentials: true,
        });
        return response.data;
    },

    async canUserReview(
        reservationId: string
    ): Promise<{ canReview: boolean; reason?: string; reservation?: any }> {
        const response = await axios.get(
            `${API_URL}/reviews/can-review/${reservationId}`,
            {
                withCredentials: true,
            }
        );
        return response.data;
    },

    async getMyReviews(
        page = 1,
        limit = 10
    ): Promise<{
        reviews: Review[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        const response = await axios.get(`${API_URL}/reviews/my-reviews`, {
            params: { page, limit },
            withCredentials: true,
        });
        return response.data;
    },
};
