import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, AuthorizationError, NotFoundError } from '../types';
import prisma from '../prisma/client';

/**
 * Verify that the user has access to a reservation
 * (either as the tenant or as the property owner)
 */
export const verifyReservationAccess = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;
        const user = req.user;

        if (!user) {
            throw new AuthorizationError('Authentication required');
        }

        // Admin can access any reservation
        if (user.userType === 'admin') {
            next();
            return;
        }

        // Get reservation with property owner info
        const reservation = await prisma.reservation.findUnique({
            where: { id },
            include: {
                accommodation: {
                    select: { ownerId: true },
                },
            },
        });

        if (!reservation) {
            throw new NotFoundError('Reservation not found');
        }

        // Check if user is the tenant or the property owner
        if (reservation.tenantId !== user.id && reservation.accommodation.ownerId !== user.id) {
            throw new AuthorizationError('You do not have permission to access this reservation');
        }

        next();
    } catch (error) {
        next(error);
    }
};

/**
 * Verify that the user is the property owner for a reservation
 * (for accept/reject actions)
 */
export const verifyPropertyOwnerForReservation = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;
        const user = req.user;

        if (!user) {
            throw new AuthorizationError('Authentication required');
        }

        // Admin can perform any action
        if (user.userType === 'admin') {
            next();
            return;
        }

        // Get reservation with property owner info
        const reservation = await prisma.reservation.findUnique({
            where: { id },
            include: {
                accommodation: {
                    select: { ownerId: true },
                },
            },
        });

        if (!reservation) {
            throw new NotFoundError('Reservation not found');
        }

        // Check if user is the property owner
        if (reservation.accommodation.ownerId !== user.id) {
            throw new AuthorizationError('Only the property owner can perform this action');
        }

        next();
    } catch (error) {
        next(error);
    }
};

/**
 * Verify that the user is the tenant for a reservation
 */
export const verifyReservationTenant = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;
        const user = req.user;

        if (!user) {
            throw new AuthorizationError('Authentication required');
        }

        // Admin can perform any action
        if (user.userType === 'admin') {
            next();
            return;
        }

        // Get reservation
        const reservation = await prisma.reservation.findUnique({
            where: { id },
            select: { tenantId: true },
        });

        if (!reservation) {
            throw new NotFoundError('Reservation not found');
        }

        // Check if user is the tenant
        if (reservation.tenantId !== user.id) {
            throw new AuthorizationError('Only the tenant can perform this action');
        }

        next();
    } catch (error) {
        next(error);
    }
};
