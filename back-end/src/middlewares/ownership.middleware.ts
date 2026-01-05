import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, AuthorizationError, NotFoundError } from '../types';
import prisma from '../prisma/client';


/**
 * Middleware to verify that the authenticated user owns the property
 * or is an admin. Admins can access any property.
 */
export const verifyPropertyOwnership = async (
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

        // Admin can access any property
        if (user.userType === 'admin') {
            next();
            return;
        }

        // Check if property exists and get owner
        const property = await prisma.logement.findUnique({
            where: { id },
            select: { ownerId: true },
        });

        if (!property) {
            throw new NotFoundError('Property not found');
        }

        // Check if user is the owner
        if (property.ownerId !== user.id) {
            throw new AuthorizationError('You do not have permission to access this property');
        }

        next();
    } catch (error) {
        next(error);
    }
};

/**
 * Middleware to verify that the authenticated user has owner or admin role
 * Used for creating properties
 */
export const requireOwnerRole = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): void => {
    try {
        const user = req.user;

        if (!user) {
            throw new AuthorizationError('Authentication required');
        }

        // Only proprietaire and admin can create properties
        if (user.userType !== 'proprietaire' && user.userType !== 'admin') {
            throw new AuthorizationError(
                'Only property owners and administrators can create properties. Please update your account type.'
            );
        }

        next();
    } catch (error) {
        next(error);
    }
};
