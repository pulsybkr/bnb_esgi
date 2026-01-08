import prisma from '../../prisma/client';
import { NotFoundError, ValidationError, AuthorizationError } from '../../types';
import { Prisma } from '@prisma/client';
import { DisponibiliteService } from '../disponibilite';

export interface CreateReservationData {
    accommodationId: string;
    startDate: Date;
    endDate: Date;
    guestCount: number;
    tenantMessage?: string;
}

export interface ReservationFilters {
    status?: 'en_attente' | 'confirmee' | 'annulee' | 'en_cours' | 'terminee';
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
    sortBy?: 'createdAt' | 'startDate' | 'endDate' | 'totalAmount';
    sortOrder?: 'asc' | 'desc';
}

export class ReservationService {
    /**
     * Create a new reservation request
     */
    static async createReservation(
        tenantId: string,
        reservationData: CreateReservationData
    ): Promise<any> {
        const { accommodationId, startDate, endDate, guestCount, tenantMessage } = reservationData;

        // Check if property exists
        const property = await prisma.logement.findUnique({
            where: { id: accommodationId },
            select: {
                id: true,
                ownerId: true,
                pricePerNight: true,
                capacity: true,
                status: true,
                bookingMode: true,
            },
        });

        if (!property) {
            throw new NotFoundError('Property not found');
        }

        // Check if property is active
        if (property.status !== 'actif') {
            throw new ValidationError('This property is not available for booking');
        }

        // Check if guest count exceeds capacity
        if (guestCount > property.capacity) {
            throw new ValidationError(
                `Guest count (${guestCount}) exceeds property capacity (${property.capacity})`
            );
        }

        // Check if user is trying to book their own property
        if (property.ownerId === tenantId) {
            throw new ValidationError('You cannot book your own property');
        }

        // Check for availability conflicts
        const isAvailable = await this.checkAvailability(accommodationId, startDate, endDate);

        if (!isAvailable) {
            throw new ValidationError(
                'The selected dates are not available. Please choose different dates.'
            );
        }

        // Calculate total amount
        const totalAmount = await this.calculateTotalAmount(
            accommodationId,
            startDate,
            endDate
        );

        // Determine initial status based on booking mode
        const isInstantBooking = property.bookingMode === 'instant';
        const initialStatus = isInstantBooking ? 'confirmee' : 'en_attente';
        const pricePerNight = parseFloat(property.pricePerNight.toString());

        // Create reservation
        const reservation = await prisma.reservation.create({
            data: {
                accommodationId,
                tenantId,
                startDate,
                endDate,
                guestCount,
                totalAmount: new Prisma.Decimal(totalAmount),
                pricePerNight: new Prisma.Decimal(pricePerNight),
                status: initialStatus,
                tenantMessage,
            },
            include: {
                accommodation: {
                    select: {
                        id: true,
                        title: true,
                        address: true,
                        city: true,
                        pricePerNight: true,
                        owner: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                            },
                        },
                    },
                },
                tenant: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                    },
                },
            },
        });

        // If instant booking, auto-block availability
        if (isInstantBooking) {
            await DisponibiliteService.autoBlockOnReservation(
                accommodationId,
                startDate,
                endDate,
                totalAmount
            );
        }

        return reservation;
    }

    /**
     * Get reservation by ID
     */
    static async getReservationById(id: string): Promise<any> {
        const reservation = await prisma.reservation.findUnique({
            where: { id },
            include: {
                accommodation: {
                    select: {
                        id: true,
                        title: true,
                        address: true,
                        city: true,
                        country: true,
                        type: true,
                        pricePerNight: true,
                        owner: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                                phone: true,
                                profilePhoto: true,
                            },
                        },
                        photos: {
                            where: { isMain: true },
                            take: 1,
                        },
                    },
                },
                tenant: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                        profilePhoto: true,
                    },
                },
                payments: true,
            },
        });

        if (!reservation) {
            throw new NotFoundError('Reservation not found');
        }

        return reservation;
    }

    /**
     * Get reservations by tenant
     */
    static async getReservationsByTenant(
        tenantId: string,
        filters: ReservationFilters = {}
    ): Promise<{ reservations: any[]; total: number; page: number; limit: number; totalPages: number }> {
        const {
            status,
            startDate,
            endDate,
            page = 1,
            limit = 20,
            sortBy = 'createdAt',
            sortOrder = 'desc',
        } = filters;

        const where: any = { tenantId };

        if (status) {
            where.status = status;
        }

        if (startDate || endDate) {
            where.AND = [];
            if (startDate) {
                where.AND.push({ endDate: { gte: startDate } });
            }
            if (endDate) {
                where.AND.push({ startDate: { lte: endDate } });
            }
        }

        const skip = (page - 1) * limit;
        const total = await prisma.reservation.count({ where });

        const reservations = await prisma.reservation.findMany({
            where,
            skip,
            take: limit,
            orderBy: { [sortBy]: sortOrder },
            include: {
                accommodation: {
                    select: {
                        id: true,
                        title: true,
                        address: true,
                        city: true,
                        type: true,
                        photos: {
                            where: { isMain: true },
                            take: 1,
                        },
                        owner: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                                profilePhoto: true,
                            },
                        },
                    },
                },
            },
        });

        return {
            reservations,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    /**
     * Get reservations for a property
     */
    static async getReservationsByProperty(
        accommodationId: string,
        filters: ReservationFilters = {}
    ): Promise<any[]> {
        const {
            status,
            startDate,
            endDate,
            sortBy = 'createdAt',
            sortOrder = 'desc',
        } = filters;

        const where: any = { accommodationId };

        if (status) {
            where.status = status;
        }

        if (startDate || endDate) {
            where.AND = [];
            if (startDate) {
                where.AND.push({ endDate: { gte: startDate } });
            }
            if (endDate) {
                where.AND.push({ startDate: { lte: endDate } });
            }
        }

        const reservations = await prisma.reservation.findMany({
            where,
            orderBy: { [sortBy]: sortOrder },
            include: {
                tenant: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                        profilePhoto: true,
                    },
                },
                payments: true,
            },
        });

        return reservations;
    }

    /**
     * Get all reservations for owner's properties
     */
    static async getReservationsByOwner(
        ownerId: string,
        filters: ReservationFilters = {}
    ): Promise<{ reservations: any[]; total: number; page: number; limit: number; totalPages: number }> {
        const {
            status,
            startDate,
            endDate,
            page = 1,
            limit = 20,
            sortBy = 'createdAt',
            sortOrder = 'desc',
        } = filters;

        const where: any = {
            accommodation: {
                ownerId,
            },
        };

        if (status) {
            where.status = status;
        }

        if (startDate || endDate) {
            where.AND = [];
            if (startDate) {
                where.AND.push({ endDate: { gte: startDate } });
            }
            if (endDate) {
                where.AND.push({ startDate: { lte: endDate } });
            }
        }

        const skip = (page - 1) * limit;
        const total = await prisma.reservation.count({ where });

        const reservations = await prisma.reservation.findMany({
            where,
            skip,
            take: limit,
            orderBy: { [sortBy]: sortOrder },
            include: {
                accommodation: {
                    select: {
                        id: true,
                        title: true,
                        address: true,
                        city: true,
                        type: true,
                        photos: {
                            where: { isMain: true },
                            take: 1,
                        },
                    },
                },
                tenant: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                        profilePhoto: true,
                    },
                },
                payments: true,
            },
        });

        return {
            reservations,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    /**
     * Accept a reservation (owner only)
     */
    static async acceptReservation(id: string): Promise<any> {
        const reservation = await prisma.reservation.findUnique({
            where: { id },
            include: { accommodation: true },
        });

        if (!reservation) {
            throw new NotFoundError('Reservation not found');
        }

        if (reservation.status !== 'en_attente') {
            throw new ValidationError(`Cannot accept reservation with status: ${reservation.status}`);
        }

        // Update reservation status to acceptee (awaiting payment)
        const updated = await prisma.reservation.update({
            where: { id },
            data: { status: 'acceptee' },
            include: {
                accommodation: {
                    select: {
                        id: true,
                        title: true,
                        owner: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                },
                tenant: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });

        // Auto-block availability
        await DisponibiliteService.autoBlockOnReservation(
            reservation.accommodationId,
            reservation.startDate,
            reservation.endDate,
            parseFloat(reservation.totalAmount.toString())
        );

        return updated;
    }

    /**
     * Confirm payment for an accepted reservation
     */
    static async confirmPayment(id: string): Promise<any> {
        const reservation = await prisma.reservation.findUnique({
            where: { id },
        });

        if (!reservation) {
            throw new NotFoundError('Reservation not found');
        }

        if (reservation.status !== 'acceptee') {
            throw new ValidationError(
                `Cannot confirm payment for reservation with status: ${reservation.status}`
            );
        }

        // Update reservation status to confirmed
        const updated = await prisma.reservation.update({
            where: { id },
            data: { status: 'confirmee' },
            include: {
                accommodation: {
                    select: {
                        id: true,
                        title: true,
                        owner: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                            },
                        },
                    },
                },
                tenant: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });

        return updated;
    }

    /**
     * Reject a reservation (owner only)
     */
    static async rejectReservation(id: string): Promise<any> {
        const reservation = await prisma.reservation.findUnique({
            where: { id },
        });

        if (!reservation) {
            throw new NotFoundError('Reservation not found');
        }

        if (reservation.status !== 'en_attente') {
            throw new ValidationError(
                `Cannot reject reservation with status: ${reservation.status}`
            );
        }

        const updated = await prisma.reservation.update({
            where: { id },
            data: {
                status: 'annulee',
                cancellationReason: 'Rejected by owner',
                cancellationDate: new Date(),
            },
            include: {
                accommodation: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
                tenant: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });

        return updated;
    }

    /**
     * Cancel a reservation
     */
    static async cancelReservation(
        id: string,
        cancellationReason: string
    ): Promise<any> {
        const reservation = await prisma.reservation.findUnique({
            where: { id },
        });

        if (!reservation) {
            throw new NotFoundError('Reservation not found');
        }

        if (reservation.status === 'annulee') {
            throw new ValidationError('Reservation is already cancelled');
        }

        if (reservation.status === 'terminee') {
            throw new ValidationError('Cannot cancel a completed reservation');
        }

        const wasConfirmed = reservation.status === 'confirmee' || reservation.status === 'en_cours';

        const updated = await prisma.reservation.update({
            where: { id },
            data: {
                status: 'annulee',
                cancellationReason,
                cancellationDate: new Date(),
            },
            include: {
                accommodation: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
                tenant: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });

        // If reservation was confirmed, free the availability
        if (wasConfirmed) {
            await DisponibiliteService.autoFreeOnCancellation(
                reservation.accommodationId,
                reservation.startDate,
                reservation.endDate
            );
        }

        return updated;
    }

    /**
     * Calculate total amount for a reservation
     */
    static async calculateTotalAmount(
        accommodationId: string,
        startDate: Date,
        endDate: Date
    ): Promise<number> {
        const property = await prisma.logement.findUnique({
            where: { id: accommodationId },
            select: { pricePerNight: true },
        });

        if (!property) {
            throw new NotFoundError('Property not found');
        }

        // Calculate number of nights
        const nights = Math.ceil(
            (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Check for custom pricing in availability periods
        const availabilities = await prisma.disponibilite.findMany({
            where: {
                accommodationId,
                customPrice: { not: null },
                AND: [
                    { startDate: { lte: endDate } },
                    { endDate: { gte: startDate } },
                ],
            },
        });

        // For simplicity, use base price (can be enhanced to use custom pricing)
        const pricePerNight = parseFloat(property.pricePerNight.toString());
        const totalAmount = nights * pricePerNight;

        return totalAmount;
    }

    /**
     * Check if dates are available for booking
     */
    static async checkAvailability(
        accommodationId: string,
        startDate: Date,
        endDate: Date
    ): Promise<boolean> {
        // Check for conflicting confirmed reservations
        const conflictingReservations = await prisma.reservation.count({
            where: {
                accommodationId,
                status: { in: ['confirmee', 'en_cours'] },
                AND: [
                    { startDate: { lt: endDate } },
                    { endDate: { gt: startDate } },
                ],
            },
        });

        if (conflictingReservations > 0) {
            return false;
        }

        // Check for blocked availability periods
        const blockedPeriods = await prisma.disponibilite.count({
            where: {
                accommodationId,
                status: { in: ['reserve', 'bloque'] },
                AND: [
                    { startDate: { lt: endDate } },
                    { endDate: { gt: startDate } },
                ],
            },
        });

        return blockedPeriods === 0;
    }

    /**
     * Get statistics for owner
     */
    static async getOwnerStatistics(ownerId: string): Promise<any> {
        const reservations = await prisma.reservation.findMany({
            where: {
                accommodation: {
                    ownerId,
                },
            },
            select: {
                status: true,
                totalAmount: true,
                createdAt: true,
            },
        });

        const totalReservations = reservations.length;
        const pendingReservations = reservations.filter((r) => r.status === 'en_attente').length;
        const confirmedReservations = reservations.filter((r) => r.status === 'confirmee').length;
        const completedReservations = reservations.filter((r) => r.status === 'terminee').length;
        const cancelledReservations = reservations.filter((r) => r.status === 'annulee').length;

        const totalRevenue = reservations
            .filter((r) => r.status === 'confirmee' || r.status === 'terminee')
            .reduce((sum, r) => sum + parseFloat(r.totalAmount.toString()), 0);

        return {
            totalReservations,
            pendingReservations,
            confirmedReservations,
            completedReservations,
            cancelledReservations,
            totalRevenue: totalRevenue.toFixed(2),
        };
    }

    /**
     * Update negotiated price for a reservation (owner or tenant can propose)
     */
    static async updateNegotiatedPrice(
        reservationId: string,
        newPrice: number,
        userId: string
    ): Promise<any> {
        const reservation = await prisma.reservation.findUnique({
            where: { id: reservationId },
            include: {
                accommodation: {
                    select: {
                        ownerId: true,
                    },
                },
            },
        });

        if (!reservation) {
            throw new NotFoundError('Reservation not found');
        }

        // Only allow price negotiation for pending reservations
        if (reservation.status !== 'en_attente') {
            throw new ValidationError(
                'Price negotiation is only allowed for pending reservations'
            );
        }

        // Only owner or tenant can update the price
        if (userId !== reservation.tenantId && userId !== reservation.accommodation.ownerId) {
            throw new AuthorizationError('You are not authorized to modify this reservation');
        }

        // Calculate new total based on negotiated price
        const nights = Math.ceil(
            (reservation.endDate.getTime() - reservation.startDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        const newTotal = nights * newPrice;

        const updated = await prisma.reservation.update({
            where: { id: reservationId },
            data: {
                negotiatedPrice: new Prisma.Decimal(newPrice),
                totalAmount: new Prisma.Decimal(newTotal),
            },
            include: {
                accommodation: {
                    select: {
                        id: true,
                        title: true,
                        owner: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                },
                tenant: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });

        return updated;
    }
}

