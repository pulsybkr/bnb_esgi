import { registerSchema, loginSchema } from '../../utils/validation/auth.validation';

describe('Auth Validation', () => {
    describe('registerSchema', () => {
        it('should validate valid data', () => {
            const validData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                password: 'password123',
                userType: 'locataire',
            };

            const { error } = registerSchema.validate(validData);
            expect(error).toBeUndefined();
        });

        it('should fail if email is invalid', () => {
            const invalidData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'invalid-email',
                password: 'password123',
                userType: 'locataire',
            };

            const { error } = registerSchema.validate(invalidData);
            expect(error).toBeDefined();
            expect(error?.details[0].message).toBe('Please provide a valid email address');
        });

        it('should fail if password is too short', () => {
            const invalidData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                password: 'short',
                userType: 'locataire',
            };

            const { error } = registerSchema.validate(invalidData);
            expect(error).toBeDefined();
            expect(error?.details[0].message).toBe('Password must be at least 8 characters long');
        });
    });

    describe('loginSchema', () => {
        it('should validate valid login data', () => {
            const validData = {
                email: 'john@example.com',
                password: 'password123',
            };

            const { error } = loginSchema.validate(validData);
            expect(error).toBeUndefined();
        });

        it('should fail if email is missing', () => {
            const invalidData = { password: 'pass' };
            const { error } = loginSchema.validate(invalidData);
            expect(error).toBeDefined();
        });
    });
});
