import { PasswordService } from '../../../services/auth/password.service';
import bcrypt from 'bcryptjs';

describe('PasswordService', () => {
    describe('hashPassword', () => {
        it('should hash a password successfully', async () => {
            const password = 'Password123!';
            const hash = await PasswordService.hashPassword(password);

            expect(hash).toBeDefined();
            expect(hash).not.toBe(password);
            expect(await bcrypt.compare(password, hash)).toBe(true);
        });

        it('should throw an error if hashing fails', async () => {
            jest.spyOn(bcrypt, 'genSalt').mockImplementationOnce(() => {
                throw new Error('Salt generation failed');
            });

            await expect(PasswordService.hashPassword('password')).rejects.toThrow('Failed to hash password');
        });
    });

    describe('verifyPassword', () => {
        it('should return true for a correct password', async () => {
            const password = 'correctPassword';
            const hash = await bcrypt.hash(password, 10);

            const result = await PasswordService.verifyPassword(password, hash);
            expect(result).toBe(true);
        });

        it('should return false for an incorrect password', async () => {
            const password = 'correctPassword';
            const wrongPassword = 'wrongPassword';
            const hash = await bcrypt.hash(password, 10);

            const result = await PasswordService.verifyPassword(wrongPassword, hash);
            expect(result).toBe(false);
        });
    });

    describe('validatePasswordStrength', () => {
        it('should return valid for a strong password', () => {
            const result = PasswordService.validatePasswordStrength('StrongPass123!');
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should return errors for a short password', () => {
            const result = PasswordService.validatePasswordStrength('short');
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Password must be at least 8 characters long');
        });
    });

    describe('generateSecurePassword', () => {
        it('should generate a password of specified length', () => {
            const length = 16;
            const password = PasswordService.generateSecurePassword(length);
            expect(password).toHaveLength(length);
        });

        it('should generate a default length password if no length provided', () => {
            const password = PasswordService.generateSecurePassword();
            expect(password).toHaveLength(12);
        });
    });

    describe('needsRehash', () => {
        it('should return true if salt rounds are lower than configured', () => {
            // bcrypt hash structure: $2a$10$hashedstuff... (10 is rounds)
            const oldHash = '$2a$08$sometingrandomhere';
            expect(PasswordService.needsRehash(oldHash)).toBe(true);
        });

        it('should return false if salt rounds match configured', () => {
            // Assuming 12 rounds in config
            const currentHash = '$2a$12$sometingrandomhere';
            expect(PasswordService.needsRehash(currentHash)).toBe(false);
        });
    });
});
