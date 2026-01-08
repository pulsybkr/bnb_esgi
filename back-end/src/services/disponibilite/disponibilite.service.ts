import prisma from '../../prisma/client';
import { NotFoundError, ValidationError } from '../../types';
import { Prisma } from '@prisma/client';

export interface CreateAvailabilityData {
    startDate: Date;
    endDate: Date;
    status?: 'disponible' | 'reserve' | 'bloque';
    customPrice?: number;
    note?: string;
}

export interface UpdateAvailabilityData {
    startDate?: Date;
    endDate?: Date;
    status?: 'disponible' | 'reserve' | 'bloque';
    customPrice?: number;
    note?: string;
}

export interface AvailabilityFilters {
    startDate?: Date;
    endDate?: Date;
    status?: 'disponible' | 'reserve' | 'bloque';
}

export class DisponibiliteService {
    /**
     * Create an availability period for a property
     */
    static async createAvailability(
        accommodationId: string,
        availabilityData: CreateAvailabilityData
    ): Promise<any> {
        // Check if property exists
        const property = await prisma.logement.findUnique({
            where: { id: accommodationId },
        });

        if (!property) {
            throw new NotFoundError('Property not found');
        }

        // Check for conflicts
        const hasConflict = await this.checkConflicts(
            accommodationId,
            availabilityData.startDate,
            availabilityData.endDate
        );

        if (hasConflict) {
            throw new ValidationError(
                'This period conflicts with existing availability or reservations'
            );
        }

        // If creating a 'bloque' or 'reserve' period, delete overlapping 'disponible' periods
        if (availabilityData.status === 'bloque' || availabilityData.status === 'reserve') {
            await prisma.disponibilite.deleteMany({
                where: {
                    accommodationId,
                    status: 'disponible',
                    AND: [
                        { startDate: { lt: availabilityData.endDate } },
                        { endDate: { gt: availabilityData.startDate } },
                    ],
                },
            });
        }

        const availability = await prisma.disponibilite.create({
            data: {
                accommodationId,
                startDate: availabilityData.startDate,
                endDate: availabilityData.endDate,
                status: availabilityData.status || 'disponible',
                customPrice: availabilityData.customPrice
                    ? new Prisma.Decimal(availabilityData.customPrice)
                    : null,
                note: availabilityData.note,
            },
        });

        return availability;
    }

    /**
     * Get all availabilities for a property
     */
    static async getAvailabilitiesByProperty(
        accommodationId: string,
        filters: AvailabilityFilters = {}
    ): Promise<any[]> {
        const where: any = { accommodationId };

        if (filters.status) {
            where.status = filters.status;
        }

        if (filters.startDate || filters.endDate) {
            where.AND = [];

            if (filters.startDate) {
                where.AND.push({
                    endDate: { gte: filters.startDate },
                });
            }

            if (filters.endDate) {
                where.AND.push({
                    startDate: { lte: filters.endDate },
                });
            }
        }

        const availabilities = await prisma.disponibilite.findMany({
            where,
            orderBy: { startDate: 'asc' },
        });

        return availabilities;
    }

    /**
     * Get available dates for a property in a date range
     */
    static async getAvailableDates(
        accommodationId: string,
        startDate: Date,
        endDate: Date
    ): Promise<any[]> {
        const availabilities = await prisma.disponibilite.findMany({
            where: {
                accommodationId,
                status: 'disponible',
                AND: [
                    { endDate: { gte: startDate } },
                    { startDate: { lte: endDate } },
                ],
            },
            orderBy: { startDate: 'asc' },
        });

        return availabilities;
    }

    /**
     * Update an availability period
     */
    static async updateAvailability(
        id: string,
        updateData: UpdateAvailabilityData
    ): Promise<any> {
        const existing = await prisma.disponibilite.findUnique({
            where: { id },
        });

        if (!existing) {
            throw new NotFoundError('Availability period not found');
        }

        // If dates are being updated, check for conflicts
        if (updateData.startDate || updateData.endDate) {
            const newStartDate = updateData.startDate || existing.startDate;
            const newEndDate = updateData.endDate || existing.endDate;

            const hasConflict = await this.checkConflicts(
                existing.accommodationId,
                newStartDate,
                newEndDate,
                id // Exclude current availability from conflict check
            );

            if (hasConflict) {
                throw new ValidationError(
                    'Updated period conflicts with existing availability or reservations'
                );
            }
        }

        const dataToUpdate: any = {};

        if (updateData.startDate) dataToUpdate.startDate = updateData.startDate;
        if (updateData.endDate) dataToUpdate.endDate = updateData.endDate;
        if (updateData.status) dataToUpdate.status = updateData.status;
        if (updateData.note !== undefined) dataToUpdate.note = updateData.note;
        if (updateData.customPrice !== undefined) {
            dataToUpdate.customPrice = updateData.customPrice
                ? new Prisma.Decimal(updateData.customPrice)
                : null;
        }

        const updated = await prisma.disponibilite.update({
            where: { id },
            data: dataToUpdate,
        });

        return updated;
    }

    /**
     * Delete an availability period
     */
    static async deleteAvailability(id: string): Promise<void> {
        const availability = await prisma.disponibilite.findUnique({
            where: { id },
        });

        if (!availability) {
            throw new NotFoundError('Availability period not found');
        }

        // Don't allow deleting reserved periods
        if (availability.status === 'reserve') {
            throw new ValidationError(
                'Cannot delete a reserved period. Cancel the reservation first.'
            );
        }

        await prisma.disponibilite.delete({
            where: { id },
        });
    }

    /**
     * Check for conflicts with existing availabilities or reservations
     */
    static async checkConflicts(
        accommodationId: string,
        startDate: Date,
        endDate: Date,
        excludeAvailabilityId?: string
    ): Promise<boolean> {
        // Check for overlapping availabilities (only reserve and bloque, not disponible)
        const where: any = {
            accommodationId,
            status: { in: ['reserve', 'bloque'] }, // Ignore 'disponible' status
            AND: [
                { startDate: { lt: endDate } },
                { endDate: { gt: startDate } },
            ],
        };

        if (excludeAvailabilityId) {
            where.id = { not: excludeAvailabilityId };
        }

        const overlappingAvailabilities = await prisma.disponibilite.count({
            where,
        });

        if (overlappingAvailabilities > 0) {
            return true;
        }

        // Check for overlapping confirmed reservations
        const overlappingReservations = await prisma.reservation.count({
            where: {
                accommodationId,
                status: { in: ['confirmee', 'en_cours'] },
                AND: [
                    { startDate: { lt: endDate } },
                    { endDate: { gt: startDate } },
                ],
            },
        });

        return overlappingReservations > 0;
    }

    /**
     * Auto-block dates when a reservation is confirmed
     */
    static async autoBlockOnReservation(
        accommodationId: string,
        startDate: Date,
        endDate: Date,
        customPrice?: number
    ): Promise<any> {
        // Delete any existing disponible periods that overlap
        await prisma.disponibilite.deleteMany({
            where: {
                accommodationId,
                status: 'disponible',
                AND: [
                    { startDate: { lt: endDate } },
                    { endDate: { gt: startDate } },
                ],
            },
        });

        // Create reserved period
        const availability = await prisma.disponibilite.create({
            data: {
                accommodationId,
                startDate,
                endDate,
                status: 'reserve',
                customPrice: customPrice ? new Prisma.Decimal(customPrice) : null,
                note: 'Auto-blocked by reservation',
            },
        });

        return availability;
    }

    /**
     * Auto-free dates when a reservation is cancelled
     */
    static async autoFreeOnCancellation(
        accommodationId: string,
        startDate: Date,
        endDate: Date
    ): Promise<void> {
        // Update reserved periods to disponible
        await prisma.disponibilite.updateMany({
            where: {
                accommodationId,
                status: 'reserve',
                AND: [
                    { startDate: { gte: startDate } },
                    { endDate: { lte: endDate } },
                ],
            },
            data: {
                status: 'disponible',
                note: 'Freed by reservation cancellation',
            },
        });
    }

    /**
     * Bulk create availability periods
     */
    static async bulkCreateAvailabilities(
        accommodationId: string,
        periods: CreateAvailabilityData[]
    ): Promise<any[]> {
        // Check if property exists
        const property = await prisma.logement.findUnique({
            where: { id: accommodationId },
        });

        if (!property) {
            throw new NotFoundError('Property not found');
        }

        // Check each period for conflicts
        for (const period of periods) {
            const hasConflict = await this.checkConflicts(
                accommodationId,
                period.startDate,
                period.endDate
            );

            if (hasConflict) {
                throw new ValidationError(
                    `Period from ${period.startDate.toISOString()} to ${period.endDate.toISOString()} conflicts with existing availability or reservations`
                );
            }
        }

        // Create all periods
        const created = await Promise.all(
            periods.map((period) =>
                prisma.disponibilite.create({
                    data: {
                        accommodationId,
                        startDate: period.startDate,
                        endDate: period.endDate,
                        status: period.status || 'disponible',
                        customPrice: period.customPrice
                            ? new Prisma.Decimal(period.customPrice)
                            : null,
                        note: period.note,
                    },
                })
            )
        );

        return created;
    }
}
