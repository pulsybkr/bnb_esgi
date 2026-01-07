import { PricingService } from '../../../services/pricing/pricing.service';
import { prismaMock } from '../../setup';
import { Prisma } from '@prisma/client';

describe('PricingService', () => {
    describe('createOrUpdatePricingConfig', () => {
        it('should create pricing configuration if none exists', async () => {
            const configData = { basePrice: 120, currency: 'EUR' };
            prismaMock.logement.findUnique.mockResolvedValue({ id: 'prop-1' } as any);
            prismaMock.pricingConfiguration.findUnique.mockResolvedValue(null);
            prismaMock.pricingConfiguration.create.mockResolvedValue({
                accommodationId: 'prop-1',
                basePrice: new Prisma.Decimal(120)
            } as any);

            const result = await PricingService.createOrUpdatePricingConfig('prop-1', configData);

            expect(result.basePrice.toNumber()).toBe(120);
            expect(prismaMock.pricingConfiguration.create).toHaveBeenCalled();
        });

        it('should update pricing configuration if it exists', async () => {
            const configData = { basePrice: 150 };
            prismaMock.logement.findUnique.mockResolvedValue({ id: 'prop-1' } as any);
            prismaMock.pricingConfiguration.findUnique.mockResolvedValue({ id: 'conf-1', accommodationId: 'prop-1' } as any);
            prismaMock.pricingConfiguration.update.mockResolvedValue({
                id: 'conf-1',
                basePrice: new Prisma.Decimal(150)
            } as any);

            const result = await PricingService.createOrUpdatePricingConfig('prop-1', configData);

            expect(result.basePrice.toNumber()).toBe(150);
            expect(prismaMock.pricingConfiguration.update).toHaveBeenCalled();
        });
    });

    describe('addPricingRule', () => {
        it('should add a rule successfully', async () => {
            const ruleData: any = {
                type: 'season',
                name: 'Summer',
                priceMultiplier: 1.5,
            };

            prismaMock.pricingConfiguration.findUnique.mockResolvedValue({ id: 'conf-1' } as any);
            prismaMock.pricingRule.create.mockResolvedValue({ id: 'rule-1', ...ruleData } as any);

            const result = await PricingService.addPricingRule('prop-1', ruleData);

            expect(result.id).toBe('rule-1');
            expect(prismaMock.pricingRule.create).toHaveBeenCalled();
        });
    });
});
