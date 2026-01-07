import { createPropertySchema, updatePropertySchema, queryPropertiesSchema } from '../../utils/validation/logement.validation';

describe('Logement Validation', () => {
    describe('createPropertySchema', () => {
        const validProperty = {
            title: 'Beautiful Villa in Dakar',
            description: 'A very large villa with a private pool and garden.',
            address: 'Almadies, Dakar',
            city: 'Dakar',
            country: 'Senegal',
            type: 'villa',
            roomCount: 4,
            capacity: 8,
            pricePerNight: 150000,
            currency: 'XOF'
        };

        it('should validate a correct property object', () => {
            const { error } = createPropertySchema.validate(validProperty);
            expect(error).toBeUndefined();
        });

        it('should fail if title is too short', () => {
            const { error } = createPropertySchema.validate({ ...validProperty, title: 'abc' });
            expect(error).toBeDefined();
            expect(error?.details[0].message).toBe('Title must be at least 5 characters long');
        });

        it('should fail if type is invalid', () => {
            const { error } = createPropertySchema.validate({ ...validProperty, type: 'spaceship' });
            expect(error).toBeDefined();
        });

        it('should fail if capacity is missing', () => {
            const { capacity, ...invalidProperty } = validProperty as any;
            const { error } = createPropertySchema.validate(invalidProperty);
            expect(error).toBeDefined();
        });
    });

    describe('updatePropertySchema', () => {
        it('should allow partial updates', () => {
            const { error } = updatePropertySchema.validate({ title: 'New Title' });
            expect(error).toBeUndefined();
        });

        it('should fail if title is too short on update', () => {
            const { error } = updatePropertySchema.validate({ title: 'abc' });
            expect(error).toBeDefined();
        });
    });

    describe('queryPropertiesSchema', () => {
        it('should validate valid query params', () => {
            const { error } = queryPropertiesSchema.validate({
                city: 'Dakar',
                minPrice: 50000,
                page: 1,
                limit: 10
            });
            expect(error).toBeUndefined();
        });

        it('should fail for invalid status', () => {
            const { error } = queryPropertiesSchema.validate({ status: 'invalid' });
            expect(error).toBeDefined();
        });
    });
});
