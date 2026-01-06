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
    type: 'maison' | 'appartement' | 'chambre' | 'hotel' | 'villa' | 'studio' | 'loft';
    roomCount: number;
    capacity: number;
    bedrooms?: number;
    bathrooms?: number;
    pricePerNight: number;
    currency?: string;
    amenities?: any;
    houseRules?: any;
    tags?: string[];
    checkIn?: string;
    checkOut?: string;
    services?: Array<{
        serviceId: string;
        name: string;
        description?: string;
        price: number;
        priceType: 'fixed' | 'per_night' | 'per_guest' | 'per_guest_per_night';
    }>;
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
    type?: 'maison' | 'appartement' | 'chambre' | 'hotel' | 'villa' | 'studio' | 'loft';
    roomCount?: number;
    capacity?: number;
    bedrooms?: number;
    bathrooms?: number;
    pricePerNight?: number;
    currency?: string;
    amenities?: any;
    houseRules?: any;
    tags?: string[];
    checkIn?: string;
    checkOut?: string;
    status?: 'actif' | 'suspendu' | 'archive';
}

export interface PropertyFilters {
    city?: string;
    country?: string;
    type?: 'maison' | 'appartement' | 'chambre' | 'hotel' | 'villa' | 'studio' | 'loft';
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
            // Extract photos and services from property data
            const { photos, services, ...propertyDataWithoutPhotos } = propertyData;

            // Determine if there's a main photo
            const hasMainPhoto = photos?.some(photo => photo.isMain);

            // Convert numeric strings to Decimal for Prisma
            const property = await prisma.logement.create({
                data: {
                    ...propertyDataWithoutPhotos,
                    ownerId,
                    bedrooms: propertyData.bedrooms ?? 0,
                    bathrooms: propertyData.bathrooms ?? 0,
                    tags: propertyData.tags && propertyData.tags.length > 0 ? propertyData.tags : undefined,
                    checkIn: propertyData.checkIn || '15:00',
                    checkOut: propertyData.checkOut || '11:00',
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
                    // Create services if provided
                    services: services && services.length > 0 ? {
                        create: services.map(service => ({
                            name: service.name,
                            description: service.description,
                            price: new Prisma.Decimal(service.price),
                            priceType: service.priceType,
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
                    services: {
                        orderBy: { createdAt: 'asc' },
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
                services: {
                    orderBy: { createdAt: 'asc' },
                },
                pricingConfig: {
                    include: {
                        rules: {
                            orderBy: { priority: 'desc' },
                        },
                    },
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

        // Handle tags - convert array to JSON if provided
        if (updateData.tags !== undefined) {
            dataToUpdate.tags = updateData.tags.length > 0 ? updateData.tags : undefined;
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
     * Add multiple photos to a property
     */
    static async addMultiplePhotos(
        propertyId: string,
        photosData: AddPhotoData[]
    ): Promise<any[]> {
        const property = await prisma.logement.findUnique({
            where: { id: propertyId },
        });

        if (!property) {
            throw new NotFoundError('Property not found');
        }

        // Get current max order
        const currentPhotos = await prisma.photo.findMany({
            where: { accommodationId: propertyId },
            orderBy: { order: 'desc' },
            take: 1,
        });

        const startOrder = currentPhotos.length > 0 ? (currentPhotos[0].order || 0) + 1 : 0;

        // Check if any photo should be main
        const hasMainPhoto = photosData.some(photo => photo.isMain);

        // If setting main photos, unset existing main photos
        if (hasMainPhoto) {
            await prisma.photo.updateMany({
                where: {
                    accommodationId: propertyId,
                    isMain: true,
                },
                data: { isMain: false },
            });
        }

        // Create all photos
        const photos = await Promise.all(
            photosData.map((photoData, index) =>
                prisma.photo.create({
                    data: {
                        accommodationId: propertyId,
                        url: photoData.url,
                        thumbnailUrl: photoData.thumbnailUrl,
                        isMain: photoData.isMain || (index === 0 && !hasMainPhoto),
                        order: photoData.order !== undefined ? photoData.order : startOrder + index,
                    },
                })
            )
        );

        return photos;
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
