import { ServiceService } from '../../../services/service/service.service';
import { prismaMock } from '../../setup';

describe('ServiceService', () => {
    describe('createService', () => {
        it('should create a service successfully', async () => {
            const serviceData: any = {
                name: 'Wifi',
                price: 10,
                priceType: 'fixed'
            };

            prismaMock.logement.findUnique.mockResolvedValue({ id: 'prop-1' } as any);
            prismaMock.service.create.mockResolvedValue({ id: 'srv-1', ...serviceData } as any);

            const result = await ServiceService.createService('prop-1', serviceData);

            expect(result.id).toBe('srv-1');
            expect(prismaMock.service.create).toHaveBeenCalled();
        });
    });

    describe('getServiceById', () => {
        it('should return service with accommodation info', async () => {
            const mockSrv = { id: 'srv-1', name: 'Wifi', accommodation: { title: 'Villa' } };
            prismaMock.service.findUnique.mockResolvedValue(mockSrv as any);

            const result = await ServiceService.getServiceById('srv-1');

            expect(result.accommodation).toBeDefined();
        });

        it('should throw NotFoundError if service not found', async () => {
            prismaMock.service.findUnique.mockResolvedValue(null);

            await expect(ServiceService.getServiceById('none')).rejects.toThrow('Service not found');
        });
    });
});
