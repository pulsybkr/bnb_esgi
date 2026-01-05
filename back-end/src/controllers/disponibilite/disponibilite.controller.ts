import { Request, Response, NextFunction } from 'express';
import { DisponibiliteService, CreateAvailabilityData, UpdateAvailabilityData, AvailabilityFilters } from '../../services/disponibilite';
import { AuthenticatedRequest } from '../../types';

export class DisponibiliteController {
    /**
     * Create availability period for a property
     */
    static async createAvailability(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const availabilityData: CreateAvailabilityData = {
                ...req.body,
                startDate: new Date(req.body.startDate),
                endDate: new Date(req.body.endDate),
            };

            const availability = await DisponibiliteService.createAvailability(id, availabilityData);

            res.status(201).json({
                success: true,
                message: 'Availability period created successfully',
                data: { availability },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get all availabilities for a property
     */
    static async getAvailabilities(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const filters: AvailabilityFilters = {
                startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
                endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
                status: req.query.status as any,
            };

            const availabilities = await DisponibiliteService.getAvailabilitiesByProperty(id, filters);

            res.json({
                success: true,
                data: { availabilities },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get available dates for a property
     */
    static async getAvailableDates(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const startDate = new Date(req.query.startDate as string);
            const endDate = new Date(req.query.endDate as string);

            const availableDates = await DisponibiliteService.getAvailableDates(id, startDate, endDate);

            res.json({
                success: true,
                data: { availableDates },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update availability period
     */
    static async updateAvailability(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const updateData: UpdateAvailabilityData = {
                ...req.body,
                startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
                endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
            };

            const availability = await DisponibiliteService.updateAvailability(id, updateData);

            res.json({
                success: true,
                message: 'Availability period updated successfully',
                data: { availability },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete availability period
     */
    static async deleteAvailability(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            await DisponibiliteService.deleteAvailability(id);

            res.json({
                success: true,
                message: 'Availability period deleted successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Bulk create availability periods
     */
    static async bulkCreateAvailabilities(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const periods = req.body.periods.map((p: any) => ({
                ...p,
                startDate: new Date(p.startDate),
                endDate: new Date(p.endDate),
            }));

            const availabilities = await DisponibiliteService.bulkCreateAvailabilities(id, periods);

            res.status(201).json({
                success: true,
                message: `${availabilities.length} availability periods created successfully`,
                data: { availabilities },
            });
        } catch (error) {
            next(error);
        }
    }
}
