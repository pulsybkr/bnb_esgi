import { LogementService } from '../../../services/logement/logement.service';
import { prismaMock } from '../../setup';
import { Prisma } from '@prisma/client';

describe('LogementService', () => {
    describe('createProperty', () => {
        const propertyData: any = {
            title: 'Beautiful Villa',
            description: 'A great place to stay',
            address: '123 Beach Rd',
            city: 'Dakar',
            country: 'Senegal',
            type: 'villa',
            capacity: 6,
            pricePerNight: 150,
        };

        it('should create a property successfully', async () => {
            prismaMock.logement.create.mockResolvedValue({
                id: 'prop-1',
                ...propertyData,
                pricePerNight: new Prisma.Decimal(150),
                status: 'actif',
                createdAt: new Date(),
            } as any);

            const result = await LogementService.createProperty('owner-1', propertyData);

            expect(result.id).toBe('prop-1');
            expect(result.title).toBe(propertyData.title);
            expect(prismaMock.logement.create).toHaveBeenCalled();
        });
    });

    describe('getPropertyById', () => {
        it('should return property with relations', async () => {
            const mockProp = {
                id: 'prop-1',
                title: 'Villa',
                owner: { firstName: 'Owner' },
                photos: [],
            };
            prismaMock.logement.findUnique.mockResolvedValue(mockProp as any);

            const result = await LogementService.getPropertyById('prop-1');

            expect(result.id).toBe('prop-1');
            expect(result.owner).toBeDefined();
        });

        it('should throw NotFoundError if property not found', async () => {
            prismaMock.logement.findUnique.mockResolvedValue(null);

            await expect(LogementService.getPropertyById('none')).rejects.toThrow('Property not found');
        });
    });

    describe('getAllProperties', () => {
        it('should return filtered properties and pagination info', async () => {
            prismaMock.logement.findMany.mockResolvedValue([{ id: '1' }] as any);
            prismaMock.logement.count.mockResolvedValue(1);

            const result = await LogementService.getAllProperties({ city: 'Dakar' });

            expect(result.properties).toHaveLength(1);
            expect(result.total).toBe(1);
            expect(result.totalPages).toBe(1);
        });
    });
});
