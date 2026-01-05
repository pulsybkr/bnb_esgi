import { Request, Response, NextFunction } from 'express';
import { LogementService, CreatePropertyData, UpdatePropertyData, PropertyFilters, AddPhotoData } from '../../services/logement';
import { AuthenticatedRequest } from '../../types';

export class LogementController {
    /**
     * Create a new property
     */
    static async createProperty(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const authReq = req as AuthenticatedRequest;

            if (!authReq.user) {
                throw new Error('User not authenticated');
            }

            const propertyData: CreatePropertyData = req.body;
            const property = await LogementService.createProperty(authReq.user.id, propertyData);

            res.status(201).json({
                success: true,
                message: 'Property created successfully',
                data: { property },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get all properties with filters
     */
    static async getAllProperties(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const filters: PropertyFilters = {
                city: req.query.city as string,
                country: req.query.country as string,
                type: req.query.type as any,
                minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
                maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
                minCapacity: req.query.minCapacity ? parseInt(req.query.minCapacity as string) : undefined,
                status: (req.query.status as any) || 'actif',
                page: req.query.page ? parseInt(req.query.page as string) : 1,
                limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
                sortBy: (req.query.sortBy as any) || 'createdAt',
                sortOrder: (req.query.sortOrder as any) || 'desc',
            };

            const result = await LogementService.getAllProperties(filters);

            res.json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get a single property by ID
     */
    static async getPropertyById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const property = await LogementService.getPropertyById(id);

            res.json({
                success: true,
                data: { property },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get properties owned by the authenticated user
     */
    static async getMyProperties(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const authReq = req as AuthenticatedRequest;

            if (!authReq.user) {
                throw new Error('User not authenticated');
            }

            const filters: Partial<PropertyFilters> = {
                status: req.query.status as any,
                sortBy: (req.query.sortBy as any) || 'createdAt',
                sortOrder: (req.query.sortOrder as any) || 'desc',
            };

            const properties = await LogementService.getPropertiesByOwner(authReq.user.id, filters);

            res.json({
                success: true,
                data: { properties },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update a property
     */
    static async updateProperty(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const updateData: UpdatePropertyData = req.body;

            const property = await LogementService.updateProperty(id, updateData);

            res.json({
                success: true,
                message: 'Property updated successfully',
                data: { property },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete a property
     */
    static async deleteProperty(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            await LogementService.deleteProperty(id);

            res.json({
                success: true,
                message: 'Property deleted successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Add a photo to a property
     */
    static async addPhoto(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const photoData: AddPhotoData = req.body;

            const photo = await LogementService.addPhoto(id, photoData);

            res.status(201).json({
                success: true,
                message: 'Photo added successfully',
                data: { photo },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete a photo from a property
     */
    static async deletePhoto(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id, photoId } = req.params;
            await LogementService.deletePhoto(id, photoId);

            res.json({
                success: true,
                message: 'Photo deleted successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Set a photo as the main photo
     */
    static async setMainPhoto(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id, photoId } = req.params;
            const photo = await LogementService.setMainPhoto(id, photoId);

            res.json({
                success: true,
                message: 'Main photo updated successfully',
                data: { photo },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get statistics for the authenticated owner
     */
    static async getMyStatistics(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const authReq = req as AuthenticatedRequest;

            if (!authReq.user) {
                throw new Error('User not authenticated');
            }

            const statistics = await LogementService.getOwnerStatistics(authReq.user.id);

            res.json({
                success: true,
                data: { statistics },
            });
        } catch (error) {
            next(error);
        }
    }
}
