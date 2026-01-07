import { Request, Response, NextFunction } from 'express';
import { ReservationService, CreateReservationData, ReservationFilters } from '../../services/reservation';
import { AuthenticatedRequest } from '../../types';

export class ReservationController {
    /**
     * Create a new reservation request
     */
    static async createReservation(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const authReq = req as AuthenticatedRequest;

            if (!authReq.user) {
                throw new Error('User not authenticated');
            }

            const reservationData: CreateReservationData = {
                ...req.body,
                startDate: new Date(req.body.startDate),
                endDate: new Date(req.body.endDate),
            };

            const reservation = await ReservationService.createReservation(authReq.user.id, reservationData);

            res.status(201).json({
                success: true,
                message: 'Reservation request created successfully',
                data: { reservation },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get my reservations (tenant)
     */
    static async getMyReservations(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const authReq = req as AuthenticatedRequest;

            if (!authReq.user) {
                throw new Error('User not authenticated');
            }

            const filters: ReservationFilters = {
                status: req.query.status as any,
                startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
                endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
                page: req.query.page ? parseInt(req.query.page as string) : 1,
                limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
                sortBy: (req.query.sortBy as any) || 'createdAt',
                sortOrder: (req.query.sortOrder as any) || 'desc',
            };

            const result = await ReservationService.getReservationsByTenant(authReq.user.id, filters);

            res.json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get reservations for owner's properties
     */
    static async getOwnerReservations(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const authReq = req as AuthenticatedRequest;

            if (!authReq.user) {
                throw new Error('User not authenticated');
            }

            const filters: ReservationFilters = {
                status: req.query.status as any,
                startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
                endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
                page: req.query.page ? parseInt(req.query.page as string) : 1,
                limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
                sortBy: (req.query.sortBy as any) || 'createdAt',
                sortOrder: (req.query.sortOrder as any) || 'desc',
            };

            const result = await ReservationService.getReservationsByOwner(authReq.user.id, filters);

            res.json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get reservations for a specific property
     */
    static async getPropertyReservations(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const filters: ReservationFilters = {
                status: req.query.status as any,
                startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
                endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
                sortBy: (req.query.sortBy as any) || 'createdAt',
                sortOrder: (req.query.sortOrder as any) || 'desc',
            };

            const reservations = await ReservationService.getReservationsByProperty(id, filters);

            res.json({
                success: true,
                data: { reservations },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get single reservation by ID
     */
    static async getReservationById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const reservation = await ReservationService.getReservationById(id);

            res.json({
                success: true,
                data: { reservation },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Accept a reservation (owner only)
     */
    static async acceptReservation(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const reservation = await ReservationService.acceptReservation(id);

            res.json({
                success: true,
                message: 'Reservation accepted successfully',
                data: { reservation },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Confirm payment for accepted reservation
     */
    static async confirmPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const reservation = await ReservationService.confirmPayment(id);

            res.json({
                success: true,
                message: 'Payment confirmed successfully',
                data: { reservation },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Reject a reservation (owner only)
     */
    static async rejectReservation(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const reservation = await ReservationService.rejectReservation(id);

            res.json({
                success: true,
                message: 'Reservation rejected successfully',
                data: { reservation },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Cancel a reservation
     */
    static async cancelReservation(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const { cancellationReason } = req.body;

            const reservation = await ReservationService.cancelReservation(id, cancellationReason);

            res.json({
                success: true,
                message: 'Reservation cancelled successfully',
                data: { reservation },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get owner statistics
     */
    static async getOwnerStatistics(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const authReq = req as AuthenticatedRequest;

            if (!authReq.user) {
                throw new Error('User not authenticated');
            }

            const statistics = await ReservationService.getOwnerStatistics(authReq.user.id);

            res.json({
                success: true,
                data: { statistics },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update negotiated price for a reservation
     */
    static async updateNegotiatedPrice(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const authReq = req as AuthenticatedRequest;

            if (!authReq.user) {
                throw new Error('User not authenticated');
            }

            const { id } = req.params;
            const { newPrice } = req.body;

            if (typeof newPrice !== 'number' || newPrice <= 0) {
                throw new Error('Invalid price provided');
            }

            const reservation = await ReservationService.updateNegotiatedPrice(
                id,
                newPrice,
                authReq.user.id
            );

            res.json({
                success: true,
                message: 'Price updated successfully',
                data: { reservation },
            });
        } catch (error) {
            next(error);
        }
    }
}
