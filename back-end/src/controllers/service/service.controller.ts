import { Request, Response, NextFunction } from 'express';
import { ServiceService, CreateServiceData, UpdateServiceData } from '../../services/service';
import { AuthenticatedRequest } from '../../types';

export class ServiceController {
    /**
     * Create a new service for an accommodation
     */
    static async createService(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const serviceData: CreateServiceData = req.body;

            const service = await ServiceService.createService(id, serviceData);

            res.status(201).json({
                success: true,
                message: 'Service created successfully',
                data: { service },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get all services for an accommodation
     */
    static async getServices(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const services = await ServiceService.getServicesByAccommodation(id);

            res.json({
                success: true,
                data: { services },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get a service by ID
     */
    static async getServiceById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { serviceId } = req.params;
            const service = await ServiceService.getServiceById(serviceId);

            res.json({
                success: true,
                data: { service },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update a service
     */
    static async updateService(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { serviceId } = req.params;
            const updateData: UpdateServiceData = req.body;

            const service = await ServiceService.updateService(serviceId, updateData);

            res.json({
                success: true,
                message: 'Service updated successfully',
                data: { service },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete a service
     */
    static async deleteService(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { serviceId } = req.params;
            await ServiceService.deleteService(serviceId);

            res.json({
                success: true,
                message: 'Service deleted successfully',
            });
        } catch (error) {
            next(error);
        }
    }
}


