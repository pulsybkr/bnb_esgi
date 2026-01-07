import { AuthenticationError, AuthorizationError, ValidationError, NotFoundError } from '../../types';

describe('Custom Errors', () => {
    it('AuthenticationError should have correct name and message', () => {
        const error = new AuthenticationError('Auth failed');
        expect(error.name).toBe('AuthenticationError');
        expect(error.message).toBe('Auth failed');
        expect(error instanceof Error).toBe(true);
    });

    it('AuthorizationError should have correct name and message', () => {
        const error = new AuthorizationError('Forbidden');
        expect(error.name).toBe('AuthorizationError');
        expect(error.message).toBe('Forbidden');
    });

    it('ValidationError should store field name', () => {
        const error = new ValidationError('Invalid input', 'email');
        expect(error.name).toBe('ValidationError');
        expect(error.message).toBe('Invalid input');
        expect(error.field).toBe('email');
    });

    it('NotFoundError should work as expected', () => {
        const error = new NotFoundError('Not found');
        expect(error.name).toBe('NotFoundError');
        expect(error.message).toBe('Not found');
    });
});
