import prisma from '../../prisma/client';
import { NotFoundError, AuthorizationError, ValidationError } from '../../types';
import { Prisma } from '@prisma/client';

export interface CreatePropertyData {
    title: string;
    description?: string;
    address: string;
    city: string;
    country: string;
    latitude?: number;
    longitude?: number;
    type: 'maison' | 'appartement' | 'chambre' | 'hotel';
    roomCount: number;
    capacity: number;
    pricePerNight: number;
    currency?: string;
    amenities?: any;
    houseRules?: any;
    photos?: AddPhotoData[];
}

export interface UpdatePropertyData {
    title?: string;
    description?: string;
    address?: string;
    city?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
    type?: 'maison' | 'appartement' | 'chambre' | 'hotel';
    roomCount?: number;
    capacity?: number;
    pricePerNight?: number;
    currency?: string;
    amenities?: any;
    houseRules?: any;
    status?: 'actif' | 'suspendu' | 'archive';
}

export interface PropertyFilters {
    city?: string;
    country?: string;
    type?: 'maison' | 'appartement' | 'chambre' | 'hotel';
    minPrice?: number;
    maxPrice?: number;
    minCapacity?: number;
    status?: 'actif' | 'suspendu' | 'archive';
    page?: number;
    limit?: number;
    sortBy?: 'createdAt' | 'pricePerNight' | 'averageRating' | 'title';
    sortOrder?: 'asc' | 'desc';
}

export interface AddPhotoData {
    url: string;
    thumbnailUrl?: string;
    isMain?: boolean;
    order?: number;
}

export class LogementService {
    /**
     * Create a new property
     */
    static async createProperty(
        ownerId: string,
        propertyData: CreatePropertyData
    ): Promise<any> {
        try {
            // Extract photos from property data
            const { photos, ...propertyDataWithoutPhotos } = propertyData;

            // Determine if there's a main photo
            const hasMainPhoto = photos?.some(photo => photo.isMain);

            // Convert numeric strings to Decimal for Prisma
            const property = await prisma.logement.create({
                data: {
                    ...propertyDataWithoutPhotos,
                    ownerId,
                    pricePerNight: new Prisma.Decimal(propertyData.pricePerNight),
                    latitude: propertyData.latitude ? new Prisma.Decimal(propertyData.latitude) : null,
                    longitude: propertyData.longitude ? new Prisma.Decimal(propertyData.longitude) : null,
                    currency: propertyData.currency || 'XOF',
                    // Create photos if provided
                    photos: photos && photos.length > 0 ? {
                        create: photos.map((photo, index) => ({
                            url: photo.url,
                            thumbnailUrl: photo.thumbnailUrl,
                            // If no main photo is specified, make the first one main
                            isMain: hasMainPhoto ? (photo.isMain || false) : (index === 0),
                            order: photo.order !== undefined ? photo.order : index,
                        }))
                    } : undefined,
                },
                include: {
                    owner: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            profilePhoto: true,
                        },
                    },
                    photos: {
                        orderBy: { order: 'asc' },
                    },
                },
            });

            return property;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get all properties with filters and pagination
     */
    static async getAllProperties(filters: PropertyFilters = {}): Promise<{
        properties: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        const {
            city,
            country,
            type,
            minPrice,
            maxPrice,
            minCapacity,
            status = 'actif',
            page = 1,
            limit = 20,
            sortBy = 'createdAt',
            sortOrder = 'desc',
        } = filters;

        // Build where clause
        const where: any = {
            status,
        };

        if (city) {
            where.city = { contains: city, mode: 'insensitive' };
        }

        if (country) {
            where.country = { contains: country, mode: 'insensitive' };
        }

        if (type) {
            where.type = type;
        }

        if (minPrice !== undefined || maxPrice !== undefined) {
            where.pricePerNight = {};
            if (minPrice !== undefined) {
                where.pricePerNight.gte = new Prisma.Decimal(minPrice);
            }
            if (maxPrice !== undefined) {
                where.pricePerNight.lte = new Prisma.Decimal(maxPrice);
            }
        }

        if (minCapacity !== undefined) {
            where.capacity = { gte: minCapacity };
        }

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Get total count
        const total = await prisma.logement.count({ where });

        // Get properties
        const properties = await prisma.logement.findMany({
            where,
            skip,
            take: limit,
            orderBy: { [sortBy]: sortOrder },
            include: {
                owner: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        profilePhoto: true,
                    },
                },
                photos: {
                    orderBy: { order: 'asc' },
                },
                _count: {
                    select: {
                        reservations: true,
                        favorites: true,
                    },
                },
            },
        });

        return {
            properties,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    /**
     * Get a single property by ID
     */
    static async getPropertyById(id: string): Promise<any> {
        const property = await prisma.logement.findUnique({
            where: { id },
            include: {
                owner: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                        profilePhoto: true,
                        registrationDate: true,
                    },
                },
                photos: {
                    orderBy: { order: 'asc' },
                },
                availabilities: {
                    where: {
                        endDate: { gte: new Date() },
                    },
                    orderBy: { startDate: 'asc' },
                },
                _count: {
                    select: {
                        reservations: true,
                        favorites: true,
                    },
                },
            },
        });

        if (!property) {
            throw new NotFoundError('Property not found');
        }

        return property;
    }

    /**
     * Get properties by owner ID
     */
    static async getPropertiesByOwner(
        ownerId: string,
        filters: Partial<PropertyFilters> = {}
    ): Promise<any[]> {
        const { status, sortBy = 'createdAt', sortOrder = 'desc' } = filters;

        const where: any = { ownerId };

        if (status) {
            where.status = status;
        }

        const properties = await prisma.logement.findMany({
            where,
            orderBy: { [sortBy]: sortOrder },
            include: {
                photos: {
                    orderBy: { order: 'asc' },
                },
                _count: {
                    select: {
                        reservations: true,
                        favorites: true,
                    },
                },
            },
        });

        return properties;
    }

    /**
     * Update a property
     */
    static async updateProperty(
        id: string,
        updateData: UpdatePropertyData
    ): Promise<any> {
        // Check if property exists
        const existingProperty = await prisma.logement.findUnique({
            where: { id },
        });

        if (!existingProperty) {
            throw new NotFoundError('Property not found');
        }

        // Prepare update data with Decimal conversion
        const dataToUpdate: any = { ...updateData };

        if (updateData.pricePerNight !== undefined) {
            dataToUpdate.pricePerNight = new Prisma.Decimal(updateData.pricePerNight);
        }

        if (updateData.latitude !== undefined) {
            dataToUpdate.latitude = updateData.latitude ? new Prisma.Decimal(updateData.latitude) : null;
        }

        if (updateData.longitude !== undefined) {
            dataToUpdate.longitude = updateData.longitude ? new Prisma.Decimal(updateData.longitude) : null;
        }

        const updatedProperty = await prisma.logement.update({
            where: { id },
            data: dataToUpdate,
            include: {
                owner: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        profilePhoto: true,
                    },
                },
                photos: {
                    orderBy: { order: 'asc' },
                },
            },
        });

        return updatedProperty;
    }

    /**
     * Delete a property (cascade deletes photos and availabilities)
     */
    static async deleteProperty(id: string): Promise<void> {
        const property = await prisma.logement.findUnique({
            where: { id },
            include: {
                reservations: {
                    where: {
                        status: { in: ['en_attente', 'confirmee', 'en_cours'] },
                    },
                },
            },
        });

        if (!property) {
            throw new NotFoundError('Property not found');
        }

        // Check if there are active reservations
        if (property.reservations.length > 0) {
            throw new ValidationError(
                'Cannot delete property with active or pending reservations. Please cancel all reservations first.'
            );
        }

        // Delete the property (photos and availabilities will be cascade deleted)
        await prisma.logement.delete({
            where: { id },
        });
    }

    /**
     * Add a photo to a property
     */
    static async addPhoto(
        propertyId: string,
        photoData: AddPhotoData
    ): Promise<any> {
        const property = await prisma.logement.findUnique({
            where: { id: propertyId },
        });

        if (!property) {
            throw new NotFoundError('Property not found');
        }

        // If this is set as main photo, unset other main photos
        if (photoData.isMain) {
            await prisma.photo.updateMany({
                where: {
                    accommodationId: propertyId,
                    isMain: true,
                },
                data: { isMain: false },
            });
        }

        const photo = await prisma.photo.create({
            data: {
                accommodationId: propertyId,
                url: photoData.url,
                thumbnailUrl: photoData.thumbnailUrl,
                isMain: photoData.isMain || false,
                order: photoData.order || 0,
            },
        });

        return photo;
    }

    /**
     * Delete a photo from a property
     */
    static async deletePhoto(propertyId: string, photoId: string): Promise<void> {
        const photo = await prisma.photo.findUnique({
            where: { id: photoId },
        });

        if (!photo) {
            throw new NotFoundError('Photo not found');
        }

        if (photo.accommodationId !== propertyId) {
            throw new AuthorizationError('Photo does not belong to this property');
        }

        await prisma.photo.delete({
            where: { id: photoId },
        });
    }

    /**
     * Set a photo as the main photo
     */
    static async setMainPhoto(propertyId: string, photoId: string): Promise<any> {
        const photo = await prisma.photo.findUnique({
            where: { id: photoId },
        });

        if (!photo) {
            throw new NotFoundError('Photo not found');
        }

        if (photo.accommodationId !== propertyId) {
            throw new AuthorizationError('Photo does not belong to this property');
        }

        // Unset all main photos for this property
        await prisma.photo.updateMany({
            where: {
                accommodationId: propertyId,
                isMain: true,
            },
            data: { isMain: false },
        });

        // Set this photo as main
        const updatedPhoto = await prisma.photo.update({
            where: { id: photoId },
            data: { isMain: true },
        });

        return updatedPhoto;
    }

    /**
     * Get property statistics for an owner
     */
    static async getOwnerStatistics(ownerId: string): Promise<any> {
        const properties = await prisma.logement.findMany({
            where: { ownerId },
            include: {
                _count: {
                    select: {
                        reservations: true,
                        favorites: true,
                    },
                },
            },
        });

        const totalProperties = properties.length;
        const activeProperties = properties.filter((p) => p.status === 'actif').length;
        const totalReservations = properties.reduce((sum, p) => sum + p._count.reservations, 0);
        const totalFavorites = properties.reduce((sum, p) => sum + p._count.favorites, 0);
        const averageRating =
            properties.reduce((sum, p) => sum + (p.averageRating || 0), 0) / totalProperties || 0;

        return {
            totalProperties,
            activeProperties,
            totalReservations,
            totalFavorites,
            averageRating: averageRating.toFixed(2),
        };
    }
}
