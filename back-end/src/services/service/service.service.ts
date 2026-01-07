import prisma from '../../prisma/client';
import { NotFoundError, AuthorizationError } from '../../types';
import { Prisma } from '@prisma/client';

export interface CreateServiceData {
    name: string;
    description?: string;
    price: number;
    priceType: 'fixed' | 'per_night' | 'per_guest' | 'per_guest_per_night';
    icon?: string;
}

export interface UpdateServiceData {
    name?: string;
    description?: string;
    price?: number;
    priceType?: 'fixed' | 'per_night' | 'per_guest' | 'per_guest_per_night';
    icon?: string;
}

export class ServiceService {
    /**
     * Create a new service for an accommodation
     */
    static async createService(
        accommodationId: string,
        serviceData: CreateServiceData
    ): Promise<any> {
        // Check if accommodation exists
        const accommodation = await prisma.logement.findUnique({
            where: { id: accommodationId },
        });

        if (!accommodation) {
            throw new NotFoundError('Accommodation not found');
        }

        const service = await prisma.service.create({
            data: {
                accommodationId,
                name: serviceData.name,
                description: serviceData.description,
                price: new Prisma.Decimal(serviceData.price),
                priceType: serviceData.priceType,
                icon: serviceData.icon,
            },
        });

        return service;
    }

    /**
     * Get all services for an accommodation
     */
    static async getServicesByAccommodation(accommodationId: string): Promise<any[]> {
        const services = await prisma.service.findMany({
            where: { accommodationId },
            orderBy: { createdAt: 'asc' },
        });

        return services;
    }

    /**
     * Get a service by ID
     */
    static async getServiceById(serviceId: string): Promise<any> {
        const service = await prisma.service.findUnique({
            where: { id: serviceId },
            include: {
                accommodation: {
                    select: {
                        id: true,
                        title: true,
                        ownerId: true,
                    },
                },
            },
        });

        if (!service) {
            throw new NotFoundError('Service not found');
        }

        return service;
    }

    /**
     * Update a service
     */
    static async updateService(
        serviceId: string,
        updateData: UpdateServiceData
    ): Promise<any> {
        const service = await prisma.service.findUnique({
            where: { id: serviceId },
        });

        if (!service) {
            throw new NotFoundError('Service not found');
        }

        const dataToUpdate: any = { ...updateData };

        if (updateData.price !== undefined) {
            dataToUpdate.price = new Prisma.Decimal(updateData.price);
        }

        const updatedService = await prisma.service.update({
            where: { id: serviceId },
            data: dataToUpdate,
        });

        return updatedService;
    }

    /**
     * Delete a service
     */
    static async deleteService(serviceId: string): Promise<void> {
        const service = await prisma.service.findUnique({
            where: { id: serviceId },
        });

        if (!service) {
            throw new NotFoundError('Service not found');
        }

        await prisma.service.delete({
            where: { id: serviceId },
        });
    }
}


