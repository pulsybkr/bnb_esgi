import { createAvailabilitySchema, updateAvailabilitySchema, bulkCreateAvailabilitiesSchema } from '../../utils/validation/disponibilite.validation';

describe('Disponibilite Validation', () => {
    describe('createAvailabilitySchema', () => {
        const validAvailability = {
            startDate: new Date('2024-06-01').toISOString(),
            endDate: new Date('2024-06-05').toISOString(),
            status: 'disponible',
            customPrice: 75.50,
            note: 'Summer season pricing'
        };

        it('should validate a correct availability object', () => {
            const { error } = createAvailabilitySchema.validate(validAvailability);
            expect(error).toBeUndefined();
        });

        it('should fail if endDate is before startDate', () => {
            const { error } = createAvailabilitySchema.validate({
                ...validAvailability,
                startDate: new Date('2024-06-05').toISOString(),
                endDate: new Date('2024-06-01').toISOString()
            });
            expect(error).toBeDefined();
        });

        it('should fail for invalid status', () => {
            const { error } = createAvailabilitySchema.validate({ ...validAvailability, status: 'unknown' });
            expect(error).toBeDefined();
        });
    });

    describe('updateAvailabilitySchema', () => {
        it('should allow partial updates', () => {
            const { error } = updateAvailabilitySchema.validate({ customPrice: 100 });
            expect(error).toBeUndefined();
        });
    });

    describe('bulkCreateAvailabilitiesSchema', () => {
        it('should validate multiple periods', () => {
            const { error } = bulkCreateAvailabilitiesSchema.validate({
                periods: [
                    { startDate: new Date('2024-07-01').toISOString(), endDate: new Date('2024-07-05').toISOString() },
                    { startDate: new Date('2024-07-10').toISOString(), endDate: new Date('2024-07-15').toISOString() }
                ]
            });
            expect(error).toBeUndefined();
        });

        it('should fail if periods array is empty', () => {
            const { error } = bulkCreateAvailabilitiesSchema.validate({ periods: [] });
            expect(error).toBeDefined();
        });
    });
});
